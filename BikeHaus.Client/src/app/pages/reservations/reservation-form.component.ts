import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { BicycleService } from '../../services/bicycle.service';
import { TranslationService } from '../../services/translation.service';
import { FormDraftService } from '../../services/form-draft.service';
import {
  ReservationCreate,
  Bicycle,
  BikeCondition,
  Customer,
  CustomerCreate,
  PaymentMethod,
} from '../../models/models';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';
import { CustomerAutocompleteComponent } from '../../components/customer-autocomplete/customer-autocomplete.component';
import { DraftRestoredBannerComponent } from '../../components/draft-restored-banner/draft-restored-banner.component';

/**
 * Nur echte Nutzereingaben. Wie im Verkaufsformular gilt: ein per Suche
 * ausgewähltes vorhandenes Fahrrad wird NICHT wiederhergestellt (sonst
 * könnte submit() beim Neuladen fälschlich ein zweites Fahrrad anlegen statt
 * das ausgewählte zu verwenden) — nur die Schnellerfassung eines neuen
 * Fahrrads. Die Kundenunterschrift (kundenUnterschrift) ist ein Signatur-Pad
 * und zählt als "Datei" — nicht Teil des Entwurfs.
 */
interface ReservationFormDraft {
  customer: CustomerCreate;
  reservierungsDatum: string;
  ablaufDatum: string;
  anzahlung: number | null;
  anzahlungZahlungsart: PaymentMethod | '';
  verkaufspreis: number | null;
  notizen: string;
  isQuickAddMode: boolean;
  newBike: {
    lagernummer: number | null;
    rahmennummer: string;
    marke: string;
    modell: string;
    rahmengroesse: string;
    farbe: string;
    reifengroesse: string;
    fahrradtyp: string;
    beschreibung: string;
    zustand: BikeCondition | '';
  };
  hadSignature: boolean;
}

