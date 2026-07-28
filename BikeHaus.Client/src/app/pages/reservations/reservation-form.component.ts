import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { BicycleService } from '../../services/bicycle.service';
import { TranslationService } from '../../services/translation.service';
import {
  ReservationCreate,
  Bicycle,
  CustomerCreate,
  PaymentMethod,
} from '../../models/models';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SignaturePadComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.newReservation }}</h1>
        <a routerLink="/reservations" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Bicycle selection — gleiche Bedienung wie im Verkaufsformular:
               Lager- oder Rahmennummer tippen, aus dem Vorschlag wählen. -->
          <div class="form-card">
            <h2>{{ t.selectBicycle }}</h2>
            <div class="form-grid">
              <div class="field rahmen-autocomplete-wrapper">
                <label>{{ t.stockNumber }}</label>
                <input
                  type="number"
                  min="1"
                  [(ngModel)]="lagernummerInput"
                  name="lagernummerInput"
                  (ngModelChange)="onLagernummerChange($event)"
                  (focus)="onLagernummerChange(lagernummerInput)"
                  (blur)="hideLagerDropdown()"
                  placeholder="Lagernummer eingeben..."
                  autocomplete="off"
                />
                <div
                  class="rahmen-dropdown"
                  *ngIf="lagerSearchResults.length > 0 && showLagerDropdown"
                >
                  <div
                    class="rahmen-dropdown-item"
                    *ngFor="let bike of lagerSearchResults"
                    (mousedown)="selectBike(bike)"
                  >
                    <span class="rahmen-nr">#{{ bike.lagernummer }}</span>
                    <span class="rahmen-info">{{ bike.marke }} {{ bike.modell }}</span>
                    <span class="rahmen-badge">{{ t.available }}</span>
                  </div>
                </div>
              </div>

              <div class="field rahmen-autocomplete-wrapper">
                <label>{{ t.frameNumber }}</label>
                <input
                  [(ngModel)]="rahmennummerInput"
                  name="rahmennummerInput"
                  (ngModelChange)="onRahmennummerChange($event)"
                  (focus)="onRahmennummerChange(rahmennummerInput)"
                  (blur)="hideRahmenDropdown()"
                  style="text-transform: uppercase"
                  placeholder="Rahmennummer eingeben..."
                  autocomplete="off"
                />
                <div
                  class="rahmen-dropdown"
                  *ngIf="rahmenSearchResults.length > 0 && showRahmenDropdown"
                >
                  <div
                    class="rahmen-dropdown-item"
                    *ngFor="let bike of rahmenSearchResults"
                    (mousedown)="selectBike(bike)"
                  >
                    <span class="rahmen-nr" *ngIf="bike.lagernummer != null"
                      >#{{ bike.lagernummer }}</span
                    >
                    <span class="rahmen-nr">{{ bike.rahmennummer }}</span>
                    <span class="rahmen-info">{{ bike.marke }} {{ bike.modell }}</span>
                    <span class="rahmen-badge">{{ t.available }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="selected-bike" *ngIf="selectedBike">
              <div class="selected-bike-head">
                <strong>{{ selectedBike.marke }} {{ selectedBike.modell }}</strong>
                <button type="button" class="btn btn-outline btn-sm" (click)="clearBike()">
                  ✕ {{ t.change }}
                </button>
              </div>
              <div class="selected-bike-facts">
                <span *ngIf="selectedBike.lagernummer != null">#{{ selectedBike.lagernummer }}</span>
                <span *ngIf="selectedBike.rahmennummer">{{ selectedBike.rahmennummer }}</span>
                <span *ngIf="selectedBike.farbe">{{ selectedBike.farbe }}</span>
                <span *ngIf="selectedBike.rahmengroesse">{{ selectedBike.rahmengroesse }}</span>
                <span *ngIf="selectedBike.verkaufspreisVorschlag != null">
                  {{ selectedBike.verkaufspreisVorschlag | number: '1.2-2' }} €
                </span>
              </div>
            </div>
          </div>

          <!-- Customer info -->
          <div class="form-card">
            <h2>{{ t.customer }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.firstName }} *</label>
                <input
                  [(ngModel)]="customer.vorname"
                  name="customerVorname"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.lastName }} *</label>
                <input
                  [(ngModel)]="customer.nachname"
                  name="customerNachname"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.street }} *</label>
                <input
                  [(ngModel)]="customer.strasse"
                  name="customerStrasse"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.houseNumber }} *</label>
                <input
                  [(ngModel)]="customer.hausnummer"
                  name="customerHausnr"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.postalCode }} *</label>
                <input [(ngModel)]="customer.plz" name="customerPlz" required />
              </div>
              <div class="field">
                <label>{{ t.city }} *</label>
                <input
                  [(ngModel)]="customer.stadt"
                  name="customerStadt"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.phone }} *</label>
                <input
                  [(ngModel)]="customer.telefon"
                  name="customerTel"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.email }}</label>
                <input
                  type="email"
                  [(ngModel)]="customer.email"
                  name="customerEmail"
                />
              </div>
            </div>
          </div>

          <!-- Reservation details -->
          <div class="form-card">
            <h2>{{ t.reservationDataTitle }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.reservationDate }}</label>
                <input
                  type="date"
                  [(ngModel)]="reservierungsDatum"
                  name="reservierungsDatum"
                />
              </div>
              <!-- „Reserviert bis" direkt aus dem Kalender statt einer
                   Tagesanzahl — das ist die Angabe, die auch auf dem Beleg steht. -->
              <div class="field">
                <label>{{ t.reservedUntil }} *</label>
                <input
                  type="date"
                  [(ngModel)]="ablaufDatum"
                  name="ablaufDatum"
                  [min]="reservierungsDatum"
                  required
                />
                <small class="hint" *ngIf="reservationDays() > 0">
                  {{ reservationDays() }} {{ reservationDays() === 1 ? t.day : t.days }}
                </small>
              </div>
              <div class="field">
                <label>{{ t.salePrice }} (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="verkaufspreis"
                  name="verkaufspreis"
                />
                <small class="hint">{{ t.salePriceHint }}</small>
              </div>
              <div class="field">
                <label>{{ t.deposit }} (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="anzahlung"
                  name="anzahlung"
                />
              </div>
              <div class="field">
                <label>{{ t.depositPaymentMethod }}</label>
                <select [(ngModel)]="anzahlungZahlungsart" name="anzahlungZahlungsart">
                  <option value="">{{ t.selectOption }}</option>
                  <option value="Bar">Bar</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Karte">Karte</option>
                  <option value="Überweisung">Überweisung</option>
                </select>
              </div>
              <div class="field full rest-row" *ngIf="verkaufspreis">
                <span>{{ t.remainingAmount }}</span>
                <strong>{{ restbetrag() | number: '1.2-2' }} €</strong>
              </div>
              <div class="field full">
                <label>{{ t.notes }}</label>
                <textarea
                  [(ngModel)]="notizen"
                  name="notizen"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Unterschrift des Kunden; die Firmenunterschrift kommt aus den
               Einstellungen und wird direkt auf den Beleg gedruckt. -->
          <div class="form-card">
            <h2>{{ t.customerSignature }}</h2>
            <app-signature-pad
              [(ngModel)]="kundenUnterschrift"
              name="kundenUnterschrift"
            ></app-signature-pad>
            <small class="hint">{{ t.companySignatureHint }}</small>
          </div>
        </div>

        <!-- Validation messages -->
        <div class="validation-errors" *ngIf="!canSubmit() && !submitting">
          <p *ngIf="!selectedBike" class="error-msg">
            ⚠️ {{ t.selectBicycleWarning }}
          </p>
          <p *ngIf="!customer.vorname.trim()" class="error-msg">
            ⚠️ {{ t.firstNameRequiredMsg }}
          </p>
          <p *ngIf="!customer.nachname.trim()" class="error-msg">
            ⚠️ {{ t.lastNameRequiredMsg }}
          </p>
          <p *ngIf="!customer.strasse?.trim()" class="error-msg">
            ⚠️ {{ t.streetRequiredMsg }}
          </p>
          <p *ngIf="!customer.hausnummer?.trim()" class="error-msg">
            ⚠️ {{ t.houseNumberRequiredMsg }}
          </p>
          <p *ngIf="!customer.plz?.trim()" class="error-msg">
            ⚠️ {{ t.postalCodeRequiredMsg }}
          </p>
          <p *ngIf="!customer.stadt?.trim()" class="error-msg">
            ⚠️ {{ t.cityRequiredMsg }}
          </p>
          <p *ngIf="!customer.telefon?.trim()" class="error-msg">
            ⚠️ {{ t.phoneRequiredMsg }}
          </p>
          <p *ngIf="!ablaufDatum" class="error-msg">
            ⚠️ {{ t.reservedUntilWarning }}
          </p>
        </div>

        <!-- API Error -->
        <div class="api-error" *ngIf="errorMessage">
          <p>❌ {{ errorMessage }}</p>
        </div>

        <!-- Submit section -->
        <div class="submit-section">
          <button
            type="submit"
            class="btn btn-primary btn-large"
            [disabled]="!canSubmit()"
          >
            {{ submitting ? 'Wird gespeichert...' : 'Reservieren' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1200px;
        margin: 0 auto;
        animation: fadeIn 0.4s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .btn {
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        text-decoration: none;
      }

      .btn-outline {
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }

      .btn-outline:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
      }

      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: var(--accent-primary-hover, #4f46e5);
        box-shadow: var(--shadow-sm);
      }

      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-large {
        padding: 14px 32px;
        font-size: 1rem;
      }

      .btn-sm {
        padding: 6px 12px;
        font-size: 0.85rem;
      }

      /* ── Fahrradsuche (wie im Verkaufsformular) ── */
      .rahmen-autocomplete-wrapper {
        position: relative;
      }
      .rahmen-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 100;
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--accent-primary, #6366f1);
        border-radius: 0 0 var(--radius-md, 10px) var(--radius-md, 10px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        max-height: 240px;
        overflow-y: auto;
      }
      .rahmen-dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        cursor: pointer;
        transition: background 0.1s;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      .rahmen-dropdown-item:last-child {
        border-bottom: none;
      }
      .rahmen-dropdown-item:hover {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      .rahmen-nr {
        font-weight: 700;
        font-family: monospace;
        font-size: 0.88rem;
        text-transform: uppercase;
        color: var(--accent-primary, #6366f1);
      }
      .rahmen-info {
        font-size: 0.85rem;
        color: var(--text-primary);
      }
      .rahmen-badge {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 99px;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        margin-left: auto;
      }

      .selected-bike {
        margin-top: 16px;
        border: 1.5px solid var(--accent-primary, #6366f1);
        border-radius: var(--radius-md, 10px);
        padding: 12px 14px;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
      }
      .selected-bike-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      .selected-bike-facts {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        margin-top: 6px;
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
      }

      .rest-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-top: 1.5px solid var(--border-light, #e2e8f0);
        padding-top: 12px;
        font-size: 0.95rem;
      }
      .rest-row strong {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--accent-primary, #6366f1);
      }

      .validation-errors {
        background: rgba(245, 158, 11, 0.06);
        border: 1.5px solid rgba(245, 158, 11, 0.3);
        border-radius: var(--radius-md, 10px);
        padding: 16px;
        margin-top: 16px;
      }

      .error-msg {
        color: #f59e0b;
        margin: 4px 0;
        font-size: 0.88rem;
      }

      .api-error {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.06));
        border: 1.5px solid rgba(239, 68, 68, 0.3);
        border-radius: var(--radius-md, 10px);
        padding: 16px;
        margin-top: 16px;
        color: var(--accent-danger, #ef4444);
        font-weight: 600;
      }

      .form-sections {
        display: grid;
        gap: 20px;
      }

      .form-card {
        background: var(--bg-card, #fff);
        padding: 24px;
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }

      .form-card h2 {
        margin: 0 0 20px 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
        padding-bottom: 12px;
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field.full {
        grid-column: 1 / -1;
      }

      label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      input,
      select,
      textarea {
        padding: 9px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        font-size: 0.92rem;
        transition: var(--transition-fast);
        width: 100%;
        box-sizing: border-box;
      }

      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }

      textarea {
        resize: vertical;
        font-family: inherit;
      }

      .hint {
        font-size: 0.78rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 4px;
      }

      .submit-section {
        margin-top: 32px;
        display: flex;
        justify-content: center;
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class ReservationFormComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private bicycleService = inject(BicycleService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  availableBikes: Bicycle[] = [];
  selectedBike: Bicycle | null = null;
  submitting = false;
  errorMessage: string | null = null;

  customer: CustomerCreate = {
    vorname: '',
    nachname: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    stadt: '',
    telefon: '',
    email: '',
  };

  reservierungsDatum: string = new Date().toISOString().split('T')[0];
  /** „Reserviert bis" — aus dem Kalender, Vorbelegung: heute + 7 Tage. */
  ablaufDatum: string = ReservationFormComponent.datePlusDays(7);
  anzahlung: number | null = null;
  anzahlungZahlungsart: PaymentMethod | '' = '';
  verkaufspreis: number | null = null;
  kundenUnterschrift: string | null = null;
  notizen: string = '';

  // Fahrradsuche wie im Verkaufsformular
  lagernummerInput: number | null = null;
  rahmennummerInput = '';
  lagerSearchResults: Bicycle[] = [];
  rahmenSearchResults: Bicycle[] = [];
  showLagerDropdown = false;
  showRahmenDropdown = false;
  private rahmenSearchTimeout: any = null;

  private static datePlusDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.loadAvailableBikes();
  }

  loadAvailableBikes() {
    this.bicycleService.getAll().subscribe({
      next: (bikes) => {
        this.availableBikes = bikes.filter((b) => b.status === 'Available');
        // Pre-select bike if bicycleId query param provided
        const bicycleId = this.route.snapshot.queryParams['bicycleId'];
        if (bicycleId) {
          const preselected = this.availableBikes.find(
            (b) => b.id === +bicycleId,
          );
          if (preselected) {
            this.selectBike(preselected);
          }
        }
      },
      error: (err) => console.error('Error loading bikes:', err),
    });
  }

  // ── Fahrradsuche: gleiche Bedienung wie im Verkaufsformular ──

  /** Lagernummer: sofortiger Präfix-Treffer über die verfügbaren Räder. */
  onLagernummerChange(value: number | string | null | undefined) {
    this.lagerSearchResults = [];
    const term = value != null ? String(value).trim() : '';
    if (!term) {
      this.showLagerDropdown = false;
      return;
    }
    this.lagerSearchResults = this.availableBikes.filter(
      (b) => b.lagernummer != null && String(b.lagernummer).startsWith(term),
    );
    this.showLagerDropdown = this.lagerSearchResults.length > 0;
  }

  hideLagerDropdown() {
    // Kurze Verzögerung, damit mousedown auf dem Eintrag zuerst greift.
    setTimeout(() => (this.showLagerDropdown = false), 200);
  }

  /** Rahmennummer: serverseitige Suche ab zwei Zeichen. */
  onRahmennummerChange(value: string) {
    this.rahmenSearchResults = [];
    if (this.rahmenSearchTimeout) clearTimeout(this.rahmenSearchTimeout);
    const term = value?.trim() ?? '';
    if (term.length < 2) {
      this.showRahmenDropdown = false;
      return;
    }
    this.rahmenSearchTimeout = setTimeout(() => {
      this.bicycleService.search(term).subscribe({
        // Reservieren geht nur bei verfügbaren Rädern — verkaufte, bereits
        // reservierte und vermietete gehören nicht in den Vorschlag.
        next: (bikes) => {
          this.rahmenSearchResults = bikes.filter(
            (b) =>
              b.status === 'Available' &&
              b.rahmennummer?.toUpperCase().includes(term.toUpperCase()),
          );
          this.showRahmenDropdown = this.rahmenSearchResults.length > 0;
        },
        error: () => {},
      });
    }, 300);
  }

  hideRahmenDropdown() {
    setTimeout(() => (this.showRahmenDropdown = false), 200);
  }

  selectBike(bike: Bicycle) {
    this.selectedBike = bike;
    this.showLagerDropdown = false;
    this.showRahmenDropdown = false;
    this.lagerSearchResults = [];
    this.rahmenSearchResults = [];
    this.lagernummerInput = bike.lagernummer ?? null;
    this.rahmennummerInput = bike.rahmennummer || '';
    // Verkaufspreis aus dem Fahrrad vorbelegen, solange nichts Eigenes drinsteht.
    if (this.verkaufspreis == null && bike.verkaufspreisVorschlag != null) {
      this.verkaufspreis = bike.verkaufspreisVorschlag;
    }
  }

  clearBike() {
    this.selectedBike = null;
    this.lagernummerInput = null;
    this.rahmennummerInput = '';
    this.verkaufspreis = null;
  }

  /** Reservierungsdauer in Tagen — nur als Hinweis unter dem Datumsfeld. */
  reservationDays(): number {
    if (!this.reservierungsDatum || !this.ablaufDatum) return 0;
    const start = new Date(this.reservierungsDatum);
    const end = new Date(this.ablaufDatum);
    const diff = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, diff);
  }

  /** Offener Restbetrag = Verkaufspreis − Anzahlung. */
  restbetrag(): number {
    return (Number(this.verkaufspreis) || 0) - (Number(this.anzahlung) || 0);
  }

  canSubmit(): boolean {
    return !!(
      this.selectedBike &&
      this.customer.vorname.trim() &&
      this.customer.nachname.trim() &&
      this.customer.strasse?.trim() &&
      this.customer.hausnummer?.trim() &&
      this.customer.plz?.trim() &&
      this.customer.stadt?.trim() &&
      this.customer.telefon?.trim() &&
      this.ablaufDatum &&
      this.reservationDays() >= 0 &&
      !this.submitting
    );
  }

  submit() {
    if (!this.canSubmit()) return;

    this.submitting = true;
    this.errorMessage = null;

    const reservation: ReservationCreate = {
      bicycleId: this.selectedBike!.id,
      customer: this.customer,
      reservierungsDatum: this.reservierungsDatum || undefined,
      ablaufDatum: this.ablaufDatum || undefined,
      // Rückfallebene, falls kein Datum gesetzt ist — der Server nimmt dann Tage.
      reservierungsTage: this.reservationDays() || 7,
      anzahlung: this.anzahlung ?? undefined,
      anzahlungZahlungsart:
        (this.anzahlungZahlungsart as PaymentMethod) || undefined,
      verkaufspreis: this.verkaufspreis ?? undefined,
      kundenUnterschrift: this.kundenUnterschrift || undefined,
      notizen: this.notizen || undefined,
    };

    this.reservationService.create(reservation).subscribe({
      next: (created) => {
        console.log('Reservation created:', created);
        this.router.navigate(['/reservations']);
      },
      error: (err) => {
        console.error('Error creating reservation:', err);
        this.submitting = false;
        this.errorMessage = err.error?.error || this.t.reservationCreateError;
      },
    });
  }
}
