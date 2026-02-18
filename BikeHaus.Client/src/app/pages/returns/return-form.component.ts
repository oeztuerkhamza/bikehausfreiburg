import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReturnService } from '../../services/return.service';
import { SaleService } from '../../services/sale.service';
import { TranslationService } from '../../services/translation.service';
import {
  ReturnCreate,
  SaleList,
  PaymentMethod,
  ReturnReason,
  SignatureCreate,
} from '../../models/models';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';

@Component({
  selector: 'app-return-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SignaturePadComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.newReturnTitle }}</h1>
        <a routerLink="/returns" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Sale selection -->
          <div class="form-card">
            <h2>{{ t.selectSale }}</h2>
            <div class="field">
              <label>{{ t.saleRequired }}</label>
              <select
                [(ngModel)]="selectedSaleId"
                name="saleId"
                required
                (change)="onSaleSelect()"
              >
                <option [value]="0" disabled>{{ t.selectSalePlaceholder }}</option>
                <option *ngFor="let s of sales" [value]="s.id">
                  {{ s.belegNummer }} – {{ s.bikeInfo }} ({{ s.buyerName }}) –
                  {{ s.preis | number: '1.2-2' }} €
                </option>
              </select>
            </div>
            <div *ngIf="selectedSale" class="sale-preview">
              <span
                ><strong>{{ selectedSale.belegNummer }}</strong></span
              >
              <span>{{ t.bicycle }}: {{ selectedSale.bikeInfo }}</span>
              <span>{{ t.buyer }}: {{ selectedSale.buyerName }}</span>
              <span>{{ t.price }}: {{ selectedSale.preis | number: '1.2-2' }} €</span>
              <span
                >{{ t.soldOn }}:
                {{ selectedSale.verkaufsdatum | date: 'dd.MM.yyyy' }}</span
              >
            </div>
          </div>

          <!-- Return details -->
          <div class="form-card">
            <h2>{{ t.returnData }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.returnDateRequired }}</label>
                <input
                  type="date"
                  [(ngModel)]="rueckgabedatum"
                  name="rueckgabedatum"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.returnReasonRequired }}</label>
                <select [(ngModel)]="grund" name="grund" required>
                  <option value="" disabled>{{ t.selectReasonPlaceholder }}</option>
                  <option value="Defekt">{{ t.defect }}</option>
                  <option value="NichtWieErwartet">{{ t.notAsExpected }}</option>
                  <option value="Garantie">{{ t.warranty }}</option>
                  <option value="Sonstiges">{{ t.other }}</option>
                </select>
              </div>
              <div
                class="field full"
                *ngIf="grund === 'Sonstiges' || grund === 'NichtWieErwartet'"
              >
                <label>{{ t.reasonDetails }}</label>
                <textarea
                  [(ngModel)]="grundDetails"
                  name="grundDetails"
                  rows="2"
                  [placeholder]="t.reasonDetailsPlaceholder"
                ></textarea>
              </div>
              <div class="field">
                <label>{{ t.refundAmountRequired }}</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="erstattungsbetrag"
                  name="erstattungsbetrag"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.paymentMethodRequired }}</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">{{ t.cash }}</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Ueberweisung">{{ t.bankTransfer }}</option>
                </select>
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

          <!-- Signatures -->
          <div class="form-card">
            <h2>{{ t.signatures }}</h2>
            <app-signature-pad
              [label]="t.customerSignature"
              [(ngModel)]="customerSignatureData"
              name="customerSig"
            ></app-signature-pad>
            <div class="field" style="margin-top:8px; margin-bottom:16px;">
              <label>{{ t.customerName }}</label>
              <input
                [(ngModel)]="customerSignerName"
                name="customerSignerName"
              />
            </div>
            <app-signature-pad
              [label]="t.shopSignature"
              [(ngModel)]="shopSignatureData"
              name="shopSig"
            ></app-signature-pad>
            <div class="field" style="margin-top:8px;">
              <label>{{ t.shopEmployeeName }}</label>
              <input [(ngModel)]="shopSignerName" name="shopSignerName" />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="!f.valid || !selectedSaleId"
          >
            {{ t.saveReturn }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 700px;
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
        padding: 22px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .form-card h2 {
        font-size: 1rem;
        font-weight: 700;
        margin: 0 0 16px;
        color: var(--text-primary);
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
        padding-bottom: 10px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field label {
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
      .field textarea {
        resize: vertical;
        font-family: inherit;
      }
      .sale-preview {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 10px;
        padding: 14px;
        background: var(--bg-secondary, #f8fafc);
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        font-size: 0.9rem;
      }
      .form-actions {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
      .btn {
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: #fff;
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
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
      }
    `,
  ],
})
export class ReturnFormComponent implements OnInit {
  private translationService = inject(TranslationService);
  get t() { return this.translationService.translations(); }

  sales: SaleList[] = [];
  selectedSaleId = 0;
  selectedSale: SaleList | null = null;

  rueckgabedatum = '';
  grund: ReturnReason | '' = '';
  grundDetails = '';
  erstattungsbetrag = 0;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  notizen = '';

  customerSignatureData = '';
  customerSignerName = '';
  shopSignatureData = '';
  shopSignerName = '';

  constructor(
    private returnService: ReturnService,
    private saleService: SaleService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.rueckgabedatum = new Date().toISOString().split('T')[0];
    this.loadSales();
  }

  loadSales() {
    this.saleService.getAll().subscribe((s) => (this.sales = s));
  }

  onSaleSelect() {
    this.selectedSale =
      this.sales.find((s) => s.id === +this.selectedSaleId) || null;
    if (this.selectedSale) {
      this.erstattungsbetrag = this.selectedSale.preis;
    }
  }

  submit() {
    if (!this.selectedSaleId || !this.grund) return;

    const customerSig: SignatureCreate | undefined = this.customerSignatureData
      ? {
          signatureData: this.customerSignatureData,
          signerName: this.customerSignerName,
          signatureType: 'Buyer' as any,
        }
      : undefined;

    const shopSig: SignatureCreate | undefined = this.shopSignatureData
      ? {
          signatureData: this.shopSignatureData,
          signerName: this.shopSignerName,
          signatureType: 'ShopOwner' as any,
        }
      : undefined;

    const dto: ReturnCreate = {
      saleId: +this.selectedSaleId,
      rueckgabedatum: this.rueckgabedatum || undefined,
      grund: this.grund as ReturnReason,
      grundDetails: this.grundDetails || undefined,
      erstattungsbetrag: this.erstattungsbetrag,
      zahlungsart: this.zahlungsart,
      notizen: this.notizen || undefined,
      customerSignature: customerSig,
      shopSignature: shopSig,
    };

    this.returnService.create(dto).subscribe({
      next: () => this.router.navigate(['/returns']),
      error: (err) => alert(this.t.returnSaveError + ': ' + err.message),
    });
  }
}