const DRAFT_KEY = 'bikehaus-draft-reservation-form';
const DRAFT_MAX_AGE_MS = 8 * 60 * 60 * 1000;

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SignaturePadComponent,
    CustomerAutocompleteComponent,
    DraftRestoredBannerComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.newReservation }}</h1>
        <a routerLink="/reservations" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <app-draft-restored-banner
        *ngIf="draftRestored"
        [filesLost]="draftHadFiles"
        (discard)="discardDraft()"
      ></app-draft-restored-banner>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Bicycle selection — gleiche Bedienung wie im Verkaufsformular:
               Lager- oder Rahmennummer tippen, aus dem Vorschlag wählen. -->
          <div class="form-card">
            <div class="card-header-row">
              <h2>
                <span *ngIf="isQuickAddMode" class="quick-add-badge"
                  >🆕 {{ t.newBicycle }}</span
                >
                <span *ngIf="!isQuickAddMode">{{ t.selectBicycle }}</span>
              </h2>
              <button
                type="button"
                class="btn btn-outline btn-sm"
                (click)="isQuickAddMode ? cancelQuickAdd() : startQuickAdd()"
              >
                {{ isQuickAddMode ? '↩︎ ' + t.selectBicycle : '🆕 ' + t.newBicycle }}
              </button>
            </div>
            <div class="form-grid" *ngIf="!isQuickAddMode">
              <div class="field rahmen-autocomplete-wrapper">
                <label>{{ t.stockNumber }}</label>
                <input
                  type="number"
                  min="1"
                  [(ngModel)]="lagernummerInput"
                  name="lagernummerInput"
                  (ngModelChange)="onLagernummerChange($event)"
                  (focus)="onLagernummerChange(lagernummerInput)"
                  (blur)="hideLagerDropdown()"
                  placeholder="Lagernummer eingeben..."
                  autocomplete="off"
                />
                <div
                  class="rahmen-dropdown"
                  *ngIf="lagerSearchResults.length > 0 && showLagerDropdown"
                >
                  <div
                    class="rahmen-dropdown-item"
                    *ngFor="let bike of lagerSearchResults"
                    (mousedown)="selectBike(bike)"
                  >
                    <span class="rahmen-nr">#{{ bike.lagernummer }}</span>
                    <span class="rahmen-info">{{ bike.marke }} {{ bike.modell }}</span>
                    <span class="rahmen-badge">{{ t.available }}</span>
                  </div>
                </div>
              </div>

              <div class="field rahmen-autocomplete-wrapper">
                <label>{{ t.frameNumber }}</label>
                <input
                  [(ngModel)]="rahmennummerInput"
                  name="rahmennummerInput"
                  (ngModelChange)="onRahmennummerChange($event)"
                  (focus)="onRahmennummerChange(rahmennummerInput)"
                  (blur)="hideRahmenDropdown()"
                  style="text-transform: uppercase"
                  placeholder="Rahmennummer eingeben..."
                  autocomplete="off"
                />
                <div
                  class="rahmen-dropdown"
                  *ngIf="rahmenSearchResults.length > 0 && showRahmenDropdown"
                >
                  <div
                    class="rahmen-dropdown-item"
                    *ngFor="let bike of rahmenSearchResults"
                    (mousedown)="selectBike(bike)"
                  >
                    <span class="rahmen-nr" *ngIf="bike.lagernummer != null"
                      >#{{ bike.lagernummer }}</span
                    >
                    <span class="rahmen-nr">{{ bike.rahmennummer }}</span>
                    <span class="rahmen-info">{{ bike.marke }} {{ bike.modell }}</span>
                    <span class="rahmen-badge">{{ t.available }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fahrrad ist noch nicht im Bestand: hier direkt anlegen —
                 gleiche Felder wie im Verkaufsformular. Das Rad wird beim
                 Speichern der Reservierung erzeugt. -->
            <div class="form-grid" *ngIf="isQuickAddMode">
              <div class="field">
                <label>{{ t.stockNumber }}</label>
                <input
                  type="number"
                  min="1"
                  [(ngModel)]="newBike.lagernummer"
                  name="newBikeLagernummer"
                  placeholder="z.B. 128"
                />
              </div>
              <div class="field" [class.field-error]="newBikeErrors['rahmennummer']">
                <label>{{ t.frameNumber }} *</label>
                <input
                  [(ngModel)]="newBike.rahmennummer"
                  name="newBikeRahmennummer"
                  style="text-transform: uppercase"
                  (ngModelChange)="newBikeErrors['rahmennummer'] = false"
                />
                <span class="error-msg" *ngIf="newBikeErrors['rahmennummer']">{{
                  t.requiredField
                }}</span>
              </div>
              <div class="field" [class.field-error]="newBikeErrors['marke']">
                <label>{{ t.brand }} *</label>
                <input
                  [(ngModel)]="newBike.marke"
                  name="newBikeMarke"
                  (ngModelChange)="newBikeErrors['marke'] = false"
                />
                <span class="error-msg" *ngIf="newBikeErrors['marke']">{{
                  t.requiredField
                }}</span>
              </div>
              <div class="field">
                <label>{{ t.model }}</label>
                <input [(ngModel)]="newBike.modell" name="newBikeModell" />
              </div>
              <div class="field">
                <label>{{ t.frameSize }}</label>
                <input
                  [(ngModel)]="newBike.rahmengroesse"
                  name="newBikeRahmengroesse"
                  placeholder="z.B. 52, 56, M, L"
                />
              </div>
              <div class="field">
                <label>{{ t.color }}</label>
                <div class="color-chips">
                  <button
                    type="button"
                    *ngFor="let c of colorOptions"
                    class="color-chip"
                    [class.selected]="isColorSelected(newBike.farbe, c.value)"
                    [style.--chip-color]="c.hex"
                    (click)="newBike.farbe = toggleColor(newBike.farbe, c.value)"
                  >
                    <span class="chip-dot"></span>
                    {{ c.label }}
                  </button>
                </div>
              </div>
              <div class="field">
                <label>{{ t.wheelSize }}</label>
                <select [(ngModel)]="newBike.reifengroesse" name="newBikeReifen">
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
                <label>{{ t.bicycleType }}</label>
                <select [(ngModel)]="newBike.fahrradtyp" name="newBikeFahrradtyp">
                  <option value="">-- {{ t.selectOption }} --</option>
                  <option value="E-Bike">E-Bike</option>
                  <option value="E-Trekking Pedelec">E-Trekking Pedelec</option>
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
              <div class="field" [class.field-error]="newBikeErrors['zustand']">
                <label>{{ t.condition }} *</label>
                <select
                  [(ngModel)]="newBike.zustand"
                  name="newBikeZustand"
                  (ngModelChange)="newBikeErrors['zustand'] = false"
                >
                  <!-- Ohne Vorauswahl: Neu/Gebraucht steuert später die Garantie. -->
                  <option value="" disabled>-- {{ t.selectOption }} --</option>
                  <option value="Gebraucht">{{ t.usedCondition }}</option>
                  <option value="Neu">{{ t.newCondition }}</option>
                </select>
                <span class="error-msg" *ngIf="newBikeErrors['zustand']">{{
                  t.requiredField
                }}</span>
              </div>
              <div class="field full">
                <label>{{ t.descriptionEquipment }}</label>
                <textarea
                  [(ngModel)]="newBike.beschreibung"
                  name="newBikeBeschreibung"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="selected-bike" *ngIf="selectedBike && !isQuickAddMode">
              <div class="selected-bike-head">
                <strong>{{ selectedBike.marke }} {{ selectedBike.modell }}</strong>
                <button type="button" class="btn btn-outline btn-sm" (click)="clearBike()">
                  ✕ {{ t.change }}
                </button>
              </div>
              <div class="selected-bike-facts">
                <span *ngIf="selectedBike.lagernummer != null">#{{ selectedBike.lagernummer }}</span>
                <span *ngIf="selectedBike.rahmennummer">{{ selectedBike.rahmennummer }}</span>
                <span *ngIf="selectedBike.farbe">{{ selectedBike.farbe }}</span>
                <span *ngIf="selectedBike.rahmengroesse">{{ selectedBike.rahmengroesse }}</span>
                <span *ngIf="selectedBike.verkaufspreisVorschlag != null">
                  {{ selectedBike.verkaufspreisVorschlag | number: '1.2-2' }} €
                </span>
              </div>
            </div>
          </div>

          <!-- Customer info -->
          <div class="form-card">
            <h2>{{ t.customer }}</h2>
            <div class="form-grid">
              <app-customer-autocomplete
                [vorname]="customer.vorname"
                (vornameChange)="customer.vorname = $event"
                [nachname]="customer.nachname"
                (nachnameChange)="customer.nachname = $event"
                [vornameLabel]="t.firstName"
                [nachnameLabel]="t.lastName"
                [requiredMark]="true"
                [hasOtherData]="hasOtherCustomerData()"
                (customerSelected)="onCustomerSelected($event)"
              ></app-customer-autocomplete>
              <div class="field">
                <label>{{ t.street }} *</label>
                <input
                  [(ngModel)]="customer.strasse"
                  name="customerStrasse"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.houseNumber }} *</label>
                <input
                  [(ngModel)]="customer.hausnummer"
                  name="customerHausnr"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.postalCode }} *</label>
                <input [(ngModel)]="customer.plz" name="customerPlz" required />
              </div>
              <div class="field">
                <label>{{ t.city }} *</label>
                <input
                  [(ngModel)]="customer.stadt"
                  name="customerStadt"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.phone }} *</label>
                <input
                  [(ngModel)]="customer.telefon"
                  name="customerTel"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.email }}</label>
                <input
                  type="email"
                  [(ngModel)]="customer.email"
                  name="customerEmail"
                />
              </div>
            </div>
          </div>

          <!-- Reservation details -->
          <div class="form-card">
            <h2>{{ t.reservationDataTitle }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.reservationDate }}</label>
                <input
                  type="date"
                  [(ngModel)]="reservierungsDatum"
                  name="reservierungsDatum"
                />
              </div>
              <!-- „Reserviert bis" direkt aus dem Kalender statt einer
                   Tagesanzahl — das ist die Angabe, die auch auf dem Beleg steht. -->
              <div class="field">
                <label>{{ t.reservedUntil }} *</label>
                <input
                  type="date"
                  [(ngModel)]="ablaufDatum"
                  name="ablaufDatum"
                  [min]="reservierungsDatum"
                  required
                />
                <small class="hint" *ngIf="reservationDays() > 0">
                  {{ reservationDays() }} {{ reservationDays() === 1 ? t.day : t.days }}
                </small>
              </div>
              <div class="field">
                <label>{{ t.salePrice }} (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="verkaufspreis"
                  name="verkaufspreis"
                />
                <small class="hint">{{ t.salePriceHint }}</small>
              </div>
              <div class="field">
                <label>{{ t.deposit }} (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="anzahlung"
                  name="anzahlung"
                />
              </div>
              <div class="field">
                <label>{{ t.depositPaymentMethod }}</label>
                <select [(ngModel)]="anzahlungZahlungsart" name="anzahlungZahlungsart">
                  <option value="">{{ t.selectOption }}</option>
                  <option value="Bar">Bar</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Karte">Karte</option>
                  <option value="Überweisung">Überweisung</option>
                </select>
              </div>
              <div class="field full rest-row" *ngIf="verkaufspreis">
                <span>{{ t.remainingAmount }}</span>
                <strong>{{ restbetrag() | number: '1.2-2' }} €</strong>
              </div>
              <div class="field full">
                <label>{{ t.notes }}</label>
                <textarea
                  [(ngModel)]="notizen"
                  name="notizen"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Unterschrift des Kunden; die Firmenunterschrift kommt aus den
               Einstellungen und wird direkt auf den Beleg gedruckt. -->
          <div class="form-card">
            <h2>{{ t.customerSignature }}</h2>
            <app-signature-pad
              [(ngModel)]="kundenUnterschrift"
              name="kundenUnterschrift"
            ></app-signature-pad>
            <small class="hint">{{ t.companySignatureHint }}</small>
          </div>
        </div>

        <!-- Validation messages -->
        <div class="validation-errors" *ngIf="!canSubmit() && !submitting">
          <p *ngIf="!selectedBike && !isQuickAddMode" class="error-msg">
            ⚠️ {{ t.selectBicycleWarning }}
          </p>
          <p *ngIf="!customer.vorname.trim()" class="error-msg">
            ⚠️ {{ t.firstNameRequiredMsg }}
          </p>
          <p *ngIf="!customer.nachname.trim()" class="error-msg">
            ⚠️ {{ t.lastNameRequiredMsg }}
          </p>
          <p *ngIf="!customer.strasse?.trim()" class="error-msg">
            ⚠️ {{ t.streetRequiredMsg }}
          </p>
          <p *ngIf="!customer.hausnummer?.trim()" class="error-msg">
            ⚠️ {{ t.houseNumberRequiredMsg }}
          </p>
          <p *ngIf="!customer.plz?.trim()" class="error-msg">
            ⚠️ {{ t.postalCodeRequiredMsg }}
          </p>
          <p *ngIf="!customer.stadt?.trim()" class="error-msg">
            ⚠️ {{ t.cityRequiredMsg }}
          </p>
          <p *ngIf="!customer.telefon?.trim()" class="error-msg">
            ⚠️ {{ t.phoneRequiredMsg }}
          </p>
          <p *ngIf="!ablaufDatum" class="error-msg">
            ⚠️ {{ t.reservedUntilWarning }}
          </p>
        </div>

        <!-- API Error -->
        <div class="api-error" *ngIf="errorMessage">
          <p>❌ {{ errorMessage }}</p>
        </div>

        <!-- Submit section -->
        <div class="submit-section">
          <button
            type="submit"
            class="btn btn-primary btn-large"
            [disabled]="!canSubmit()"
          >
            {{ submitting ? 'Wird gespeichert...' : 'Reservieren' }}
          </button>
        </div>
      </form>
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

      .btn {
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        text-decoration: none;
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
        padding: 6px 12px;
        font-size: 0.85rem;
      }

      .card-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .quick-add-badge {
        color: var(--accent-primary, #6366f1);
      }

      .field-error input,
      .field-error select {
        border-color: #ef4444 !important;
      }

      /* ── Farbauswahl (wie im Verkaufsformular) ── */
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

      /* ── Fahrradsuche (wie im Verkaufsformular) ── */
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

      .selected-bike {
        margin-top: 16px;
        border: 1.5px solid var(--accent-primary, #6366f1);
        border-radius: var(--radius-md, 10px);
        padding: 12px 14px;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
      }
      .selected-bike-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      .selected-bike-facts {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        margin-top: 6px;
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
      }

      .rest-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        border-top: 1.5px solid var(--border-light, #e2e8f0);
        padding-top: 12px;
        font-size: 0.95rem;
      }
      .rest-row strong {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--accent-primary, #6366f1);
      }

      .validation-errors {
        background: rgba(245, 158, 11, 0.06);
        border: 1.5px solid rgba(245, 158, 11, 0.3);
        border-radius: var(--radius-md, 10px);
        padding: 16px;
        margin-top: 16px;
      }

      .error-msg {
        color: #f59e0b;
        margin: 4px 0;
        font-size: 0.88rem;
      }

      .api-error {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.06));
        border: 1.5px solid rgba(239, 68, 68, 0.3);
        border-radius: var(--radius-md, 10px);
        padding: 16px;
        margin-top: 16px;
        color: var(--accent-danger, #ef4444);
        font-weight: 600;
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
        width: 100%;
        box-sizing: border-box;
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

      .submit-section {
        margin-top: 32px;
        display: flex;
        justify-content: center;
      }

      @media (max-width: 768px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class ReservationFormComponent implements OnInit, OnDestroy {
  private reservationService = inject(ReservationService);
  private bicycleService = inject(BicycleService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formDraftService = inject(FormDraftService);
  draftRestored = false;
  draftHadFiles = false;
  private draftAutosaveHandle: ReturnType<typeof setInterval> | undefined;
  /** Diese Komponente kennt aktuell keinen eigenen Bearbeiten-Modus (auch die
   * Route /reservations/:id lädt keinen bestehenden Datensatz) — die Prüfung
   * ist trotzdem hier, falls das nachgerüstet wird. */
  private get isNewMode(): boolean {
    return !this.route.snapshot.paramMap.get('id');
  }

  availableBikes: Bicycle[] = [];
  selectedBike: Bicycle | null = null;
  submitting = false;
  errorMessage: string | null = null;

  customer: CustomerCreate = {
    vorname: '',
    nachname: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    stadt: '',
    telefon: '',
    email: '',
  };

  /** Steuert, ob die Kunden-Vorschlagsliste vor der Übernahme nachfragt. */
  hasOtherCustomerData(): boolean {
    return !!(
      this.customer.strasse?.trim() ||
      this.customer.hausnummer?.trim() ||
      this.customer.plz?.trim() ||
      this.customer.stadt?.trim() ||
      this.customer.telefon?.trim() ||
      this.customer.email?.trim()
    );
  }

  onCustomerSelected(customer: Customer) {
    this.customer.strasse = customer.strasse || '';
    this.customer.hausnummer = customer.hausnummer || '';
    this.customer.plz = customer.plz || '';
    this.customer.stadt = customer.stadt || '';
    this.customer.telefon = customer.telefon || '';
    this.customer.email = customer.email || '';
  }

  reservierungsDatum: string = new Date().toISOString().split('T')[0];
  /** „Reserviert bis" — aus dem Kalender, Vorbelegung: heute + 7 Tage. */
  ablaufDatum: string = ReservationFormComponent.datePlusDays(7);
  anzahlung: number | null = null;
  anzahlungZahlungsart: PaymentMethod | '' = '';
  verkaufspreis: number | null = null;
  kundenUnterschrift: string | null = null;
  notizen: string = '';

  // ── Fahrrad ist nicht im Bestand: direkt hier anlegen ──
  isQuickAddMode = false;
  newBikeErrors: { [key: string]: boolean } = {};
  newBike = {
    lagernummer: null as number | null,
    rahmennummer: '',
    marke: '',
    modell: '',
    rahmengroesse: '',
    farbe: '',
    reifengroesse: '',
    fahrradtyp: '',
    beschreibung: '',
    zustand: '' as BikeCondition | '',
  };

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
    { value: 'Türkis', label: 'Türkis', hex: '#06b6d4' },
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

  // Fahrradsuche wie im Verkaufsformular
  lagernummerInput: number | null = null;
  rahmennummerInput = '';
  lagerSearchResults: Bicycle[] = [];
  rahmenSearchResults: Bicycle[] = [];
  showLagerDropdown = false;
  showRahmenDropdown = false;
  private rahmenSearchTimeout: any = null;

  private static datePlusDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.loadAvailableBikes();

    if (this.isNewMode) {
      this.restoreDraftIfAny();
      this.draftAutosaveHandle = setInterval(
        () => this.saveDraftSnapshot(),
        3000,
      );
    }
  }

  ngOnDestroy() {
    if (this.draftAutosaveHandle) clearInterval(this.draftAutosaveHandle);
  }

  private restoreDraftIfAny() {
    const draft = this.formDraftService.load<ReservationFormDraft>(
      DRAFT_KEY,
      DRAFT_MAX_AGE_MS,
    );
    if (!draft) return;

    this.customer.vorname = draft.customer?.vorname ?? '';
    this.customer.nachname = draft.customer?.nachname ?? '';
    this.customer.strasse = draft.customer?.strasse ?? '';
    this.customer.hausnummer = draft.customer?.hausnummer ?? '';
    this.customer.plz = draft.customer?.plz ?? '';
    this.customer.stadt = draft.customer?.stadt ?? '';
    this.customer.telefon = draft.customer?.telefon ?? '';
    this.customer.email = draft.customer?.email ?? '';

    if (draft.reservierungsDatum) this.reservierungsDatum = draft.reservierungsDatum;
    if (draft.ablaufDatum) this.ablaufDatum = draft.ablaufDatum;
    this.anzahlung = draft.anzahlung ?? null;
    this.anzahlungZahlungsart = draft.anzahlungZahlungsart ?? '';
    this.verkaufspreis = draft.verkaufspreis ?? null;
    this.notizen = draft.notizen ?? '';

    // Wie im Verkaufsformular: ein vorhandenes, gesuchtes Fahrrad wird
    // bewusst nicht wiederhergestellt — nur die Schnellerfassung.
    if (draft.isQuickAddMode && draft.newBike) {
      this.isQuickAddMode = true;
      this.newBike.lagernummer = draft.newBike.lagernummer;
      this.newBike.rahmennummer = draft.newBike.rahmennummer ?? '';
      this.newBike.marke = draft.newBike.marke ?? '';
      this.newBike.modell = draft.newBike.modell ?? '';
      this.newBike.rahmengroesse = draft.newBike.rahmengroesse ?? '';
      this.newBike.farbe = draft.newBike.farbe ?? '';
      this.newBike.reifengroesse = draft.newBike.reifengroesse ?? '';
      this.newBike.fahrradtyp = draft.newBike.fahrradtyp ?? '';
      this.newBike.beschreibung = draft.newBike.beschreibung ?? '';
      this.newBike.zustand = draft.newBike.zustand ?? '';
    }

    this.draftRestored = true;
    this.draftHadFiles = !!draft.hadSignature;
  }

  private saveDraftSnapshot() {
    const draft: ReservationFormDraft = {
      customer: {
        vorname: this.customer.vorname,
        nachname: this.customer.nachname,
        strasse: this.customer.strasse,
        hausnummer: this.customer.hausnummer,
        plz: this.customer.plz,
        stadt: this.customer.stadt,
        telefon: this.customer.telefon,
        email: this.customer.email,
      },
      reservierungsDatum: this.reservierungsDatum,
      ablaufDatum: this.ablaufDatum,
      anzahlung: this.anzahlung,
      anzahlungZahlungsart: this.anzahlungZahlungsart,
      verkaufspreis: this.verkaufspreis,
      notizen: this.notizen,
      isQuickAddMode: this.isQuickAddMode,
      newBike: {
        lagernummer: this.newBike.lagernummer,
        rahmennummer: this.newBike.rahmennummer,
        marke: this.newBike.marke,
        modell: this.newBike.modell,
        rahmengroesse: this.newBike.rahmengroesse,
        farbe: this.newBike.farbe,
        reifengroesse: this.newBike.reifengroesse,
        fahrradtyp: this.newBike.fahrradtyp,
        beschreibung: this.newBike.beschreibung,
        zustand: this.newBike.zustand,
      },
      hadSignature: !!this.kundenUnterschrift,
    };
    this.formDraftService.save(DRAFT_KEY, draft);
  }

  discardDraft() {
    this.formDraftService.clear(DRAFT_KEY);
    if (typeof window !== 'undefined') window.location.reload();
  }

  loadAvailableBikes() {
    this.bicycleService.getAll().subscribe({
      next: (bikes) => {
        this.availableBikes = bikes.filter((b) => b.status === 'Available');
        // Pre-select bike if bicycleId query param provided
        const bicycleId = this.route.snapshot.queryParams['bicycleId'];
        if (bicycleId) {
          const preselected = this.availableBikes.find(
            (b) => b.id === +bicycleId,
          );
          if (preselected) {
            this.selectBike(preselected);
          }
        }
      },
      error: (err) => console.error('Error loading bikes:', err),
    });
  }

  // ── Fahrradsuche: gleiche Bedienung wie im Verkaufsformular ──

  /** Lagernummer: sofortiger Präfix-Treffer über die verfügbaren Räder. */
  onLagernummerChange(value: number | string | null | undefined) {
    this.lagerSearchResults = [];
    const term = value != null ? String(value).trim() : '';
    if (!term) {
      this.showLagerDropdown = false;
      return;
    }
    this.lagerSearchResults = this.availableBikes.filter(
      (b) => b.lagernummer != null && String(b.lagernummer).startsWith(term),
    );
    this.showLagerDropdown = this.lagerSearchResults.length > 0;
  }

  hideLagerDropdown() {
    // Kurze Verzögerung, damit mousedown auf dem Eintrag zuerst greift.
    setTimeout(() => (this.showLagerDropdown = false), 200);
  }

  /** Rahmennummer: serverseitige Suche ab zwei Zeichen. */
  onRahmennummerChange(value: string) {
    this.rahmenSearchResults = [];
    if (this.rahmenSearchTimeout) clearTimeout(this.rahmenSearchTimeout);
    const term = value?.trim() ?? '';
    if (term.length < 2) {
      this.showRahmenDropdown = false;
      return;
    }
    this.rahmenSearchTimeout = setTimeout(() => {
      this.bicycleService.search(term).subscribe({
        // Reservieren geht nur bei verfügbaren Rädern — verkaufte, bereits
        // reservierte und vermietete gehören nicht in den Vorschlag.
        next: (bikes) => {
          this.rahmenSearchResults = bikes.filter(
            (b) =>
              b.status === 'Available' &&
              b.rahmennummer?.toUpperCase().includes(term.toUpperCase()),
          );
          this.showRahmenDropdown = this.rahmenSearchResults.length > 0;
        },
        error: () => {},
      });
    }, 300);
  }

  hideRahmenDropdown() {
    setTimeout(() => (this.showRahmenDropdown = false), 200);
  }

  startQuickAdd() {
    this.isQuickAddMode = true;
    this.selectedBike = null;
    this.newBikeErrors = {};
    // Bereits getippte Nummern übernehmen — meistens hat der Nutzer sie
    // gesucht, nicht gefunden und legt genau dieses Rad jetzt an.
    this.newBike.rahmennummer = this.rahmennummerInput || '';
    this.newBike.lagernummer = this.lagernummerInput;
  }

  cancelQuickAdd() {
    this.isQuickAddMode = false;
    this.newBikeErrors = {};
  }

  selectBike(bike: Bicycle) {
    this.selectedBike = bike;
    this.isQuickAddMode = false;
    this.showLagerDropdown = false;
    this.showRahmenDropdown = false;
    this.lagerSearchResults = [];
    this.rahmenSearchResults = [];
    this.lagernummerInput = bike.lagernummer ?? null;
    this.rahmennummerInput = bike.rahmennummer || '';
    // Verkaufspreis aus dem Fahrrad vorbelegen, solange nichts Eigenes drinsteht.
    if (this.verkaufspreis == null && bike.verkaufspreisVorschlag != null) {
      this.verkaufspreis = bike.verkaufspreisVorschlag;
    }
  }

  clearBike() {
    this.selectedBike = null;
    this.lagernummerInput = null;
    this.rahmennummerInput = '';
    this.verkaufspreis = null;
  }

  /** Reservierungsdauer in Tagen — nur als Hinweis unter dem Datumsfeld. */
  reservationDays(): number {
    if (!this.reservierungsDatum || !this.ablaufDatum) return 0;
    const start = new Date(this.reservierungsDatum);
    const end = new Date(this.ablaufDatum);
    const diff = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, diff);
  }

  /** Offener Restbetrag = Verkaufspreis − Anzahlung. */
  restbetrag(): number {
    return (Number(this.verkaufspreis) || 0) - (Number(this.anzahlung) || 0);
  }

  /** Pflichtfelder des neu anzulegenden Fahrrads. */
  private validateNewBike(): boolean {
    this.newBikeErrors = {};
    if (!this.newBike.rahmennummer.trim())
      this.newBikeErrors['rahmennummer'] = true;
    if (!this.newBike.marke.trim()) this.newBikeErrors['marke'] = true;
    if (!this.newBike.zustand) this.newBikeErrors['zustand'] = true;
    return !Object.values(this.newBikeErrors).some((v) => v);
  }

  canSubmit(): boolean {
    return !!(
      (this.selectedBike || this.isQuickAddMode) &&
      this.customer.vorname.trim() &&
      this.customer.nachname.trim() &&
      this.customer.strasse?.trim() &&
      this.customer.hausnummer?.trim() &&
      this.customer.plz?.trim() &&
      this.customer.stadt?.trim() &&
      this.customer.telefon?.trim() &&
      this.ablaufDatum &&
      this.reservationDays() >= 0 &&
      !this.submitting
    );
  }

  submit() {
    if (!this.canSubmit()) return;

    if (this.isQuickAddMode) {
      if (!this.validateNewBike()) {
        this.errorMessage = this.t.requiredField;
        return;
      }
      this.submitting = true;
      this.errorMessage = null;
      // Erst das Fahrrad anlegen, dann darauf reservieren. Der Server setzt
      // es anschließend auf „Reserviert".
      this.bicycleService
        .create({
          rahmennummer: this.newBike.rahmennummer.trim().toUpperCase(),
          marke: this.newBike.marke.trim(),
          modell: this.newBike.modell || undefined,
          rahmengroesse: this.newBike.rahmengroesse || undefined,
          farbe: this.newBike.farbe || undefined,
          // Leerer String statt fehlendem Schlüssel: Reifengroesse ist im
          // BicycleCreateDto nicht nullable und damit implizit Pflicht.
          reifengroesse: this.newBike.reifengroesse || '',
          fahrradtyp: this.newBike.fahrradtyp || undefined,
          beschreibung: this.newBike.beschreibung || undefined,
          zustand: this.newBike.zustand as BikeCondition,
          lagernummer: this.newBike.lagernummer ?? undefined,
          // Reservierter Preis wird auch am Rad als Vorschlagspreis hinterlegt.
          verkaufspreisVorschlag: this.verkaufspreis ?? undefined,
          isRentable: false,
        } as any)
        .subscribe({
          next: (created) => this.createReservation(created.id),
          error: (err) => {
            this.submitting = false;
            this.errorMessage =
              err.error?.message || err.error?.error || this.t.saveError;
          },
        });
      return;
    }

    this.submitting = true;
    this.errorMessage = null;
    this.createReservation(this.selectedBike!.id);
  }

  private createReservation(bicycleId: number) {
    const reservation: ReservationCreate = {
      bicycleId,
      customer: this.customer,
      reservierungsDatum: this.reservierungsDatum || undefined,
      ablaufDatum: this.ablaufDatum || undefined,
      // Rückfallebene, falls kein Datum gesetzt ist — der Server nimmt dann Tage.
      reservierungsTage: this.reservationDays() || 7,
      anzahlung: this.anzahlung ?? undefined,
      anzahlungZahlungsart:
        (this.anzahlungZahlungsart as PaymentMethod) || undefined,
      verkaufspreis: this.verkaufspreis ?? undefined,
      kundenUnterschrift: this.kundenUnterschrift || undefined,
      notizen: this.notizen || undefined,
    };

    this.reservationService.create(reservation).subscribe({
      next: (created) => {
        console.log('Reservation created:', created);
        this.formDraftService.clear(DRAFT_KEY);
        this.router.navigate(['/reservations']);
      },
      error: (err) => {
        console.error('Error creating reservation:', err);
        this.submitting = false;
        this.errorMessage = err.error?.error || this.t.reservationCreateError;
      },
    });
  }
}
