import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SaleService } from '../../services/sale.service';
import { TranslationService } from '../../services/translation.service';
import {
  Sale,
  SaleUpdate,
  PaymentMethod,
  SaleAccessoryCreate,
  SalePaymentCreate,
  AccessoryCatalogList,
} from '../../models/models';
import { AccessoryAutocompleteComponent } from '../../components/accessory-autocomplete/accessory-autocomplete.component';

@Component({
  selector: 'app-sale-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AccessoryAutocompleteComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.editSale }}</h1>
        <a routerLink="/sales" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <div *ngIf="loading" class="loading">{{ t.loading }}</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <form *ngIf="sale && !loading" (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Bicycle info (read-only) -->
          <div class="form-card" *ngIf="!isAccessoryOnlySale">
            <h2>{{ t.bicycle }}</h2>
            <div class="bike-info" *ngIf="sale.bicycle">
              <div class="info-row">
                <span class="label">{{ t.brandModel }}:</span>
                <span>{{ sale.bicycle.marke }} {{ sale.bicycle.modell }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ t.frameNumber }}:</span>
                <span style="text-transform: uppercase">{{
                  sale.bicycle.rahmennummer
                }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ t.color }}:</span>
                <span>{{ sale.bicycle.farbe }}</span>
              </div>
              <div class="info-row" *ngIf="sale.bicycle.zustand">
                <span class="label">{{ t.condition }}:</span>
                <span
                  class="badge"
                  [class.badge-new]="sale.bicycle.zustand === 'Neu'"
                >
                  {{ sale.bicycle.zustand }}
                </span>
              </div>
            </div>
            <p class="hint">{{ t.bicycleReadonly }}</p>
          </div>

          <!-- Buyer info -->
          <div class="form-card" *ngIf="!isAccessoryOnlySale">
            <h2>Kundendaten</h2>
            <div class="form-grid">
              <div class="field">
                <label>Vorname</label>
                <input
                  [(ngModel)]="buyer.vorname"
                  name="buyerVorname"
                  required
                />
              </div>
              <div class="field">
                <label>Nachname</label>
                <input
                  [(ngModel)]="buyer.nachname"
                  name="buyerNachname"
                  required
                />
              </div>
              <div class="field">
                <label>E-Mail</label>
                <input
                  type="email"
                  [(ngModel)]="buyer.email"
                  name="buyerEmail"
                  placeholder="kunde@example.com"
                />
              </div>
              <div class="field">
                <label>Telefon</label>
                <input [(ngModel)]="buyer.telefon" name="buyerTelefon" />
              </div>
              <div class="field">
                <label>Straße</label>
                <input [(ngModel)]="buyer.strasse" name="buyerStrasse" />
              </div>
              <div class="field">
                <label>Hausnummer</label>
                <input [(ngModel)]="buyer.hausnummer" name="buyerHausnr" />
              </div>
              <div class="field">
                <label>PLZ</label>
                <input [(ngModel)]="buyer.plz" name="buyerPlz" />
              </div>
              <div class="field">
                <label>Stadt</label>
                <input [(ngModel)]="buyer.stadt" name="buyerStadt" />
              </div>
            </div>
          </div>

          <!-- Sale details -->
          <div class="form-card">
            <h2>{{ t.saleData }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.receiptNo }}</label>
                <input [(ngModel)]="belegNummer" name="belegNummer" />
              </div>
              <div class="field" *ngIf="!isAccessoryOnlySale">
                <label>Preis (€)</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="preis"
                  name="preis"
                />
              </div>
              <div class="field">
                <label>{{ t.paymentMethodRequired }}</label>
                <div class="zahlungen-list">
                  <div
                    class="zahlung-item"
                    *ngFor="let z of zahlungen; let i = index"
                  >
                    <select [(ngModel)]="z.zahlungsart" [name]="'zArt' + i">
                      <option value="">-- Zahlungsart wählen --</option>
                      <option value="Bar">{{ t.cash }}</option>
                      <option value="PayPal">{{ t.paypal }}</option>
                      <option value="Karte">{{ t.bankTransfer }}</option>
                      <option value="Überweisung">{{ t.wireTransfer }}</option>
                    </select>
                    <ng-container *ngIf="!isAccessoryOnlySale">
                      <input
                        type="number"
                        step="0.01"
                        [(ngModel)]="z.betrag"
                        [name]="'zBetrag' + i"
                        placeholder="Betrag"
                      />
                      <span class="zahlung-euro">€</span>
                      <button
                        type="button"
                        class="btn btn-icon btn-danger"
                        (click)="removeZahlung(i)"
                        *ngIf="zahlungen.length > 1"
                      >
                        🗑️
                      </button>
                    </ng-container>
                  </div>
                  <button
                    type="button"
                    class="btn btn-outline btn-sm"
                    (click)="addZahlung()"
                    *ngIf="!isAccessoryOnlySale"
                  >
                    + Weitere Zahlungsart
                  </button>
                </div>
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
              <div class="field" *ngIf="!isAccessoryOnlySale">
                <label>{{ t.warranty }}</label>
                <div class="warranty-display">
                  {{ garantieBedingungen }}
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

          <!-- Accessories -->
          <div class="form-card">
            <h2>{{ t.accessories }}</h2>

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
          </div>

          <!-- Rabatt & Gesamtbetrag -->
          <div class="form-card">
            <h2>{{ t.discount }}</h2>

            <!-- Rabatt -->
            <div class="discount-section">
              <div class="field">
                <label>{{ t.discountOptional }} (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="rabatt"
                  name="rabatt"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div class="grand-total" *ngIf="effectiveGrandTotal > 0">
              <div class="total-row" *ngIf="!isAccessoryOnlySale && preis > 0">
                <span>{{ t.bicyclePrice }}:</span>
                <span>{{ preis | number: '1.2-2' }} €</span>
              </div>
              <div class="total-row" *ngIf="accessories.length > 0">
                <span>{{ t.accessories }}:</span>
                <span>{{ accessoriesTotal | number: '1.2-2' }} €</span>
              </div>
              <div class="total-row discount" *ngIf="rabatt > 0">
                <span>{{ t.discount }}:</span>
                <span class="discount-value"
                  >- {{ rabatt | number: '1.2-2' }} €</span
                >
              </div>
              <div class="total-row grand">
                <span>{{ t.grandTotal }}:</span>
                <strong>{{ effectiveGrandTotal | number: '1.2-2' }} €</strong>
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
      .bike-info {
        background: var(--bg-secondary, #f8fafc);
        padding: 16px;
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        margin-bottom: 12px;
      }
      .info-row {
        display: flex;
        gap: 12px;
        padding: 4px 0;
      }
      .info-row .label {
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        min-width: 140px;
        font-size: 0.88rem;
      }
      .badge {
        display: inline-block;
        padding: 3px 10px;
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        color: var(--accent-success, #10b981);
        border-radius: 50px;
        font-size: 0.78rem;
        font-weight: 600;
      }
      .badge.badge-new {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }
      .hint {
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
        font-style: italic;
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
      .warranty-display {
        padding: 9px 12px;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.04));
        border-radius: var(--radius-md, 10px);
        font-size: 0.9rem;
        color: var(--text-primary);
        border: 1.5px solid var(--border-light, #e2e8f0);
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
      .total-row.discount {
        color: var(--accent-danger, #ef4444);
      }
      .discount-value {
        color: var(--accent-danger, #ef4444);
        font-weight: 600;
      }
      .discount-section {
        padding-top: 8px;
        border-top: 1px dashed var(--border-light, #e2e8f0);
      }
      .zahlungen-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .zahlung-item {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .zahlung-item select {
        flex: 1;
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
      }
      .zahlung-item input {
        width: 110px;
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
      }
      .zahlung-euro {
        font-weight: 600;
        color: var(--text-secondary, #64748b);
      }
    `,
  ],
})
export class SaleEditComponent implements OnInit {
  private translationService = inject(TranslationService);

  sale: Sale | null = null;
  loading = true;
  error = '';
  submitting = false;

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
  zahlungen: SalePaymentCreate[] = [{ zahlungsart: null as any, betrag: 0 }];
  verkaufsdatum = '';
  notizen = '';
  belegNummer = '';
  garantie = true;
  garantieBedingungen = '';
  accessories: SaleAccessoryCreate[] = [];
  rabatt = 0;

  get t() {
    return this.translationService.translations();
  }

  get accessoriesTotal(): number {
    return this.accessories.reduce(
      (sum, acc) => sum + acc.preis * acc.menge,
      0,
    );
  }

  get isAccessoryOnlySale(): boolean {
    const bike = this.sale?.bicycle;
    if (!bike) return false;

    return (
      bike.marke === 'Zubehör' &&
      bike.modell === 'Direktverkauf' &&
      !!bike.rahmennummer?.startsWith('ACC-')
    );
  }

  get effectiveSalePrice(): number {
    return this.isAccessoryOnlySale ? 0 : this.preis;
  }

  get effectiveGrandTotal(): number {
    return Math.max(
      0,
      this.effectiveSalePrice + this.accessoriesTotal - this.rabatt,
    );
  }

  constructor(
    private saleService: SaleService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = this.t.invalidSaleId;
      this.loading = false;
      return;
    }

    this.saleService.getById(+id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.loadFormData(sale);
        this.loading = false;
      },
      error: () => {
        this.error = this.t.saleNotFound;
        this.loading = false;
      },
    });
  }

  private loadFormData(sale: Sale) {
    // Load buyer data
    if (sale.buyer) {
      this.buyer = {
        vorname: sale.buyer.vorname || '',
        nachname: sale.buyer.nachname || '',
        strasse: sale.buyer.strasse || '',
        hausnummer: sale.buyer.hausnummer || '',
        plz: sale.buyer.plz || '',
        stadt: sale.buyer.stadt || '',
        telefon: sale.buyer.telefon || '',
        email: sale.buyer.email || '',
      };
    }

    // Load sale data
    this.preis = sale.preis;
    this.zahlungsart = sale.zahlungsart as PaymentMethod;
    if (sale.verkaufsdatum) {
      const d = new Date(sale.verkaufsdatum);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      this.verkaufsdatum = `${year}-${month}-${day}`;
    } else {
      this.verkaufsdatum = '';
    }
    this.notizen = sale.notizen || '';
    this.garantie = sale.garantie;
    this.garantieBedingungen = sale.garantieBedingungen || '';

    // Load accessories
    if (sale.accessories && sale.accessories.length > 0) {
      this.accessories = sale.accessories.map((acc) => ({
        bezeichnung: acc.bezeichnung,
        preis: acc.preis,
        menge: acc.menge,
      }));
    }

    // Load zahlungen
    if (sale.zahlungen && sale.zahlungen.length > 0) {
      this.zahlungen = sale.zahlungen.map((z) => ({
        zahlungsart: z.zahlungsart as PaymentMethod,
        betrag: z.betrag,
      }));
    } else {
      this.zahlungen = [
        { zahlungsart: sale.zahlungsart as PaymentMethod, betrag: sale.preis },
      ];
    }

    // Load rabatt
    this.rabatt = sale.rabatt || 0;

    // Load belegNummer
    this.belegNummer = sale.belegNummer || '';
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
      preis: item.standardpreis || 0,
      menge: 1,
    });
  }

  removeAccessory(index: number) {
    this.accessories.splice(index, 1);
  }

  addZahlung() {
    this.zahlungen.push({ zahlungsart: null as any, betrag: 0 });
  }

  removeZahlung(index: number) {
    this.zahlungen.splice(index, 1);
  }

  submit() {
    if (!this.sale) return;

    if (this.zahlungen.some((z) => !z.zahlungsart)) {
      alert('Bitte Zahlungsart auswählen.');
      return;
    }

    if (this.isAccessoryOnlySale) {
      this.preis = 0;
      this.zahlungen = [
        {
          zahlungsart: this.zahlungen[0]?.zahlungsart || (null as any),
          betrag: this.effectiveGrandTotal,
        },
      ];
    }

    this.submitting = true;

    const update: SaleUpdate = {
      buyer: this.buyer,
      preis: this.effectiveSalePrice,
      zahlungsart: this.zahlungen[0]?.zahlungsart || this.zahlungsart,
      verkaufsdatum: this.verkaufsdatum,
      garantie: this.isAccessoryOnlySale ? false : this.garantie,
      garantieBedingungen: this.isAccessoryOnlySale
        ? undefined
        : this.garantieBedingungen || undefined,
      notizen: this.notizen || undefined,
      accessories:
        this.accessories.length > 0
          ? this.accessories.filter((a) => a.bezeichnung && a.preis > 0)
          : undefined,
      zahlungen:
        this.zahlungen.length > 0
          ? this.zahlungen.filter((z) => z.betrag > 0)
          : undefined,
      rabatt: this.rabatt > 0 ? this.rabatt : undefined,
      belegNummer: this.belegNummer || undefined,
    };

    this.saleService.update(this.sale.id, update).subscribe({
      next: () => {
        this.router.navigate(['/sales']);
      },
      error: () => {
        this.submitting = false;
        alert(this.t.saveChangesError);
      },
    });
  }
}
