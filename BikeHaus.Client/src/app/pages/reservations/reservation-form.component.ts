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
} from '../../models/models';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { BikeSelectorComponent } from '../../components/bike-selector/bike-selector.component';
import { AddressSuggestion } from '../../services/address.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AddressAutocompleteComponent,
    BikeSelectorComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.newReservation }}</h1>
        <a routerLink="/reservations" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Bicycle selection -->
          <div class="form-card">
            <h2>Fahrrad auswählen</h2>
            <app-bike-selector
              [bikes]="availableBikes"
              [(selectedBike)]="selectedBike"
              (bikeSelected)="onBikeSelected($event)"
            ></app-bike-selector>
          </div>

          <!-- Customer info -->
          <div class="form-card">
            <h2>Kunde</h2>
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
              <div class="field full">
                <label>Adresse suchen</label>
                <app-address-autocomplete
                  placeholder="z.B. Bissierstraße 16, Freiburg"
                  (addressSelected)="onAddressSelected($event)"
                ></app-address-autocomplete>
                <small class="hint"
                  >Tippen Sie eine Adresse ein für Vorschläge</small
                >
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
            <h2>Reservierungsdaten</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.reservationDate }}</label>
                <input
                  type="date"
                  [(ngModel)]="reservierungsDatum"
                  name="reservierungsDatum"
                />
              </div>
              <div class="field">
                <label>{{ t.reservationDays }} *</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  [(ngModel)]="reservierungsTage"
                  name="reservierungsTage"
                  required
                />
                <small class="hint"
                  >Ablaufdatum: {{ getExpirationDate() }}</small
                >
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
        </div>

        <!-- Validation messages -->
        <div class="validation-errors" *ngIf="!canSubmit() && !submitting">
          <p *ngIf="!selectedBike" class="error-msg">
            ⚠️ Bitte wählen Sie ein Fahrrad aus
          </p>
          <p *ngIf="!customer.vorname?.trim()" class="error-msg">
            ⚠️ Vorname ist erforderlich
          </p>
          <p *ngIf="!customer.nachname?.trim()" class="error-msg">
            ⚠️ Nachname ist erforderlich
          </p>
          <p *ngIf="!customer.strasse?.trim()" class="error-msg">
            ⚠️ Straße ist erforderlich
          </p>
          <p *ngIf="!customer.hausnummer?.trim()" class="error-msg">
            ⚠️ Hausnummer ist erforderlich
          </p>
          <p *ngIf="!customer.plz?.trim()" class="error-msg">
            ⚠️ PLZ ist erforderlich
          </p>
          <p *ngIf="!customer.stadt?.trim()" class="error-msg">
            ⚠️ Stadt ist erforderlich
          </p>
          <p *ngIf="!customer.telefon?.trim()" class="error-msg">
            ⚠️ Telefon ist erforderlich
          </p>
          <p *ngIf="reservierungsTage <= 0" class="error-msg">
            ⚠️ Reservierungstage muss größer als 0 sein
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
  reservierungsTage: number = 7;
  anzahlung: number | null = null;
  notizen: string = '';

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
            this.selectedBike = preselected;
          }
        }
      },
      error: (err) => console.error('Error loading bikes:', err),
    });
  }

  onBikeSelected(bike: Bicycle) {
    this.selectedBike = bike;
  }

  onAddressSelected(address: AddressSuggestion) {
    this.customer.strasse = address.strasse || '';
    this.customer.hausnummer = address.hausnummer || '';
    this.customer.plz = address.plz || '';
    this.customer.stadt = address.stadt || '';
  }

  getExpirationDate(): string {
    const date = this.reservierungsDatum
      ? new Date(this.reservierungsDatum)
      : new Date();
    date.setDate(date.getDate() + this.reservierungsTage);
    return date.toLocaleDateString('de-DE');
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
      this.reservierungsTage > 0 &&
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
      reservierungsTage: this.reservierungsTage,
      anzahlung: this.anzahlung || undefined,
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
        this.errorMessage =
          err.error?.error || 'Fehler beim Erstellen der Reservierung';
      },
    });
  }
}
