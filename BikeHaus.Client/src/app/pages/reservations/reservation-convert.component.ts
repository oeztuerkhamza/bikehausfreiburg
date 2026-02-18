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
          <h3>🚲 Fahrrad</h3>
          <p class="bike-info">
            {{ reservation.bicycle.marke }} {{ reservation.bicycle.modell }}
          </p>
          <p class="detail">
            Rahmennummer: {{ reservation.bicycle.rahmennummer }}
          </p>
          <p class="detail">Farbe: {{ reservation.bicycle.farbe }}</p>
        </div>
        <div class="info-card">
          <h3>👤 Kunde</h3>
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
          <h3>📋 Reservierung</h3>
          <p class="detail">Nr.: {{ reservation.reservierungsNummer }}</p>
          <p class="detail">
            Vom: {{ reservation.reservierungsDatum | date: 'dd.MM.yyyy' }}
          </p>
          <p class="detail" *ngIf="reservation.anzahlung">
            Anzahlung: {{ reservation.anzahlung | number: '1.2-2' }} €
          </p>
        </div>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Sale details -->
          <div class="form-card">
            <h2>Verkaufsdaten</h2>
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
                  (Anzahlung: {{ reservation.anzahlung | number: '1.2-2' }} € -
                  Restbetrag: {{ getRestbetrag() | number: '1.2-2' }} €)
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
                        ? '2 Jahre Gewährleistung'
                        : '3 Monate Garantie'
                    }}
                  </span>
                  <small>
                    ({{
                      reservation.bicycle.zustand === 'Neu'
                        ? 'Neues Fahrrad'
                        : 'Gebrauchtes Fahrrad'
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
                  placeholder="Verkaufsnotizen..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Accessories -->
          <div class="form-card">
            <h2>Zubehör (Optional)</h2>
            <p class="hint">Fügen Sie verkaufte Zubehörteile hinzu.</p>

            <div class="field" style="margin-bottom: 16px;">
              <label>Zubehör aus Katalog hinzufügen</label>
              <app-accessory-autocomplete
                placeholder="Zubehör suchen..."
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
                  placeholder="Bezeichnung"
                  class="acc-name"
                />
                <input
                  type="number"
                  [(ngModel)]="acc.preis"
                  [name]="'accPreis' + i"
                  placeholder="Preis"
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
              + Manuell hinzufügen
            </button>
          </div>

          <!-- Signatures -->
          <div class="form-card">
            <h2>Unterschriften</h2>
            <div class="signatures-grid">
              <div class="signature-section">
                <h3>
                  Käufer ({{ reservation.customer.vorname }}
                  {{ reservation.customer.nachname }})
                </h3>
                <app-signature-pad
                  [(ngModel)]="buyerSignatureData"
                  name="buyerSignature"
                ></app-signature-pad>
              </div>
              <div class="signature-section seller-signature-section">
                <h3>Verkäufer (Bike Haus Freiburg)</h3>
                <div *ngIf="sellerSignatureData" class="signature-preview">
                  <img
                    [src]="sellerSignatureData"
                    alt="Unterschrift des Verkäufers"
                  />
                  <p class="hint">✓ Gespeicherte Unterschrift wird verwendet</p>
                </div>
                <div *ngIf="!sellerSignatureData" class="no-signature">
                  <p>Keine gespeicherte Unterschrift gefunden.</p>
                  <a routerLink="/settings" class="link"
                    >In den Einstellungen hinterlegen</a
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit section -->
        <div class="submit-section">
          <div class="total-amount">
            <span>Gesamtbetrag:</span>
            <strong>{{ getTotalAmount() | number: '1.2-2' }} €</strong>
          </div>
          <button
            type="submit"
            class="btn btn-primary btn-large"
            [disabled]="submitting || !canSubmit()"
          >
            {{ submitting ? 'Wird gespeichert...' : t.convertToSale }}
          </button>
        </div>
      </form>
    </div>

    <div class="page" *ngIf="!reservation && !loading">
      <p>Reservierung nicht gefunden.</p>
      <a routerLink="/reservations" class="btn">{{ t.back }}</a>
    </div>
  `,
  styles: [
    `
      .page {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .page-header h1 {
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--text);
      }

      .reservation-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }

      .info-card {
        background: var(--card);
        padding: 16px;
        border-radius: 12px;
        border-left: 4px solid var(--primary);
      }

      .info-card h3 {
        margin: 0 0 8px 0;
        font-size: 0.9rem;
        color: var(--text-muted);
      }

      .bike-info,
      .customer-info {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text);
        margin: 0 0 4px 0;
      }

      .detail {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin: 2px 0;
      }

      .btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .btn-outline {
        background: var(--card);
        color: var(--text);
        border: 1px solid var(--border);
      }

      .btn-outline:hover {
        background: var(--bg);
      }

      .btn-primary {
        background: var(--primary);
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        opacity: 0.9;
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
        background: var(--bg);
        color: var(--text);
      }

      .form-sections {
        display: grid;
        gap: 24px;
      }

      .form-card {
        background: var(--card);
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      .form-card h2 {
        margin: 0 0 20px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text);
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border);
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
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-muted);
      }

      input,
      select,
      textarea {
        padding: 10px 14px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--bg);
        color: var(--text);
        font-size: 0.95rem;
        transition: border-color 0.2s;
      }

      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: var(--primary);
      }

      textarea {
        resize: vertical;
        font-family: inherit;
      }

      .hint {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 4px;
      }

      .warranty-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .warranty-badge {
        display: inline-block;
        padding: 6px 12px;
        background: #d4edda;
        color: #155724;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.9rem;
        width: fit-content;
      }

      .warranty-badge.warranty-new {
        background: #cce5ff;
        color: #004085;
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
        background: #fee2e2;
        color: #dc2626;
        border: none;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
      }

      .signatures-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
      }

      .signature-section h3 {
        font-size: 0.9rem;
        font-weight: 500;
        margin: 0 0 12px 0;
        color: var(--text-muted);
      }

      .seller-signature-section {
        border-left: 1px solid var(--border);
        padding-left: 24px;
      }

      .signature-preview {
        padding: 16px;
        background: var(--bg);
        border-radius: 8px;
        text-align: center;
      }

      .signature-preview img {
        max-width: 100%;
        max-height: 120px;
      }

      .no-signature {
        padding: 20px;
        background: #fef3c7;
        border-radius: 8px;
        text-align: center;
      }

      .no-signature p {
        margin: 0 0 8px 0;
        color: #92400e;
      }

      .link {
        color: var(--primary);
        text-decoration: none;
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
        background: var(--card);
        border-radius: 12px;
      }

      .total-amount {
        font-size: 1.2rem;
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .total-amount strong {
        font-size: 1.5rem;
        color: var(--primary);
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
          border-top: 1px solid var(--border);
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
        alert(err.error?.error || 'Fehler beim Umwandeln in Verkauf');
      },
    });
  }
}
