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
  BicycleUpdate,
  BikeCondition,
  PaymentMethod,
  SignatureCreate,
  SaleAccessoryCreate,
  AccessoryCatalogList,
} from '../../models/models';
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
              [allowQuickAdd]="true"
              (bikeSelected)="onBikeSelected($event)"
              (quickAddRequested)="onQuickAddBike()"
            ></app-bike-selector>
          </div>

          <!-- Bicycle details edit form -->
          <div class="form-card" *ngIf="selectedBike">
            <div class="card-header-row">
              <h2>
                <span *ngIf="isQuickAddMode" class="quick-add-badge"
                  >🆕 {{ t.newBicycle }}</span
                >
                <span *ngIf="!isQuickAddMode">{{ t.bicycleDetails }}</span>
                <span
                  *ngIf="hasBikeErrors && !bikeEditExpanded"
                  class="bike-error-badge"
                  >{{ t.requiredFieldsMissing }}</span
                >
              </h2>
              <button
                type="button"
                class="btn btn-sm btn-outline"
                [class.btn-error]="hasBikeErrors && !bikeEditExpanded"
                (click)="bikeEditExpanded = !bikeEditExpanded"
                *ngIf="!isQuickAddMode"
              >
                {{ bikeEditExpanded ? '▲ ' + t.collapse : '▼ ' + t.expand }}
              </button>
            </div>
            <div
              class="bike-summary"
              *ngIf="!bikeEditExpanded && !isQuickAddMode"
            >
              <span
                ><strong
                  >{{ bikeEdit.marke }} {{ bikeEdit.modell }}</strong
                ></span
              >
              <span
                *ngIf="bikeEdit.rahmennummer"
                style="text-transform: uppercase"
                >{{ t.frameNumber }}: {{ bikeEdit.rahmennummer }}</span
              >
              <span *ngIf="bikeEdit.rahmengroesse"
                >{{ t.frameSize }}: {{ bikeEdit.rahmengroesse }}</span
              >
              <span>{{ bikeEdit.farbe }} | {{ bikeEdit.reifengroesse }}"</span>
            </div>
            <div class="form-grid" *ngIf="bikeEditExpanded || isQuickAddMode">
              <div class="field" [class.field-error]="bikeErrors['marke']">
                <label>{{ t.brand }} *</label>
                <input
                  [(ngModel)]="bikeEdit.marke"
                  name="bikeMarke"
                  list="brandList"
                  autocomplete="off"
                  (ngModelChange)="bikeErrors['marke'] = false"
                />
                <datalist id="brandList">
                  <option *ngFor="let b of brands" [value]="b"></option>
                </datalist>
                <span class="error-msg" *ngIf="bikeErrors['marke']">{{
                  t.requiredField
                }}</span>
              </div>
              <div class="field">
                <label>{{ t.model }}</label>
                <input
                  [(ngModel)]="bikeEdit.modell"
                  name="bikeModell"
                  list="modelList"
                  autocomplete="off"
                />
                <datalist id="modelList">
                  <option *ngFor="let m of models" [value]="m"></option>
                </datalist>
              </div>
              <div
                class="field"
                [class.field-error]="bikeErrors['rahmennummer']"
              >
                <label>{{ t.frameNumber }} *</label>
                <input
                  [(ngModel)]="bikeEdit.rahmennummer"
                  name="bikeRahmen"
                  (ngModelChange)="bikeErrors['rahmennummer'] = false"
                  style="text-transform: uppercase"
                />
                <span class="error-msg" *ngIf="bikeErrors['rahmennummer']">{{
                  t.requiredField
                }}</span>
              </div>
              <div class="field">
                <label>{{ t.frameSize }}</label>
                <input
                  [(ngModel)]="bikeEdit.rahmengroesse"
                  name="bikeRahmengroesse"
                  placeholder="z.B. 52, 56, M, L"
                />
              </div>
              <div class="field" [class.field-error]="bikeErrors['farbe']">
                <label>{{ t.color }} *</label>
                <div class="color-chips">
                  <button
                    type="button"
                    *ngFor="let c of colorOptions"
                    class="color-chip"
                    [class.selected]="isColorSelected(bikeEdit.farbe, c.value)"
                    [style.--chip-color]="c.hex"
                    (click)="
                      bikeEdit.farbe = toggleColor(bikeEdit.farbe, c.value);
                      bikeErrors['farbe'] = false
                    "
                  >
                    <span class="chip-dot"></span>
                    {{ c.label }}
                  </button>
                </div>
                <span class="error-msg" *ngIf="bikeErrors['farbe']">{{
                  t.requiredField
                }}</span>
              </div>
              <div
                class="field"
                [class.field-error]="bikeErrors['reifengroesse']"
              >
                <label>{{ t.wheelSize }} *</label>
                <span class="error-msg" *ngIf="bikeErrors['reifengroesse']">{{
                  t.requiredField
                }}</span>
                <select
                  [(ngModel)]="bikeEdit.reifengroesse"
                  name="bikeReifen"
                  (ngModelChange)="bikeErrors['reifengroesse'] = false"
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
              <div class="field">
                <label>{{ t.stockNo }}</label>
                <input [(ngModel)]="bikeEdit.stokNo" name="bikeStokNo" />
              </div>
              <div class="field" [class.field-error]="bikeErrors['fahrradtyp']">
                <label>{{ t.bicycleType }} *</label>
                <span class="error-msg" *ngIf="bikeErrors['fahrradtyp']">{{
                  t.requiredField
                }}</span>
                <select
                  [(ngModel)]="bikeEdit.fahrradtyp"
                  name="bikeFahrradtyp"
                  (ngModelChange)="bikeErrors['fahrradtyp'] = false"
                >
                  <option value="">-- {{ t.selectOption }} --</option>
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
                  [(ngModel)]="bikeEdit.zustand"
                  name="bikeZustand"
                  required
                >
                  <option value="Gebraucht">{{ t.usedCondition }}</option>
                  <option value="Neu">{{ t.newCondition }}</option>
                </select>
              </div>
              <div class="field full">
                <label>{{ t.descriptionEquipment }}</label>
                <textarea
                  [(ngModel)]="bikeEdit.beschreibung"
                  name="bikeBeschr"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Sale details -->
          <div class="form-card">
            <h2>{{ t.saleData }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.receiptNo }}</label>
                <input
                  [(ngModel)]="belegNummer"
                  name="belegNummer"
                  placeholder="z.B. VB-20260219-001"
                />
              </div>
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
                  <option value="Karte">{{ t.bankTransfer }}</option>
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

            <div class="grand-total" *ngIf="preis > 0">
              <div class="total-row">
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
                <strong
                  >{{
                    preis + accessoriesTotal - rabatt | number: '1.2-2'
                  }}
                  €</strong
                >
              </div>
            </div>
          </div>

          <!-- Buyer info -->
          <div class="form-card">
            <h2>{{ t.buyer }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.firstName }}</label>
                <input [(ngModel)]="buyer.vorname" name="buyerVorname" />
              </div>
              <div class="field">
                <label>{{ t.lastName }}</label>
                <input [(ngModel)]="buyer.nachname" name="buyerNachname" />
              </div>
              <div class="field full">
                <label>{{ t.searchAddress }}</label>
                <app-address-autocomplete
                  [placeholder]="t.addressPlaceholder"
                  (addressSelected)="onBuyerAddressSelected($event)"
                ></app-address-autocomplete>
                <small class="hint">{{ t.addressHint }}</small>
              </div>
              <div class="field">
                <label>{{ t.street }}</label>
                <input [(ngModel)]="buyer.strasse" name="buyerStrasse" />
              </div>
              <div class="field">
                <label>{{ t.houseNumber }}</label>
                <input [(ngModel)]="buyer.hausnummer" name="buyerHausnr" />
              </div>
              <div class="field">
                <label>{{ t.postalCode }}</label>
                <input [(ngModel)]="buyer.plz" name="buyerPlz" />
              </div>
              <div class="field">
                <label>{{ t.city }}</label>
                <input [(ngModel)]="buyer.stadt" name="buyerStadt" />
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
      .card-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .card-header-row h2 {
        margin-bottom: 0;
      }
      .bike-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        padding: 12px;
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        border: 1px solid var(--accent-success, #10b981);
        border-radius: var(--radius-md, 10px);
        font-size: 0.9rem;
        color: #1e293b;
      }
      .bike-summary strong {
        color: #047857;
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
      .color-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .color-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 20px;
        background: var(--bg-card, #fff);
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .color-chip:hover {
        border-color: var(--accent-primary, #6366f1);
        background: var(--table-hover, #f1f5f9);
      }
      .color-chip.selected {
        border-color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        font-weight: 600;
      }
      .chip-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--chip-color, #ccc);
        border: 1px solid rgba(0, 0, 0, 0.12);
        flex-shrink: 0;
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
      .field-error input,
      .field-error select,
      .field-error textarea {
        border-color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.04);
      }
      .field-error label {
        color: #ef4444;
      }
      .error-msg {
        display: block;
        color: #ef4444;
        font-size: 0.75rem;
        margin-top: 4px;
        font-weight: 500;
      }
      .bike-error-badge {
        display: inline-block;
        background: #ef4444;
        color: #fff;
        font-size: 0.65rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 99px;
        margin-left: 8px;
        vertical-align: middle;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .quick-add-badge {
        display: inline-block;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        font-size: 0.9rem;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 8px;
        vertical-align: middle;
      }
      .btn-error {
        border-color: #ef4444 !important;
        color: #ef4444 !important;
      }
    `,
  ],
})
export class SaleFormComponent implements OnInit {
  private translationService = inject(TranslationService);

  colorOptions = [
    { value: 'Schwarz', label: 'Schwarz', hex: '#1a1a1a' },
    { value: 'Weiß', label: 'Weiß', hex: '#f5f5f5' },
    { value: 'Rot', label: 'Rot', hex: '#ef4444' },
    { value: 'Blau', label: 'Blau', hex: '#3b82f6' },
    { value: 'Grün', label: 'Grün', hex: '#22c55e' },
    { value: 'Gelb', label: 'Gelb', hex: '#eab308' },
    { value: 'Orange', label: 'Orange', hex: '#f97316' },
    { value: 'Grau', label: 'Grau', hex: '#9ca3af' },
    { value: 'Silber', label: 'Silber', hex: '#c0c0c0' },
    { value: 'Pink', label: 'Pink', hex: '#ec4899' },
  ];

  isColorSelected(farbe: string, color: string): boolean {
    if (!farbe) return false;
    return farbe.split(/[,\/]\s*/).includes(color);
  }

  toggleColor(farbe: string, color: string): string {
    const colors = farbe ? farbe.split(/[,\/]\s*/).filter(Boolean) : [];
    const idx = colors.indexOf(color);
    if (idx >= 0) colors.splice(idx, 1);
    else colors.push(color);
    return colors.join('/');
  }

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
  belegNummer = '';
  sellerSignatureData = '';
  sellerSignerName = '';
  submitting = false;
  accessories: SaleAccessoryCreate[] = [];
  rabatt = 0;

  // Bicycle edit
  bikeEditExpanded = false;
  isQuickAddMode = false;
  bikeErrors: { [key: string]: boolean } = {};
  bikeEdit = {
    marke: '',
    modell: '',
    rahmennummer: '',
    rahmengroesse: '',
    farbe: '',
    reifengroesse: '',
    stokNo: '',
    fahrradtyp: '',
    beschreibung: '',
    zustand: 'Gebraucht' as BikeCondition,
  };
  brands: string[] = [];
  models: string[] = [];

  get t() {
    return this.translationService.translations();
  }

  get hasBikeErrors(): boolean {
    return Object.values(this.bikeErrors).some((v) => v);
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
          this.onBikeSelected(bike);
        }
      }
    });
    // Load next BelegNummer
    this.saleService.getNextBelegNummer().subscribe({
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

    // Load all models
    this.bicycleService.getModels().subscribe({
      next: (res) => {
        this.models = res;
      },
      error: () => {},
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
    this.isQuickAddMode = false;
    this.loadPlannedPrice(bike.id);
    // Populate bikeEdit form
    this.bikeEdit = {
      marke: bike.marke || '',
      modell: bike.modell || '',
      rahmennummer: bike.rahmennummer || '',
      rahmengroesse: bike.rahmengroesse || '',
      farbe: bike.farbe || '',
      reifengroesse: bike.reifengroesse || '',
      stokNo: bike.stokNo || '',
      fahrradtyp: bike.fahrradtyp || '',
      beschreibung: bike.beschreibung || '',
      zustand: bike.zustand || BikeCondition.Gebraucht,
    };
  }

  onQuickAddBike() {
    // Create a temporary bike placeholder for quick add mode
    this.isQuickAddMode = true;
    this.selectedBike = {
      id: 0, // Temporary ID, will be replaced when created
      marke: '',
      modell: '',
      rahmennummer: '',
      rahmengroesse: '',
      farbe: '',
      reifengroesse: '',
      stokNo: '',
      fahrradtyp: '',
      beschreibung: '',
      status: 'Verfügbar' as any,
      zustand: BikeCondition.Gebraucht,
    } as Bicycle;

    // Clear bikeEdit form for new bike
    this.bikeEdit = {
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

    // Expand the form to enter details
    this.bikeEditExpanded = true;
    this.bikeErrors = {};
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

  validateBike(): boolean {
    this.bikeErrors = {};
    if (!this.bikeEdit.marke?.trim()) this.bikeErrors['marke'] = true;
    if (!this.bikeEdit.rahmennummer?.trim())
      this.bikeErrors['rahmennummer'] = true;
    if (!this.bikeEdit.farbe) this.bikeErrors['farbe'] = true;
    if (!this.bikeEdit.reifengroesse) this.bikeErrors['reifengroesse'] = true;
    if (!this.bikeEdit.fahrradtyp) this.bikeErrors['fahrradtyp'] = true;
    return Object.keys(this.bikeErrors).length === 0;
  }

  submit() {
    if (!this.selectedBike) return;
    if (!this.validateBike()) {
      this.bikeEditExpanded = true;
      return;
    }
    this.submitting = true;

    // If in quick add mode, create the bike first
    if (this.isQuickAddMode) {
      const newBike = {
        marke: this.bikeEdit.marke,
        modell: this.bikeEdit.modell,
        rahmennummer: this.bikeEdit.rahmennummer || undefined,
        rahmengroesse: this.bikeEdit.rahmengroesse || undefined,
        farbe: this.bikeEdit.farbe || undefined,
        reifengroesse: this.bikeEdit.reifengroesse,
        stokNo: this.bikeEdit.stokNo || undefined,
        fahrradtyp: this.bikeEdit.fahrradtyp || undefined,
        beschreibung: this.bikeEdit.beschreibung || undefined,
        status: 'Verfügbar' as any,
        zustand: this.bikeEdit.zustand,
      };

      this.bicycleService.create(newBike).subscribe({
        next: (createdBike) => {
          this.selectedBike = createdBike;
          this.isQuickAddMode = false;
          this.createSale();
        },
        error: () => {
          this.submitting = false;
          alert('Fehler beim Erstellen des Fahrrads');
        },
      });
      return;
    }

    // Otherwise update the existing bicycle
    const bikeUpdate: BicycleUpdate = {
      marke: this.bikeEdit.marke,
      modell: this.bikeEdit.modell,
      rahmennummer: this.bikeEdit.rahmennummer || undefined,
      rahmengroesse: this.bikeEdit.rahmengroesse || undefined,
      farbe: this.bikeEdit.farbe || undefined,
      reifengroesse: this.bikeEdit.reifengroesse,
      stokNo: this.bikeEdit.stokNo || undefined,
      fahrradtyp: this.bikeEdit.fahrradtyp || undefined,
      beschreibung: this.bikeEdit.beschreibung || undefined,
      status: this.selectedBike.status,
      zustand: this.bikeEdit.zustand,
    };

    // Update bicycle first, then create sale
    this.bicycleService.update(this.selectedBike.id, bikeUpdate).subscribe({
      next: () => {
        // Update local selectedBike to reflect changes (for warranty calculation)
        this.selectedBike!.zustand = this.bikeEdit.zustand;
        this.createSale();
      },
      error: () => {
        this.submitting = false;
        alert('Fehler beim Aktualisieren des Fahrrads');
      },
    });
  }

  private createSale() {
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
      sellerSignature: sellerSig,
      accessories:
        this.accessories.length > 0
          ? this.accessories.filter((a) => a.bezeichnung && a.preis > 0)
          : undefined,
      rabatt: this.rabatt > 0 ? this.rabatt : undefined,
      belegNummer: this.belegNummer || undefined,
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
