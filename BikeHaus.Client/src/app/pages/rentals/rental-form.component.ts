import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RentalService } from '../../services/rental.service';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';
import {
  RentalCreate,
  Bicycle,
  BicycleUpdate,
  BikeCondition,
  CustomerCreate,
  BikeConditionAtHandover,
  PaymentMethod,
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
              [allowQuickAdd]="true"
              (bikeSelected)="onBikeSelected($event)"
              (quickAddRequested)="onQuickAddBike()"
            ></app-bike-selector>

            <!-- Quick-add bike form -->
            <div class="quick-add-form" *ngIf="isQuickAddMode">
              <h3>🆕 Neues Fahrrad</h3>
              <div class="form-grid">
                <div class="field">
                  <label>Rahmennummer *</label>
                  <input
                    [(ngModel)]="bikeEdit.rahmennummer"
                    name="bikeRahmen"
                    style="text-transform: uppercase"
                    required
                  />
                </div>
                <div class="field">
                  <label>Marke *</label>
                  <input
                    [(ngModel)]="bikeEdit.marke"
                    name="bikeMarke"
                    required
                  />
                </div>
                <div class="field">
                  <label>Modell *</label>
                  <input
                    [(ngModel)]="bikeEdit.modell"
                    name="bikeModell"
                    required
                  />
                </div>
                <div class="field">
                  <label>Farbe</label>
                  <input [(ngModel)]="bikeEdit.farbe" name="bikeFarbe" />
                </div>
                <div class="field">
                  <label>Reifengröße</label>
                  <input
                    [(ngModel)]="bikeEdit.reifengroesse"
                    name="bikeReifen"
                  />
                </div>
                <div class="field">
                  <label>Fahrradtyp</label>
                  <input
                    [(ngModel)]="bikeEdit.fahrradtyp"
                    name="bikeFahrradtyp"
                  />
                </div>
              </div>
            </div>

            <!-- Edit selected bike -->
            <div class="bike-edit-form" *ngIf="selectedBike && !isQuickAddMode">
              <h3>🚲 Fahrrad-Details</h3>
              <div class="form-grid">
                <div class="field">
                  <label>Rahmennummer</label>
                  <input
                    [(ngModel)]="bikeEdit.rahmennummer"
                    name="bikeRahmen"
                    style="text-transform: uppercase"
                  />
                </div>
                <div class="field">
                  <label>Marke *</label>
                  <input
                    [(ngModel)]="bikeEdit.marke"
                    name="bikeMarke"
                    required
                  />
                </div>
                <div class="field">
                  <label>Modell *</label>
                  <input
                    [(ngModel)]="bikeEdit.modell"
                    name="bikeModell"
                    required
                  />
                </div>
                <div class="field">
                  <label>Farbe</label>
                  <input [(ngModel)]="bikeEdit.farbe" name="bikeFarbe" />
                </div>
                <div class="field">
                  <label>Reifengröße</label>
                  <input
                    [(ngModel)]="bikeEdit.reifengroesse"
                    name="bikeReifen"
                  />
                </div>
                <div class="field">
                  <label>Fahrradtyp</label>
                  <input
                    [(ngModel)]="bikeEdit.fahrradtyp"
                    name="bikeFahrradtyp"
                  />
                </div>
              </div>
            </div>
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
                  (ngModelChange)="onDatesChanged()"
                />
              </div>
              <div class="field">
                <label>Mietende *</label>
                <input
                  type="date"
                  [(ngModel)]="endDatum"
                  name="endDatum"
                  required
                  (ngModelChange)="onDatesChanged()"
                />
              </div>
            </div>

            <!-- Price calculation info -->
            <div class="price-calc" *ngIf="rentalDays > 0">
              <div class="calc-header">
                <span class="calc-days"
                  >{{ rentalDays }} Tag{{ rentalDays > 1 ? 'e' : '' }}</span
                >
                <span class="calc-price"
                  >Berechneter Preis:
                  {{ berechneterPreis | number: '1.2-2' }} €</span
                >
              </div>
              <div class="calc-breakdown" *ngIf="preisInfo">
                <span class="calc-info">{{ preisInfo }}</span>
              </div>
            </div>

            <div class="form-grid" style="margin-top: 12px;">
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
                <label>Rabatt (€)</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="rabatt"
                  name="rabatt"
                  min="0"
                  (ngModelChange)="onRabattChanged()"
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
                <label>Zahlungsart *</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">Bar</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Karte">Karte</option>
                  <option value="Überweisung">Überweisung</option>
                </select>
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
            [disabled]="
              submitting || (!selectedBike && !isQuickAddMode) || !f.form.valid
            "
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
      .quick-add-form {
        margin-top: 16px;
        padding: 16px;
        background: var(--accent-success-light, rgba(16, 185, 129, 0.04));
        border-radius: var(--radius-md, 10px);
        border: 1.5px dashed var(--accent-success, #10b981);
      }
      .quick-add-form h3 {
        margin: 0 0 12px 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--accent-success, #10b981);
      }
      .bike-edit-form {
        margin-top: 16px;
        padding: 16px;
        background: var(--bg-secondary, #f8fafc);
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .bike-edit-form h3 {
        margin: 0 0 12px 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--accent-primary, #6366f1);
      }
      .price-calc {
        margin-top: 12px;
        padding: 12px 16px;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--accent-primary, #6366f1);
      }
      .calc-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--accent-primary, #6366f1);
      }
      .calc-days {
        background: var(--accent-primary, #6366f1);
        color: white;
        padding: 2px 10px;
        border-radius: 50px;
        font-size: 0.82rem;
      }
      .calc-breakdown {
        margin-top: 6px;
        font-size: 0.82rem;
        color: var(--text-secondary, #64748b);
      }
    `,
  ],
})
export class RentalFormComponent implements OnInit {
  private rentalService = inject(RentalService);
  private bicycleService = inject(BicycleService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);

  availableBikes: Bicycle[] = [];
  selectedBike: Bicycle | null = null;
  isQuickAddMode = false;

  bikeEdit = {
    rahmennummer: '',
    marke: '',
    modell: '',
    farbe: '',
    reifengroesse: '',
    fahrradtyp: '',
  };

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
  rabatt: number = 0;
  berechneterPreis: number = 0;
  rentalDays: number = 0;
  preisInfo: string = '';
  kaution: number = 0;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
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
    this.isQuickAddMode = false;
    // Populate bikeEdit from selected bike
    this.bikeEdit = {
      rahmennummer: bike.rahmennummer || '',
      marke: bike.marke || '',
      modell: bike.modell || '',
      farbe: bike.farbe || '',
      reifengroesse: bike.reifengroesse || '',
      fahrradtyp: bike.fahrradtyp || '',
    };
  }

  onQuickAddBike() {
    this.isQuickAddMode = true;
    this.selectedBike = null;
    this.bikeEdit = {
      rahmennummer: '',
      marke: '',
      modell: '',
      farbe: '',
      reifengroesse: '',
      fahrradtyp: '',
    };
  }

  onAddressSelected(addr: AddressSuggestion) {
    this.customer.strasse = addr.strasse || '';
    this.customer.hausnummer = addr.hausnummer || '';
    this.customer.plz = addr.plz || '';
    this.customer.stadt = addr.stadt || '';
  }

  onDatesChanged() {
    if (!this.startDatum || !this.endDatum) return;
    const start = new Date(this.startDatum);
    const end = new Date(this.endDatum);
    const diffMs = end.getTime() - start.getTime();
    this.rentalDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    if (this.rentalDays > 0) {
      this.berechneterPreis = this.calculatePrice(this.rentalDays);
      this.gesamtmiete = Math.max(0, this.berechneterPreis - this.rabatt);
    }
  }

  onRabattChanged() {
    if (this.berechneterPreis > 0) {
      this.gesamtmiete = Math.max(
        0,
        this.berechneterPreis - (this.rabatt || 0),
      );
    }
  }

  calculatePrice(days: number): number {
    // Pricing tiers matching homepage packages
    if (days <= 1) {
      this.preisInfo = '1 Tag = 12,00 €';
      return 12;
    }
    if (days <= 3) {
      this.preisInfo = '3 Tage-Paket = 30,00 €';
      return 30;
    }
    if (days <= 7) {
      this.preisInfo = '7 Tage-Paket = 55,00 €';
      return 55;
    }
    if (days <= 14) {
      this.preisInfo = '14 Tage-Paket = 95,00 €';
      return 95;
    }
    if (days <= 30) {
      this.preisInfo = '30 Tage-Paket = 160,00 €';
      return 160;
    }
    // 31+ days: 30-day package + extra days at 6.50€/day
    const extraDays = days - 30;
    const price = 160 + extraDays * 6.5;
    this.preisInfo = `30 Tage (160,00 €) + ${extraDays} Tag(e) × 6,50 € = ${price.toFixed(2)} €`;
    return Math.round(price * 100) / 100;
  }

  submit() {
    if (this.submitting) return;

    // Quick-add mode: create bicycle first
    if (this.isQuickAddMode) {
      if (
        !this.bikeEdit.rahmennummer ||
        !this.bikeEdit.marke ||
        !this.bikeEdit.modell
      ) {
        this.notificationService.error(
          'Bitte Rahmennummer, Marke und Modell ausfüllen',
        );
        return;
      }
      this.submitting = true;
      this.bicycleService
        .create({
          rahmennummer: this.bikeEdit.rahmennummer.toUpperCase(),
          marke: this.bikeEdit.marke,
          modell: this.bikeEdit.modell,
          farbe: this.bikeEdit.farbe || undefined,
          reifengroesse: this.bikeEdit.reifengroesse || undefined,
          fahrradtyp: this.bikeEdit.fahrradtyp || undefined,
          status: 'Available',
        } as any)
        .subscribe({
          next: (bike) => {
            this.createRental(bike.id);
          },
          error: (err) => {
            this.submitting = false;
            this.notificationService.error(
              err.error?.error || 'Fehler beim Erstellen des Fahrrads',
            );
          },
        });
    } else {
      if (!this.selectedBike) return;
      this.submitting = true;
      // Update bike details first, then create rental
      const bikeUpdate: BicycleUpdate = {
        marke: this.bikeEdit.marke,
        modell: this.bikeEdit.modell,
        rahmennummer: this.bikeEdit.rahmennummer || undefined,
        farbe: this.bikeEdit.farbe || undefined,
        reifengroesse: this.bikeEdit.reifengroesse || '',
        fahrradtyp: this.bikeEdit.fahrradtyp || undefined,
        status: this.selectedBike.status as any,
        zustand: (this.selectedBike.zustand || 'Gebraucht') as BikeCondition,
      };
      this.bicycleService.update(this.selectedBike.id, bikeUpdate).subscribe({
        next: () => this.createRental(this.selectedBike!.id),
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(
            err.error?.error || 'Fehler beim Aktualisieren des Fahrrads',
          );
        },
      });
    }
  }

  private createRental(bicycleId: number) {
    const rental: RentalCreate = {
      bicycleId,
      customer: this.customer,
      ausweisnNr: this.ausweisnNr || undefined,
      startDatum: this.startDatum,
      endDatum: this.endDatum,
      gesamtmiete: this.gesamtmiete,
      rabatt: this.rabatt || 0,
      kaution: this.kaution,
      zahlungsart: this.zahlungsart,
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
