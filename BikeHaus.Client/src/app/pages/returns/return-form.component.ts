import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReturnService } from '../../services/return.service';
import { SaleService } from '../../services/sale.service';
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
        <h1>Neue Rückgabe (Rückgabebeleg)</h1>
        <a routerLink="/returns" class="btn btn-outline">Zurück</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Sale selection -->
          <div class="form-card">
            <h2>Verkauf auswählen</h2>
            <div class="field">
              <label>Verkauf (Beleg) *</label>
              <select
                [(ngModel)]="selectedSaleId"
                name="saleId"
                required
                (change)="onSaleSelect()"
              >
                <option [value]="0" disabled>-- Verkauf wählen --</option>
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
              <span>Fahrrad: {{ selectedSale.bikeInfo }}</span>
              <span>Käufer: {{ selectedSale.buyerName }}</span>
              <span>Preis: {{ selectedSale.preis | number: '1.2-2' }} €</span>
              <span
                >Verkauft am:
                {{ selectedSale.verkaufsdatum | date: 'dd.MM.yyyy' }}</span
              >
            </div>
          </div>

          <!-- Return details -->
          <div class="form-card">
            <h2>Rückgabedaten</h2>
            <div class="form-grid">
              <div class="field">
                <label>Rückgabedatum *</label>
                <input
                  type="date"
                  [(ngModel)]="rueckgabedatum"
                  name="rueckgabedatum"
                  required
                />
              </div>
              <div class="field">
                <label>Rückgabegrund *</label>
                <select [(ngModel)]="grund" name="grund" required>
                  <option value="" disabled>-- Grund wählen --</option>
                  <option value="Defekt">Defekt</option>
                  <option value="NichtWieErwartet">Nicht wie erwartet</option>
                  <option value="Garantie">Garantie</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>
              <div
                class="field full"
                *ngIf="grund === 'Sonstiges' || grund === 'NichtWieErwartet'"
              >
                <label>Details zum Grund</label>
                <textarea
                  [(ngModel)]="grundDetails"
                  name="grundDetails"
                  rows="2"
                  placeholder="Bitte beschreiben Sie den Grund genauer..."
                ></textarea>
              </div>
              <div class="field">
                <label>Erstattungsbetrag (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="erstattungsbetrag"
                  name="erstattungsbetrag"
                  required
                />
              </div>
              <div class="field">
                <label>Zahlungsart *</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">Bar</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Ueberweisung">Überweisung</option>
                </select>
              </div>
              <div class="field full">
                <label>Notizen</label>
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
            <h2>Unterschriften</h2>
            <app-signature-pad
              label="Unterschrift Kunde"
              [(ngModel)]="customerSignatureData"
              name="customerSig"
            ></app-signature-pad>
            <div class="field" style="margin-top:8px; margin-bottom:16px;">
              <label>Name Kunde</label>
              <input
                [(ngModel)]="customerSignerName"
                name="customerSignerName"
              />
            </div>
            <app-signature-pad
              label="Unterschrift Shop"
              [(ngModel)]="shopSignatureData"
              name="shopSig"
            ></app-signature-pad>
            <div class="field" style="margin-top:8px;">
              <label>Name Shop-Mitarbeiter</label>
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
            Rückgabe speichern
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
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .form-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-card {
        background: #fff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      .form-card h2 {
        font-size: 1rem;
        margin: 0 0 16px;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 8px;
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
        font-size: 0.85rem;
        color: #555;
        margin-bottom: 4px;
      }
      .field input,
      .field select,
      .field textarea {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
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
        padding: 12px;
        background: #f8fafc;
        border-radius: 6px;
        font-size: 0.9rem;
      }
      .form-actions {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
      .btn {
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 0.95rem;
        cursor: pointer;
        border: none;
      }
      .btn-primary {
        background: #4f46e5;
        color: #fff;
      }
      .btn-primary:disabled {
        background: #c7d2fe;
        cursor: not-allowed;
      }
      .btn-outline {
        background: transparent;
        border: 1px solid #ddd;
        color: #333;
      }
    `,
  ],
})
export class ReturnFormComponent implements OnInit {
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
      error: (err) => alert('Fehler beim Speichern: ' + err.message),
    });
  }
}
