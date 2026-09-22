import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { PurchaseService } from '../../services/purchase.service';
import { Router } from '@angular/router';
import { Bicycle, BicycleImage } from '../../models/models';
import { environment } from '../../../environments/environment';

/**
 * Gebrauchte Fahrräder für den Showroom.
 *
 * Der öffentliche Showroom speist sich aus zwei Quellen: den gescrapten
 * Kleinanzeigen-Anzeigen UND den eigenen Rädern, die hier auf „Website" gesetzt
 * werden (Flag `isPublishedOnWebsite`, ausgeliefert über
 * /api/public/gebrauchte-fahrraeder). Die Homepage wandelt sie in dasselbe
 * Listing-Format um, sie erscheinen also gemischt in derselben Liste.
 *
 * Wichtig für die Filter: Der Showroom filtert über den TITEL, nicht über
 * strukturierte Felder. Marke, Zoll, Gänge, Rahmengröße und Herren/Damen/Kinder
 * gehören deshalb gepflegt — daraus baut die Homepage einen Titel im gleichen
 * Format wie eine Kleinanzeigen-Anzeige. Die Vorschau in jeder Karte zeigt,
 * was dabei herauskommt.
 *
 * Angelegt und bearbeitet wird hier nichts: „Fahrrad hinzufügen" führt in das
 * Ankaufsformular, „Bearbeiten" in den zugehörigen Ankauf. Ein Rad im Showroom
 * ist ein angekauftes Rad — ein zweites Formular für dieselbe Sache lief
 * auseinander und konnte weniger (kein Verkäufer, kein Beleg, keine
 * Einkaufsfotos). Diese Seite entscheidet nur noch, was sichtbar ist.
 */
