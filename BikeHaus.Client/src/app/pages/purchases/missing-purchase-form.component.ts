import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { CustomerService } from '../../services/customer.service';
import { TranslationService } from '../../services/translation.service';
import {
  PurchaseCreateForExistingBike,
  PaymentMethod,
  BikeCondition,
} from '../../models/models';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { AddressSuggestion } from '../../services/address.service';

@Component({
  selector: 'app-missing-purchase-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AddressAutocompleteComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.createPurchase }}</h1>
        <a routerLink="/purchases/missing" class="btn btn-outline">{{
          t.back
        }}</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Bicycle Info -->
          <div class="form-card">
            <h2>🚲 {{ t.bicycle }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.brand }} *</label>
                <input [(ngModel)]="bikeMarke" name="bikeMarke" required />
              </div>
              <div class="field">
                <label>{{ t.model }}</label>
                <input [(ngModel)]="bikeModell" name="bikeModell" />
              </div>
              <div class="field">
                <label>{{ t.frameNumber }} *</label>
                <input
                  [(ngModel)]="bikeRahmennummer"
                  name="bikeRahmennummer"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.frameSize }}</label>
                <input
                  [(ngModel)]="bikeRahmengroesse"
                  name="bikeRahmengroesse"
                />
              </div>
              <div class="field">
                <label>{{ t.color }}</label>
                <input [(ngModel)]="bikeFarbe" name="bikeFarbe" />
              </div>
              <div class="field">
                <label>{{ t.wheelSize }} *</label>
                <input
                  [(ngModel)]="bikeReifengroesse"
                  name="bikeReifengroesse"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.bicycleType }}</label>
                <input [(ngModel)]="bikeFahrradtyp" name="bikeFahrradtyp" />
              </div>
            </div>
          </div>

          <!-- Seller info -->
          <div class="form-card">
            <h2>{{ t.seller }} ({{ t.customer }})</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.firstName }}</label>
                <input
                  [(ngModel)]="seller.vorname"
                  name="sellerVorname"
                  autocomplete="off"
                  list="firstNameList"
                />
                <datalist id="firstNameList">
                  <option *ngFor="let n of firstNames" [value]="n"></option>
                </datalist>
              </div>
              <div class="field">
                <label>{{ t.lastName }}</label>
                <input
                  [(ngModel)]="seller.nachname"
                  name="sellerNachname"
                  autocomplete="off"
                  list="lastNameList"
                />
                <datalist id="lastNameList">
                  <option *ngFor="let n of lastNames" [value]="n"></option>
                </datalist>
              </div>
              <div class="field full">
                <label>{{ t.searchAddress }}</label>
                <app-address-autocomplete
                  placeholder="z.B. Bissierstraße 16, Freiburg"
                  (addressSelected)="onAddressSelected($event)"
                ></app-address-autocomplete>
              </div>
              <div class="field">
                <label>{{ t.street }}</label>
                <input [(ngModel)]="seller.strasse" name="sellerStrasse" />
              </div>
              <div class="field">
                <label>{{ t.houseNumber }}</label>
                <input [(ngModel)]="seller.hausnummer" name="sellerHausnr" />
              </div>
              <div class="field">
                <label>{{ t.postalCode }}</label>
                <input [(ngModel)]="seller.plz" name="sellerPlz" />
              </div>
              <div class="field">
                <label>{{ t.city }}</label>
                <input [(ngModel)]="seller.stadt" name="sellerStadt" />
              </div>
              <div class="field">
                <label>{{ t.phone }}</label>
                <input [(ngModel)]="seller.telefon" name="sellerTelefon" />
              </div>
              <div class="field">
                <label>{{ t.email }}</label>
                <input
                  [(ngModel)]="seller.email"
                  name="sellerEmail"
                  type="email"
                />
              </div>
            </div>
          </div>

          <!-- Purchase Details -->
          <div class="form-card">
            <h2>{{ t.purchases }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.receiptNo }}</label>
                <input [(ngModel)]="belegNummer" name="belegNummer" />
              </div>
              <div class="field">
                <label>{{ t.bicyclePrice }} *</label>
                <input
                  [(ngModel)]="preis"
                  name="preis"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.plannedSellingPrice }}</label>
                <input
                  [(ngModel)]="verkaufspreisVorschlag"
                  name="verkaufspreisVorschlag"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
              <div class="field">
                <label>{{ t.paymentMethodRequired }}</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option [value]="PaymentMethod.Bar">{{ t.cash }}</option>
                  <option [value]="PaymentMethod.PayPal">
                    {{ t.paypal }}
                  </option>
                  <option [value]="PaymentMethod.Karte">
                    {{ t.bankTransfer }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.purchaseDate }} *</label>
                <input
                  [(ngModel)]="kaufdatum"
                  name="kaufdatum"
                  type="date"
                  required
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

        <div class="form-actions">
          <a routerLink="/purchases/missing" class="btn btn-outline">{{
            t.back
          }}</a>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="submitting || !canSubmit()"
          >
            {{ submitting ? '...' : t.savePurchase }}
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
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 28px;
      }
      .page-header h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .form-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-card {
        background: var(--bg-secondary);
        border-radius: 14px;
        border: 1px solid var(--border-light);
        padding: 24px;
      }
      .form-card h2 {
        margin: 0 0 16px;
        font-size: 1.1rem;
        font-weight: 600;
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
      .field label {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-secondary);
      }
      .field input,
      .field select,
      .field textarea {
        padding: 10px 14px;
        border: 1.5px solid var(--border-color);
        border-radius: 10px;
        font-size: 0.9rem;
        background: var(--bg-primary);
        color: var(--text-primary);
        transition: border-color 0.2s;
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        border-color: var(--accent-primary);
        outline: none;
      }
      .field input.readonly {
        background: var(--bg-tertiary, rgba(0, 0, 0, 0.03));
        color: var(--text-muted);
        cursor: not-allowed;
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
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        text-decoration: none;
        border: none;
        transition: all 0.2s;
      }
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--border-color);
        color: var(--text-secondary);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
      }
      .btn-primary {
        background: var(--accent-primary);
        color: #fff;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 640px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
      }
    `,
  ],
})
export class MissingPurchaseFormComponent implements OnInit {
  private purchaseService = inject(PurchaseService);
  private customerService = inject(CustomerService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  PaymentMethod = PaymentMethod;

  // Bicycle info from query params (read-only)
  bicycleId = 0;
  bikeMarke = '';
  bikeModell = '';
  bikeRahmennummer = '';
  bikeRahmengroesse = '';
  bikeFarbe = '';
  bikeReifengroesse = '';
  bikeFahrradtyp = '';
  bikeArt = '';
  bikeZustand: BikeCondition = BikeCondition.Gebraucht;

  // Form fields
  seller = {
    vorname: '',
    nachname: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    stadt: '',
    telefon: '',
    email: '',
    steuernummer: '',
  };

  preis = 0;
  verkaufspreisVorschlag: number | null = null;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  kaufdatum = '';
  notizen = '';
  belegNummer = '';
  submitting = false;

  firstNames: string[] = [];
  lastNames: string[] = [];

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.kaufdatum = new Date().toISOString().split('T')[0];

    // Read bicycle data from query params
    this.route.queryParams.subscribe((params) => {
      this.bicycleId = +params['bicycleId'] || 0;
      this.bikeMarke = params['marke'] || '';
      this.bikeModell = params['modell'] || '';
      this.bikeRahmennummer = params['rahmennummer'] || '';
      this.bikeRahmengroesse = params['rahmengroesse'] || '';
      this.bikeFarbe = params['farbe'] || '';
      this.bikeReifengroesse = params['reifengroesse'] || '';
      this.bikeFahrradtyp = params['fahrradtyp'] || '';
      this.bikeArt = params['art'] || '';
      this.bikeZustand =
        (params['zustand'] as BikeCondition) || BikeCondition.Gebraucht;

      // Pre-fill suggested selling price from sale price
      if (params['salePreis']) {
        this.verkaufspreisVorschlag = +params['salePreis'];
      }
    });

    // Get next Belegnummer
    this.purchaseService.getNextBelegNummer().subscribe({
      next: (res) => {
        this.belegNummer = res.belegNummer;
      },
      error: () => {},
    });

    // Load customer names for autocomplete
    this.customerService.getFirstNames().subscribe({
      next: (res) => {
        this.firstNames = res;
      },
      error: () => {},
    });
    this.customerService.getLastNames().subscribe({
      next: (res) => {
        this.lastNames = res;
      },
      error: () => {},
    });
  }

  onAddressSelected(address: AddressSuggestion) {
    this.seller.strasse = address.strasse;
    this.seller.hausnummer = address.hausnummer;
    this.seller.plz = address.plz;
    this.seller.stadt = address.stadt;
  }

  canSubmit(): boolean {
    return !!(
      this.bicycleId > 0 &&
      this.bikeMarke?.trim() &&
      this.bikeRahmennummer?.trim() &&
      this.bikeReifengroesse?.trim() &&
      this.preis > 0 &&
      this.kaufdatum
    );
  }

  submit() {
    if (!this.canSubmit() || this.submitting) return;
    this.submitting = true;

    const dto: PurchaseCreateForExistingBike = {
      bicycleId: this.bicycleId,
      seller: {
        vorname: this.seller.vorname,
        nachname: this.seller.nachname,
        strasse: this.seller.strasse || undefined,
        hausnummer: this.seller.hausnummer || undefined,
        plz: this.seller.plz || undefined,
        stadt: this.seller.stadt || undefined,
        telefon: this.seller.telefon || undefined,
        email: this.seller.email || undefined,
        steuernummer: this.seller.steuernummer || undefined,
      },
      preis: this.preis,
      verkaufspreisVorschlag: this.verkaufspreisVorschlag ?? undefined,
      zahlungsart: this.zahlungsart,
      kaufdatum: this.kaufdatum,
      notizen: this.notizen || undefined,
      belegNummer: this.belegNummer || undefined,
      marke: this.bikeMarke || undefined,
      modell: this.bikeModell || undefined,
      rahmennummer: this.bikeRahmennummer || undefined,
      rahmengroesse: this.bikeRahmengroesse || undefined,
      farbe: this.bikeFarbe || undefined,
      reifengroesse: this.bikeReifengroesse || undefined,
      fahrradtyp: this.bikeFahrradtyp || undefined,
      art: this.bikeArt || undefined,
      zustand: this.bikeZustand,
    };

    this.purchaseService.createForExistingBike(dto).subscribe({
      next: () => {
        this.router.navigate(['/purchases/missing']);
      },
      error: () => {
        this.submitting = false;
      },
    });
  }
}
