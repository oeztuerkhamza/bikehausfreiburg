import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { DocumentService } from '../../services/document.service';
import { BicycleService } from '../../services/bicycle.service';
import { CustomerService } from '../../services/customer.service';
import { TranslationService } from '../../services/translation.service';
import {
  PurchaseCreate,
  BulkPurchaseCreate,
  PaymentMethod,
  BikeCondition,
  DocumentType,
} from '../../models/models';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { AddressSuggestion } from '../../services/address.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-purchase-form',
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
        <h1>{{ t.newPurchaseTitle }}</h1>
        <a routerLink="/purchases" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <!-- Mode Toggle -->
      <div class="mode-toggle">
        <button
          type="button"
          class="toggle-btn"
          [class.active]="!bulkMode"
          (click)="bulkMode = false"
        >
          🚲 {{ t.singlePurchase }}
        </button>
        <button
          type="button"
          class="toggle-btn"
          [class.active]="bulkMode"
          (click)="bulkMode = true"
        >
          📦 {{ t.bulkPurchase }}
        </button>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Seller info -->
          <div class="form-card">
            <h2>
              {{
                bulkMode ? t.supplierStore : t.seller + ' (' + t.customer + ')'
              }}
            </h2>
            <div class="form-grid">
              <div class="field" *ngIf="!bulkMode">
                <label>{{ t.firstNameRequired }}</label>
                <input
                  [(ngModel)]="seller.vorname"
                  name="sellerVorname"
                  [required]="!bulkMode"
                  (ngModelChange)="updateSignerName()"
                  autocomplete="off"
                />
              </div>
              <div class="field" *ngIf="!bulkMode">
                <label>{{ t.lastNameRequired }}</label>
                <input
                  [(ngModel)]="seller.nachname"
                  name="sellerNachname"
                  [required]="!bulkMode"
                  (ngModelChange)="updateSignerName()"
                  autocomplete="off"
                />
              </div>
              <div class="field full" *ngIf="bulkMode">
                <label>{{ t.storeName }} *</label>
                <input
                  [(ngModel)]="seller.nachname"
                  name="sellerStore"
                  [required]="bulkMode"
                  [placeholder]="t.storeNamePlaceholder"
                  list="storeNameList"
                  autocomplete="off"
                />
                <datalist id="storeNameList">
                  <option *ngFor="let s of storeNames" [value]="s"></option>
                </datalist>
              </div>
              <div class="field full" *ngIf="!bulkMode">
                <label>{{ t.searchAddress }}</label>
                <app-address-autocomplete
                  placeholder="z.B. Bissierstraße 16, Freiburg"
                  (addressSelected)="onSellerAddressSelected($event)"
                ></app-address-autocomplete>
                <small class="hint">{{ t.addressHint }}</small>
              </div>
              <div class="field" *ngIf="!bulkMode">
                <label>{{ t.street }}</label>
                <input [(ngModel)]="seller.strasse" name="sellerStrasse" />
              </div>
              <div class="field" *ngIf="!bulkMode">
                <label>{{ t.houseNumber }}</label>
                <input [(ngModel)]="seller.hausnummer" name="sellerHausnr" />
              </div>
              <div class="field" *ngIf="!bulkMode">
                <label>{{ t.postalCode }}</label>
                <input [(ngModel)]="seller.plz" name="sellerPlz" />
              </div>
              <div class="field" *ngIf="!bulkMode">
                <label>{{ t.city }}</label>
                <input [(ngModel)]="seller.stadt" name="sellerStadt" />
              </div>
              <div class="field" *ngIf="!bulkMode">
                <label>{{ t.phone }}</label>
                <input [(ngModel)]="seller.telefon" name="sellerTel" />
              </div>
              <div class="field" *ngIf="!bulkMode">
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
            <!-- Bulk quantity -->
            <div class="bulk-quantity" *ngIf="bulkMode">
              <label>{{ t.quantity }} *</label>
              <div class="quantity-control">
                <button type="button" class="qty-btn" (click)="decreaseQty()">
                  −
                </button>
                <input
                  type="number"
                  [(ngModel)]="bulkQuantity"
                  name="bulkQty"
                  min="1"
                  max="100"
                  class="qty-input"
                />
                <button type="button" class="qty-btn" (click)="increaseQty()">
                  +
                </button>
              </div>
              <small class="hint">{{ t.bulkQuantityHint }}</small>
            </div>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.brand }} *</label>
                <input
                  [(ngModel)]="bicycle.marke"
                  name="bikeMarke"
                  required
                  list="brandList"
                  (ngModelChange)="onBrandChange()"
                  autocomplete="off"
                />
                <datalist id="brandList">
                  <option *ngFor="let b of brands" [value]="b"></option>
                </datalist>
              </div>
              <div class="field">
                <label>{{ t.model }}</label>
                <input
                  [(ngModel)]="bicycle.modell"
                  name="bikeModell"
                  list="modelList"
                  autocomplete="off"
                />
                <datalist id="modelList">
                  <option *ngFor="let m of models" [value]="m"></option>
                </datalist>
              </div>
              <div class="field" *ngIf="!bulkMode">
                <label>{{ t.frameNumber }}</label>
                <input
                  [(ngModel)]="bicycle.rahmennummer"
                  name="bikeRahmen"
                  placeholder="optional"
                />
              </div>
              <div class="field">
                <label>{{ t.frameSize }}</label>
                <input
                  [(ngModel)]="bicycle.rahmengroesse"
                  name="bikeRahmengroesse"
                  placeholder="z.B. 52, 56, M, L"
                />
              </div>
              <div class="field">
                <label>{{ t.color }}</label>
                <select [(ngModel)]="bicycle.farbe" name="bikeFarbe">
                  <option value="">-- {{ t.selectOption }} --</option>
                  <option value="Schwarz">Schwarz</option>
                  <option value="Weiß">Weiß</option>
                  <option value="Rot">Rot</option>
                  <option value="Blau">Blau</option>
                  <option value="Grün">Grün</option>
                  <option value="Gelb">Gelb</option>
                  <option value="Orange">Orange</option>
                  <option value="Grau">Grau</option>
                  <option value="Silber">Silber</option>
                  <option value="Pink">Pink</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.wheelSize }} *</label>
                <select
                  [(ngModel)]="bicycle.reifengroesse"
                  name="bikeReifen"
                  required
                >
                  <option value="">-- {{ t.selectOption }} --</option>
                  <option value="12">12"</option>
                  <option value="14">14"</option>
                  <option value="16">16"</option>
                  <option value="18">18"</option>
                  <option value="20">20"</option>
                  <option value="24">24"</option>
                  <option value="26">26"</option>
                  <option value="27.5">27.5"</option>
                  <option value="28">28"</option>
                  <option value="29">29"</option>
                </select>
              </div>
              <div class="field" *ngIf="!bulkMode">
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
              <div class="field" *ngIf="!bulkMode">
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
              <div class="field" *ngIf="bulkMode">
                <label>{{ t.condition }}</label>
                <div class="fixed-value">{{ t.newCondition }}</div>
              </div>
              <div class="field full">
                <label>{{ t.descriptionEquipment }}</label>
                <textarea
                  [(ngModel)]="bicycle.beschreibung"
                  name="bikeBeschr"
                  rows="4"
                  placeholder="z.B.&#10;E-Trekking Pedelec&#10;Bosch Performance Line 65&#10;NM 500 Wh&#10;28 Zoll Trapez 50 cm"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Purchase details -->
          <div class="form-card">
            <h2>{{ t.purchaseData }}</h2>
            <div class="form-grid">
              <div class="field">
                <label
                  >{{ t.receiptNo }}
                  {{ bulkMode ? '(' + t.invoiceOptional + ')' : '' }}</label
                >
                <input
                  [(ngModel)]="belegNummer"
                  name="belegNummer"
                  [placeholder]="bulkMode ? 'z.B. RE-2026-001234' : 'z.B. 001'"
                />
                <small class="hint" *ngIf="bulkMode">{{
                  t.sameInvoiceForAllBikes
                }}</small>
              </div>
              <div class="field">
                <label>{{ bulkMode ? t.pricePerBike : t.priceRequired }}</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="preis"
                  name="preis"
                  required
                />
              </div>
              <div class="field" *ngIf="bulkMode">
                <label>{{ t.totalPrice }}</label>
                <div class="calculated-price">
                  {{ preis * bulkQuantity | number: '1.2-2' }} €
                </div>
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
                  <option value="Karte">{{ t.bankTransfer }}</option>
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

          <!-- Document Upload (optional) -->
          <div class="form-card" *ngIf="!bulkMode">
            <h2>
              {{
                bicycle.zustand === 'Neu'
                  ? t.invoiceOptional
                  : t.screenshotsOptional
              }}
            </h2>
            <p class="hint-text">
              {{ t.documentsOptionalHint }}
            </p>
            <div class="upload-area">
              <input
                type="file"
                #fileInput
                (change)="onFilesSelected($event)"
                accept="image/*"
                multiple
                style="display: none"
              />
              <button
                type="button"
                class="btn btn-outline"
                (click)="fileInput.click()"
              >
                {{
                  bicycle.zustand === 'Neu'
                    ? '📄 ' + t.selectInvoice
                    : '📷 ' + t.selectPhotos
                }}
              </button>
              <span class="file-count" *ngIf="selectedFiles.length > 0">
                {{ selectedFiles.length }} {{ t.photosSelected }}
              </span>
            </div>
            <div class="preview-grid" *ngIf="previewUrls.length > 0">
              <div
                class="preview-item"
                *ngFor="let url of previewUrls; let i = index"
              >
                <img [src]="url" alt="Vorschau" />
                <button
                  type="button"
                  class="remove-btn"
                  (click)="removeFile(i)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Validation messages -->
        <div class="validation-errors" *ngIf="!canSubmit() && !submitting">
          <p *ngIf="!bulkMode && !seller.vorname.trim()" class="error-msg">
            ⚠️ {{ t.sellerFirstNameRequired }}
          </p>
          <p *ngIf="!bulkMode && !seller.nachname.trim()" class="error-msg">
            ⚠️ {{ t.sellerLastNameRequired }}
          </p>
          <p *ngIf="bulkMode && !seller.nachname.trim()" class="error-msg">
            ⚠️ {{ t.storeNameRequired }}
          </p>
          <p *ngIf="!bicycle.marke.trim()" class="error-msg">
            ⚠️ {{ t.brandIsRequired }}
          </p>
          <p *ngIf="!bicycle.reifengroesse.trim()" class="error-msg">
            ⚠️ {{ t.wheelSizeIsRequired }}
          </p>
          <p *ngIf="!preis || preis <= 0" class="error-msg">
            ⚠️ {{ t.priceMustBeGreaterThanZero }}
          </p>
          <p *ngIf="!kaufdatum" class="error-msg">
            ⚠️ {{ t.purchaseDateIsRequired }}
          </p>
        </div>

        <!-- Bulk summary -->
        <div class="bulk-summary" *ngIf="bulkMode && canSubmit()">
          <p>
            📦 <strong>{{ bulkQuantity }}x</strong> {{ bicycle.marke }}
            {{ bicycle.modell }}
            <span *ngIf="bicycle.reifengroesse"
              >({{ bicycle.reifengroesse }}")</span
            >
            — {{ t.pricePerBike }}: {{ preis | number: '1.2-2' }} € —
            {{ t.totalPrice }}: {{ preis * bulkQuantity | number: '1.2-2' }} €
          </p>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            [disabled]="!canSubmit() || submitting"
          >
            {{
              submitting
                ? t.saving
                : bulkMode
                  ? t.saveBulkPurchase
                  : t.savePurchase
            }}
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
      .mode-toggle {
        display: flex;
        gap: 0;
        margin-bottom: 20px;
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        overflow: hidden;
      }
      .toggle-btn {
        flex: 1;
        padding: 12px 20px;
        border: none;
        background: transparent;
        font-size: 0.92rem;
        font-weight: 600;
        cursor: pointer;
        color: var(--text-secondary, #64748b);
        transition: var(--transition-fast);
      }
      .toggle-btn.active {
        background: var(--accent-primary, #6366f1);
        color: white;
      }
      .toggle-btn:not(.active):hover {
        background: var(--table-hover, #f1f5f9);
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
      .bulk-quantity {
        margin-bottom: 18px;
        padding-bottom: 18px;
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
      }
      .bulk-quantity label {
        display: block;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .quantity-control {
        display: flex;
        align-items: center;
        gap: 0;
        width: fit-content;
      }
      .qty-btn {
        width: 40px;
        height: 40px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        background: var(--bg-card, #fff);
        font-size: 1.2rem;
        font-weight: 700;
        cursor: pointer;
        color: var(--text-primary);
        transition: var(--transition-fast);
      }
      .qty-btn:first-child {
        border-radius: var(--radius-md, 10px) 0 0 var(--radius-md, 10px);
      }
      .qty-btn:last-child {
        border-radius: 0 var(--radius-md, 10px) var(--radius-md, 10px) 0;
      }
      .qty-btn:hover {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
      }
      .qty-input {
        width: 60px;
        height: 40px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-left: none;
        border-right: none;
        text-align: center;
        font-size: 1.1rem;
        font-weight: 700;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
      }
      .qty-input:focus {
        outline: none;
      }
      .bulk-quantity .hint {
        display: block;
        font-size: 0.73rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 6px;
      }
      .calculated-price {
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
      }
      .fixed-value {
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        background: var(--bg-tertiary, #f1f5f9);
      }
      .bulk-summary {
        margin-top: 16px;
        padding: 14px 18px;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
        border: 1.5px solid var(--accent-primary, #6366f1);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        color: var(--text-primary);
      }
      .form-actions {
        margin-top: 24px;
        text-align: right;
      }
      .btn {
        padding: 8px 16px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        display: inline-flex;
        align-items: center;
        gap: 6px;
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
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
      }
      .btn-lg {
        padding: 12px 32px;
        font-size: 1.05rem;
      }
      .hint-text {
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
        margin-bottom: 12px;
      }
      .upload-area {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .file-count {
        font-size: 0.9rem;
        color: var(--text-secondary, #64748b);
      }
      .preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
      }
      .preview-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--radius-md, 10px);
        overflow: hidden;
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        border: none;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        transition: var(--transition-fast);
      }
      .remove-btn:hover {
        background: var(--accent-danger, #ef4444);
      }
      .validation-errors {
        margin-top: 12px;
      }
      .error-msg {
        font-size: 0.85rem;
        color: var(--accent-danger, #ef4444);
        margin: 4px 0;
      }
    `,
  ],
})
export class PurchaseFormComponent implements OnInit {
  private translationService = inject(TranslationService);
  get t() {
    return this.translationService.translations();
  }

  bulkMode = false;
  bulkQuantity = 1;

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
    rahmengroesse: '',
    farbe: '',
    reifengroesse: '',
    stokNo: '',
    fahrradtyp: '',
    beschreibung: '',
    zustand: BikeCondition.Gebraucht,
  };
  preis = 0;
  verkaufspreisVorschlag: number | null = null;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  kaufdatum = '';
  notizen = '';
  belegNummer = '';
  signatureData = '';
  signerName = '';
  submitting = false;

  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  brands: string[] = [];
  models: string[] = [];
  storeNames: string[] = [];

  firstNames: string[] = [];
  lastNames: string[] = [];

  constructor(
    private purchaseService: PurchaseService,
    private documentService: DocumentService,
    private bicycleService: BicycleService,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // Check for bulk mode from query param
    this.route.queryParams.subscribe((params) => {
      if (params['bulk'] === 'true') {
        this.bulkMode = true;
        this.bicycle.zustand = BikeCondition.Neu; // Bulk mode is always Neu
      } else {
        this.bicycle.zustand = BikeCondition.Gebraucht; // Single mode is Gebraucht
      }
    });

    this.kaufdatum = new Date().toISOString().split('T')[0];
    this.bicycleService.getNextStokNo().subscribe({
      next: (res) => {
        this.bicycle.stokNo = res.stokNo;
      },
      error: () => {},
    });
    this.purchaseService.getNextBelegNummer().subscribe({
      next: (res) => {
        this.belegNummer = res.belegNummer;
      },
      error: () => {},
    });

    // Load brands for autocomplete
    this.bicycleService.getBrands().subscribe({
      next: (res) => {
        this.brands = res;
      },
      error: () => {},
    });

    // Load store names for autocomplete
    this.purchaseService.getStoreNames().subscribe({
      next: (res) => {
        this.storeNames = res;
      },
      error: () => {},
    });

    // Load all models initially
    this.bicycleService.getModels().subscribe({
      next: (res) => {
        this.models = res;
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

  increaseQty() {
    if (this.bulkQuantity < 100) this.bulkQuantity++;
  }

  decreaseQty() {
    if (this.bulkQuantity > 1) this.bulkQuantity--;
  }

  onBrandChange() {
    // Load models filtered by the selected brand
    const brand = this.bicycle.marke?.trim();
    if (brand && this.brands.includes(brand)) {
      this.bicycleService.getModels(brand).subscribe({
        next: (res) => {
          this.models = res;
        },
        error: () => {},
      });
    } else {
      // Load all models if brand is cleared or doesn't match exactly
      this.bicycleService.getModels().subscribe({
        next: (res) => {
          this.models = res;
        },
        error: () => {},
      });
    }
  }

  canSubmit(): boolean {
    const baseValid = !!(
      this.bicycle.marke?.trim() &&
      this.bicycle.reifengroesse?.trim() &&
      this.preis > 0 &&
      this.kaufdatum
    );

    if (this.bulkMode) {
      return (
        baseValid && !!this.seller.nachname?.trim() && this.bulkQuantity >= 1
      );
    }

    return (
      baseValid &&
      !!this.seller.vorname?.trim() &&
      !!this.seller.nachname?.trim()
    );
  }

  onSellerAddressSelected(address: AddressSuggestion) {
    this.seller.strasse = address.strasse;
    this.seller.hausnummer = address.hausnummer;
    this.seller.plz = address.plz;
    this.seller.stadt = address.stadt;
  }

  updateSignerName() {
    const name = [this.seller.vorname, this.seller.nachname]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (name) {
      this.signerName = name;
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of Array.from(input.files)) {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrls.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
    input.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  submit() {
    this.submitting = true;
    if (this.bulkMode) {
      this.submitBulk();
    } else {
      this.submitSingle();
    }
  }

  private submitBulk() {
    const bulkData: BulkPurchaseCreate = {
      bicycle: {
        marke: this.bicycle.marke,
        modell: this.bicycle.modell,
        farbe: this.bicycle.farbe || undefined,
        reifengroesse: this.bicycle.reifengroesse,
        rahmengroesse: this.bicycle.rahmengroesse || undefined,
        fahrradtyp: this.bicycle.fahrradtyp || undefined,
        beschreibung: this.bicycle.beschreibung || undefined,
        zustand: this.bicycle.zustand as BikeCondition,
      },
      seller: {
        vorname: this.seller.vorname || this.seller.nachname,
        nachname: this.seller.nachname,
      },
      anzahl: this.bulkQuantity,
      preis: this.preis,
      verkaufspreisVorschlag: this.verkaufspreisVorschlag || undefined,
      zahlungsart: this.zahlungsart,
      kaufdatum: this.kaufdatum,
      notizen: this.notizen || undefined,
      belegNummer: this.belegNummer || undefined,
    };

    this.purchaseService.createBulk(bulkData).subscribe({
      next: () => {
        this.router.navigate(['/purchases']);
      },
      error: () => {
        this.submitting = false;
        alert('Fehler beim Speichern des Toplu-Ankaufs');
      },
    });
  }

  private submitSingle() {
    const purchase: PurchaseCreate = {
      bicycle: this.bicycle,
      seller: this.seller,
      preis: this.preis,
      verkaufspreisVorschlag: this.verkaufspreisVorschlag || undefined,
      zahlungsart: this.zahlungsart,
      kaufdatum: this.kaufdatum,
      notizen: this.notizen || undefined,
      belegNummer: this.belegNummer || undefined,
    };

    this.purchaseService.create(purchase).subscribe({
      next: (result) => {
        if (this.selectedFiles.length > 0 && result.id) {
          const docType =
            this.bicycle.zustand === 'Neu'
              ? DocumentType.Rechnung
              : DocumentType.Screenshot;
          const uploadObservables = this.selectedFiles.map((file) =>
            this.documentService.upload(
              file,
              docType,
              result.bicycle.id,
              result.id,
            ),
          );

          forkJoin(uploadObservables).subscribe({
            next: () => {
              this.router.navigate(['/purchases']);
            },
            error: () => {
              console.error('Fehler beim Hochladen der Screenshots');
              this.router.navigate(['/purchases']);
            },
          });
        } else {
          this.router.navigate(['/purchases']);
        }
      },
      error: () => {
        this.submitting = false;
        alert('Fehler beim Speichern des Ankaufs');
      },
    });
  }
}
