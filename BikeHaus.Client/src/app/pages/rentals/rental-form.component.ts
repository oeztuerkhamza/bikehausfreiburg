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
  BusyPeriod,
  Bicycle,
  BicycleUpdate,
  BikeCondition,
  CustomerCreate,
  BikeConditionAtHandover,
  PaymentMethod,
} from '../../models/models';
import { BikeSelectorComponent } from '../../components/bike-selector/bike-selector.component';

interface AccessoryLine {
  rentalAccessoryId?: number;
  bezeichnung: string;
  tagespreis: number;
  verlustgebuehr?: number;
  menge: number;
}

type PredefinedAccessoryKey = 'helm' | 'schloss' | 'korb';

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

@Component({
  selector: 'app-rental-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BikeSelectorComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>
          {{ fromBookingId ? 'Mietvertrag aus Anfrage' : 'Neue Vermietung' }}
        </h1>
        <a routerLink="/rentals" class="btn btn-outline">Zurück</a>
      </div>

      <div class="from-booking-banner" *ngIf="fromBookingId">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Felder wurden aus Mietanfrage vorausgefüllt. Bitte überprüfen und
        ergänzen.
        <a
          [routerLink]="['/rental-bookings', fromBookingId]"
          class="booking-link"
          >→ Anfrage ansehen</a
        >
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

          <!-- Mieter -->
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
            </div>
          </div>

          <!-- Zubehör -->
          <div class="form-card">
            <div class="section-header">
              <h2>Zubehör</h2>
              <div class="accessory-checklist">
                <label class="checkbox-item">
                  <input
                    type="checkbox"
                    [(ngModel)]="selectedAccessories.helm"
                    name="accessoryHelm"
                  />
                  Helm
                </label>
                <label class="checkbox-item">
                  <input
                    type="checkbox"
                    [(ngModel)]="selectedAccessories.schloss"
                    name="accessorySchloss"
                  />
                  Schloss
                </label>
                <label class="checkbox-item">
                  <input
                    type="checkbox"
                    [(ngModel)]="selectedAccessories.korb"
                    name="accessoryKorb"
                  />
                  Korb
                </label>
              </div>
            </div>
          </div>

          <!-- Mietdauer mit Kalender -->
          <div class="form-card">
            <h2>Mietdauer</h2>

            <!-- Calendar -->
            <div class="calendar-wrap">
              <div class="cal-loading" *ngIf="busyPeriodsLoading">
                <span>Verfügbarkeit wird geladen…</span>
              </div>

              <div class="calendar" *ngIf="!busyPeriodsLoading">
                <div class="cal-nav">
                  <button
                    type="button"
                    class="cal-nav-btn"
                    (click)="prevMonth()"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <span class="cal-title"
                    >{{ calendarMonthName }} {{ calendarYear }}</span
                  >
                  <button
                    type="button"
                    class="cal-nav-btn"
                    (click)="nextMonth()"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                <div class="cal-grid">
                  <div class="cal-dow" *ngFor="let d of weekDays">{{ d }}</div>
                  <div
                    *ngFor="let day of calendarDays"
                    class="cal-day"
                    [class.empty]="!day"
                    [class.busy]="day && isDayBusy(day)"
                    [class.closed]="day && !isDayBusy(day) && isClosedDay(day)"
                    [class.range-start]="day && isDayRangeStart(day)"
                    [class.range-end]="day && isDayRangeEnd(day)"
                    [class.in-range]="day && isDayInRange(day)"
                    [class.today]="day && isDayToday(day)"
                    [class.picking-end]="
                      pickingState === 'end' &&
                      day &&
                      !isDayBusy(day) &&
                      !isClosedDay(day) &&
                      !isDayRangeStart(day)
                    "
                    (click)="day && onCalendarDayClick(day)"
                  >
                    <span *ngIf="day">{{ day.getDate() }}</span>
                    <div class="busy-tooltip" *ngIf="day && isDayBusy(day)">
                      Besetzt
                    </div>
                    <div
                      class="busy-tooltip closed-tooltip"
                      *ngIf="day && !isDayBusy(day) && isClosedDay(day)"
                    >
                      {{ day.getDay() === 0 ? 'Sonntag' : 'Feiertag' }}
                    </div>
                  </div>
                </div>

                <div class="cal-legend">
                  <span class="legend-item">
                    <span class="legend-dot busy-dot"></span> Besetzt
                  </span>
                  <span class="legend-item">
                    <span class="legend-dot closed-dot"></span> Geschlossen
                  </span>
                  <span class="legend-item">
                    <span class="legend-dot selected-dot"></span> Ausgewählt
                  </span>
                  <span
                    class="legend-item legend-hint"
                    *ngIf="!selectedBike && !isQuickAddMode"
                  >
                    Zuerst Fahrrad auswählen
                  </span>
                </div>

                <div class="cal-hint" *ngIf="pickingState === 'start'">
                  Startdatum klicken
                </div>
                <div class="cal-hint" *ngIf="pickingState === 'end'">
                  Enddatum klicken
                </div>
              </div>
            </div>

            <!-- Selected range display -->
            <div class="date-display" *ngIf="startDatum || endDatum">
              <div class="date-chip" [class.active]="!!startDatum">
                <label>Mietbeginn</label>
                <span>{{
                  startDatum ? (startDatum | date: 'dd.MM.yyyy') : '–'
                }}</span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <div class="date-chip" [class.active]="!!endDatum">
                <label>Mietende</label>
                <span>{{
                  endDatum ? (endDatum | date: 'dd.MM.yyyy') : '–'
                }}</span>
              </div>
              <button
                type="button"
                class="btn-reset-dates"
                *ngIf="startDatum"
                (click)="resetDates()"
                title="Zurücksetzen"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <!-- Hidden inputs for form validation -->
            <input
              type="hidden"
              [(ngModel)]="startDatum"
              name="startDatum"
              required
            />
            <input
              type="hidden"
              [(ngModel)]="endDatum"
              name="endDatum"
              required
            />

            <!-- Price calculation -->
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
            </div>

            <div class="form-grid" style="margin-top: 16px;">
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
              submitting ||
              (!selectedBike && !isQuickAddMode) ||
              !f.form.valid ||
              !startDatum ||
              !endDatum
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
      .booking-link:hover {
        text-decoration: underline;
      }
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

      /* ── Calendar ── */
      .calendar-wrap {
        margin-bottom: 16px;
      }
      .cal-loading {
        padding: 20px;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.88rem;
      }
      .calendar {
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        overflow: hidden;
        user-select: none;
      }
      .cal-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        background: var(--bg-secondary, #f8fafc);
        border-bottom: 1px solid var(--border-light);
      }
      .cal-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .cal-nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: none;
        background: transparent;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.15s;
      }
      .cal-nav-btn:hover {
        background: var(--border-light);
        color: var(--text-primary);
      }
      .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0;
        padding: 8px;
      }
      .cal-dow {
        text-align: center;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 4px 0 8px;
      }
      .cal-day {
        position: relative;
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s;
        color: var(--text-primary);
        margin: 1px;
      }
      .cal-day:hover:not(.busy):not(.empty) {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.1));
        color: var(--accent-primary, #6366f1);
      }
      .cal-day.empty {
        cursor: default;
      }
      .cal-day.today {
        font-weight: 800;
      }
      .cal-day.today span {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .cal-day.busy {
        background: rgba(239, 68, 68, 0.12);
        color: #ef4444;
        cursor: not-allowed;
        font-weight: 600;
      }
      .cal-day.closed {
        background: rgba(148, 163, 184, 0.1);
        color: var(--text-muted, #94a3b8);
        cursor: not-allowed;
        font-style: italic;
      }
      .cal-day.closed:hover .closed-tooltip {
        display: block;
      }
      .closed-tooltip {
        background: #64748b !important;
      }
      .closed-tooltip::after {
        border-top-color: #64748b !important;
      }
      .closed-dot {
        background: rgba(148, 163, 184, 0.5);
      }
      .cal-day.range-start,
      .cal-day.range-end {
        background: var(--accent-primary, #6366f1);
        color: white;
        font-weight: 700;
        border-radius: 8px;
      }
      .cal-day.in-range {
        background: rgba(99, 102, 241, 0.12);
        color: var(--accent-primary, #6366f1);
        border-radius: 0;
      }
      .cal-day.range-start.in-range,
      .cal-day.range-end.in-range {
        border-radius: 8px;
      }
      .cal-day.picking-end:hover:not(.busy) {
        background: rgba(99, 102, 241, 0.15);
      }
      .busy-tooltip {
        display: none;
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 3px 7px;
        border-radius: 5px;
        white-space: nowrap;
        pointer-events: none;
        z-index: 10;
      }
      .busy-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: #ef4444;
      }
      .cal-day.busy:hover .busy-tooltip {
        display: block;
      }
      .cal-legend {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 14px 10px;
        font-size: 0.78rem;
        color: var(--text-muted);
        border-top: 1px solid var(--border-light);
        flex-wrap: wrap;
      }
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        flex-shrink: 0;
      }
      .busy-dot {
        background: rgba(239, 68, 68, 0.7);
      }
      .selected-dot {
        background: var(--accent-primary, #6366f1);
      }
      .legend-hint {
        color: var(--accent-warning, #f59e0b);
        font-style: italic;
      }
      .cal-hint {
        text-align: center;
        font-size: 0.78rem;
        color: var(--text-muted);
        padding: 4px 0 10px;
      }

      /* ── Date display chips ── */
      .date-display {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 12px 0;
        padding: 12px 14px;
        background: var(--bg-secondary, #f8fafc);
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light);
      }
      .date-chip {
        display: flex;
        flex-direction: column;
        gap: 2px;
        opacity: 0.5;
        transition: opacity 0.2s;
      }
      .date-chip.active {
        opacity: 1;
      }
      .date-chip label {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .date-chip span {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .btn-reset-dates {
        margin-left: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: 1.5px solid var(--border-color);
        border-radius: 7px;
        background: transparent;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .btn-reset-dates:hover {
        border-color: #ef4444;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.06);
      }

      /* ── Price calc ── */
      .price-calc {
        margin-top: 0;
        margin-bottom: 4px;
        padding: 12px 16px;
        background: rgba(99, 102, 241, 0.06);
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

      /* ── Accessory section ── */
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
      .accessory-checklist {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .checkbox-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-primary);
        text-transform: none;
        letter-spacing: normal;
      }
      .checkbox-item input {
        width: 16px;
        height: 16px;
        margin: 0;
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
        grid-template-columns: 1fr 130px 110px 36px;
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
        grid-template-columns: 1fr 130px 110px 36px;
        gap: 8px;
        align-items: center;
      }
      .loss-fee {
        border-color: rgba(239, 68, 68, 0.4) !important;
      }
      .loss-fee input {
        color: #ef4444 !important;
        font-weight: 600;
      }
      .loss-fee .unit {
        color: #ef4444;
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
        border-color: #ef4444;
        color: #ef4444;
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

      /* ── Buttons ── */
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--border-light);
      }
      .quick-add-form {
        margin-top: 16px;
        padding: 16px;
        background: rgba(16, 185, 129, 0.04);
        border-radius: var(--radius-md, 10px);
        border: 1.5px dashed #10b981;
      }
      .quick-add-form h3 {
        margin: 0 0 12px 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: #10b981;
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

      @media (max-width: 640px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .accessory-header-row,
        .accessory-row {
          grid-template-columns: 1fr 90px 100px 70px 32px;
        }
        .date-display {
          flex-wrap: wrap;
        }
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

  startDatum = '';
  endDatum = '';
  gesamtmiete = 0;
  rabatt = 0;
  berechneterPreis = 0;
  rentalDays = 0;
  preisInfo = '';
  kaution = 0;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  zustandBeiUebergabe = 'Gut';
  notizen = '';
  submitting = false;

  availableAccessories: RentalAccessoryList[] = [];
  selectedAccessories: Record<PredefinedAccessoryKey, boolean> = {
    helm: false,
    schloss: false,
    korb: false,
  };

  // ── Calendar ──
  readonly weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  calendarYear = new Date().getFullYear();
  calendarMonth = new Date().getMonth();
  busyPeriods: BusyPeriod[] = [];
  busyPeriodsLoading = false;
  pickingState: 'start' | 'end' = 'start';

  get calendarMonthName(): string {
    return MONTH_NAMES[this.calendarMonth];
  }

  get calendarDays(): (Date | null)[] {
    const first = new Date(this.calendarYear, this.calendarMonth, 1);
    const last = new Date(this.calendarYear, this.calendarMonth + 1, 0);
    const offset = (first.getDay() + 6) % 7; // Mon=0
    const days: (Date | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(this.calendarYear, this.calendarMonth, d));
    }
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  private toLocal(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  isDayBusy(date: Date): boolean {
    const t = date.getTime();
    return this.busyPeriods.some((p) => {
      const s = new Date(p.start).getTime();
      const e = new Date(p.end).getTime();
      return t >= s && t <= e;
    });
  }

  private bwHolidayCache = new Map<number, Set<string>>();

  private easterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  }

  private getBWHolidays(year: number): Set<string> {
    if (this.bwHolidayCache.has(year)) return this.bwHolidayCache.get(year)!;
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const add = (d: Date, days: number) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
    const easter = this.easterDate(year);
    const holidays = new Set<string>([
      fmt(new Date(year, 0, 1)), // Neujahr
      fmt(new Date(year, 0, 6)), // Heilige Drei Könige (BW)
      fmt(new Date(year, 4, 1)), // Tag der Arbeit
      fmt(new Date(year, 9, 3)), // Tag der Deutschen Einheit
      fmt(new Date(year, 10, 1)), // Allerheiligen (BW)
      fmt(new Date(year, 11, 25)), // 1. Weihnachtstag
      fmt(new Date(year, 11, 26)), // 2. Weihnachtstag
      fmt(add(easter, -2)), // Karfreitag
      fmt(easter), // Ostersonntag
      fmt(add(easter, 1)), // Ostermontag
      fmt(add(easter, 39)), // Christi Himmelfahrt
      fmt(add(easter, 49)), // Pfingstsonntag
      fmt(add(easter, 50)), // Pfingstmontag
      fmt(add(easter, 60)), // Fronleichnam (BW)
    ]);
    this.bwHolidayCache.set(year, holidays);
    return holidays;
  }

  isClosedDay(date: Date): boolean {
    if (date.getDay() === 0) return true; // Sonntag
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return this.getBWHolidays(date.getFullYear()).has(key);
  }

  isDayRangeStart(date: Date): boolean {
    return !!this.startDatum && this.toLocal(date) === this.startDatum;
  }

  isDayRangeEnd(date: Date): boolean {
    return !!this.endDatum && this.toLocal(date) === this.endDatum;
  }

  isDayInRange(date: Date): boolean {
    if (!this.startDatum || !this.endDatum) return false;
    const t = date.getTime();
    return (
      t > new Date(this.startDatum).getTime() &&
      t < new Date(this.endDatum).getTime()
    );
  }

  isDayToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  prevMonth() {
    if (this.calendarMonth === 0) {
      this.calendarMonth = 11;
      this.calendarYear--;
    } else this.calendarMonth--;
  }

  nextMonth() {
    if (this.calendarMonth === 11) {
      this.calendarMonth = 0;
      this.calendarYear++;
    } else this.calendarMonth++;
  }

  onCalendarDayClick(date: Date) {
    if (this.isDayBusy(date)) return;
    if (this.isClosedDay(date)) return;
    const dateStr = this.toLocal(date);

    if (this.pickingState === 'start' || (this.startDatum && this.endDatum)) {
      this.startDatum = dateStr;
      this.endDatum = '';
      this.pickingState = 'end';
      this.onDatesChanged();
      return;
    }

    // Picking end
    if (dateStr < this.startDatum) {
      // Clicked earlier than start → reset
      this.startDatum = dateStr;
      this.endDatum = '';
      this.pickingState = 'end';
      this.onDatesChanged();
      return;
    }

    // Check if selected range would overlap with any busy period
    const rangeStart = new Date(this.startDatum);
    const rangeEnd = date;
    const overlaps = this.busyPeriods.some((p) => {
      const ps = new Date(p.start);
      const pe = new Date(p.end);
      return rangeStart <= pe && rangeEnd >= ps;
    });
    if (overlaps) {
      this.notificationService.error(
        'Dieser Zeitraum überschneidet sich mit einer bestehenden Buchung oder Vermietung.',
      );
      return;
    }

    this.endDatum = dateStr;
    this.pickingState = 'start';
    this.onDatesChanged();
  }

  resetDates() {
    this.startDatum = '';
    this.endDatum = '';
    this.pickingState = 'start';
    this.onDatesChanged();
  }

  private loadBusyPeriods(bikeId: number) {
    this.busyPeriodsLoading = true;
    this.busyPeriods = [];
    this.bicycleService.getBusyPeriods(bikeId).subscribe({
      next: (periods) => {
        this.busyPeriods = periods;
        this.busyPeriodsLoading = false;
      },
      error: () => {
        this.busyPeriodsLoading = false;
      },
    });
  }

  ngOnInit() {
    this.accessoryService.getActive().subscribe({
      next: (list) => (this.availableAccessories = list),
    });

    this.bicycleService.getAll().subscribe({
      next: (bikes) => {
        this.availableBikes = bikes.filter((b) => b.status === 'Available');

        const bookingId = this.route.snapshot.queryParamMap.get('bookingId');
        if (bookingId) {
          this.fromBookingId = Number(bookingId);
          this.bookingService.getById(this.fromBookingId).subscribe({
            next: (booking) => {
              this.customer.vorname = booking.vorname;
              this.customer.nachname = booking.nachname;
              this.customer.telefon = booking.telefon || '';
              this.customer.email = booking.email || '';

              this.startDatum = booking.startDatum.split('T')[0];
              this.endDatum = booking.endDatum.split('T')[0];
              this.pickingState = 'start';

              // Navigate calendar to the booking start month
              const start = new Date(this.startDatum);
              this.calendarMonth = start.getMonth();
              this.calendarYear = start.getFullYear();

              this.onDatesChanged();

              if (booking.gesamtpreis) this.gesamtmiete = booking.gesamtpreis;
              this.notizen = booking.notizen || '';

              if (booking.accessories && booking.accessories.length > 0) {
                this.selectedAccessories.helm = booking.accessories.some((a) =>
                  this.matchesAccessoryKey(a.bezeichnung, 'helm'),
                );
                this.selectedAccessories.schloss = booking.accessories.some(
                  (a) => this.matchesAccessoryKey(a.bezeichnung, 'schloss'),
                );
                this.selectedAccessories.korb = booking.accessories.some((a) =>
                  this.matchesAccessoryKey(a.bezeichnung, 'korb'),
                );
              }

              const match = this.availableBikes.find(
                (b) => b.id === booking.bicycle.id,
              );
              if (match) {
                this.onBikeSelected(match);
              } else {
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
                this.loadBusyPeriods(booking.bicycle.id);
              }
            },
            error: () => {
              this.notificationService.error(
                'Buchung konnte nicht geladen werden',
              );
            },
          });
        }
      },
    });
    this.startDatum = new Date().toISOString().split('T')[0];
  }

  onBikeSelected(bike: Bicycle) {
    this.selectedBike = bike;
    this.isQuickAddMode = false;
    this.bikeEdit = {
      rahmennummer: bike.rahmennummer || '',
      marke: bike.marke || '',
      modell: bike.modell || '',
      farbe: bike.farbe || '',
      reifengroesse: bike.reifengroesse || '',
      fahrradtyp: bike.fahrradtyp || '',
    };
    this.loadBusyPeriods(bike.id);
  }

  onQuickAddBike() {
    this.isQuickAddMode = true;
    this.selectedBike = null;
    this.busyPeriods = [];
    this.bikeEdit = {
      rahmennummer: '',
      marke: '',
      modell: '',
      farbe: '',
      reifengroesse: '',
      fahrradtyp: '',
    };
  }

  private normalizeAccessoryName(value: string): string {
    return (value || '')
      .toLowerCase()
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ß/g, 'ss')
      .trim();
  }

  private matchesAccessoryKey(
    bezeichnung: string,
    key: PredefinedAccessoryKey,
  ): boolean {
    const n = this.normalizeAccessoryName(bezeichnung);
    if (key === 'helm') return n.includes('helm');
    if (key === 'schloss') return n.includes('schloss');
    return n.includes('korb');
  }

  private getDefaultAccessoryLabel(key: PredefinedAccessoryKey): string {
    if (key === 'helm') return 'Helm';
    if (key === 'schloss') return 'Schloss';
    return 'Korb';
  }

  private buildAccessoryFromKey(key: PredefinedAccessoryKey): AccessoryLine {
    const found = this.availableAccessories.find((a) =>
      this.matchesAccessoryKey(a.bezeichnung, key),
    );

    return {
      rentalAccessoryId: found?.id,
      bezeichnung: found?.bezeichnung || this.getDefaultAccessoryLabel(key),
      tagespreis: found?.tagespreis || 0,
      verlustgebuehr: found?.verlustgebuehr,
      menge: 1,
    };
  }

  recalcPrice() {
    if (this.rentalDays > 0) {
      this.berechneterPreis = this.calculatePrice(this.rentalDays);
      this.gesamtmiete = Math.max(
        0,
        this.berechneterPreis - (this.rabatt || 0),
      );
    }
  }

  onDatesChanged() {
    if (!this.startDatum || !this.endDatum) {
      this.rentalDays = 0;
      return;
    }
    const start = new Date(this.startDatum);
    const end = new Date(this.endDatum);
    const diffDays = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    this.rentalDays = Math.max(0, diffDays + 1); // both start and end day count
    if (this.rentalDays > 0) this.recalcPrice();
  }

  onRabattChanged() {
    if (this.berechneterPreis > 0)
      this.gesamtmiete = Math.max(
        0,
        this.berechneterPreis - (this.rabatt || 0),
      );
  }

  calculatePrice(days: number): number {
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
    const extra = days - 30;
    const price = 160 + extra * 6.5;
    this.preisInfo = `30 Tage (160,00 €) + ${extra} Tag(e) × 6,50 € = ${price.toFixed(2)} €`;
    return Math.round(price * 100) / 100;
  }

  submit() {
    if (this.submitting) return;

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
        } as any)
        .subscribe({
          next: (bike) => this.createRental(bike.id),
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
    const accessoryKeys: PredefinedAccessoryKey[] = ['helm', 'schloss', 'korb'];
    const accessoriesPayload: RentalAccessoryItemCreate[] = accessoryKeys
      .filter((key) => this.selectedAccessories[key])
      .map((key) => {
        const accessory = this.buildAccessoryFromKey(key);
        return {
          rentalAccessoryId: accessory.rentalAccessoryId,
          bezeichnung: accessory.bezeichnung,
          tagespreis: accessory.tagespreis,
          verlustgebuehr: accessory.verlustgebuehr,
          menge: accessory.menge,
        };
      });

    const rental: RentalCreate = {
      bicycleId,
      customer: this.customer,
      startDatum: this.startDatum,
      endDatum: this.endDatum,
      gesamtmiete: this.gesamtmiete,
      rabatt: this.rabatt || 0,
      kaution: this.kaution,
      zahlungsart: this.zahlungsart,
      zustandBeiUebergabe: this.zustandBeiUebergabe as BikeConditionAtHandover,
      notizen: this.notizen || undefined,
      accessories:
        accessoriesPayload.length > 0 ? accessoriesPayload : undefined,
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
