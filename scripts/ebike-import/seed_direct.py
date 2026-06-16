#!/usr/bin/env python3
"""
Direct DB seeder for the E-Bike catalog (server-side, additive).

Inserts the scraped feldmeier IDEAL e-bikes straight into the live SQLite DB
on the production volume and places their images into the uploads volume.
Bikes are created INACTIVE (IsActive=0) so the owner reviews/publishes per item.

Safe to re-run: skips any bike whose Titel already exists.
Run ONLY on the server, against the live volume path. Take a backup first.

Usage:
  python3 seed_direct.py <db_path> <uploads_dir> <dataset_json> [--active]
"""
import sqlite3, sys, json, os, uuid, subprocess, datetime

def ef_now():
    # EF Core SQLite datetime text format, 7 fractional digits
    return datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f") + "0"

def main():
    db_path = sys.argv[1]
    uploads_dir = sys.argv[2]
    dataset = sys.argv[3]
    active = 1 if (len(sys.argv) > 4 and sys.argv[4] == "--active") else 0

    with open(dataset, encoding="utf-8") as f:
        bikes = json.load(f)
    print(f"Loaded {len(bikes)} bikes. active={active}")

    conn = sqlite3.connect(db_path, timeout=30)
    conn.execute("PRAGMA busy_timeout=30000")
    cur = conn.cursor()

    existing = {r[0] for r in cur.execute("SELECT Titel FROM EBikes").fetchall()}
    created = skipped = img_ok = img_fail = 0
    ebike_dir = os.path.join(uploads_dir, "e-bikes")

    for b in bikes:
        titel = b["titel"]
        if titel in existing:
            print(f"  SKIP (exists): {titel}")
            skipped += 1
            continue

        now = ef_now()
        cur.execute("""
            INSERT INTO EBikes
              (Titel,Beschreibung,Preis,PreisText,Kategorie,Marke,Modell,Farbe,
               Rahmengroesse,Reifengroesse,Gangschaltung,Zustand,Angebot,IsActive,
               MotorMarke,MotorPosition,AkkuKapazitaetWh,ReichweiteKm,MotorLeistungNm,
               CreatedAt,UpdatedAt)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL)
        """, (
            titel, b.get("beschreibung"), b.get("preis"), None, b.get("kategorie"),
            b.get("marke"), b.get("modell"), b.get("farbe"), b.get("rahmengroesse"),
            b.get("reifengroesse"), b.get("gangschaltung"), b.get("zustand") or "Neu",
            None, active, b.get("motorMarke"), b.get("motorPosition"),
            b.get("akkuKapazitaetWh"), b.get("reichweiteKm"), b.get("motorLeistungNm"),
            now,
        ))
        ebike_id = cur.lastrowid
        print(f"  CREATED #{ebike_id}: {titel}")
        created += 1

        sort = 0
        for url in (b.get("imageUrls") or []):
            if not url:
                continue
            ext = ".png" if ".png" in url.lower() else (".webp" if ".webp" in url.lower() else ".jpg")
            fname = f"{uuid.uuid4()}{ext}"
            dest_dir = os.path.join(ebike_dir, str(ebike_id))
            os.makedirs(dest_dir, exist_ok=True)
            dest = os.path.join(dest_dir, fname)
            # Wix "fill" URLs without a height return HTTP 400; fall back to the
            # original media URL (everything before "/v1/"), which always works.
            candidates = [url]
            if "/v1/" in url:
                candidates.append(url.split("/v1/")[0])
            try:
                ok = False
                for cand in candidates:
                    try:
                        subprocess.run(
                            ["curl", "-fsSL", "-A",
                             "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "-o", dest, cand],
                            check=True, timeout=60)
                        if os.path.getsize(dest) < 1000:
                            raise RuntimeError("downloaded file too small")
                        ok = True
                        break
                    except Exception:
                        if os.path.exists(dest):
                            os.remove(dest)
                if not ok:
                    raise RuntimeError("all candidate URLs failed")
                cur.execute("""
                    INSERT INTO EBikeImages (EBikeId,FilePath,SortOrder,CreatedAt,UpdatedAt)
                    VALUES (?,?,?,?,NULL)
                """, (ebike_id, f"/uploads/e-bikes/{ebike_id}/{fname}", sort, ef_now()))
                img_ok += 1
                sort += 1
            except Exception as e:
                print(f"    image FAILED ({url}): {e}")
                if os.path.exists(dest):
                    os.remove(dest)
                img_fail += 1

    conn.commit()
    n = cur.execute("SELECT COUNT(*) FROM EBikes").fetchone()[0]
    ni = cur.execute("SELECT COUNT(*) FROM EBikeImages").fetchone()[0]
    conn.close()
    print(f"\nDone. Created:{created} Skipped:{skipped} Img OK:{img_ok} Img fail:{img_fail}")
    print(f"Totals now -> EBikes:{n} EBikeImages:{ni}")

if __name__ == "__main__":
    main()
