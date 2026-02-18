import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SaleService } from '../../services/sale.service';
import { BicycleService } from '../../services/bicycle.service';
import { PurchaseService } from '../../services/purchase.service';
import { SettingsService } from '../../services/settings.service';
import { TranslationService } from '../../services/translation.service';
import {
  SaleCreate,
  Bicycle,
  PaymentMethod,
  SignatureCreate,
  SaleAccessoryCreate,
  AccessoryCatalogList,
} from '../../models/models';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { BikeSelectorComponent } from '../../components/bike-selector/bike-selector.component';
import { AccessoryAutocompleteComponent } from '../../components/accessory-autocomplete/accessory-autocomplete.component';
import { AddressSuggestion } from '../../services/address.service';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SignaturePadComponent,
    AddressAutocompleteComponent,
    BikeSelectorComponent,
    AccessoryAutocompleteComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.newSaleTitle }}</h1>
        <a routerLink="/sales" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Bicycle selection -->
          <div class="form-card">
            <h2>{{ t.selectBicycle }}</h2>
            <app-bike-selector
              [bikes]="availableBikes"
              [(selectedBike)]="selectedBike"
              (bikeSelected)="onBikeSelected($event)"
            ></app-bike-selector>
          </div>

          <!-- Buyer info -->
          <div class="form-card">
            <h2>{{ t.buyer }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.firstNameRequired }}</label>
                <input
                  [(ngModel)]="buyer.vorname"
                  name="buyerVorname"
                  required
                  (ngModelChange)="updateBuyerSignerName()"
                />
              </div>
              <div class="field">
                <label>{{ t.lastNameRequired }}</label>
                <input
                  [(ngModel)]="buyer.nachname"
                  name="buyerNachname"
                  required
                  (ngModelChange)="updateBuyerSignerName()"
                />
              </div>
              <div class="field full">
                <label>{{ t.searchAddress }}</label>
                <app-address-autocomplete
                  [placeholder]="t.addressPlaceholder"
                  (addressSelected)="onBuyerAddressSelected($event)"
                ></app-address-autocomplete>
                <small class="hint"
                  >{{ t.addressHint }}</small
                >
              </div>
              <div class="field">
                <label>{{ t.streetRequired }}</label>
                <input
                  [(ngModel)]="buyer.strasse"
                  name="buyerStrasse"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.houseNumberRequired }}</label>
                <input
                  [(ngModel)]="buyer.hausnummer"
                  name="buyerHausnr"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.postalCodeRequired }}</label>
                <input [(ngModel)]="buyer.plz" name="buyerPlz" required />
              </div>
              <div class="field">
                <label>{{ t.cityRequired }}</label>
                <input [(ngModel)]="buyer.stadt" name="buyerStadt" required />
              </div>
              <div class="field">
                <label>{{ t.phoneRequired }}</label>
                <input [(ngModel)]="buyer.telefon" name="buyerTel" required />
              </div>
              <div class="field">
                <label>{{ t.email }}</label>
                <input
                  type="email"
                  [(ngModel)]="buyer.email"
                  name="buyerEmail"
                />
              </div>
            </div>
          </div>

          <!-- Sale details -->
          <div class="form-card">
            <h2>{{ t.saleData }}</h2>
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
                <label>{{ t.paymentMethodRequired }}</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">{{ t.cash }}</option>
                  <option value="PayPal">{{ t.paypal }}</option>
                  <option value="Ueberweisung">{{ t.bankTransfer }}</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.saleDateRequired }}</label>
                <input
                  type="date"
                  [(ngModel)]="verkaufsdatum"
                  name="verkaufsdatum"
                  required
                />
              </div>
              <div class="field" *ngIf="selectedBike">
                <label>{{ t.warranty }}</label>
                <div class="warranty-info">
                  <span
                    class="warranty-badge"
                    [class.warranty-new]="selectedBike.zustand === 'Neu'"
                  >
                    {{
                      selectedBike.zustand === 'Neu'
                        ? t.warrantyNew
                        : t.warrantyUsed
                    }}
                  </span>
                  <small
                    >({{
                      selectedBike.zustand === 'Neu'
                        ? t.newBicycle
                        : t.usedBicycle
                    }})</small
                  >
                </div>
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

          <!-- Accessories (Zubehör) -->
          <div class="form-card">
            <h2>{{ t.accessoriesOptional }}</h2>
            <p class="hint">
              {{ t.accessorySaleHint }}
            </p>

            <!-- Autocomplete to add from catalog -->
            <div class="field" style="margin-bottom: 16px;">
              <label>{{ t.addAccessoryFromCatalog }}</label>
              <app-accessory-autocomplete
                [placeholder]="t.searchAccessory"
                (itemSelected)="addAccessoryFromCatalog($event)"
              ></app-accessory-autocomplete>
            </div>

            <div class="accessories-list" *ngIf="accessories.length > 0">
              <div
                class="accessory-item"
                *ngFor="let acc of accessories; let i = index"
              >
                <div class="accessory-fields">
                  <div class="field">
                    <label>{{ t.designation }}</label>
                    <input
                      [(ngModel)]="acc.bezeichnung"
                      [name]="'accBez' + i"
                      placeholder="z.B. Fahrradschloss"
                      required
                    />
                  </div>
                  <div class="field">
                    <label>{{ t.price }} (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      [(ngModel)]="acc.preis"
                      [name]="'accPreis' + i"
                      required
                    />
                  </div>
                  <div class="field">
                    <label>{{ t.quantity }}</label>
                    <input
                      type="number"
                      min="1"
                      [(ngModel)]="acc.menge"
                      [name]="'accMenge' + i"
                      required
                    />
                  </div>
                  <div class="field accessory-total">
                    <label>{{ t.total }}</label>
                    <span class="total-value"
                      >{{ acc.preis * acc.menge | number: '1.2-2' }} €</span
                    >
                  </div>
                  <button
                    type="button"
                    class="btn btn-icon btn-danger"
                    (click)="removeAccessory(i)"
                    [title]="t.remove"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <div class="accessory-summary" *ngIf="accessories.length > 0">
              <span>{{ t.accessoriesTotal }}:</span>
              <strong>{{ accessoriesTotal | number: '1.2-2' }} €</strong>
            </div>

            <button
              type="button"
              class="btn btn-outline btn-sm"
              (click)="addAccessory()"
            >
              + {{ t.addManually }}
            </button>

            <div class="grand-total" *ngIf="preis > 0">
              <div class="total-row">
                <span>{{ t.bicyclePrice }}:</span>
                <span>{{ preis | number: '1.2-2' }} €</span>
              </div>
              <div class="total-row" *ngIf="accessories.length > 0">
                <span>{{ t.accessories }}:</span>
                <span>{{ accessoriesTotal | number: '1.2-2' }} €</span>
              </div>
              <div class="total-row grand">
                <span>{{ t.grandTotal }}:</span>
                <strong
                  >{{ preis + accessoriesTotal | number: '1.2-2' }} €</strong
                >
              </div>
            </div>
          </div>

          <!-- Signatures -->
          <div class="form-card">
            <h2>{{ t.signatures }}</h2>
            <app-signature-pad
              [label]="t.buyerSignature"
              [(ngModel)]="buyerSignatureData"
              name="buyerSig"
            ></app-signature-pad>
            <div class="field" style="margin-top:8px; margin-bottom:16px;">
              <label>{{ t.buyerName }}</label>
              <input [(ngModel)]="buyerSignerName" name="buyerSignerName" />
            </div>
            <!-- Seller signature from settings (read-only preview) -->
            <div class="seller-signature-section">
              <label>{{ t.sellerSignatureShop }}</label>
              <div *ngIf="sellerSignatureData" class="signature-preview">
                <img [src]="sellerSignatureData" [alt]="t.sellerSignature" />
              </div>
              <div *ngIf="!sellerSignatureData" class="signature-missing">
                ⚠️ {{ t.noSignatureWarning }}
                <a routerLink="/settings">{{ t.addNow }}</a>
              </div>
              <div class="field" style="margin-top:8px;">
                <label>{{ t.sellerName }}</label>
                <input
                  [(ngModel)]="sellerSignerName"
                  name="sellerSignerName"
                  readonly
                />
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
            {{ submitting ? t.saving : t.saveSale }}
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
      .checkbox-label {
        display: flex !important;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        text-transform: none;
        letter-spacing: normal;
      }
      .checkbox-label input {
        width: auto;
        accent-color: var(--accent-primary, #6366f1);
      }
      .search-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .search-input {
        width: 120px;
      }
      .error-text {
        color: var(--accent-danger, #ef4444);
        font-size: 0.82rem;
        margin-top: 4px;
        display: block;
      }
      .bike-preview {
        margin-top: 12px;
        padding: 14px;
        background: var(--bg-secondary, #f8fafc);
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.9rem;
      }
      .warranty-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .warranty-badge {
        display: inline-block;
        padding: 5px 12px;
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        color: var(--accent-success, #10b981);
        border-radius: 50px;
        font-weight: 600;
        font-size: 0.82rem;
      }
      .warranty-badge.warranty-new {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }
      .warranty-info small {
        color: var(--text-secondary, #64748b);
        font-size: 0.8rem;
      }
      .form-actions {
        margin-top: 24px;
        text-align: right;
      }
      .btn-lg {
        padding: 12px 32px;
        font-size: 1.05rem;
      }
      .accessories-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }
      .accessory-item {
        background: var(--bg-secondary, #f8fafc);
        padding: 14px;
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .accessory-fields {
        display: flex;
        gap: 10px;
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .accessory-fields .field {
        flex: 1;
        min-width: 100px;
      }
      .accessory-fields .field input {
        padding: 6px 8px;
      }
      .accessory-total {
        display: flex;
        align-items: center;
      }
      .total-value {
        font-weight: 700;
        color: var(--text-primary);
        padding: 6px 10px;
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-sm, 6px);
      }
      .btn-icon {
        width: 32px;
        height: 32px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm, 6px);
        font-size: 14px;
        flex-shrink: 0;
      }
      .btn-danger {
        background: var(--accent-danger, #ef4444);
        color: white;
        border: none;
      }
      .btn-sm {
        padding: 8px 16px;
        font-size: 0.85rem;
      }
      .accessory-summary {
        display: flex;
        justify-content: space-between;
        padding: 10px 14px;
        background: var(--bg-secondary, #f1f5f9);
        border-radius: var(--radius-md, 10px);
        margin-bottom: 16px;
        font-weight: 600;
      }
      .grand-total {
        margin-top: 16px;
        padding: 16px;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.04));
        border-radius: var(--radius-lg, 14px);
        border: 2px solid var(--border-light, #e2e8f0);
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        color: var(--text-primary);
      }
      .total-row.grand {
        border-top: 1.5px solid var(--border-light, #e2e8f0);
        padding-top: 8px;
        margin-top: 8px;
        font-size: 1.1rem;
        font-weight: 700;
      }
      .seller-signature-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1.5px solid var(--border-light, #e2e8f0);
      }
      .seller-signature-section > label {
        display: block;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--text-primary);
      }
      .signature-preview {
        background: var(--bg-secondary, #f8fafc);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        padding: 12px;
        max-width: 300px;
      }
      .signature-preview img {
        max-width: 100%;
        max-height: 100px;
      }
      .signature-missing {
        background: rgba(245, 158, 11, 0.08);
        color: #f59e0b;
        padding: 12px 16px;
        border-radius: var(--radius-md, 10px);
        font-size: 0.9rem;
        font-weight: 500;
      }
      .signature-missing a {
        color: var(--accent-primary, #6366f1);
        text-decoration: underline;
        margin-left: 8px;
      }
    `,
  ],
})
export class SaleFormComponent implements OnInit {
  private translationService = inject(TranslationService);

  availableBikes: Bicycle[] = [];
  selectedBike: Bicycle | null = null;

  buyer = {
    vorname: '',
    nachname: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    stadt: '',
    telefon: '',
    email: '',
  };
  preis = 0;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  verkaufsdatum = '';
  notizen = '';
  buyerSignatureData = '';
  buyerSignerName = '';
  sellerSignatureData = '';
  sellerSignerName = '';
  submitting = false;
  accessories: SaleAccessoryCreate[] = [];

  get t() {
    return this.translationService.translations();
  }

  get accessoriesTotal(): number {
    return this.accessories.reduce(
      (sum, acc) => sum + acc.preis * acc.menge,
      0,
    );
  }

  constructor(
    private saleService: SaleService,
    private bicycleService: BicycleService,
    private purchaseService: PurchaseService,
    private settingsService: SettingsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.verkaufsdatum = new Date().toISOString().split('T')[0];
    this.bicycleService.getAvailable().subscribe((bikes) => {
      this.availableBikes = bikes;
      const preselect = this.route.snapshot.queryParamMap.get('bicycleId');
      if (preselect) {
        const bike = bikes.find((b) => b.id === +preselect);
        if (bike) {
          this.selectedBike = bike;
          this.loadPlannedPrice(bike.id);
        }
      }
    });
    // Load owner signature from settings
    this.settingsService.getSettings().subscribe((settings) => {
      if (settings?.inhaberSignatureBase64) {
        this.sellerSignatureData = settings.inhaberSignatureBase64;
        const ownerName = [settings.inhaberVorname, settings.inhaberNachname]
          .filter(Boolean)
          .join(' ');
        if (ownerName) {
          this.sellerSignerName = ownerName;
        }
      }
    });
  }

  onBikeSelected(bike: Bicycle) {
    this.selectedBike = bike;
    this.loadPlannedPrice(bike.id);
  }

  private loadPlannedPrice(bicycleId: number) {
    this.purchaseService.getByBicycleId(bicycleId).subscribe({
      next: (purchase) => {
        if (purchase?.verkaufspreisVorschlag) {
          this.preis = purchase.verkaufspreisVorschlag;
        }
      },
      error: () => {
        // No purchase found for this bike, ignore
      },
    });
  }

  onBuyerAddressSelected(address: AddressSuggestion) {
    this.buyer.strasse = address.strasse;
    this.buyer.hausnummer = address.hausnummer;
    this.buyer.plz = address.plz;
    this.buyer.stadt = address.stadt;
  }

  updateBuyerSignerName() {
    const name = [this.buyer.vorname, this.buyer.nachname]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (name) {
      this.buyerSignerName = name;
    }
  }

  addAccessory() {
    this.accessories.push({
      bezeichnung: '',
      preis: 0,
      menge: 1,
    });
  }

  addAccessoryFromCatalog(item: AccessoryCatalogList) {
    this.accessories.push({
      bezeichnung: item.bezeichnung,
      preis: item.standardpreis,
      menge: 1,
    });
  }

  removeAccessory(index: number) {
    this.accessories.splice(index, 1);
  }

  submit() {
    if (!this.selectedBike) return;
    this.submitting = true;

    const buyerSig: SignatureCreate | undefined = this.buyerSignatureData
      ? {
          signatureData: this.buyerSignatureData,
          signerName:
            this.buyerSignerName ||
            `${this.buyer.vorname} ${this.buyer.nachname}`,
          signatureType: 'Buyer' as any,
        }
      : undefined;

    const sellerSig: SignatureCreate | undefined = this.sellerSignatureData
      ? {
          signatureData: this.sellerSignatureData,
          signerName: this.sellerSignerName || 'Bike Haus Freiburg',
          signatureType: 'ShopOwner' as any,
        }
      : undefined;

    const sale: SaleCreate = {
      bicycleId: this.selectedBike!.id,
      buyer: this.buyer,
      preis: this.preis,
      zahlungsart: this.zahlungsart,
      verkaufsdatum: this.verkaufsdatum,
      garantie: true,
      garantieBedingungen:
        this.selectedBike!.zustand === 'Neu'
          ? '2 Jahre Gewährleistung gemäß § 437 BGB'
          : '3 Monate Garantie auf das Fahrrad',
      notizen: this.notizen || undefined,
      buyerSignature: buyerSig,
      sellerSignature: sellerSig,
      accessories:
        this.accessories.length > 0
          ? this.accessories.filter((a) => a.bezeichnung && a.preis > 0)
          : undefined,
    };

    this.saleService.create(sale).subscribe({
      next: () => this.router.navigate(['/sales']),
      error: () => {
        this.submitting = false;
        alert(this.t.saleError);
      },
    });
  }
}
