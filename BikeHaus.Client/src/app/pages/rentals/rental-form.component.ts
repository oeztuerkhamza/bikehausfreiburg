import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RentalService } from '../../services/rental.service';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import {
  RentalCreate,
  Bicycle,
  CustomerCreate,
  BikeConditionAtHandover,
} from '../../models/models';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { BikeSelectorComponent } from '../../components/bike-selector/bike-selector.component';
import { AddressSuggestion } from '../../services/address.service';

@Component({
  selector: 'app-rental-form',
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
        <h1>Neue Vermietung</h1>
        <a routerLink="/rentals" class="btn btn-outline">Zurück</a>
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

          <!-- Mieter (Renter) info -->
          <div class="form-card">
            <h2>Mieter</h2>
            <div class="form-grid">
              <div class="field">
                <label>Vorname *</label>
                <input
                  [(ngModel)]="customer.vorname"
                  name="customerVorname"
                  required
                />
              </div>
              <div class="field">
                <label>Nachname *</label>
                <input
                  [(ngModel)]="customer.nachname"
                  name="customerNachname"
                  required
                />
              </div>
              <div class="field full">
                <label>Adresse suchen</label>
                <app-address-autocomplete
                  placeholder="Adresse eingeben..."
                  (addressSelected)="onAddressSelected($event)"
                ></app-address-autocomplete>
              </div>
              <div class="field">
                <label>Straße *</label>
                <input
                  [(ngModel)]="customer.strasse"
                  name="customerStrasse"
                  required
                />
              </div>
              <div class="field">
                <label>Hausnummer *</label>
                <input
                  [(ngModel)]="customer.hausnummer"
                  name="customerHausnr"
                  required
                />
              </div>
              <div class="field">
                <label>PLZ *</label>
                <input [(ngModel)]="customer.plz" name="customerPlz" required />
              </div>
              <div class="field">
                <label>Stadt *</label>
                <input
                  [(ngModel)]="customer.stadt"
                  name="customerStadt"
                  required
                />
              </div>
              <div class="field">
                <label>Telefon *</label>
                <input
                  [(ngModel)]="customer.telefon"
                  name="customerTelefon"
                  required
                />
              </div>
              <div class="field">
                <label>E-Mail</label>
                <input
                  [(ngModel)]="customer.email"
                  name="customerEmail"
                  type="email"
                />
              </div>
              <div class="field">
                <label>Ausweis-Nr.</label>
                <input [(ngModel)]="ausweisnNr" name="ausweisnNr" />
              </div>
            </div>
          </div>

          <!-- Mietdetails -->
          <div class="form-card">
            <h2>Mietdetails</h2>
            <div class="form-grid">
              <div class="field">
                <label>Mietbeginn *</label>
                <input
                  type="date"
                  [(ngModel)]="startDatum"
                  name="startDatum"
                  required
                />
              </div>
              <div class="field">
                <label>Mietende *</label>
                <input
                  type="date"
                  [(ngModel)]="endDatum"
                  name="endDatum"
                  required
                />
              </div>
              <div class="field">
                <label>Gesamtmiete (€, inkl. MwSt.) *</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="gesamtmiete"
                  name="gesamtmiete"
                  required
                  min="0"
                />
              </div>
              <div class="field">
                <label>Kaution (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="kaution"
                  name="kaution"
                  required
                  min="0"
                />
              </div>
              <div class="field">
                <label>Kaution in Worten</label>
                <input
                  [(ngModel)]="kautionInWorten"
                  name="kautionInWorten"
                  placeholder="z.B. Einhundert"
                />
              </div>
              <div class="field">
                <label>Zustand bei Übergabe *</label>
                <select
                  [(ngModel)]="zustandBeiUebergabe"
                  name="zustandBeiUebergabe"
                  required
                >
                  <option value="SehrGut">Sehr gut</option>
                  <option value="Gut">Gut</option>
                  <option value="Gebrauchsspuren">Gebrauchsspuren</option>
                </select>
              </div>
              <div class="field full">
                <label>Notizen</label>
                <textarea
                  [(ngModel)]="notizen"
                  name="notizen"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/rentals" class="btn btn-outline">Abbrechen</a>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="submitting || !selectedBike || !f.form.valid"
          >
            {{ submitting ? 'Wird erstellt...' : 'Vermietung anlegen' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 900px;
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
      .form-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-card {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        box-shadow: var(--shadow-sm);
        padding: 24px;
      }
      .form-card h2 {
        font-size: 1rem;
        font-weight: 700;
        margin: 0 0 16px 0;
        color: var(--text-primary);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
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
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      input,
      select,
      textarea {
        padding: 10px 14px;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 0.92rem;
        transition: all 0.2s;
      }
      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      textarea {
        resize: vertical;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--border-light);
      }
      .btn {
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: white;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
        box-shadow: var(--shadow-sm);
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--border-color);
        color: var(--text-primary);
      }
      .btn-outline:hover {
        background: var(--bg-secondary, #f1f5f9);
      }
      @media (max-width: 640px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class RentalFormComponent implements OnInit {
  private rentalService = inject(RentalService);
  private bicycleService = inject(BicycleService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  availableBikes: Bicycle[] = [];
  selectedBike: Bicycle | null = null;

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

  ausweisnNr = '';
  startDatum = '';
  endDatum = '';
  gesamtmiete: number = 0;
  kaution: number = 0;
  kautionInWorten = '';
  zustandBeiUebergabe = 'Gut';
  notizen = '';
  submitting = false;

  ngOnInit() {
    this.bicycleService.getAll().subscribe({
      next: (bikes) => {
        this.availableBikes = bikes.filter((b) => b.status === 'Available');
      },
    });
    // Set default start date to today
    this.startDatum = new Date().toISOString().split('T')[0];
  }

  onBikeSelected(bike: Bicycle) {
    this.selectedBike = bike;
  }

  onAddressSelected(addr: AddressSuggestion) {
    this.customer.strasse = addr.strasse || '';
    this.customer.hausnummer = addr.hausnummer || '';
    this.customer.plz = addr.plz || '';
    this.customer.stadt = addr.stadt || '';
  }

  submit() {
    if (!this.selectedBike || this.submitting) return;

    this.submitting = true;

    const rental: RentalCreate = {
      bicycleId: this.selectedBike.id,
      customer: this.customer,
      ausweisnNr: this.ausweisnNr || undefined,
      startDatum: this.startDatum,
      endDatum: this.endDatum,
      gesamtmiete: this.gesamtmiete,
      kaution: this.kaution,
      kautionInWorten: this.kautionInWorten || undefined,
      zustandBeiUebergabe: this.zustandBeiUebergabe as BikeConditionAtHandover,
      notizen: this.notizen || undefined,
    };

    this.rentalService.create(rental).subscribe({
      next: () => {
        this.notificationService.success('Vermietung erfolgreich angelegt');
        this.router.navigate(['/rentals']);
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.error(
          err.error?.error || 'Fehler beim Anlegen der Vermietung',
        );
      },
    });
  }
}