@Component({
  selector: 'app-showroom-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Showroom</h1>
          <p class="page-sub">
            Die Räder, die auf der Website stehen — mit den Fotos, die der
            Kunde dort sieht.
          </p>
        </div>
        <button class="btn btn-primary" (click)="startNew()">
          + Fahrrad hinzufügen
        </button>
      </div>

      <div class="info-box">
        Diese Räder erscheinen auf
        <strong>bikehausfreiburg.com/de/showroom</strong> zusammen mit den
        Kleinanzeigen-Anzeigen. Damit die Filter greifen, bitte Zoll,
        Rahmengröße, Gänge und Art (Herren/Damen/Kinder) ausfüllen — daraus wird
        der Anzeigentitel gebaut.
      </div>

      <div class="notice" *ngIf="!loading() && publishedCount() === 0">
        Es steht noch kein eigenes Fahrrad im Showroom. Unten siehst du deinen
        Bestand — mit <strong>„Im Showroom zeigen"</strong> erscheint ein Rad auf
        der Website. Danach begrüßt dich diese Seite nur noch mit den
        veröffentlichten Rädern.
      </div>

      <div class="toolbar">
        <input
          type="text"
          class="search"
          placeholder="Suchen (Marke, Modell, Rahmennummer)…"
          [(ngModel)]="search"
        />
        <label class="check">
          <input type="checkbox" [(ngModel)]="onlyPublished" />
          Nur veröffentlichte
        </label>
        <span class="count">
          {{ publishedCount() }} im Showroom · {{ filtered().length }} angezeigt
        </span>
      </div>

      <div *ngIf="loading()" class="state">Lade Fahrräder…</div>
      <div *ngIf="!loading() && filtered().length === 0" class="state">
        <!-- Der Filter ist beim Öffnen aktiv. Ohne diesen Hinweis wirkt die
             leere Seite wie ein Fehler, obwohl nur nichts veröffentlicht ist. -->
        <ng-container *ngIf="onlyPublished && hiddenByFilter() > 0">
          Aktuell steht kein Fahrrad im Showroom.
          {{ hiddenByFilter() }} nicht veröffentlichte Rad(er) sind
          ausgeblendet —
          <button class="link-btn" (click)="onlyPublished = false">
            alle anzeigen
          </button>
        </ng-container>
        <ng-container *ngIf="!(onlyPublished && hiddenByFilter() > 0)">
          Keine Fahrräder gefunden.
        </ng-container>
      </div>

      <div class="grid" *ngIf="!loading() && filtered().length > 0">
        <article class="card" *ngFor="let b of filtered()">
          <div class="thumb" [class.empty]="!firstImage(b)">
            <img
              *ngIf="firstImage(b) as img"
              [src]="imageUrl(img)"
              [alt]="b.marke + ' ' + b.modell"
              loading="lazy"
            />
            <span *ngIf="!firstImage(b)" class="no-img">Kein Foto</span>
          </div>

          <div class="card-body">
            <div class="card-head">
              <h3>{{ b.marke }} {{ b.modell }}</h3>
              <span
                class="badge"
                [class.on]="b.isPublishedOnWebsite"
                [class.off]="!b.isPublishedOnWebsite"
              >
                {{
                  b.status !== 'Available'
                    ? 'Verkauft'
                    : b.isPublishedOnWebsite
                      ? 'Im Showroom'
                      : 'Nicht sichtbar'
                }}
              </span>
            </div>

            <p class="title-preview" [title]="previewTitle(b)">
              {{ previewTitle(b) }}
            </p>

            <div class="meta">
              <span *ngIf="b.verkaufspreisVorschlag"
                >{{ b.verkaufspreisVorschlag }} €</span
              >
              <span *ngIf="!b.verkaufspreisVorschlag" class="warn"
                >Kein Preis</span
              >
              <span>{{ b.images?.length || 0 }} Foto(s)</span>
              <span class="warn" *ngIf="!b.images?.length"
                >Ohne Foto kaum verkäuflich</span
              >
            </div>

            <div class="card-actions">
              <button class="btn btn-sm btn-outline" (click)="startEdit(b)">
                Bearbeiten
              </button>
              <button
                class="btn btn-sm"
                [class.btn-primary]="!b.isPublishedOnWebsite"
                [class.btn-outline]="b.isPublishedOnWebsite"
                (click)="togglePublish(b)"
                [disabled]="busyId() === b.id"
              >
                {{
                  b.isPublishedOnWebsite
                    ? 'Aus Showroom nehmen'
                    : 'Im Showroom zeigen'
                }}
              </button>
            </div>
          </div>
        </article>
      </div>

    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1400px;
        margin: 0 auto;
        animation: fadeIn 0.4s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 12px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0;
      }
      .page-sub {
        margin: 4px 0 0;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      .info-box {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        border: 1px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        padding: 10px 14px;
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-bottom: 16px;
      }
      .notice {
        background: var(--accent-warning-light, rgba(245, 158, 11, 0.12));
        border: 1px solid var(--accent-warning, #f59e0b);
        border-radius: var(--radius-md, 10px);
        padding: 10px 14px;
        font-size: 0.85rem;
        color: var(--text-primary);
        margin-bottom: 14px;
      }
      .toolbar {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .search {
        flex: 1;
        min-width: 220px;
        padding: 10px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
      }
      .check {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.86rem;
        color: var(--text-secondary);
      }
      .count {
        font-size: 0.82rem;
        color: var(--text-secondary);
      }
      .state {
        padding: 40px;
        text-align: center;
        color: var(--text-secondary);
      }
      .link-btn {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        color: var(--accent-primary, #6366f1);
        text-decoration: underline;
        cursor: pointer;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }
      .card {
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-lg, 14px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .thumb {
        height: 160px;
        background: var(--bg-secondary, #f1f5f9);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .no-img {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
      .card-body {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
      }
      .card-head h3 {
        margin: 0;
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 20px;
        white-space: nowrap;
      }
      .badge.on {
        background: rgba(16, 185, 129, 0.14);
        color: #059669;
      }
      .badge.off {
        background: var(--bg-secondary, #f1f5f9);
        color: var(--text-secondary);
      }
      .title-preview {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .meta {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 0.78rem;
        color: var(--text-secondary);
        margin-top: auto;
      }
      .meta .warn {
        color: var(--accent-warning, #d97706);
        font-weight: 600;
      }
      .card-actions {
        display: flex;
        gap: 8px;
        padding-top: 6px;
      }
      .card-actions .btn {
        flex: 1;
      }

      .btn {
        padding: 9px 16px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.86rem;
        cursor: pointer;
        border: 1.5px solid transparent;
      }
      .btn-sm {
        padding: 7px 10px;
        font-size: 0.78rem;
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: #fff;
      }
      .btn-outline {
        background: transparent;
        border-color: var(--border-light, #e2e8f0);
        color: var(--text-primary);
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }


      @media (max-width: 760px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ShowroomListComponent implements OnInit {
  private bicycleService = inject(BicycleService);
  private notify = inject(NotificationService);
  private purchaseService = inject(PurchaseService);
  private router = inject(Router);

  bikes = signal<Bicycle[]>([]);
  loading = signal(true);
  busyId = signal<number | null>(null);
  brands = signal<string[]>([]);

  search = '';
  // Beim Öffnen zeigt die Seite nur, was tatsächlich im Showroom steht — das
  // ist die Frage, mit der man hierher kommt. Zum Anlegen oder Nachpflegen
  // eines noch nicht veröffentlichten Rades den Haken abwählen.
  //
  // Ausnahme: Solange ÜBERHAUPT nichts veröffentlicht ist, wäre die Seite beim
  // ersten Aufruf komplett leer und sähe kaputt aus. Dann startet sie mit allen
  // Rädern (siehe load()), damit man von hier aus überhaupt veröffentlichen kann.
  onlyPublished = true;

  /** Der Startwert des Filters wird nur EINMAL gesetzt, danach gilt die Wahl des Nutzers. */
  private initialFilterApplied = false;

  readonly zollOptions = [
    '12', '14', '16', '18', '20', '24', '26', '27.5', '28', '29',
  ];
  readonly typOptions = [
    'City', 'Trekking', 'MTB', 'Rennrad', 'Gravelbike', 'E-Bike',
    'Kinderfahrrad', 'Lastenrad', 'Hollandrad', 'Sonstige',
  ];


  publishedCount = computed(
    () => this.bikes().filter((b) => b.isPublishedOnWebsite).length,
  );

  /** Wie viele Räder der Veröffentlicht-Filter gerade ausblendet. */
  hiddenByFilter = computed(
    () => this.bikes().filter((b) => !b.isPublishedOnWebsite).length,
  );

  filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    return this.bikes().filter((b) => {
      if (this.onlyPublished && !b.isPublishedOnWebsite) return false;
      if (!term) return true;
      return [b.marke, b.modell, b.rahmennummer, b.farbe]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(term));
    });
  });

  ngOnInit(): void {
    this.load();
    this.bicycleService.getBrands().subscribe({
      next: (b) => this.brands.set(b),
      error: () => {},
    });
  }

  load(): void {
    this.loading.set(true);
    this.bicycleService.getAll().subscribe({
      next: (all) => {
        // NUR der Showroom-Katalog. Vorher stand hier der komplette Bestand —
        // angekaufte, verkaufte, vermietete Räder inklusive — und die Seite war
        // damit unbrauchbar, sobald ein paar Dutzend Räder im System lagen.
        // Maßgeblich ist jetzt isShowroomBike: das Rad wurde ausdrücklich für
        // den Showroom angelegt oder dorthin gestellt.
        const showroom = all.filter((b) => b.isShowroomBike);
        // Verkaufte und vermietete Räder gehören auch dann nicht hierher, wenn
        // sie einmal im Katalog waren — es sei denn, sie stehen noch sichtbar
        // auf der Website; dann soll man sie hier ausblenden können.
        this.bikes.set(
          showroom.filter(
            (b) => b.status === 'Available' || b.isPublishedOnWebsite,
          ),
        );
        if (!this.initialFilterApplied) {
          // Nichts veröffentlicht -> alles zeigen, sonst ist die Seite leer.
          this.onlyPublished = this.publishedCount() > 0;
          this.initialFilterApplied = true;
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Fahrräder konnten nicht geladen werden.');
      },
    });
  }

  firstImage(b: Bicycle): BicycleImage | null {
    return b.images?.length ? b.images[0] : null;
  }

  imageUrl(img: BicycleImage): string {
    return `${environment.apiUrl}/public/gallery-image/${img.filePath}`;
  }

  /**
   * Zeigt exakt den Titel, den die Homepage aus diesen Feldern baut
   * (bicycle-listing-title.ts). Bewusst dupliziert statt geteilt: Admin und
   * Homepage sind getrennte Anwendungen ohne gemeinsames Paket. Wer das Format
   * dort ändert, muss es hier nachziehen — deshalb steht die Quelle im Kommentar.
   */
  private buildTitle(b: {
    reifengroesse?: string;
    zustand?: string;
    marke?: string;
    modell?: string;
    art?: string;
    fahrradtyp?: string;
    gangschaltung?: string;
    rahmengroesse?: string;
  }): string {
    const parts: string[] = [];
    if (b.reifengroesse) parts.push(`${b.reifengroesse} Zoll`);
    if (b.zustand === 'Neu') parts.push('neues');
    if (b.marke) parts.push(b.marke.trim());
    if (b.modell) parts.push(b.modell.trim());
    if (b.art) parts.push(b.art.trim());
    if (b.fahrradtyp && b.fahrradtyp.trim() !== b.art?.trim()) {
      parts.push(b.fahrradtyp.trim());
    }
    parts.push('Fahrrad.');
    const gears = (b.gangschaltung ?? '').match(/\d{1,2}/);
    if (gears) parts.push(`${gears[0]} Gänge.`);
    const size = (b.rahmengroesse ?? '').match(/\d{1,3}/);
    if (size) parts.push(`${size[0]} size.`);
    return parts.join(' ').replace(/\s{2,}/g, ' ').trim();
  }

  previewTitle(b: Bicycle): string {
    return this.buildTitle(b);
  }

  /**
   * Anlegen und Bearbeiten laufen ueber den Ankauf, nicht ueber ein eigenes
   * Formular auf dieser Seite. Ein Rad im Showroom ist ein angekauftes Rad —
   * zwei Eingabemasken fuer dieselbe Sache gehen frueher oder spaeter
   * auseinander, und das Ankaufsformular kann mehr (Verkaeufer, Beleg,
   * Einkaufsfotos, Showroom-Fotos).
   */
  startNew(): void {
    this.router.navigate(['/purchases/new']);
  }

  startEdit(b: Bicycle): void {
    this.busyId.set(b.id);
    this.purchaseService.getByBicycleId(b.id).subscribe({
      next: (p) => {
        this.busyId.set(null);
        if (p?.id) this.router.navigate(['/purchases/edit', p.id]);
        // Ein Rad ohne Ankaufsbeleg (frueher direkt hier angelegt) hat keinen
        // Ankauf zum Bearbeiten — dann die Fahrradseite, die dieselben Felder
        // samt Showroom-Schalter fuehrt.
        else this.router.navigate(['/bicycles', b.id]);
      },
      error: () => {
        this.busyId.set(null);
        this.router.navigate(['/bicycles', b.id]);
      },
    });
  }

  togglePublish(b: Bicycle): void {
    // Ohne Foto im Showroom zu landen ist fast immer ein Versehen.
    if (!b.isPublishedOnWebsite && !b.images?.length) {
      this.notify.warning(
        'Dieses Rad hat kein Foto — im Showroom wird es kaum angeklickt.',
      );
    }
    this.busyId.set(b.id);
    this.bicycleService.togglePublishWebsite(b.id).subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.notify.success(
          updated.isPublishedOnWebsite
            ? 'Fahrrad erscheint jetzt im Showroom.'
            : 'Fahrrad aus dem Showroom genommen.',
        );
        this.load();
      },
      error: () => {
        this.busyId.set(null);
        this.notify.error('Status konnte nicht geändert werden.');
      },
    });
  }
}
