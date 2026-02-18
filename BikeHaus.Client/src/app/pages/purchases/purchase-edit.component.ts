import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { TranslationService } from '../../services/translation.service';
import {
  Purchase,
  PurchaseUpdate,
  PaymentMethod,
  BikeCondition,
  BikeStatus,
} from '../../models/models';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { AddressSuggestion } from '../../services/address.service';

@Component({
  selector: 'app-purchase-edit',
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
        <h1>{{ t.editPurchase }}</h1>
        <a routerLink="/purchases" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <div *ngIf="loading" class="loading">{{ t.loading }}</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <form *ngIf="purchase && !loading" (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Seller info -->
          <div class="form-card">
            <h2>{{ t.seller }} ({{ t.customer }})</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.firstNameRequired }}</label>
                <input
                  [(ngModel)]="seller.vorname"
                  name="sellerVorname"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.lastNameRequired }}</label>
                <input
                  [(ngModel)]="seller.nachname"
                  name="sellerNachname"
                  required
                />
              </div>
              <div class="field full">
                <label>{{ t.searchAddress }}</label>
                <app-address-autocomplete
                  placeholder="z.B. Bissierstraße 16, Freiburg"
                  (addressSelected)="onSellerAddressSelected($event)"
                ></app-address-autocomplete>
                <small class="hint"
                  >{{ t.addressHint }}</small
                >
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
                <input [(ngModel)]="seller.telefon" name="sellerTel" />
              </div>
              <div class="field">
                <label>{{ t.email }}</label>
                <input
                  type="email"
                  [(ngModel)]="seller.email"
                  name="sellerEmail"
                />
              </div>
            </div>
          </div>

          <!-- Bicycle info -->
          <div class="form-card">
            <h2>{{ t.bicycle }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.brand }} *</label>
                <input [(ngModel)]="bicycle.marke" name="bikeMarke" required />
              </div>
              <div class="field">
                <label>{{ t.model }} *</label>
                <input
                  [(ngModel)]="bicycle.modell"
                  name="bikeModell"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.frameNumber }} *</label>
                <input
                  [(ngModel)]="bicycle.rahmennummer"
                  name="bikeRahmen"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.color }} *</label>
                <input [(ngModel)]="bicycle.farbe" name="bikeFarbe" required />
              </div>
              <div class="field">
                <label>{{ t.wheelSize }} *</label>
                <input
                  [(ngModel)]="bicycle.reifengroesse"
                  name="bikeReifen"
                  required
                  placeholder="z.B. 28"
                />
              </div>
              <div class="field">
                <label>{{ t.stockNo }}</label>
                <input
                  [(ngModel)]="bicycle.stokNo"
                  name="bikeStokNo"
                  placeholder="optional"
                />
              </div>
              <div class="field">
                <label>{{ t.bicycleType }}</label>
                <select [(ngModel)]="bicycle.fahrradtyp" name="bikeFahrradtyp">
                  <option value="">-- Auswählen --</option>
                  <option value="E-Bike">E-Bike</option>
                  <option value="E-Trekking Pedelec">E-Trekking Pedelec</option>
                  <option value="Trekking">Trekking</option>
                  <option value="City">City</option>
                  <option value="MTB">Mountainbike (MTB)</option>
                  <option value="Rennrad">Rennrad</option>
                  <option value="Kinderfahrrad">Kinderfahrrad</option>
                  <option value="Lastenrad">Lastenrad</option>
                  <option value="Sonstige">Sonstige</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.condition }} *</label>
                <select
                  [(ngModel)]="bicycle.zustand"
                  name="bikeZustand"
                  required
                >
                  <option value="Gebraucht">
                    {{ t.usedCondition }}
                  </option>
                  <option value="Neu">{{ t.newCondition }}</option>
                </select>
              </div>
              <div class="field full">
                <label>{{ t.descriptionEquipment }}</label>
                <textarea
                  [(ngModel)]="bicycle.beschreibung"
                  name="bikeBeschr"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Purchase details -->
          <div class="form-card">
            <h2>{{ t.purchaseData }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.priceRequired }}</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="preis"
                  name="preis"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.plannedSellingPrice }} (€)</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="verkaufspreisVorschlag"
                  name="verkaufspreisVorschlag"
                  placeholder="optional"
                />
              </div>
              <div class="field">
                <label>{{ t.paymentMethodRequired }}</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">{{ t.cash }}</option>
                  <option value="PayPal">{{ t.paypal }}</option>
                  <option value="Ueberweisung">{{ t.bankTransfer }}</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.purchaseDate }} *</label>
                <input
                  type="date"
                  [(ngModel)]="kaufdatum"
                  name="kaufdatum"
                  required
                />
              </div>
              <div class="field full">
                <label>{{ t.notes }}</label>
                <textarea
                  [(ngModel)]="notizen"
                  name="notizen"
                  rows="2"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            [disabled]="submitting"
          >
            {{ submitting ? t.saving : t.saveChanges }}
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
        margin-bottom: 22px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .loading,
      .error {
        text-align: center;
        padding: 48px;
        font-size: 1.1rem;
        color: var(--text-secondary, #64748b);
      }
      .error {
        color: var(--accent-danger, #ef4444);
      }
      .form-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .form-card h2 {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 600px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
      .field label {
        display: block;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .field input,
      .field select,
      .field textarea {
        width: 100%;
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field .hint {
        display: block;
        font-size: 0.73rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 4px;
      }
      .form-actions {
        margin-top: 24px;
        text-align: right;
      }
      .btn-lg {
        padding: 12px 32px;
        font-size: 1.05rem;
      }
    `,
  ],
})
export class PurchaseEditComponent implements OnInit {
  private translationService = inject(TranslationService);
  get t() { return this.translationService.translations(); }

  purchase: Purchase | null = null;
  loading = true;
  error = '';
  submitting = false;

  seller = {
    vorname: '',
    nachname: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    stadt: '',
    telefon: '',
    email: '',
  };

  bicycle = {
    marke: '',
    modell: '',
    rahmennummer: '',
    farbe: '',
    reifengroesse: '',
    stokNo: '',
    fahrradtyp: '',
    beschreibung: '',
    status: BikeStatus.Available,
    zustand: BikeCondition.Gebraucht,
  };

  preis = 0;
  verkaufspreisVorschlag: number | null = null;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  kaufdatum = '';
  notizen = '';

  constructor(
    private purchaseService: PurchaseService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = this.t.invalidPurchaseId;
      this.loading = false;
      return;
    }

    this.purchaseService.getById(+id).subscribe({
      next: (purchase) => {
        this.purchase = purchase;
        this.loadFormData(purchase);
        this.loading = false;
      },
      error: () => {
        this.error = this.t.purchaseNotFound;
        this.loading = false;
      },
    });
  }

  private loadFormData(purchase: Purchase) {
    // Load seller data
    if (purchase.seller) {
      this.seller = {
        vorname: purchase.seller.vorname || '',
        nachname: purchase.seller.nachname || '',
        strasse: purchase.seller.strasse || '',
        hausnummer: purchase.seller.hausnummer || '',
        plz: purchase.seller.plz || '',
        stadt: purchase.seller.stadt || '',
        telefon: purchase.seller.telefon || '',
        email: purchase.seller.email || '',
      };
    }

    // Load bicycle data
    if (purchase.bicycle) {
      this.bicycle = {
        marke: purchase.bicycle.marke || '',
        modell: purchase.bicycle.modell || '',
        rahmennummer: purchase.bicycle.rahmennummer || '',
        farbe: purchase.bicycle.farbe || '',
        reifengroesse: purchase.bicycle.reifengroesse || '',
        stokNo: purchase.bicycle.stokNo || '',
        fahrradtyp: purchase.bicycle.fahrradtyp || '',
        beschreibung: purchase.bicycle.beschreibung || '',
        status: (purchase.bicycle.status as BikeStatus) || BikeStatus.Available,
        zustand:
          (purchase.bicycle.zustand as BikeCondition) ||
          BikeCondition.Gebraucht,
      };
    }

    // Load purchase data
    this.preis = purchase.preis;
    this.verkaufspreisVorschlag = purchase.verkaufspreisVorschlag || null;
    this.zahlungsart = purchase.zahlungsart as PaymentMethod;
    this.kaufdatum = purchase.kaufdatum
      ? new Date(purchase.kaufdatum).toISOString().split('T')[0]
      : '';
    this.notizen = purchase.notizen || '';
  }

  onSellerAddressSelected(address: AddressSuggestion) {
    this.seller.strasse = address.strasse;
    this.seller.hausnummer = address.hausnummer;
    this.seller.plz = address.plz;
    this.seller.stadt = address.stadt;
  }

  submit() {
    if (!this.purchase) return;
    this.submitting = true;

    const update: PurchaseUpdate = {
      bicycle: this.bicycle,
      seller: this.seller,
      preis: this.preis,
      verkaufspreisVorschlag: this.verkaufspreisVorschlag || undefined,
      zahlungsart: this.zahlungsart,
      kaufdatum: this.kaufdatum,
      notizen: this.notizen || undefined,
    };

    this.purchaseService.update(this.purchase.id, update).subscribe({
      next: () => {
        this.router.navigate(['/purchases']);
      },
      error: () => {
        this.submitting = false;
        alert(this.t.saveError);
      },
    });
  }
}
