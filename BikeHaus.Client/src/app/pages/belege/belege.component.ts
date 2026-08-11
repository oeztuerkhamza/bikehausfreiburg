import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BelegService } from '../../services/beleg.service';
import { RentalService } from '../../services/rental.service';
import { SaleService } from '../../services/sale.service';
import { NotificationService } from '../../services/notification.service';
import { BelegListItem, FlatpayImportResult } from '../../models/models';

/**
 * Miet- und Verkaufsbelege in einer gemeinsamen, nach Datum sortierten Liste.
 * Der Export liefert genau diese Belege in EINER PDF-Datei, in derselben
 * Reihenfolge — Mietverträge und Verkaufsbelege hintereinander.
 */
@Component({
  selector: 'app-belege',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Belege</h1>
        <div class="header-actions">
          <button
            class="btn btn-primary"
            (click)="exportPdf()"
            [disabled]="exporting || belege.length === 0"
          >
            <span *ngIf="!exporting">📄 Beleg exportieren</span>
            <span *ngIf="exporting">Wird erstellt…</span>
          </button>
          <button
            class="btn btn-outline"
            (click)="exportAnkaufPdf()"
            [disabled]="exportingAnkauf || ankaufCount === 0"
          >
            <span *ngIf="!exportingAnkauf">
              📄 Ankaufbelege exportieren
              <span *ngIf="ankaufCount > 0">({{ ankaufCount }})</span>
            </span>
            <span *ngIf="exportingAnkauf">Wird erstellt…</span>
          </button>
          <!-- Der Flatpay-Bericht hakt die Kartenzahlungen automatisch ab.
               Die Datei kommt unverändert aus dem Terminal-Portal. -->
          <button
            class="btn btn-outline"
            (click)="flatpayInput.click()"
            [disabled]="importing"
          >
            <span *ngIf="!importing">💳 Flatpay-Bericht einlesen</span>
            <span *ngIf="importing">Wird abgeglichen…</span>
          </button>
          <input
            #flatpayInput
            type="file"
            accept=".xlsx"
            hidden
            (change)="onFlatpayFile($event)"
          />
        </div>
      </div>

      <div class="filters">
        <div class="date-field">
          <label>Von</label>
          <input type="date" [(ngModel)]="startDate" (change)="load()" />
        </div>
        <div class="date-field">
          <label>Bis</label>
          <input type="date" [(ngModel)]="endDate" (change)="load()" />
        </div>
        <div class="date-field">
          <label>Kartenzahlung</label>
          <select [(ngModel)]="karteFilter">
            <option value="alle">Alle</option>
            <option value="mit">Nur mit Karte</option>
            <option value="ohne">Ohne Karte</option>
          </select>
        </div>
        <div class="summary" *ngIf="!loading">
          {{ mieteCount }} Mietvertrag / {{ verkaufCount }} Verkauf /
          {{ ankaufCount }} Ankauf
          <span *ngIf="karteFilter !== 'alle'">
            · {{ sichtbareBelege.length }} angezeigt
          </span>
        </div>
      </div>

      <!-- Zahlungen aus dem Bericht, zu denen kein Beleg passt: die muss
           jemand von Hand prüfen, deshalb stehen sie hier ausgeschrieben. -->
      <div class="import-report" *ngIf="importErgebnis">
        <div class="import-summary">
          <strong>Flatpay-Abgleich:</strong>
          {{ importErgebnis.zahlungen }} Kartenzahlung(en) im Bericht,
          {{ importErgebnis.neuAngehakt }} neu angehakt,
          {{ importErgebnis.schonAngehakt }} waren schon angehakt.
          <button class="link-btn" (click)="importErgebnis = null">
            schließen
          </button>
        </div>
        <div class="import-offen" *ngIf="importErgebnis.offen.length > 0">
          <strong
            >{{ importErgebnis.offen.length }} Zahlung(en) ohne passenden
            Beleg:</strong
          >
          <ul>
            <li *ngFor="let o of importErgebnis.offen">
              {{ o.datum | date: 'dd.MM.yyyy HH:mm' }} —
              {{ o.betrag | number: '1.2-2' }} €
            </li>
          </ul>
          <span class="import-hint">
            Zu diesen Beträgen gibt es an dem Tag keinen Beleg mit demselben
            Betrag — entweder fehlt der Beleg, oder der Betrag stimmt nicht.
          </span>
        </div>
      </div>

      <p class="hint">
        Nach Beleg-Nr. sortiert, höchste zuerst. Der Export fasst alle Belege
        dieses Zeitraums in einer einzigen PDF-Datei zusammen — in der
        Reihenfolge dieser Liste (der Kartenzahlungs-Filter gilt nur für die
        Ansicht). Die Ankaufbelege liegen in einer eigenen Datei, ebenso
        sortiert. Zeilenfarben: grün = in Flatpay angehakt, blau =
        Kartenzahlung, gelb = nur bar.
      </p>

      <div class="loading" *ngIf="loading">Wird geladen…</div>

      <div class="table-wrap" *ngIf="!loading">
        <table>
          <thead>
            <tr>
              <th>Art</th>
              <th>Beleg-Nr.</th>
              <th>Datum</th>
              <th>Fahrrad</th>
              <th>Zustand</th>
              <th>Ankauf-Nr.</th>
              <th class="right">Ankaufpreis</th>
              <th>Zahlung</th>
              <th class="right">Betrag</th>
              <th class="center" style="width:80px">Flatpay</th>
              <th style="width:60px"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="sichtbareBelege.length === 0">
              <td colspan="11" class="empty">
                {{
                  belege.length === 0
                    ? 'In diesem Zeitraum gibt es keine Belege.'
                    : 'Kein Beleg passt zu diesem Filter.'
                }}
              </td>
            </tr>
            <tr *ngFor="let b of sichtbareBelege" [class]="zeilenKlasse(b)">
              <td>
                <span
                  class="badge"
                  [class.badge-miete]="b.art === 'Miete'"
                  [class.badge-verkauf]="b.art === 'Verkauf'"
                >
                  {{ b.art === 'Miete' ? 'Miete' : 'Verkauf' }}
                </span>
              </td>
              <td class="mono">{{ b.belegNummer }}</td>
              <td>{{ b.datum | date: 'dd.MM.yyyy' }}</td>
              <td>{{ b.fahrradInfo || '–' }}</td>
              <td>
                <span
                  *ngIf="b.zustand; else keinZustand"
                  class="badge"
                  [class.badge-neu]="b.zustand === 'Neu'"
                  [class.badge-gebraucht]="b.zustand === 'Gebraucht'"
                >
                  {{ b.zustand }}
                </span>
                <ng-template #keinZustand>–</ng-template>
              </td>
              <td class="mono">{{ b.ankaufBelegNummer || '–' }}</td>
              <td class="right">
                {{
                  b.ankaufPreis != null
                    ? (b.ankaufPreis | number: '1.2-2') + ' €'
                    : '–'
                }}
              </td>
              <td class="pay-cell">
                <span class="pay-part" *ngFor="let z of b.zahlungen">
                  {{ z.zahlungsart }}: {{ z.betrag | number: '1.2-2' }} €
                </span>
                <span *ngIf="b.zahlungen.length === 0">–</span>
              </td>
              <td class="right">{{ b.betrag | number: '1.2-2' }} €</td>
              <td class="center">
                <input
                  type="checkbox"
                  class="flatpay-box"
                  [checked]="b.flatpay"
                  [disabled]="flatpayPending.has(b.art + ':' + b.id)"
                  (change)="toggleFlatpay(b, $event)"
                  title="In Flatpay verbucht"
                />
              </td>
              <td>
                <button
                  class="btn btn-outline btn-sm"
                  (click)="openSingle(b)"
                  title="Einzelbeleg öffnen"
                >
                  🖨️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .header-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .filters {
        display: flex;
        gap: 16px;
        align-items: flex-end;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .date-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .date-field label {
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
      }
      .date-field input,
      .date-field select {
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
      }
      .import-report {
        margin: 0 0 16px;
        padding: 12px 14px;
        border: 1px solid var(--border-light, #e2e8f0);
        border-left: 4px solid #2563eb;
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        font-size: 0.88rem;
      }
      .import-offen {
        margin-top: 10px;
        color: #b45309;
      }
      .import-offen ul {
        margin: 6px 0 4px;
        padding-left: 20px;
      }
      .import-hint {
        display: block;
        font-size: 0.8rem;
        color: var(--text-muted, #94a3b8);
      }
      .link-btn {
        margin-left: 8px;
        border: none;
        background: none;
        padding: 0;
        color: var(--text-secondary, #64748b);
        text-decoration: underline;
        cursor: pointer;
        font-size: 0.82rem;
      }
      .summary {
        padding-bottom: 10px;
        font-size: 0.88rem;
        color: var(--text-secondary, #64748b);
      }
      .hint {
        margin: 0 0 18px;
        font-size: 0.85rem;
        color: var(--text-muted, #94a3b8);
      }
      .table-wrap {
        overflow-x: auto;
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light, #e2e8f0);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        padding: 11px 14px;
        text-align: left;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
        font-size: 0.9rem;
      }
      th {
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #64748b);
      }
      tbody tr:last-child td {
        border-bottom: none;
      }
      .right {
        text-align: right;
      }
      .center {
        text-align: center;
      }
      .pay-cell {
        display: table-cell;
        white-space: nowrap;
      }
      .pay-part {
        display: block;
        font-size: 0.82rem;
        color: var(--text-secondary, #64748b);
      }
      /* Zeilenfarben für den Abgleich mit dem Flatpay-Bericht:
         grün = schon angehakt, blau = Kartenzahlung, gelb = nur Bar. */
      tr.row-flatpay td {
        background: rgba(16, 185, 129, 0.12);
      }
      tr.row-karte td {
        background: rgba(37, 99, 235, 0.09);
      }
      tr.row-bar td {
        background: rgba(234, 179, 8, 0.14);
      }
      .flatpay-box {
        width: 17px;
        height: 17px;
        cursor: pointer;
        accent-color: var(--primary, #2563eb);
      }
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
      .empty {
        text-align: center;
        padding: 30px;
        color: var(--text-muted, #94a3b8);
      }
      .loading {
        padding: 30px;
        text-align: center;
        color: var(--text-muted, #94a3b8);
      }
      .badge {
        display: inline-block;
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .badge-miete {
        background: rgba(37, 99, 235, 0.12);
        color: #2563eb;
      }
      .badge-verkauf {
        background: rgba(16, 185, 129, 0.14);
        color: #059669;
      }
      /* Dieselben Farben wie im Verkaufsbeleg-PDF. */
      .badge-neu {
        background: rgba(21, 87, 36, 0.12);
        color: #155724;
      }
      .badge-gebraucht {
        background: rgba(133, 100, 4, 0.14);
        color: #856404;
      }
    `,
  ],
})
export class BelegeComponent implements OnInit {
  private belegService = inject(BelegService);
  private rentalService = inject(RentalService);
  private saleService = inject(SaleService);
  private notificationService = inject(NotificationService);

  belege: BelegListItem[] = [];
  // Ankaufbelege stehen nicht in der Tabelle (die zeigt die Verkaufsseite),
  // die Anzahl steuert aber Beschriftung und Zustand des zweiten Knopfes.
  ankaufCount = 0;
  loading = false;
  // Belege, deren Flatpay-Häkchen gerade gespeichert wird ("Art:Id").
  flatpayPending = new Set<string>();
  // Ansichtsfilter — der PDF-Export umfasst weiterhin den ganzen Zeitraum.
  karteFilter: 'alle' | 'mit' | 'ohne' = 'alle';
  importing = false;
  importErgebnis: FlatpayImportResult | null = null;
  exporting = false;
  exportingAnkauf = false;
  startDate = '';
  endDate = '';

  /** Beleg enthält einen als Karte verbuchten Zahlungsanteil. */
  hatKartenzahlung(b: BelegListItem): boolean {
    return b.zahlungen.some((z) => z.zahlungsart === 'Karte');
  }

  /** Beleg wurde ausschließlich bar bezahlt. */
  nurBar(b: BelegListItem): boolean {
    return (
      b.zahlungen.length > 0 && b.zahlungen.every((z) => z.zahlungsart === 'Bar')
    );
  }

  /**
   * Zeilenfarbe: angehakt schlägt alles (grün), sonst Kartenzahlung (blau)
   * bzw. reine Barzahlung (gelb).
   */
  zeilenKlasse(b: BelegListItem): string {
    if (b.flatpay) return 'row-flatpay';
    if (this.hatKartenzahlung(b)) return 'row-karte';
    if (this.nurBar(b)) return 'row-bar';
    return '';
  }

  /** Die Liste nach dem Kartenzahlungs-Filter. */
  get sichtbareBelege(): BelegListItem[] {
    if (this.karteFilter === 'alle') return this.belege;
    const mit = this.karteFilter === 'mit';
    return this.belege.filter((b) => this.hatKartenzahlung(b) === mit);
  }

  get mieteCount(): number {
    return this.belege.filter((b) => b.art === 'Miete').length;
  }

  get verkaufCount(): number {
    return this.belege.filter((b) => b.art === 'Verkauf').length;
  }

  ngOnInit(): void {
    // Voreinstellung: laufender Monat.
    const now = new Date();
    this.startDate = this.toInput(new Date(now.getFullYear(), now.getMonth(), 1));
    this.endDate = this.toInput(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    this.load();
  }

  load(): void {
    if (!this.startDate || !this.endDate) return;
    // Beim Umstellen des Zeitraums steht kurz ein Datum hinter dem anderen.
    // Dann gar nicht erst laden — sonst quittiert der Server das mit 400 und
    // der Benutzer sieht mitten im Tippen eine Fehlermeldung.
    if (this.startDate > this.endDate) return;
    this.loading = true;
    this.belegService.getBelege(this.startDate, this.endDate).subscribe({
      next: (items) => {
        this.belege = items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Belege konnten nicht geladen werden.');
      },
    });

    this.belegService.getAnkaufBelege(this.startDate, this.endDate).subscribe({
      next: (items) => (this.ankaufCount = items.length),
      error: () => (this.ankaufCount = 0),
    });
  }

  exportPdf(): void {
    if (!this.startDate || !this.endDate) return;
    this.exporting = true;
    this.belegService.downloadCombinedPdf(this.startDate, this.endDate).subscribe({
      next: (blob) => {
        this.exporting = false;
        this.save(blob, `Belege_${this.startDate}_bis_${this.endDate}.pdf`);
      },
      error: () => {
        this.exporting = false;
        this.notificationService.error('Export fehlgeschlagen.');
      },
    });
  }

  exportAnkaufPdf(): void {
    if (!this.startDate || !this.endDate) return;
    this.exportingAnkauf = true;
    this.belegService.downloadAnkaufPdf(this.startDate, this.endDate).subscribe({
      next: (blob) => {
        this.exportingAnkauf = false;
        this.save(blob, `Ankaufbelege_${this.startDate}_bis_${this.endDate}.pdf`);
      },
      error: () => {
        this.exportingAnkauf = false;
        this.notificationService.error('Export der Ankaufbelege fehlgeschlagen.');
      },
    });
  }

  /**
   * Flatpay-Transaktionsbericht einlesen: der Server hakt jede abgeschlossene
   * Kartenzahlung an dem Beleg desselben Tages mit demselben Betrag ab.
   * Gesetzte Häkchen bleiben stehen; was nicht zugeordnet werden konnte, steht
   * danach oben in der Liste der offenen Zahlungen.
   */
  onFlatpayFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Dateiauswahl zurücksetzen, damit dieselbe Datei erneut gewählt werden kann.
    input.value = '';
    if (!file) return;

    this.importing = true;
    this.importErgebnis = null;
    this.belegService.importFlatpayReport(file).subscribe({
      next: (ergebnis) => {
        this.importing = false;
        this.importErgebnis = ergebnis;
        if (ergebnis.zahlungen === 0) {
          this.notificationService.error(
            'Im Bericht steht keine abgeschlossene Kartenzahlung.',
          );
        } else {
          this.notificationService.success(
            `${ergebnis.neuAngehakt} von ${ergebnis.zahlungen} Kartenzahlungen zugeordnet.`,
          );
        }
        // Der Zeitraum der Liste bleibt, wie er ist — nur die Häkchen holen.
        this.load();
      },
      error: (err) => {
        this.importing = false;
        this.notificationService.error(
          err?.error?.message || 'Der Flatpay-Bericht konnte nicht eingelesen werden.',
        );
      },
    });
  }

  /**
   * Häkchen "in Flatpay verbucht". Der Zustand liegt am Server, damit die
   * Kontrolle auch am nächsten Tag und auf einem anderen Gerät noch dasteht.
   */
  toggleFlatpay(b: BelegListItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const gewuenscht = input.checked;
    const key = `${b.art}:${b.id}`;

    this.flatpayPending.add(key);
    this.belegService.setFlatpay(b.art, b.id, gewuenscht).subscribe({
      next: () => {
        this.flatpayPending.delete(key);
        b.flatpay = gewuenscht;
      },
      error: () => {
        this.flatpayPending.delete(key);
        // Häkchen zurücksetzen — sonst zeigt die Liste einen Stand, den der
        // Server nicht kennt.
        input.checked = b.flatpay;
        this.notificationService.error('Flatpay-Häkchen konnte nicht gespeichert werden.');
      },
    });
  }

  openSingle(b: BelegListItem): void {
    const request$ =
      b.art === 'Miete'
        ? this.rentalService.downloadMietvertragPdf(b.id)
        // Interne Fassung mit Ankaufnummer und -preis — genau das PDF, das
        // auch der Sammelexport dieser Seite liefert.
        : this.saleService.downloadVerkaufsbeleg(b.id, true);

    request$.subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Der neue Tab hält das Blob; nach kurzer Zeit darf die URL weg.
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: () => this.notificationService.error('Beleg konnte nicht geladen werden.'),
    });
  }

  private save(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  private toInput(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
