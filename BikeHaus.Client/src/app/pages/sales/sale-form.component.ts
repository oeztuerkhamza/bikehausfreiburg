import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SaleService } from '../../services/sale.service';
import { BicycleService } from '../../services/bicycle.service';
import { PurchaseService } from '../../services/purchase.service';
import { SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';
import { FormDraftService } from '../../services/form-draft.service';
import {
  SaleCreate,
  Bicycle,
  BicycleUpdate,
  BikeCondition,
  PaymentMethod,
  SignatureCreate,
  SaleAccessoryCreate,
  SalePaymentCreate,
  AccessoryCatalogList,
  Customer,
} from '../../models/models';
import { AccessoryAutocompleteComponent } from '../../components/accessory-autocomplete/accessory-autocomplete.component';
import { CustomerAutocompleteComponent } from '../../components/customer-autocomplete/customer-autocomplete.component';
import { DraftRestoredBannerComponent } from '../../components/draft-restored-banner/draft-restored-banner.component';

/**
 * Nur echte Nutzereingaben. `bikeEdit`/`isQuickAddMode` nur, wenn tatsächlich
 * neu angelegt wird (Schnellerfassung) — ist stattdessen ein vorhandenes
 * Fahrrad aus dem Bestand ausgewählt, wird die Auswahl bewusst NICHT
 * wiederhergestellt: sonst könnte submit() beim Wiederherstellen fälschlich
 * ein zweites, doppeltes Fahrrad anlegen statt das ausgewählte zu verwenden.
 * Unterschrift (sellerSignatureData) ist ohnehin keine Eingabe hier — sie
 * kommt aus den Settings (Standard-Unterschrift des Inhabers), nicht von
 * einem Unterschriften-Pad in diesem Formular.
 */
interface SaleFormDraft {
  isAccessoryOnly: boolean;
  buyer: {
    vorname: string;
    nachname: string;
    strasse: string;
    hausnummer: string;
    plz: string;
    stadt: string;
    telefon: string;
    email: string;
  };
  preis: number;
  zahlungsart: PaymentMethod;
  zahlungen: SalePaymentCreate[];
  verkaufsdatum: string;
  notizen: string;
  accessories: SaleAccessoryCreate[];
  rabatt: number;
  isQuickAddMode: boolean;
  bikeEdit: {
    marke: string;
    modell: string;
    rahmennummer: string;
    lagernummer: number | undefined;
    rahmengroesse: string;
    farbe: string;
    reifengroesse: string;
    fahrradtyp: string;
    beschreibung: string;
    zustand: BikeCondition | '';
  };
}

const DRAFT_KEY = 'bikehaus-draft-sale-form';
const DRAFT_MAX_AGE_MS = 8 * 60 * 60 * 1000;

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AccessoryAutocompleteComponent,
    CustomerAutocompleteComponent,
    DraftRestoredBannerComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.newSaleTitle }}</h1>
        <div class="page-header-actions">
          <label
            class="checkbox-label accessory-toggle"
            [class.active]="isAccessoryOnly"
          >
            <input
              type="checkbox"
              [(ngModel)]="isAccessoryOnly"
              name="isAccessoryOnly"
              (ngModelChange)="onAccessoryOnlyChange()"
            />
            <span class="accessory-toggle-indicator">✓</span>
            <span>Nur Zubehörverkauf (ohne Fahrrad)</span>
          </label>
          <a routerLink="/sales" class="btn btn-outline">{{ t.back }}</a>
        </div>
      </div>

      <app-draft-restored-banner
        *ngIf="draftRestored"
        (discard)="discardDraft()"
      ></app-draft-restored-banner>

      <form (ngSubmit)="submit()" #f="ngForm">
        <!-- Wizard progress (mobile only) -->
        <div class="wizard-progress" *ngIf="isMobile">
          <div class="wizard-progress-top">
            <span class="wizard-step-count"
              >Schritt {{ currentStep + 1 }} / {{ totalSteps }}</span
            >
            <span class="wizard-step-name">{{ currentStepLabel }}</span>
          </div>
          <div class="wizard-progress-bar">
            <div
              class="wizard-progress-fill"
              [style.width.%]="((currentStep + 1) / totalSteps) * 100"
            ></div>
          </div>
          <div class="wizard-dots">
            <span
              class="wizard-dot"
              *ngFor="let s of wizardSteps; let idx = index"
              [class.active]="idx === currentStep"
              [class.done]="idx < currentStep"
              (click)="goToStep(idx)"
            ></span>
          </div>
        </div>

        <div class="form-sections">
          <!-- STEP: Fahrrad -->
          <div class="wizard-step" [class.wizard-hidden]="isStepHidden('bike')">
          <ng-container *ngIf="!isAccessoryOnly">
            <!-- Bicycle details edit form (always open; existing bikes are
                 linked via Lagernummer/Rahmennummer autocomplete) -->
            <div class="form-card">
              <div class="card-header-row">
                <h2>
                  <span *ngIf="isQuickAddMode" class="quick-add-badge"
                    >🆕 {{ t.newBicycle }}</span
                  >
                  <span *ngIf="!isQuickAddMode"
                    >{{ t.bicycleDetails }}: {{ selectedBike?.marke }}
                    {{ selectedBike?.modell }}</span
                  >
                </h2>
                <button
                  type="button"
                  class="btn btn-outline"
                  *ngIf="!isQuickAddMode"
                  (click)="onQuickAddBike()"
                >
                  ✕ {{ t.newBicycle }}
                </button>
              </div>
              <div class="form-grid">
                <!-- Lagernummer with autocomplete dropdown -->
                <div class="field full rahmen-autocomplete-wrapper">
                  <label>{{ t.stockNumber }}</label>
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="bikeEdit.lagernummer"
                    name="bikeLagernummer"
                    (ngModelChange)="onLagernummerChange($event)"
                    (focus)="onLagernummerChange(bikeEdit.lagernummer)"
                    (blur)="hideLagerDropdown()"
                    placeholder="Lagernummer eingeben..."
                    autocomplete="off"
                  />
                  <!-- Autocomplete dropdown -->
                  <div
                    class="rahmen-dropdown"
                    *ngIf="lagerSearchResults.length > 0 && showLagerDropdown"
                  >
                    <div
                      class="rahmen-dropdown-item"
                      *ngFor="let bike of lagerSearchResults"
                      (mousedown)="selectRahmenBike(bike)"
                    >
                      <span class="rahmen-nr">#{{ bike.lagernummer }}</span>
                      <span class="rahmen-info"
                        >{{ bike.marke }} {{ bike.modell }}</span
                      >
                      <span
                        class="rahmen-badge"
                        *ngIf="bike.status === 'Available'"
                        >Verfügbar</span
                      >
                    </div>
                  </div>
                </div>
                <!-- Rahmennummer with autocomplete dropdown -->
                <div
                  class="field full rahmen-autocomplete-wrapper"
                  [class.field-error]="bikeErrors['rahmennummer']"
                >
                  <label>{{ t.frameNumber }} *</label>
                  <input
                    [(ngModel)]="bikeEdit.rahmennummer"
                    name="bikeRahmen"
                    (ngModelChange)="
                      bikeErrors['rahmennummer'] = false;
                      onRahmennummerChange($event)
                    "
                    (focus)="onRahmennummerChange(bikeEdit.rahmennummer)"
                    (blur)="hideRahmenDropdown()"
                    style="text-transform: uppercase"
                    placeholder="Rahmennummer eingeben..."
                    autocomplete="off"
                  />
                  <span class="error-msg" *ngIf="bikeErrors['rahmennummer']">{{
                    t.requiredField
                  }}</span>
                  <!-- Autocomplete dropdown -->
                  <div
                    class="rahmen-dropdown"
                    *ngIf="rahmenSearchResults.length > 0 && showRahmenDropdown"
                  >
                    <div
                      class="rahmen-dropdown-item"
                      *ngFor="let bike of rahmenSearchResults"
                      (mousedown)="selectRahmenBike(bike)"
                    >
                      <span class="rahmen-nr" *ngIf="bike.lagernummer != null"
                        >#{{ bike.lagernummer }}</span
                      >
                      <span class="rahmen-nr">{{ bike.rahmennummer }}</span>
                      <span class="rahmen-info"
                        >{{ bike.marke }} {{ bike.modell }}</span
                      >
                      <span
                        class="rahmen-badge"
                        *ngIf="bike.status === 'Available'"
                        >Verfügbar</span
                      >
                      <span
                        class="rahmen-badge sold"
                        *ngIf="bike.status === 'Sold'"
                        >Verkauft</span
                      >
                    </div>
                  </div>
                </div>
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
                      [class.selected]="
                        isColorSelected(bikeEdit.farbe, c.value)
                      "
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
                <div
                  class="field"
                  [class.field-error]="bikeErrors['fahrradtyp']"
                >
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
                    <option value="E-Trekking Pedelec">
                      E-Trekking Pedelec
                    </option>
                    <option value="Trekking">Trekking</option>
                    <option value="City">City</option>
                    <option value="MTB">Mountainbike (MTB)</option>
                    <option value="Rennrad">Rennrad</option>
                    <option value="Gravelbike">Gravelbike</option>
                    <option value="Kinderfahrrad">Kinderfahrrad</option>
                    <option value="Lastenrad">Lastenrad</option>
                    <option value="Sonstige">Sonstige</option>
                  </select>
                </div>
                <div class="field" [class.field-error]="bikeErrors['zustand']">
                  <label>{{ t.condition }} *</label>
                  <select
                    [(ngModel)]="bikeEdit.zustand"
                    name="bikeZustand"
                    required
                    (ngModelChange)="bikeErrors['zustand'] = false"
                  >
                    <!-- Bewusst ohne Vorauswahl: Neu/Gebraucht steuert die
                         Garantie, das darf kein stiller Default entscheiden. -->
                    <option value="" disabled>-- {{ t.selectOption }} --</option>
                    <option value="Gebraucht">{{ t.usedCondition }}</option>
                    <option value="Neu">{{ t.newCondition }}</option>
                  </select>
                  <span class="error-msg" *ngIf="bikeErrors['zustand']">{{
                    t.requiredField
                  }}</span>
                </div>
                <div class="field" [class.field-error]="bikeErrors['preis']">
                  <label>Preis (€) *</label>
                  <span class="error-msg" *ngIf="bikeErrors['preis']">{{
                    t.requiredField
                  }}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    [(ngModel)]="preis"
                    name="preis"
                    required
                    (ngModelChange)="bikeErrors['preis'] = false"
                  />
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
          </ng-container>
          </div>
          <!-- /STEP Fahrrad -->

          <!-- STEP: Verkaufsdaten -->
          <div class="wizard-step" [class.wizard-hidden]="isStepHidden('sale')">
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
          </div>
          <!-- /STEP Verkaufsdaten -->

          <!-- STEP: Zubehör & Rabatt -->
          <div
            class="wizard-step"
            [class.wizard-hidden]="isStepHidden('accessories')"
          >
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
          </div>
          </div>
          <!-- /STEP Zubehör -->

          <!-- STEP: Kundendaten -->
          <div
            class="wizard-step"
            [class.wizard-hidden]="isStepHidden('buyer')"
          >
          <!-- Buyer info -->
          <div class="form-card" *ngIf="showBuyerFields">
            <h2>Kundendaten</h2>
            <!-- Labels mit englischer Bezeichnung: der Kunde sitzt beim
                 Ausfüllen daneben und liest oft weder Deutsch noch Türkisch. -->
            <div class="form-grid">
              <app-customer-autocomplete
                [vorname]="buyer.vorname"
                (vornameChange)="buyer.vorname = $event"
                [nachname]="buyer.nachname"
                (nachnameChange)="buyer.nachname = $event"
                [vornameLabel]="t.firstNameIntl"
                [nachnameLabel]="t.lastNameIntl"
                [hasOtherData]="hasOtherBuyerData()"
                (customerSelected)="onBuyerSelected($event)"
              ></app-customer-autocomplete>
              <div class="field">
                <label>{{ t.emailIntl }}</label>
                <input
                  type="email"
                  [(ngModel)]="buyer.email"
                  name="buyerEmail"
                  placeholder="kunde@example.com"
                />
              </div>
              <div class="field">
                <label>{{ t.phoneIntl }}</label>
                <input [(ngModel)]="buyer.telefon" name="buyerTelefon" />
              </div>
              <div class="field">
                <label>{{ t.streetIntl }}</label>
                <input [(ngModel)]="buyer.strasse" name="buyerStrasse" />
              </div>
              <div class="field">
                <label>{{ t.houseNumberIntl }}</label>
                <input [(ngModel)]="buyer.hausnummer" name="buyerHausnr" />
              </div>
              <div class="field">
                <label>{{ t.postalCodeIntl }}</label>
                <input [(ngModel)]="buyer.plz" name="buyerPlz" />
              </div>
              <div class="field">
                <label>{{ t.cityIntl }}</label>
                <input [(ngModel)]="buyer.stadt" name="buyerStadt" />
              </div>
            </div>
          </div>
          </div>
          <!-- /STEP Kundendaten -->

          <!-- STEP: Zahlung -->
          <div
            class="wizard-step"
            [class.wizard-hidden]="isStepHidden('payment')"
          >
          <div class="form-card">
            <h2>Preisübersicht</h2>
            <table class="price-summary-table">
              <tr *ngIf="!isAccessoryOnly">
                <th>Fahrradpreis</th>
                <td>{{ preis | number: '1.2-2' }} €</td>
              </tr>
              <tr>
                <th>Zubehörpreis</th>
                <td>{{ accessoriesTotal | number: '1.2-2' }} €</td>
              </tr>
              <tr>
                <th>Rabatt</th>
                <td>- {{ rabatt | number: '1.2-2' }} €</td>
              </tr>
              <tr class="table-total-row">
                <th>Gesamt</th>
                <td>{{ effectiveGrandTotal | number: '1.2-2' }} €</td>
              </tr>
            </table>
          </div>

          <div class="form-card">
            <h2>Ödeme Bilgileri</h2>
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
                  <option value="Raten">Taksit</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="z.betrag"
                  [name]="'zBetrag' + i"
                  placeholder="Betrag"
                />
                <span class="zahlung-euro">€</span>
                <ng-container *ngIf="z.zahlungsart === 'Raten'">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    step="1"
                    class="raten-monate"
                    [(ngModel)]="z.ratenMonate"
                    [name]="'zRaten' + i"
                    placeholder="Ay"
                  />
                  <span class="zahlung-euro">ay</span>
                </ng-container>
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  (click)="fillRemaining(i)"
                  *ngIf="remainingAmount > 0"
                >
                  Kalanı Ekle
                </button>
                <button
                  type="button"
                  class="btn btn-icon btn-danger"
                  (click)="removeZahlung(i)"
                  *ngIf="zahlungen.length > 1"
                >
                  🗑️
                </button>
              </div>
              <button
                type="button"
                class="btn btn-outline btn-sm"
                (click)="addZahlung()"
              >
                + Weitere Zahlungsart
              </button>
            </div>

            <div class="payment-status">
              <div class="total-row">
                <span>Ödenen</span>
                <span>{{ paidAmount | number: '1.2-2' }} €</span>
              </div>
              <div class="total-row remaining" *ngIf="remainingAmount > 0">
                <span>Kalan</span>
                <strong>{{ remainingAmount | number: '1.2-2' }} €</strong>
              </div>
              <div class="total-row" *ngIf="remainingAmount === 0">
                <span>Kalan</span>
                <strong>0.00 €</strong>
              </div>
              <div class="total-row" *ngIf="ratenPlan">
                <span>Taksit</span>
                <strong>
                  {{ ratenPlan!.monate }} ay ×
                  {{ ratenPlan!.rate | number: '1.2-2' }} €
                </strong>
              </div>
            </div>
          </div>
          </div>
          <!-- /STEP Zahlung -->
        </div>

        <!-- Wizard nav (mobile only) -->
        <div class="wizard-nav" *ngIf="isMobile">
          <a
            routerLink="/sales"
            class="btn btn-outline wizard-back"
            *ngIf="currentStep === 0"
            >{{ t.back }}</a
          >
          <button
            type="button"
            class="btn btn-outline wizard-back"
            *ngIf="currentStep > 0"
            (click)="prevStep()"
          >
            Zurück
          </button>
          <button
            type="button"
            class="btn btn-primary wizard-next"
            *ngIf="!isLastStep"
            (click)="nextStep()"
          >
            Weiter
          </button>
          <button
            type="submit"
            class="btn btn-primary wizard-next"
            *ngIf="isLastStep"
            [disabled]="submitting"
          >
            {{ submitting ? t.saving : t.saveSale }}
          </button>
        </div>

        <div class="form-actions" *ngIf="!isMobile">
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
      .page-header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .accessory-toggle {
        display: inline-flex !important;
        align-items: center;
        gap: 10px;
        padding: 9px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 10px;
        background: var(--bg-card, #fff);
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        transition: all 0.18s ease;
      }
      .accessory-toggle:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--text-primary);
      }
      .accessory-toggle input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }
      .accessory-toggle-indicator {
        width: 18px;
        height: 18px;
        border-radius: 5px;
        border: 1.5px solid var(--border-light, #cbd5e1);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        line-height: 1;
        color: transparent;
        background: transparent;
        transition: all 0.18s ease;
      }
      .accessory-toggle.active {
        border-color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.1));
        color: var(--text-primary);
      }
      .accessory-toggle.active .accessory-toggle-indicator {
        border-color: var(--accent-primary, #6366f1);
        background: var(--accent-primary, #6366f1);
        color: #fff;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      @media (max-width: 900px) {
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        .page-header-actions {
          width: 100%;
          justify-content: space-between;
        }
        .accessory-toggle {
          white-space: normal;
        }
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
      .zahlung-item input.raten-monate {
        width: 72px;
      }
      .zahlung-euro {
        font-weight: 600;
        color: var(--text-secondary, #64748b);
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
      .price-summary-table {
        width: 100%;
        border-collapse: collapse;
      }
      .price-summary-table th,
      .price-summary-table td {
        padding: 10px 12px;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
        text-align: left;
      }
      .price-summary-table td {
        text-align: right;
        font-weight: 600;
      }
      .table-total-row th,
      .table-total-row td {
        font-weight: 800;
        font-size: 1.02rem;
      }
      .payment-status {
        margin-top: 12px;
        padding: 12px;
        border-radius: 10px;
        background: var(--bg-secondary, #f8fafc);
        border: 1px solid var(--border-light, #e2e8f0);
      }
      .payment-status .remaining {
        color: var(--accent-danger, #ef4444);
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
      .rahmen-warning {
        margin-top: 8px;
        padding: 12px 14px;
        background: rgba(245, 158, 11, 0.08);
        border: 1.5px solid #f59e0b;
        border-radius: var(--radius-md, 10px);
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 0.88rem;
        color: #92400e;
      }
      .warning-icon {
        font-size: 1.2rem;
        flex-shrink: 0;
      }
      .rahmen-autocomplete-wrapper {
        position: relative;
      }
      .rahmen-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 100;
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--accent-primary, #6366f1);
        border-radius: 0 0 var(--radius-md, 10px) var(--radius-md, 10px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        max-height: 240px;
        overflow-y: auto;
      }
      .rahmen-dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        cursor: pointer;
        transition: background 0.1s;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      .rahmen-dropdown-item:last-child {
        border-bottom: none;
      }
      .rahmen-dropdown-item:hover {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      .rahmen-nr {
        font-weight: 700;
        font-family: monospace;
        font-size: 0.88rem;
        text-transform: uppercase;
        color: var(--accent-primary, #6366f1);
      }
      .rahmen-info {
        font-size: 0.85rem;
        color: var(--text-primary);
      }
      .rahmen-badge {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 99px;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        margin-left: auto;
      }
      .rahmen-badge.sold {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      /* ── Mobile wizard ── */
      .wizard-progress {
        margin-bottom: 16px;
      }
      .wizard-progress-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 8px;
      }
      .wizard-step-count {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
      }
      .wizard-step-name {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .wizard-progress-bar {
        height: 6px;
        background: var(--border-light);
        border-radius: 99px;
        overflow: hidden;
      }
      .wizard-progress-fill {
        height: 100%;
        background: var(--accent-primary, #6366f1);
        border-radius: 99px;
        transition: width 0.25s ease;
      }
      .wizard-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 12px;
      }
      .wizard-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--border-color);
        cursor: pointer;
        transition: all 0.15s;
      }
      .wizard-dot.active {
        background: var(--accent-primary, #6366f1);
        transform: scale(1.35);
      }
      .wizard-dot.done {
        background: var(--accent-primary, #6366f1);
        opacity: 0.5;
      }
      .wizard-hidden {
        display: none;
      }
      .wizard-nav {
        position: sticky;
        bottom: 0;
        z-index: 50;
        display: flex;
        gap: 12px;
        margin-top: 16px;
        padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
        background: var(--bg-card);
        border-top: 1px solid var(--border-light);
      }
      .wizard-nav .wizard-next {
        flex: 1;
      }
      .wizard-nav .wizard-back {
        flex: 0 0 auto;
      }
      .wizard-nav .btn {
        padding: 14px 18px;
        font-size: 1rem;
        justify-content: center;
      }

      @media (max-width: 640px) {
        /* Prevent iOS zoom-on-focus (needs ≥16px) */
        .field input,
        .field select,
        .field textarea,
        .zahlung-item select,
        .zahlung-item input {
          font-size: 16px;
        }
        .form-card {
          padding: 16px;
        }
        .form-sections {
          gap: 16px;
        }
        .page-header {
          margin-bottom: 16px;
        }
        .page-header h1 {
          font-size: 1.25rem;
        }
        .color-chip {
          padding: 8px 12px;
          font-size: 0.9rem;
        }
        .btn-icon {
          width: 40px;
          height: 40px;
        }
        .accessory-fields .field {
          min-width: 130px;
        }
        .zahlung-item {
          flex-wrap: wrap;
        }
        .zahlung-item select {
          flex: 1 1 100%;
        }
        .zahlung-item input {
          flex: 1;
          width: auto;
        }
      }
    `,
  ],
})
export class SaleFormComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private notificationService = inject(NotificationService);
  private formDraftService = inject(FormDraftService);
  draftRestored = false;
  private draftAutosaveHandle: ReturnType<typeof setInterval> | undefined;
  private readonly defaultBuyer = {
    vorname: '',
    nachname: '',
  };

  // ── Mobile wizard ──
  isMobile = false;
  currentStep = 0;

  get wizardSteps(): { key: string; label: string }[] {
    if (this.isAccessoryOnly) {
      return [
        { key: 'sale', label: this.t.saleData },
        { key: 'accessories', label: 'Zubehör' },
        { key: 'payment', label: 'Zahlung' },
      ];
    }
    return [
      { key: 'bike', label: this.t.bicycle },
      { key: 'sale', label: this.t.saleData },
      { key: 'accessories', label: 'Zubehör' },
      { key: 'buyer', label: 'Kundendaten' },
      { key: 'payment', label: 'Zahlung' },
    ];
  }

  get totalSteps(): number {
    return this.wizardSteps.length;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.totalSteps - 1;
  }

  get currentStepLabel(): string {
    return this.wizardSteps[this.currentStep]?.label ?? '';
  }

  isStepHidden(key: string): boolean {
    return this.isMobile && this.wizardSteps[this.currentStep]?.key !== key;
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateIsMobile();
  }

  private updateIsMobile() {
    if (typeof window === 'undefined') return;
    this.isMobile = window.innerWidth <= 640;
  }

  private scrollToTop() {
    if (typeof document !== 'undefined') {
      document
        .querySelector('.content-area')
        ?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextStep() {
    if (!this.validateStep(this.currentStep)) return;
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  goToStep(step: number) {
    if (step === this.currentStep) return;
    if (step < this.currentStep) {
      this.currentStep = step;
      this.scrollToTop();
      return;
    }
    for (let s = this.currentStep; s < step; s++) {
      if (!this.validateStep(s)) {
        this.currentStep = s;
        this.scrollToTop();
        return;
      }
    }
    this.currentStep = step;
    this.scrollToTop();
  }

  private validateStep(step: number): boolean {
    const key = this.wizardSteps[step]?.key;
    switch (key) {
      case 'bike':
        if (!this.validateBike()) {
          this.notificationService.error(
            'Bitte alle Pflichtfelder des Fahrrads ausfüllen.',
          );
          return false;
        }
        return true;
      case 'sale':
        if (!this.verkaufsdatum) {
          this.notificationService.error('Bitte Verkaufsdatum ausfüllen.');
          return false;
        }
        return true;
      case 'accessories':
        if (this.isAccessoryOnly && this.accessories.length === 0) {
          this.notificationService.error(
            'Bitte mindestens ein Zubehör hinzufügen.',
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  colorOptions = [
    { value: 'Schwarz', label: 'Schwarz', hex: '#1a1a1a' },
    { value: 'Weiß', label: 'Weiß', hex: '#f5f5f5' },
    { value: 'Rot', label: 'Rot', hex: '#ef4444' },
    { value: 'Blau', label: 'Blau', hex: '#3b82f6' },
    { value: 'Grün', label: 'Grün', hex: '#22c55e' },
    { value: 'Gelb', label: 'Gelb', hex: '#eab308' },
    { value: 'Orange', label: 'Orange', hex: '#f97316' },
    { value: 'Braun', label: 'Braun', hex: '#92400e' },
    { value: 'Grau', label: 'Grau', hex: '#9ca3af' },
    { value: 'Silber', label: 'Silber', hex: '#c0c0c0' },
    { value: 'Pink', label: 'Pink', hex: '#ec4899' },
    { value: 'T\u00fcrkis', label: 'T\u00fcrkis', hex: '#06b6d4' },
    { value: 'Lila', label: 'Lila', hex: '#a855f7' },
    { value: 'Dunkelblau', label: 'Dunkelblau', hex: '#1e3a5f' },
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
    vorname: this.defaultBuyer.vorname,
    nachname: this.defaultBuyer.nachname,
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
  sellerSignatureData = '';
  sellerSignerName = '';
  submitting = false;
  isAccessoryOnly = false;
  showBuyerFields = true;
  accessories: SaleAccessoryCreate[] = [];
  rabatt = 0;
  purchaseId: number | undefined = undefined;

  // Bicycle edit
  bikeEditExpanded = true;
  isQuickAddMode = false;
  bikeErrors: { [key: string]: boolean } = {};
  rahmenMatchBike: Bicycle | null = null;
  rahmenSearchResults: Bicycle[] = [];
  showRahmenDropdown = false;
  private rahmenSearchTimeout: any = null;
  lagerSearchResults: Bicycle[] = [];
  showLagerDropdown = false;
  bikeEdit = {
    marke: '',
    modell: '',
    rahmennummer: '',
    lagernummer: undefined as number | undefined,
    rahmengroesse: '',
    farbe: '',
    reifengroesse: '',
    fahrradtyp: '',
    beschreibung: '',
    // '' = noch nicht gewählt. Kein Default, weil Neu/Gebraucht die Garantie
    // bestimmt — validateBike() erzwingt die Auswahl vor dem Speichern.
    zustand: '' as BikeCondition | '',
  };
  brands: string[] = [];
  models: string[] = [];

  get t() {
    return this.translationService.translations();
  }

  /** Steuert, ob die Kunden-Vorschlagsliste vor der Übernahme nachfragt. */
  hasOtherBuyerData(): boolean {
    return !!(
      this.buyer.strasse?.trim() ||
      this.buyer.hausnummer?.trim() ||
      this.buyer.plz?.trim() ||
      this.buyer.stadt?.trim() ||
      this.buyer.telefon?.trim() ||
      this.buyer.email?.trim()
    );
  }

  onBuyerSelected(customer: Customer) {
    this.buyer.strasse = customer.strasse || '';
    this.buyer.hausnummer = customer.hausnummer || '';
    this.buyer.plz = customer.plz || '';
    this.buyer.stadt = customer.stadt || '';
    this.buyer.telefon = customer.telefon || '';
    this.buyer.email = customer.email || '';
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

  get effectiveSalePrice(): number {
    return this.isAccessoryOnly ? 0 : this.preis;
  }

  get effectiveGrandTotal(): number {
    return Math.max(
      0,
      this.effectiveSalePrice + this.accessoriesTotal - this.rabatt,
    );
  }

  get paidAmount(): number {
    return this.zahlungen.reduce((sum, z) => sum + (z.betrag || 0), 0);
  }

  get remainingAmount(): number {
    return Math.max(0, this.effectiveGrandTotal - this.paidAmount);
  }

  // Taksitli satırdan aylık tutarı türet — belgede de aynı hesap görünüyor.
  get ratenPlan(): { monate: number; rate: number } | null {
    const z = this.zahlungen.find(
      (x) =>
        x.zahlungsart === PaymentMethod.Raten &&
        (x.ratenMonate ?? 0) > 0 &&
        (x.betrag ?? 0) > 0,
    );
    if (!z) return null;
    return { monate: z.ratenMonate!, rate: z.betrag / z.ratenMonate! };
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
    this.updateIsMobile();
    const _d = new Date();
    this.verkaufsdatum = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`;

    const accessoryOnlyParam =
      this.route.snapshot.queryParamMap.get('accessoryOnly');
    if (accessoryOnlyParam === 'true') {
      this.isAccessoryOnly = true;
      this.onAccessoryOnlyChange();
    }

    this.showBuyerFields = !this.isAccessoryOnly;

    // Bike details form is always open; start in quick-add mode until an
    // existing bike is linked via Lagernummer/Rahmennummer autocomplete.
    if (!this.isAccessoryOnly) {
      this.onQuickAddBike();
    }

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

    this.restoreDraftIfAny();
    this.draftAutosaveHandle = setInterval(() => this.saveDraftSnapshot(), 3000);
  }

  ngOnDestroy() {
    if (this.draftAutosaveHandle) clearInterval(this.draftAutosaveHandle);
  }

  private restoreDraftIfAny() {
    const draft = this.formDraftService.load<SaleFormDraft>(
      DRAFT_KEY,
      DRAFT_MAX_AGE_MS,
    );
    if (!draft) return;

    this.isAccessoryOnly = !!draft.isAccessoryOnly;
    this.showBuyerFields = !this.isAccessoryOnly;

    this.buyer.vorname = draft.buyer?.vorname ?? '';
    this.buyer.nachname = draft.buyer?.nachname ?? '';
    this.buyer.strasse = draft.buyer?.strasse ?? '';
    this.buyer.hausnummer = draft.buyer?.hausnummer ?? '';
    this.buyer.plz = draft.buyer?.plz ?? '';
    this.buyer.stadt = draft.buyer?.stadt ?? '';
    this.buyer.telefon = draft.buyer?.telefon ?? '';
    this.buyer.email = draft.buyer?.email ?? '';

    this.preis = draft.preis || 0;
    this.zahlungsart = draft.zahlungsart ?? PaymentMethod.Bar;
    if (Array.isArray(draft.zahlungen) && draft.zahlungen.length > 0) {
      this.zahlungen = draft.zahlungen.map((z) => ({
        zahlungsart: z.zahlungsart,
        betrag: z.betrag || 0,
        ratenMonate: z.ratenMonate,
      }));
    }
    if (draft.verkaufsdatum) this.verkaufsdatum = draft.verkaufsdatum;
    this.notizen = draft.notizen ?? '';
    if (Array.isArray(draft.accessories)) {
      this.accessories = draft.accessories.map((a) => ({
        bezeichnung: a.bezeichnung,
        preis: a.preis || 0,
        menge: a.menge || 1,
      }));
    }
    this.rabatt = draft.rabatt || 0;

    // Ein vorhandenes, per Suche ausgewähltes Fahrrad wird bewusst NICHT
    // wiederhergestellt (siehe Kommentar am Interface) — nur die Schnell-
    // erfassung eines neuen Fahrrads.
    if (draft.isQuickAddMode && draft.bikeEdit) {
      this.isQuickAddMode = true;
      this.bikeEdit.marke = draft.bikeEdit.marke ?? '';
      this.bikeEdit.modell = draft.bikeEdit.modell ?? '';
      this.bikeEdit.rahmennummer = draft.bikeEdit.rahmennummer ?? '';
      this.bikeEdit.lagernummer = draft.bikeEdit.lagernummer;
      this.bikeEdit.rahmengroesse = draft.bikeEdit.rahmengroesse ?? '';
      this.bikeEdit.farbe = draft.bikeEdit.farbe ?? '';
      this.bikeEdit.reifengroesse = draft.bikeEdit.reifengroesse ?? '';
      this.bikeEdit.fahrradtyp = draft.bikeEdit.fahrradtyp ?? '';
      this.bikeEdit.beschreibung = draft.bikeEdit.beschreibung ?? '';
      this.bikeEdit.zustand = draft.bikeEdit.zustand ?? '';
    }

    this.draftRestored = true;
  }

  private saveDraftSnapshot() {
    const draft: SaleFormDraft = {
      isAccessoryOnly: this.isAccessoryOnly,
      buyer: {
        vorname: this.buyer.vorname,
        nachname: this.buyer.nachname,
        strasse: this.buyer.strasse,
        hausnummer: this.buyer.hausnummer,
        plz: this.buyer.plz,
        stadt: this.buyer.stadt,
        telefon: this.buyer.telefon,
        email: this.buyer.email,
      },
      preis: this.preis,
      zahlungsart: this.zahlungsart,
      zahlungen: this.zahlungen.map((z) => ({
        zahlungsart: z.zahlungsart,
        betrag: z.betrag,
        ratenMonate: z.ratenMonate,
      })),
      verkaufsdatum: this.verkaufsdatum,
      notizen: this.notizen,
      accessories: this.accessories.map((a) => ({
        bezeichnung: a.bezeichnung,
        preis: a.preis,
        menge: a.menge,
      })),
      rabatt: this.rabatt,
      isQuickAddMode: this.isQuickAddMode,
      bikeEdit: {
        marke: this.bikeEdit.marke,
        modell: this.bikeEdit.modell,
        rahmennummer: this.bikeEdit.rahmennummer,
        lagernummer: this.bikeEdit.lagernummer,
        rahmengroesse: this.bikeEdit.rahmengroesse,
        farbe: this.bikeEdit.farbe,
        reifengroesse: this.bikeEdit.reifengroesse,
        fahrradtyp: this.bikeEdit.fahrradtyp,
        beschreibung: this.bikeEdit.beschreibung,
        zustand: this.bikeEdit.zustand,
      },
    };
    this.formDraftService.save(DRAFT_KEY, draft);
  }

  discardDraft() {
    this.formDraftService.clear(DRAFT_KEY);
    if (typeof window !== 'undefined') window.location.reload();
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
      lagernummer: bike.lagernummer,
      rahmengroesse: bike.rahmengroesse || '',
      farbe: bike.farbe || '',
      reifengroesse: bike.reifengroesse || '',
      fahrradtyp: bike.fahrradtyp || '',
      beschreibung: bike.beschreibung || '',
      // Kein Fallback auf Gebraucht: hat das Rad keinen Zustand, muss er
      // bewusst gewählt werden.
      zustand: bike.zustand || '',
    };
  }

  onQuickAddBike() {
    // Create a temporary bike placeholder for quick add mode
    this.isQuickAddMode = true;
    this.purchaseId = undefined;
    this.rahmenMatchBike = null;
    this.selectedBike = {
      id: 0, // Temporary ID, will be replaced when created
      marke: '',
      modell: '',
      rahmennummer: '',
      rahmengroesse: '',
      farbe: '',
      reifengroesse: '',
      fahrradtyp: '',
      beschreibung: '',
      status: 'Verfügbar' as any,
      zustand: BikeCondition.Gebraucht,
      isRentable: false,
      rentalPriceDay1: undefined,
      rentalPriceDay2: undefined,
      rentalPriceDay3: undefined,
      rentalPriceDay4: undefined,
      rentalPriceDay5: undefined,
      rentalPriceDay6: undefined,
      rentalPriceDay7: undefined,
      rentalPriceAdditionalDayAfter7: undefined,
    } as Bicycle;

    // Clear bikeEdit form for new bike
    this.bikeEdit = {
      marke: '',
      modell: '',
      rahmennummer: '',
      lagernummer: undefined,
      rahmengroesse: '',
      farbe: '',
      reifengroesse: '',
      fahrradtyp: '',
      beschreibung: '',
      zustand: '',
    };

    // Expand the form to enter details
    this.bikeEditExpanded = true;
    this.bikeErrors = {};
  }

  onRahmennummerChange(value: string) {
    this.rahmenMatchBike = null;
    this.rahmenSearchResults = [];
    if (this.rahmenSearchTimeout) clearTimeout(this.rahmenSearchTimeout);
    // Numeric input = Lagernummer search, allowed from the first digit
    const isNumeric = /^\d+$/.test(value?.trim() ?? '');
    if (!value || (!isNumeric && value.trim().length < 2)) {
      this.showRahmenDropdown = false;
      return;
    }
    this.rahmenSearchTimeout = setTimeout(() => {
      this.bicycleService.search(value.trim()).subscribe({
        next: (bikes) => {
          this.rahmenSearchResults = bikes.filter(
            (b) =>
              b.status !== 'Sold' &&
              // Mietfahrräder nicht im Verkaufs-Autocomplete anzeigen.
              !b.isRentable &&
              (b.rahmennummer
                ?.toUpperCase()
                .includes(value.trim().toUpperCase()) ||
                (isNumeric && b.lagernummer === +value.trim())),
          );
          this.showRahmenDropdown = this.rahmenSearchResults.length > 0;
        },
        error: () => {},
      });
    }, 300);
  }

  hideRahmenDropdown() {
    // Small delay so mousedown on dropdown item fires first
    setTimeout(() => {
      this.showRahmenDropdown = false;
    }, 200);
  }

  // Lagernummer autocomplete: instant prefix match over available bikes
  onLagernummerChange(value: number | string | null | undefined) {
    this.lagerSearchResults = [];
    const term = value != null ? String(value).trim() : '';
    if (!term) {
      this.showLagerDropdown = false;
      return;
    }
    this.lagerSearchResults = this.availableBikes.filter(
      (b) =>
        !b.isRentable &&
        b.lagernummer != null &&
        String(b.lagernummer).startsWith(term),
    );
    this.showLagerDropdown = this.lagerSearchResults.length > 0;
  }

  hideLagerDropdown() {
    setTimeout(() => {
      this.showLagerDropdown = false;
    }, 200);
  }

  selectRahmenBike(bike: Bicycle) {
    this.showRahmenDropdown = false;
    this.rahmenSearchResults = [];
    this.showLagerDropdown = false;
    this.lagerSearchResults = [];
    this.rahmenMatchBike = null;
    this.isQuickAddMode = false;
    this.selectedBike = bike;
    this.loadPlannedPrice(bike.id);
    this.bikeEdit = {
      marke: bike.marke || '',
      modell: bike.modell || '',
      rahmennummer: bike.rahmennummer || '',
      lagernummer: bike.lagernummer,
      rahmengroesse: bike.rahmengroesse || '',
      farbe: bike.farbe || '',
      reifengroesse: bike.reifengroesse || '',
      fahrradtyp: bike.fahrradtyp || '',
      beschreibung: bike.beschreibung || '',
      // Kein Fallback auf Gebraucht: hat das Rad keinen Zustand, muss er
      // bewusst gewählt werden.
      zustand: bike.zustand || '',
    };
    this.bikeErrors = {};
  }

  useExistingBike(bike: Bicycle) {
    this.rahmenMatchBike = null;
    this.isQuickAddMode = false;
    this.selectedBike = bike;
    this.loadPlannedPrice(bike.id);
    this.bikeEdit = {
      marke: bike.marke || '',
      modell: bike.modell || '',
      rahmennummer: bike.rahmennummer || '',
      lagernummer: bike.lagernummer,
      rahmengroesse: bike.rahmengroesse || '',
      farbe: bike.farbe || '',
      reifengroesse: bike.reifengroesse || '',
      fahrradtyp: bike.fahrradtyp || '',
      beschreibung: bike.beschreibung || '',
      // Kein Fallback auf Gebraucht: hat das Rad keinen Zustand, muss er
      // bewusst gewählt werden.
      zustand: bike.zustand || '',
    };
  }

  private loadPlannedPrice(bicycleId: number) {
    this.purchaseService.getByBicycleId(bicycleId).subscribe({
      next: (purchase) => {
        if (purchase) {
          this.purchaseId = purchase.id;
          if (purchase.verkaufspreisVorschlag) {
            this.preis = purchase.verkaufspreisVorschlag;
          }
        }
      },
      error: () => {
        // No purchase found for this bike, ignore
        this.purchaseId = undefined;
      },
    });
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
    this.zahlungen.push({ zahlungsart: PaymentMethod.Bar, betrag: 0 });
  }

  fillRemaining(index: number) {
    if (this.remainingAmount <= 0) return;
    this.zahlungen[index].betrag =
      (this.zahlungen[index].betrag || 0) + this.remainingAmount;
  }

  removeZahlung(index: number) {
    this.zahlungen.splice(index, 1);
  }

  validateBike(): boolean {
    this.bikeErrors = {};
    if (!this.bikeEdit.marke?.trim()) this.bikeErrors['marke'] = true;
    if (!this.bikeEdit.rahmennummer?.trim())
      this.bikeErrors['rahmennummer'] = true;
    if (!this.bikeEdit.farbe) this.bikeErrors['farbe'] = true;
    if (!this.bikeEdit.reifengroesse) this.bikeErrors['reifengroesse'] = true;
    if (!this.bikeEdit.fahrradtyp) this.bikeErrors['fahrradtyp'] = true;
    if (!this.bikeEdit.zustand) this.bikeErrors['zustand'] = true;
    if (this.preis <= 0) this.bikeErrors['preis'] = true;
    return Object.keys(this.bikeErrors).length === 0;
  }

  onAccessoryOnlyChange() {
    this.showBuyerFields = !this.isAccessoryOnly;
    // Step list changes between modes — restart the wizard from the top
    this.currentStep = 0;

    if (this.isAccessoryOnly) {
      this.selectedBike = null;
      this.isQuickAddMode = false;
      this.purchaseId = undefined;
      this.preis = 0;
      this.zahlungen = [
        {
          zahlungsart: null as any,
          betrag: 0,
        },
      ];
      return;
    }

    if (this.zahlungen.length === 0) {
      this.zahlungen = [{ zahlungsart: null as any, betrag: 0 }];
    }

    // Re-open the bike form in quick-add mode when switching back
    if (!this.selectedBike) {
      this.onQuickAddBike();
    }
  }

  submit() {
    if (!this.isAccessoryOnly && !this.selectedBike) return;

    if (this.isAccessoryOnly) {
      this.preis = 0;
      this.zahlungen = [
        {
          zahlungsart: this.zahlungen[0]?.zahlungsart || (null as any),
          betrag: 0,
        },
      ];
    }

    // If payment is not split, use the first selected payment method for full amount.
    if (this.zahlungen.length === 1 && this.effectiveGrandTotal > 0) {
      this.zahlungen[0].betrag = this.effectiveGrandTotal;
    }

    if (!this.verkaufsdatum) {
      alert('Bitte Verkaufsdatum ausfüllen.');
      return;
    }

    if (this.zahlungen.some((z) => !z.zahlungsart)) {
      alert('Bitte Zahlungsart auswählen.');
      return;
    }

    // Ohne Laufzeit steht auf dem Beleg eine Rate ohne Monatszahl.
    if (
      this.zahlungen.some(
        (z) =>
          z.zahlungsart === PaymentMethod.Raten &&
          z.betrag > 0 &&
          !((z.ratenMonate ?? 0) > 0),
      )
    ) {
      alert('Taksit için ay sayısını gir.');
      return;
    }

    if (
      this.effectiveGrandTotal > 0 &&
      this.zahlungen.every((z) => z.betrag <= 0)
    ) {
      alert('Bitte mindestens eine Zahlung eintragen.');
      return;
    }

    if (this.remainingAmount > 0.009) {
      alert(
        `Es bleibt ein Restbetrag von ${this.remainingAmount.toFixed(2)} €. Bitte vollständig bezahlen.`,
      );
      return;
    }

    if (this.isAccessoryOnly && this.accessories.length === 0) {
      alert('Bitte mindestens ein Zubehör hinzufügen.');
      return;
    }

    if (!this.isAccessoryOnly && !this.validateBike()) {
      this.bikeEditExpanded = true;
      // Ohne Meldung sah der Nutzer nur, dass nichts passiert — die roten
      // Felder liegen u. U. weit oben auf der Seite.
      this.notificationService.error(
        'Bitte alle Pflichtfelder des Fahrrads ausfüllen.',
      );
      return;
    }

    this.submitting = true;

    if (this.isAccessoryOnly) {
      this.createSale();
      return;
    }

    // If in quick add mode, create the bike first
    if (this.isQuickAddMode) {
      const newBike = {
        marke: this.bikeEdit.marke,
        modell: this.bikeEdit.modell,
        rahmennummer: this.bikeEdit.rahmennummer || undefined,
        lagernummer: this.bikeEdit.lagernummer,
        rahmengroesse: this.bikeEdit.rahmengroesse || undefined,
        farbe: this.bikeEdit.farbe || undefined,
        reifengroesse: this.bikeEdit.reifengroesse,
        fahrradtyp: this.bikeEdit.fahrradtyp || undefined,
        beschreibung: this.bikeEdit.beschreibung || undefined,
        status: 'Verfügbar' as any,
        // validateBike() lässt '' nicht bis hierher durch.
        zustand: this.bikeEdit.zustand as BikeCondition,
        isRentable: false,
        rentalPriceDay1: undefined,
        rentalPriceDay2: undefined,
        rentalPriceDay3: undefined,
        rentalPriceDay4: undefined,
        rentalPriceDay5: undefined,
        rentalPriceDay6: undefined,
        rentalPriceDay7: undefined,
        rentalPriceAdditionalDayAfter7: undefined,
      };

      this.bicycleService.create(newBike).subscribe({
        next: (createdBike) => {
          this.selectedBike = createdBike;
          this.isQuickAddMode = false;
          const bikeUpdate = this.buildBikeUpdate(createdBike.status);
          this.bicycleService.update(createdBike.id, bikeUpdate).subscribe({
            next: () => {
              this.selectedBike!.zustand = this.bikeEdit.zustand as BikeCondition;
              this.selectedBike!.verkaufspreisVorschlag =
                bikeUpdate.verkaufspreisVorschlag;
              this.createSale();
            },
            error: () => {
              this.submitting = false;
              alert('Fehler beim Aktualisieren des Fahrrads');
            },
          });
        },
        error: () => {
          this.submitting = false;
          alert('Fehler beim Erstellen des Fahrrads');
        },
      });
      return;
    }

    // Otherwise update the existing bicycle
    const selectedBike = this.selectedBike;
    if (!selectedBike) {
      this.submitting = false;
      return;
    }

    const bikeUpdate = this.buildBikeUpdate(selectedBike.status);

    // Update bicycle first, then create sale
    this.bicycleService.update(selectedBike.id, bikeUpdate).subscribe({
      next: () => {
        // Update local selectedBike to reflect changes (for warranty calculation)
        this.selectedBike!.zustand = this.bikeEdit.zustand as BikeCondition;
        this.selectedBike!.verkaufspreisVorschlag =
          bikeUpdate.verkaufspreisVorschlag;
        this.createSale();
      },
      error: () => {
        this.submitting = false;
        alert('Fehler beim Aktualisieren des Fahrrads');
      },
    });
  }

  private buildBikeUpdate(status: Bicycle['status']): BicycleUpdate {
    return {
      marke: this.bikeEdit.marke,
      modell: this.bikeEdit.modell,
      rahmennummer: this.bikeEdit.rahmennummer || undefined,
      // empty input means "clear" → send 0 (backend: null=keep, 0=clear)
      lagernummer: this.bikeEdit.lagernummer ?? 0,
      rahmengroesse: this.bikeEdit.rahmengroesse || undefined,
      farbe: this.bikeEdit.farbe || undefined,
      reifengroesse: this.bikeEdit.reifengroesse,
      fahrradtyp: this.bikeEdit.fahrradtyp || undefined,
      beschreibung: this.bikeEdit.beschreibung || undefined,
      status,
      // validateBike() lässt '' nicht bis hierher durch.
      zustand: this.bikeEdit.zustand as BikeCondition,
      verkaufspreisVorschlag: this.preis > 0 ? this.preis : undefined,
      isRentable: this.selectedBike?.isRentable ?? false,
      rentalPriceDay1: this.selectedBike?.rentalPriceDay1,
      rentalPriceDay2: this.selectedBike?.rentalPriceDay2,
      rentalPriceDay3: this.selectedBike?.rentalPriceDay3,
      rentalPriceDay4: this.selectedBike?.rentalPriceDay4,
      rentalPriceDay5: this.selectedBike?.rentalPriceDay5,
      rentalPriceDay6: this.selectedBike?.rentalPriceDay6,
      rentalPriceDay7: this.selectedBike?.rentalPriceDay7,
      rentalPriceAdditionalDayAfter7:
        this.selectedBike?.rentalPriceAdditionalDayAfter7,
      // Kaution wird von hier gar nicht mehr geschickt — sie ist nur über die
      // Seite „Mietfahrräder" änderbar und bleibt damit garantiert unberührt.
      art: this.selectedBike?.art,
    };
  }

  private createSale() {
    const hasBuyerName =
      !!this.buyer.vorname?.trim() && !!this.buyer.nachname?.trim();

    const saleBuyer = hasBuyerName
      ? this.buyer
      : {
          ...this.buyer,
          vorname: this.defaultBuyer.vorname,
          nachname: this.defaultBuyer.nachname,
        };

    const sellerSig: SignatureCreate | undefined = this.sellerSignatureData
      ? {
          signatureData: this.sellerSignatureData,
          signerName: this.sellerSignerName || 'Bike Haus Freiburg',
          signatureType: 'ShopOwner' as any,
        }
      : undefined;

    const sale: SaleCreate = {
      bicycleId: this.isAccessoryOnly ? 0 : this.selectedBike!.id,
      isAccessoryOnly: this.isAccessoryOnly,
      purchaseId: this.purchaseId,
      buyer: saleBuyer,
      preis: this.effectiveSalePrice,
      zahlungsart: this.zahlungen[0]?.zahlungsart || this.zahlungsart,
      verkaufsdatum: this.verkaufsdatum,
      garantie: !this.isAccessoryOnly,
      garantieBedingungen: this.isAccessoryOnly
        ? undefined
        : this.selectedBike!.zustand === 'Neu'
          ? '2 Jahre Gewährleistung gemäß § 437 BGB'
          : '3 Monate Garantie auf das Fahrrad',
      notizen: this.notizen || undefined,
      sellerSignature: sellerSig,
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

    this.saleService.create(sale).subscribe({
      next: () => {
        this.formDraftService.clear(DRAFT_KEY);
        this.router.navigate(['/sales']);
      },
      error: () => {
        this.submitting = false;
        alert(this.t.saleError);
      },
    });
  }
}
