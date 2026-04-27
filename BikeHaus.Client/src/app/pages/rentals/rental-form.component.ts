import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { RentalService } from '../../services/rental.service';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';
import { RentalBookingService } from '../../services/rental-booking.service';
import { RentalAccessoryService } from '../../services/rental-accessory.service';
import {
    RentalCreate,
    RentalAccessoryItemCreate,
    RentalAccessoryList,
    Bicycle,
    BicycleUpdate,
    BikeCondition,
    CustomerCreate,
    BikeConditionAtHandover,
    PaymentMethod,
} from '../../models/models';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { BikeSelectorComponent } from '../../components/bike-selector/bike-selector.component';
import { AddressSuggestion } from '../../services/address.service';

interface AccessoryLine {
  rentalAccessoryId?: number;
  bezeichnung: string;
  tagespreis: number;
  menge: number;
}

@Component({
  selector: 'app-rental-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AddressAutocompleteComponent,
    BikeSelectorComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ fromBookingId ? 'Mietvertrag aus Anfrage' : 'Neue Vermietung' }}</h1>
        <a routerLink="/rentals" class="btn btn-outline">Zurück</a>
      </div>

      <div class="from-booking-banner" *ngIf="fromBookingId">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Felder wurden aus Mietanfrage vorausgefüllt. Bitte überprüfen und ergänzen.
        <a [routerLink]="['/rental-bookings', fromBookingId]" class="booking-link">→ Anfrage ansehen</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Bicycle selection -->
          <div class="form-card">
            <h2>Fahrrad auswählen</h2>
            <app-bike-selector
              [bikes]="availableBikes"
              [(selectedBike)]="selectedBike"
              [allowQuickAdd]="true"
              (bikeSelected)="onBikeSelected($event)"
              (quickAddRequested)="onQuickAddBike()"
            ></app-bike-selector>

            <!-- Quick-add bike form -->
            <div class="quick-add-form" *ngIf="isQuickAddMode">
              <h3>🆕 Neues Fahrrad</h3>
              <div class="form-grid">
                <div class="field">
                  <label>Rahmennummer *</label>
                  <input
                    [(ngModel)]="bikeEdit.rahmennummer"
                    name="bikeRahmen"
                    style="text-transform: uppercase"
                    required
                  />
                </div>
                <div class="field">
                  <label>Marke *</label>
                  <input
                    [(ngModel)]="bikeEdit.marke"
                    name="bikeMarke"
                    required
                  />
                </div>
                <div class="field">
                  <label>Modell *</label>
                  <input
                    [(ngModel)]="bikeEdit.modell"
                    name="bikeModell"
                    required
                  />
                </div>
                <div class="field">
                  <label>Farbe</label>
                  <input [(ngModel)]="bikeEdit.farbe" name="bikeFarbe" />
                </div>
                <div class="field">
                  <label>Reifengröße</label>
                  <input
                    [(ngModel)]="bikeEdit.reifengroesse"
                    name="bikeReifen"
                  />
                </div>
                <div class="field">
                  <label>Fahrradtyp</label>
                  <input
                    [(ngModel)]="bikeEdit.fahrradtyp"
                    name="bikeFahrradtyp"
                  />
                </div>
              </div>
            </div>

            <!-- Edit selected bike -->
            <div class="bike-edit-form" *ngIf="selectedBike && !isQuickAddMode">
              <h3>🚲 Fahrrad-Details</h3>
              <div class="form-grid">
                <div class="field">
                  <label>Rahmennummer</label>
                  <input
                    [(ngModel)]="bikeEdit.rahmennummer"
                    name="bikeRahmen"
                    style="text-transform: uppercase"
                  />
                </div>
                <div class="field">
                  <label>Marke *</label>
                  <input
                    [(ngModel)]="bikeEdit.marke"
                    name="bikeMarke"
                    required
                  />
                </div>
                <div class="field">
                  <label>Modell *</label>
                  <input
                    [(ngModel)]="bikeEdit.modell"
                    name="bikeModell"
                    required
                  />
                </div>
                <div class="field">
                  <label>Farbe</label>
                  <input [(ngModel)]="bikeEdit.farbe" name="bikeFarbe" />
                </div>
                <div class="field">
                  <label>Reifengröße</label>
                  <input
                    [(ngModel)]="bikeEdit.reifengroesse"
                    name="bikeReifen"
                  />
                </div>
                <div class="field">
                  <label>Fahrradtyp</label>
                  <input
                    [(ngModel)]="bikeEdit.fahrradtyp"
                    name="bikeFahrradtyp"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Mieter (Renter) info -->
          <div class="form-card">
            <h2>Mieter</h2>
            <div class="form-grid">
              <div class="field">
                <label>Vorname *</label>
                <input
                  [(ngModel)]="customer.vorname"
                  name="customerVorname"
                  required
                />
              </div>
              <div class="field">
                <label>Nachname *</label>
                <input
                  [(ngModel)]="customer.nachname"
                  name="customerNachname"
                  required
                />
              </div>
              <div class="field full">
                <label>Adresse suchen</label>
                <app-address-autocomplete
                  placeholder="Adresse eingeben..."
                  (addressSelected)="onAddressSelected($event)"
                ></app-address-autocomplete>
              </div>
              <div class="field">
                <label>Straße *</label>
                <input
                  [(ngModel)]="customer.strasse"
                  name="customerStrasse"
                  required
                />
              </div>
              <div class="field">
                <label>Hausnummer *</label>
                <input
                  [(ngModel)]="customer.hausnummer"
                  name="customerHausnr"
                  required
                />
              </div>
              <div class="field">
                <label>PLZ *</label>
                <input [(ngModel)]="customer.plz" name="customerPlz" required />
              </div>
              <div class="field">
                <label>Stadt *</label>
                <input
                  [(ngModel)]="customer.stadt"
                  name="customerStadt"
                  required
                />
              </div>
              <div class="field">
                <label>Telefon *</label>
                <input
                  [(ngModel)]="customer.telefon"
                  name="customerTelefon"
                  required
                />
              </div>
              <div class="field">
                <label>E-Mail</label>
                <input
                  [(ngModel)]="customer.email"
                  name="customerEmail"
                  type="email"
                />
              </div>
              <div class="field">
                <label>Ausweis-Nr.</label>
                <input [(ngModel)]="ausweisnNr" name="ausweisnNr" />
              </div>
            </div>
          </div>

          <!-- Zubehör -->
          <div class="form-card">
            <div class="section-header">
              <h2>Zubehör</h2>
              <div class="accessory-actions">
                <select
                  class="accessory-picker"
                  (change)="onAccessoryPicked($event)"
                  [disabled]="availableAccessories.length === 0"
                >
                  <option value="">+ Zubehör hinzufügen...</option>
                  <option
                    *ngFor="let a of availableAccessories"
                    [value]="a.id"
                  >
                    {{ a.bezeichnung }} ({{ a.tagespreis | number:'1.2-2' }} €/Tag)
                  </option>
                </select>
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  (click)="addCustomAccessory()"
                >
                  Manuell eingeben
                </button>
              </div>
            </div>

            <div class="accessory-empty" *ngIf="accessories.length === 0">
              Kein Zubehör hinzugefügt (z. B. Helm, Schloss, Anhänger)
            </div>

            <div class="accessory-list" *ngIf="accessories.length > 0">
              <div class="accessory-header-row">
                <span>Bezeichnung</span>
                <span>Tagespreis</span>
                <span>Menge</span>
                <span>Gesamt/Tag</span>
                <span></span>
              </div>
              <div
                class="accessory-row"
                *ngFor="let acc of accessories; let i = index"
              >
                <input
                  [(ngModel)]="acc.bezeichnung"
                  [name]="'accBez_' + i"
                  placeholder="Bezeichnung"
                  required
                />
                <div class="price-input">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    [(ngModel)]="acc.tagespreis"
                    [name]="'accPreis_' + i"
                    (ngModelChange)="recalcPrice()"
                  />
                  <span class="unit">€</span>
                </div>
                <div class="qty-input">
                  <button
                    type="button"
                    class="qty-btn"
                    (click)="changeQty(i, -1)"
                  >−</button>
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="acc.menge"
                    [name]="'accMenge_' + i"
                    (ngModelChange)="recalcPrice()"
                  />
                  <button
                    type="button"
                    class="qty-btn"
                    (click)="changeQty(i, 1)"
                  >+</button>
                </div>
                <span class="acc-total">{{ acc.tagespreis * acc.menge | number:'1.2-2' }} €</span>
                <button
                  type="button"
                  class="btn-remove"
                  (click)="removeAccessory(i)"
                  title="Entfernen"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div class="accessory-total-row">
                <span>Zubehör gesamt (pro Tag):</span>
                <span class="acc-total-sum">{{ accessoryTotalPerDay | number:'1.2-2' }} €</span>
              </div>
            </div>
          </div>

          <!-- Mietdetails -->
          <div class="form-card">
            <h2>Mietdetails</h2>
            <div class="form-grid">
              <div class="field">
                <label>Mietbeginn *</label>
                <input
                  type="date"
                  [(ngModel)]="startDatum"
                  name="startDatum"
                  required
                  (ngModelChange)="onDatesChanged()"
                />
              </div>
              <div class="field">
                <label>Mietende *</label>
                <input
                  type="date"
                  [(ngModel)]="endDatum"
                  name="endDatum"
                  required
                  (ngModelChange)="onDatesChanged()"
                />
              </div>
            </div>

            <!-- Price calculation info -->
            <div class="price-calc" *ngIf="rentalDays > 0">
              <div class="calc-header">
                <span class="calc-days"
                  >{{ rentalDays }} Tag{{ rentalDays > 1 ? 'e' : '' }}</span
                >
                <span class="calc-price"
                  >Berechneter Preis:
                  {{ berechneterPreis | number: '1.2-2' }} €</span
                >
              </div>
              <div class="calc-breakdown" *ngIf="preisInfo">
                <span class="calc-info">{{ preisInfo }}</span>
              </div>
              <div class="calc-breakdown" *ngIf="accessories.length > 0">
                <span class="calc-info">
                  Zubehör: {{ accessoryTotalPerDay | number:'1.2-2' }} €/Tag × {{ rentalDays }} Tag{{ rentalDays > 1 ? 'e' : '' }} = {{ accessoryTotalPerDay * rentalDays | number:'1.2-2' }} €
                </span>
              </div>
            </div>

            <div class="form-grid" style="margin-top: 12px;">
              <div class="field">
                <label>Gesamtmiete (€, inkl. MwSt.) *</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="gesamtmiete"
                  name="gesamtmiete"
                  required
                  min="0"
                />
              </div>
              <div class="field">
                <label>Rabatt (€)</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="rabatt"
                  name="rabatt"
                  min="0"
                  (ngModelChange)="onRabattChanged()"
                />
              </div>
              <div class="field">
                <label>Kaution (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="kaution"
                  name="kaution"
                  required
                  min="0"
                />
              </div>
              <div class="field">
                <label>Zahlungsart *</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">Bar</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Karte">Karte</option>
                  <option value="Überweisung">Überweisung</option>
                </select>
              </div>
              <div class="field">
                <label>Zustand bei Übergabe *</label>
                <select
                  [(ngModel)]="zustandBeiUebergabe"
                  name="zustandBeiUebergabe"
                  required
                >
                  <option value="SehrGut">Sehr gut</option>
                  <option value="Gut">Gut</option>
                  <option value="Gebrauchsspuren">Gebrauchsspuren</option>
                </select>
              </div>
              <div class="field full">
                <label>Notizen</label>
                <textarea
                  [(ngModel)]="notizen"
                  name="notizen"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/rentals" class="btn btn-outline">Abbrechen</a>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="
              submitting || (!selectedBike && !isQuickAddMode) || !f.form.valid
            "
          >
            {{ submitting ? 'Wird erstellt...' : 'Vermietung anlegen' }}
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
        margin-bottom: 24px;
      }
      .from-booking-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(99, 102, 241, 0.08);
        border: 1.5px solid rgba(99, 102, 241, 0.25);
        border-radius: 10px;
        padding: 10px 16px;
        font-size: 0.88rem;
        color: var(--accent-primary, #6366f1);
        margin-bottom: 20px;
      }
      .booking-link {
        margin-left: auto;
        font-weight: 600;
        color: var(--accent-primary, #6366f1);
        text-decoration: none;
      }
      .booking-link:hover { text-decoration: underline; }
      .form-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-card {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        box-shadow: var(--shadow-sm);
        padding: 24px;
      }
      .form-card h2 {
        font-size: 1rem;
        font-weight: 700;
        margin: 0 0 16px 0;
        color: var(--text-primary);
      }
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        gap: 12px;
        flex-wrap: wrap;
      }
      .section-header h2 {
        margin: 0;
      }
      .accessory-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      .accessory-picker {
        padding: 8px 12px;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 0.88rem;
        min-width: 220px;
        cursor: pointer;
      }
      .btn-sm {
        padding: 7px 14px;
        font-size: 0.82rem;
      }
      .accessory-empty {
        color: var(--text-muted);
        font-size: 0.88rem;
        padding: 12px 0;
        text-align: center;
        border: 1.5px dashed var(--border-light);
        border-radius: var(--radius-md, 10px);
      }
      .accessory-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .accessory-header-row {
        display: grid;
        grid-template-columns: 1fr 110px 120px 90px 36px;
        gap: 8px;
        padding: 0 4px 6px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-bottom: 1px solid var(--border-light);
      }
      .accessory-row {
        display: grid;
        grid-template-columns: 1fr 110px 120px 90px 36px;
        gap: 8px;
        align-items: center;
      }
      .accessory-row input {
        padding: 8px 10px;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 0.88rem;
        width: 100%;
        box-sizing: border-box;
      }
      .accessory-row input:focus {
        outline: none;
        border-color: var(--accent-primary);
      }
      .price-input {
        display: flex;
        align-items: center;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        overflow: hidden;
        background: var(--bg-card);
      }
      .price-input input {
        border: none;
        border-radius: 0;
        padding: 8px 6px;
        flex: 1;
        min-width: 0;
      }
      .price-input input:focus {
        outline: none;
        border-color: transparent;
        box-shadow: none;
      }
      .unit {
        padding: 0 8px;
        font-size: 0.82rem;
        color: var(--text-muted);
        white-space: nowrap;
      }
      .qty-input {
        display: flex;
        align-items: center;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        overflow: hidden;
        background: var(--bg-card);
      }
      .qty-input input {
        border: none;
        border-radius: 0;
        padding: 8px 4px;
        text-align: center;
        flex: 1;
        min-width: 0;
      }
      .qty-input input:focus {
        outline: none;
      }
      .qty-btn {
        padding: 0 10px;
        height: 36px;
        border: none;
        background: var(--bg-secondary, #f1f5f9);
        color: var(--text-primary);
        cursor: pointer;
        font-size: 1rem;
        font-weight: 700;
        transition: background 0.15s;
        flex-shrink: 0;
      }
      .qty-btn:hover {
        background: var(--border-color);
      }
      .acc-total {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-primary);
        text-align: right;
        white-space: nowrap;
      }
      .btn-remove {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 1.5px solid var(--border-color);
        border-radius: 8px;
        background: transparent;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .btn-remove:hover {
        border-color: var(--accent-danger, #ef4444);
        color: var(--accent-danger, #ef4444);
        background: rgba(239, 68, 68, 0.06);
      }
      .accessory-total-row {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 16px;
        margin-top: 4px;
        padding-top: 8px;
        border-top: 1px solid var(--border-light);
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-secondary);
      }
      .acc-total-sum {
        color: var(--accent-primary, #6366f1);
        font-size: 0.95rem;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
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
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      input,
      select,
      textarea {
        padding: 10px 14px;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 0.92rem;
        transition: all 0.2s;
      }
      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      textarea {
        resize: vertical;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--border-light);
      }
      .btn {
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        display: inline-flex;
        align-items: center;
        justify-content: center;
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
        background: transparent;
        border: 1.5px solid var(--border-color);
        color: var(--text-primary);
      }
      .btn-outline:hover {
        background: var(--bg-secondary, #f1f5f9);
      }
      @media (max-width: 640px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .accessory-header-row,
        .accessory-row {
          grid-template-columns: 1fr 90px 100px 70px 32px;
        }
      }
      .quick-add-form {
        margin-top: 16px;
        padding: 16px;
        background: var(--accent-success-light, rgba(16, 185, 129, 0.04));
        border-radius: var(--radius-md, 10px);
        border: 1.5px dashed var(--accent-success, #10b981);
      }
      .quick-add-form h3 {
        margin: 0 0 12px 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--accent-success, #10b981);
      }
      .bike-edit-form {
        margin-top: 16px;
        padding: 16px;
        background: var(--bg-secondary, #f8fafc);
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .bike-edit-form h3 {
        margin: 0 0 12px 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--accent-primary, #6366f1);
      }
      .price-calc {
        margin-top: 12px;
        padding: 12px 16px;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--accent-primary, #6366f1);
      }
      .calc-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--accent-primary, #6366f1);
      }
      .calc-days {
        background: var(--accent-primary, #6366f1);
        color: white;
        padding: 2px 10px;
        border-radius: 50px;
        font-size: 0.82rem;
      }
      .calc-breakdown {
        margin-top: 6px;
        font-size: 0.82rem;
        color: var(--text-secondary, #64748b);
      }
    `,
  ],
})
export class RentalFormComponent implements OnInit {
  private rentalService = inject(RentalService);
  private bicycleService = inject(BicycleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private bookingService = inject(RentalBookingService);
  private accessoryService = inject(RentalAccessoryService);

  fromBookingId: number | null = null;

  availableBikes: Bicycle[] = [];
  selectedBike: Bicycle | null = null;
  isQuickAddMode = false;

  bikeEdit = {
    rahmennummer: '',
    marke: '',
    modell: '',
    farbe: '',
    reifengroesse: '',
    fahrradtyp: '',
  };

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

  ausweisnNr = '';
  startDatum = '';
  endDatum = '';
  gesamtmiete: number = 0;
  rabatt: number = 0;
  berechneterPreis: number = 0;
  rentalDays: number = 0;
  preisInfo: string = '';
  kaution: number = 0;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  zustandBeiUebergabe = 'Gut';
  notizen = '';
  submitting = false;

  availableAccessories: RentalAccessoryList[] = [];
  accessories: AccessoryLine[] = [];
  accessoryTotalPerDay: number = 0;

  ngOnInit() {
    this.accessoryService.getActive().subscribe({
      next: (list) => (this.availableAccessories = list),
    });

    this.bicycleService.getAll().subscribe({
      next: (bikes) => {
        this.availableBikes = bikes.filter((b) => b.status === 'Available');

        // Pre-fill from booking if bookingId param is present
        const bookingId = this.route.snapshot.queryParamMap.get('bookingId');
        if (bookingId) {
          this.fromBookingId = Number(bookingId);
          this.bookingService.getById(this.fromBookingId).subscribe({
            next: (booking) => {
              // Pre-fill customer
              this.customer.vorname = booking.vorname;
              this.customer.nachname = booking.nachname;
              this.customer.telefon = booking.telefon || '';
              this.customer.email = booking.email || '';

              // Pre-fill dates
              this.startDatum = booking.startDatum.split('T')[0];
              this.endDatum = booking.endDatum.split('T')[0];
              this.onDatesChanged();

              // Pre-fill price from booking if set
              if (booking.gesamtpreis) {
                this.gesamtmiete = booking.gesamtpreis;
              }

              // Pre-fill notes
              this.notizen = booking.notizen || '';

              // Pre-fill accessories from booking
              if (booking.accessories && booking.accessories.length > 0) {
                this.accessories = booking.accessories.map((a) => ({
                  bezeichnung: a.bezeichnung,
                  tagespreis: a.tagespreis,
                  menge: a.menge,
                }));
                this.recalcPrice();
              }

              // Pre-select the bike if it's in available list
              const match = this.availableBikes.find(
                (b) => b.id === booking.bicycle.id,
              );
              if (match) {
                this.onBikeSelected(match);
              } else {
                // Bike may be rented; still pre-fill bike edit fields
                this.isQuickAddMode = false;
                this.selectedBike = booking.bicycle as Bicycle;
                this.bikeEdit = {
                  rahmennummer: booking.bicycle.rahmennummer || '',
                  marke: booking.bicycle.marke || '',
                  modell: booking.bicycle.modell || '',
                  farbe: booking.bicycle.farbe || '',
                  reifengroesse: booking.bicycle.reifengroesse || '',
                  fahrradtyp: booking.bicycle.fahrradtyp || '',
                };
              }
            },
            error: () => {
              this.notificationService.error('Buchung konnte nicht geladen werden');
            },
          });
        }
      },
    });
    // Set default start date to today
    this.startDatum = new Date().toISOString().split('T')[0];
  }

  onBikeSelected(bike: Bicycle) {
    this.selectedBike = bike;
    this.isQuickAddMode = false;
    // Populate bikeEdit from selected bike
    this.bikeEdit = {
      rahmennummer: bike.rahmennummer || '',
      marke: bike.marke || '',
      modell: bike.modell || '',
      farbe: bike.farbe || '',
      reifengroesse: bike.reifengroesse || '',
      fahrradtyp: bike.fahrradtyp || '',
    };
  }

  onQuickAddBike() {
    this.isQuickAddMode = true;
    this.selectedBike = null;
    this.bikeEdit = {
      rahmennummer: '',
      marke: '',
      modell: '',
      farbe: '',
      reifengroesse: '',
      fahrradtyp: '',
    };
  }

  onAddressSelected(addr: AddressSuggestion) {
    this.customer.strasse = addr.strasse || '';
    this.customer.hausnummer = addr.hausnummer || '';
    this.customer.plz = addr.plz || '';
    this.customer.stadt = addr.stadt || '';
  }

  onAccessoryPicked(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    (event.target as HTMLSelectElement).value = '';
    if (!id) return;
    const found = this.availableAccessories.find((a) => a.id === id);
    if (!found) return;
    const existing = this.accessories.find((a) => a.rentalAccessoryId === id);
    if (existing) {
      existing.menge++;
    } else {
      this.accessories.push({
        rentalAccessoryId: found.id,
        bezeichnung: found.bezeichnung,
        tagespreis: found.tagespreis,
        menge: 1,
      });
    }
    this.recalcPrice();
  }

  addCustomAccessory() {
    this.accessories.push({ bezeichnung: '', tagespreis: 0, menge: 1 });
  }

  removeAccessory(index: number) {
    this.accessories.splice(index, 1);
    this.recalcPrice();
  }

  changeQty(index: number, delta: number) {
    const line = this.accessories[index];
    line.menge = Math.max(1, (line.menge || 1) + delta);
    this.recalcPrice();
  }

  recalcPrice() {
    this.accessoryTotalPerDay = this.accessories.reduce(
      (sum, a) => sum + (a.tagespreis || 0) * (a.menge || 1),
      0,
    );
    if (this.rentalDays > 0) {
      const bikePrice = this.calculatePrice(this.rentalDays);
      const accTotal = this.accessoryTotalPerDay * this.rentalDays;
      this.berechneterPreis = bikePrice + accTotal;
      this.gesamtmiete = Math.max(0, this.berechneterPreis - (this.rabatt || 0));
    }
  }

  onDatesChanged() {
    if (!this.startDatum || !this.endDatum) return;
    const start = new Date(this.startDatum);
    const end = new Date(this.endDatum);
    const diffMs = end.getTime() - start.getTime();
    this.rentalDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    if (this.rentalDays > 0) {
      this.recalcPrice();
    }
  }

  onRabattChanged() {
    if (this.berechneterPreis > 0) {
      this.gesamtmiete = Math.max(
        0,
        this.berechneterPreis - (this.rabatt || 0),
      );
    }
  }

  calculatePrice(days: number): number {
    // Pricing tiers matching homepage packages
    if (days <= 1) {
      this.preisInfo = '1 Tag = 12,00 €';
      return 12;
    }
    if (days <= 3) {
      this.preisInfo = '3 Tage-Paket = 30,00 €';
      return 30;
    }
    if (days <= 7) {
      this.preisInfo = '7 Tage-Paket = 55,00 €';
      return 55;
    }
    if (days <= 14) {
      this.preisInfo = '14 Tage-Paket = 95,00 €';
      return 95;
    }
    if (days <= 30) {
      this.preisInfo = '30 Tage-Paket = 160,00 €';
      return 160;
    }
    // 31+ days: 30-day package + extra days at 6.50€/day
    const extraDays = days - 30;
    const price = 160 + extraDays * 6.5;
    this.preisInfo = `30 Tage (160,00 €) + ${extraDays} Tag(e) × 6,50 € = ${price.toFixed(2)} €`;
    return Math.round(price * 100) / 100;
  }

  submit() {
    if (this.submitting) return;

    // Quick-add mode: create bicycle first
    if (this.isQuickAddMode) {
      if (
        !this.bikeEdit.rahmennummer ||
        !this.bikeEdit.marke ||
        !this.bikeEdit.modell
      ) {
        this.notificationService.error(
          'Bitte Rahmennummer, Marke und Modell ausfüllen',
        );
        return;
      }
      this.submitting = true;
      this.bicycleService
        .create({
          rahmennummer: this.bikeEdit.rahmennummer.toUpperCase(),
          marke: this.bikeEdit.marke,
          modell: this.bikeEdit.modell,
          farbe: this.bikeEdit.farbe || undefined,
          reifengroesse: this.bikeEdit.reifengroesse || undefined,
          fahrradtyp: this.bikeEdit.fahrradtyp || undefined,
          status: 'Available',
          zustand: BikeCondition.Gebraucht,
          isRentable: false,
          rentalPriceDay1: undefined,
          rentalPriceDay3: undefined,
          rentalPriceDay7: undefined,
          rentalPriceDay14: undefined,
          rentalPriceDay30: undefined,
          rentalPricePerDayFrom10: undefined,
        } as any)
        .subscribe({
          next: (bike) => {
            this.createRental(bike.id);
          },
          error: (err) => {
            this.submitting = false;
            this.notificationService.error(
              err.error?.error || 'Fehler beim Erstellen des Fahrrads',
            );
          },
        });
    } else {
      if (!this.selectedBike) return;
      this.submitting = true;
      // Update bike details first, then create rental
      const bikeUpdate: BicycleUpdate = {
        marke: this.bikeEdit.marke,
        modell: this.bikeEdit.modell,
        rahmennummer: this.bikeEdit.rahmennummer || undefined,
        farbe: this.bikeEdit.farbe || undefined,
        reifengroesse: this.bikeEdit.reifengroesse || '',
        fahrradtyp: this.bikeEdit.fahrradtyp || undefined,
        status: this.selectedBike.status as any,
        zustand: (this.selectedBike.zustand || 'Gebraucht') as BikeCondition,
        isRentable: this.selectedBike.isRentable,
        rentalPriceDay1: this.selectedBike.rentalPriceDay1,
        rentalPriceDay3: this.selectedBike.rentalPriceDay3,
        rentalPriceDay7: this.selectedBike.rentalPriceDay7,
        rentalPriceDay14: this.selectedBike.rentalPriceDay14,
        rentalPriceDay30: this.selectedBike.rentalPriceDay30,
        rentalPricePerDayFrom10: this.selectedBike.rentalPricePerDayFrom10,
      };
      this.bicycleService.update(this.selectedBike.id, bikeUpdate).subscribe({
        next: () => this.createRental(this.selectedBike!.id),
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(
            err.error?.error || 'Fehler beim Aktualisieren des Fahrrads',
          );
        },
      });
    }
  }

  private createRental(bicycleId: number) {
    const accessoriesPayload: RentalAccessoryItemCreate[] = this.accessories
      .filter((a) => a.bezeichnung.trim())
      .map((a) => ({
        rentalAccessoryId: a.rentalAccessoryId,
        bezeichnung: a.bezeichnung,
        tagespreis: a.tagespreis,
        menge: a.menge,
      }));

    const rental: RentalCreate = {
      bicycleId,
      customer: this.customer,
      ausweisnNr: this.ausweisnNr || undefined,
      startDatum: this.startDatum,
      endDatum: this.endDatum,
      gesamtmiete: this.gesamtmiete,
      rabatt: this.rabatt || 0,
      kaution: this.kaution,
      zahlungsart: this.zahlungsart,
      zustandBeiUebergabe: this.zustandBeiUebergabe as BikeConditionAtHandover,
      notizen: this.notizen || undefined,
      accessories: accessoriesPayload.length > 0 ? accessoriesPayload : undefined,
    };

    this.rentalService.create(rental).subscribe({
      next: () => {
        this.notificationService.success('Vermietung erfolgreich angelegt');
        this.router.navigate(['/rentals']);
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.error(
          err.error?.error || 'Fehler beim Anlegen der Vermietung',
        );
      },
    });
  }
}
