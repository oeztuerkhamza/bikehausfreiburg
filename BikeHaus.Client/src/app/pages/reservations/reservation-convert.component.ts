import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { SettingsService } from '../../services/settings.service';
import { TranslationService } from '../../services/translation.service';
import {
  Reservation,
  ReservationConvertToSale,
  PaymentMethod,
  SignatureCreate,
  SaleAccessoryCreate,
  AccessoryCatalogList,
} from '../../models/models';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';
import { AccessoryAutocompleteComponent } from '../../components/accessory-autocomplete/accessory-autocomplete.component';

@Component({
  selector: 'app-reservation-convert',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SignaturePadComponent,
    AccessoryAutocompleteComponent,
  ],
  template: `
    <div class="page" *ngIf="reservation">
      <div class="page-header">
        <h1>{{ t.convertToSale }}</h1>
        <a routerLink="/reservations" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <!-- Reservation Info -->
      <div class="reservation-info">
        <div class="info-card">
          <h3>🚲 {{ t.bicycleLabel }}</h3>
          <p class="bike-info">
            {{ reservation.bicycle.marke }} {{ reservation.bicycle.modell }}
          </p>
          <p class="detail">
            {{ t.frameNumber }}: {{ reservation.bicycle.rahmennummer }}
          </p>
          <p class="detail">{{ t.color }}: {{ reservation.bicycle.farbe }}</p>
        </div>
        <div class="info-card">
          <h3>👤 {{ t.customerLabel }}</h3>
          <p class="customer-info">
            {{ reservation.customer.vorname }}
            {{ reservation.customer.nachname }}
          </p>
          <p class="detail" *ngIf="reservation.customer.strasse">
            {{ reservation.customer.strasse }}
            {{ reservation.customer.hausnummer }}
          </p>
          <p class="detail" *ngIf="reservation.customer.plz">
            {{ reservation.customer.plz }} {{ reservation.customer.stadt }}
          </p>
        </div>
        <div class="info-card">
          <h3>📋 {{ t.reservationLabel }}</h3>
          <p class="detail">
            {{ t.numberShort }} {{ reservation.reservierungsNummer }}
          </p>
          <p class="detail">
            {{ t.from }}:
            {{ reservation.reservierungsDatum | date: 'dd.MM.yyyy' }}
          </p>
          <p class="detail" *ngIf="reservation.anzahlung">
            {{ t.deposit }}: {{ reservation.anzahlung | number: '1.2-2' }} €
          </p>
        </div>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Sale details -->
          <div class="form-card">
            <h2>{{ t.saleData }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.price }} (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="preis"
                  name="preis"
                  required
                />
                <small class="hint" *ngIf="reservation.anzahlung">
                  ({{ t.depositColon }}
                  {{ reservation.anzahlung | number: '1.2-2' }} € -
                  {{ t.remainingAmount }}
                  {{ getRestbetrag() | number: '1.2-2' }} €)
                </small>
              </div>
              <div class="field">
                <label>{{ t.paymentMethod }} *</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">{{ t.cash }}</option>
                  <option value="PayPal">{{ t.paypal }}</option>
                  <option value="Ueberweisung">{{ t.bankTransfer }}</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.warranty }}</label>
                <div class="warranty-info">
                  <span
                    class="warranty-badge"
                    [class.warranty-new]="reservation.bicycle.zustand === 'Neu'"
                  >
                    {{
                      reservation.bicycle.zustand === 'Neu'
                        ? t.warrantyNew
                        : t.warrantyUsed
                    }}
                  </span>
                  <small>
                    ({{
                      reservation.bicycle.zustand === 'Neu'
                        ? t.newBicycle
                        : t.usedBicycle
                    }})
                  </small>
                </div>
              </div>
              <div class="field full">
                <label>{{ t.notes }}</label>
                <textarea
                  [(ngModel)]="notizen"
                  name="notizen"
                  rows="2"
                  [placeholder]="t.salesNotes"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Accessories -->
          <div class="form-card">
            <h2>{{ t.accessoriesOptional }}</h2>
            <p class="hint">{{ t.accessoriesHint }}</p>

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
                <input
                  [(ngModel)]="acc.bezeichnung"
                  [name]="'accName' + i"
                  [placeholder]="t.designation"
                  class="acc-name"
                />
                <input
                  type="number"
                  [(ngModel)]="acc.preis"
                  [name]="'accPreis' + i"
                  [placeholder]="t.price"
                  step="0.01"
                  class="acc-price"
                />
                <span>€ ×</span>
                <input
                  type="number"
                  [(ngModel)]="acc.menge"
                  [name]="'accMenge' + i"
                  min="1"
                  class="acc-qty"
                />
                <span>= {{ acc.preis * acc.menge | number: '1.2-2' }} €</span>
                <button
                  type="button"
                  class="btn-remove"
                  (click)="removeAccessory(i)"
                >
                  🗑️
                </button>
              </div>
            </div>

            <button type="button" class="btn btn-sm" (click)="addAccessory()">
              + {{ t.addManually }}
            </button>
          </div>

          <!-- Signatures -->
          <div class="form-card">
            <h2>{{ t.signatures }}</h2>
            <div class="signatures-grid">
              <div class="signature-section">
                <h3>
                  {{ t.buyer }} ({{ reservation.customer.vorname }}
                  {{ reservation.customer.nachname }})
                </h3>
                <app-signature-pad
                  [(ngModel)]="buyerSignatureData"
                  name="buyerSignature"
                ></app-signature-pad>
              </div>
              <div class="signature-section seller-signature-section">
                <h3>{{ t.seller }} (Bike Haus Freiburg)</h3>
                <div *ngIf="sellerSignatureData" class="signature-preview">
                  <img
                    [src]="sellerSignatureData"
                    alt="{{ t.sellerSignature }}"
                  />
                  <p class="hint">✓ {{ t.savedSignatureUsed }}</p>
                </div>
                <div *ngIf="!sellerSignatureData" class="no-signature">
                  <p>{{ t.noSignatureFound }}</p>
                  <a routerLink="/settings" class="link">{{
                    t.settingsLink
                  }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit section -->
        <div class="submit-section">
          <div class="total-amount">
            <span>{{ t.totalAmountLabel }}</span>
            <strong>{{ getTotalAmount() | number: '1.2-2' }} €</strong>
          </div>
          <button
            type="submit"
            class="btn btn-primary btn-large"
            [disabled]="submitting || !canSubmit()"
          >
            {{ submitting ? t.saving : t.convertToSale }}
          </button>
        </div>
      </form>
    </div>

    <div class="page" *ngIf="!reservation && !loading">
      <p>{{ t.reservationNotFound }}</p>
      <a routerLink="/reservations" class="btn">{{ t.back }}</a>
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

      .reservation-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }

      .info-card {
        background: var(--bg-card, #fff);
        padding: 18px;
        border-radius: var(--radius-lg, 14px);
        border-left: 4px solid var(--accent-primary, #6366f1);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-left: 4px solid var(--accent-primary, #6366f1);
      }

      .info-card h3 {
        margin: 0 0 8px 0;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .bike-info,
      .customer-info {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 4px 0;
      }

      .detail {
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
        margin: 2px 0;
      }

      .btn {
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
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
        padding: 8px 14px;
        font-size: 0.85rem;
        background: var(--bg-secondary, #f1f5f9);
        color: var(--text-primary);
        border-radius: var(--radius-sm, 6px);
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
        width: fit-content;
      }

      .warranty-badge.warranty-new {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }

      .accessories-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }

      .accessory-item {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }

      .acc-name {
        flex: 2;
        min-width: 150px;
      }
      .acc-price {
        width: 80px;
      }
      .acc-qty {
        width: 60px;
      }

      .btn-remove {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
        color: var(--accent-danger, #ef4444);
        border: none;
        width: 28px;
        height: 28px;
        border-radius: var(--radius-sm, 6px);
        cursor: pointer;
        transition: var(--transition-fast);
      }
      .btn-remove:hover {
        background: rgba(239, 68, 68, 0.15);
      }

      .signatures-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
      }

      .signature-section h3 {
        font-size: 0.82rem;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .seller-signature-section {
        border-left: 1.5px solid var(--border-light, #e2e8f0);
        padding-left: 24px;
      }

      .signature-preview {
        padding: 16px;
        background: var(--bg-secondary, #f8fafc);
        border-radius: var(--radius-md, 10px);
        text-align: center;
        border: 1.5px solid var(--border-light, #e2e8f0);
      }

      .signature-preview img {
        max-width: 100%;
        max-height: 120px;
      }

      .no-signature {
        padding: 20px;
        background: rgba(245, 158, 11, 0.06);
        border-radius: var(--radius-md, 10px);
        text-align: center;
        border: 1.5px solid rgba(245, 158, 11, 0.2);
      }

      .no-signature p {
        margin: 0 0 8px 0;
        color: #f59e0b;
        font-weight: 500;
      }

      .link {
        color: var(--accent-primary, #6366f1);
        text-decoration: none;
        font-weight: 600;
      }

      .link:hover {
        text-decoration: underline;
      }

      .submit-section {
        margin-top: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }

      .total-amount {
        font-size: 1.2rem;
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .total-amount strong {
        font-size: 1.5rem;
        color: var(--accent-primary, #6366f1);
        font-weight: 800;
      }

      @media (max-width: 768px) {
        .reservation-info {
          grid-template-columns: 1fr;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
        .signatures-grid {
          grid-template-columns: 1fr;
        }
        .seller-signature-section {
          border-left: none;
          border-top: 1.5px solid var(--border-light, #e2e8f0);
          padding-left: 0;
          padding-top: 24px;
        }
        .submit-section {
          flex-direction: column;
          gap: 16px;
        }
      }
    `,
  ],
})
export class ReservationConvertComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private settingsService = inject(SettingsService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  reservation: Reservation | null = null;
  loading = true;
  submitting = false;

  preis: number = 0;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  notizen: string = '';
  accessories: SaleAccessoryCreate[] = [];

  buyerSignatureData: string = '';
  sellerSignatureData: string = '';
  sellerSignerName: string = '';

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadReservation(id);
      this.loadSellerSignature();
    }
  }

  loadReservation(id: number) {
    this.reservationService.getById(id).subscribe({
      next: (res) => {
        this.reservation = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reservation:', err);
        this.loading = false;
      },
    });
  }

  loadSellerSignature() {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings.inhaberSignatureBase64) {
          this.sellerSignatureData = settings.inhaberSignatureBase64;
          this.sellerSignerName =
            `${settings.inhaberVorname || ''} ${settings.inhaberNachname || ''}`.trim() ||
            'Bike Haus Freiburg';
        }
      },
      error: (err: Error) => console.error('Error loading settings:', err),
    });
  }

  getRestbetrag(): number {
    const deposit = this.reservation?.anzahlung || 0;
    return Math.max(0, this.preis - deposit);
  }

  getTotalAmount(): number {
    let total = this.preis;
    for (const acc of this.accessories) {
      total += acc.preis * acc.menge;
    }
    return total;
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

  canSubmit(): boolean {
    return !!(this.reservation && this.preis > 0);
  }

  submit() {
    if (!this.canSubmit() || !this.reservation) return;
    this.submitting = true;

    const buyerName = `${this.reservation.customer.vorname} ${this.reservation.customer.nachname}`;

    const buyerSig: SignatureCreate | undefined = this.buyerSignatureData
      ? {
          signatureData: this.buyerSignatureData,
          signerName: buyerName,
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

    const garantieBedingungen =
      this.reservation.bicycle.zustand === 'Neu'
        ? '2 Jahre Gewährleistung gemäß § 437 BGB'
        : '3 Monate Garantie auf das Fahrrad';

    const dto: ReservationConvertToSale = {
      preis: this.preis,
      zahlungsart: this.zahlungsart,
      garantie: true,
      garantieBedingungen,
      notizen: this.notizen || undefined,
      buyerSignature: buyerSig,
      sellerSignature: sellerSig,
      accessories:
        this.accessories.length > 0
          ? this.accessories.filter((a) => a.bezeichnung && a.preis > 0)
          : undefined,
    };

    this.reservationService.convertToSale(this.reservation.id, dto).subscribe({
      next: (sale) => {
        console.log('Converted to sale:', sale);
        this.router.navigate(['/sales']);
      },
      error: (err) => {
        console.error('Error converting to sale:', err);
        this.submitting = false;
        alert(err.error?.error || this.t.convertError);
      },
    });
  }
}
