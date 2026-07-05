import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RentalService } from '../../services/rental.service';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';
import { RentalBookingService } from '../../services/rental-booking.service';
import { RentalAccessoryService } from '../../services/rental-accessory.service';
import {
  RentalCreate,
  RentalUpdate,
  RentalBikeUpdate,
  RentalBikeCreate,
  Rental,
  RentalBike,
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
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';
import { calculateRentalPrice } from '../../utils/rental-pricing';

interface AccessoryLine {
  rentalAccessoryId?: number;
  bezeichnung: string;
  tagespreis: number;
  verlustgebuehr?: number;
  menge: number;
}

type PredefinedAccessoryKey =
  | 'helm'
  | 'schloss'
  | 'korb'
  | 'reparaturset'
  | 'licht'
  | 'handyhalter';

const ACCESSORY_KEYS: PredefinedAccessoryKey[] = [
  'helm',
  'schloss',
  'korb',
  'reparaturset',
  'licht',
  'handyhalter',
];

interface BikeEntry {
  selectedBike: Bicycle | null;
  isQuickAddMode: boolean;
  isCollapsed: boolean;
  // Edit-mode tracking (null/false for the "new rental" flow)
  rentalBikeId: number | null; // id of the existing RentalBike row, null = newly added
  isExisting: boolean;
  originalBicycleId: number | null;
  bikeEdit: {
    rahmennummer: string;
    marke: string;
    modell: string;
    rahmengroesse: string;
    farbe: string;
    reifengroesse: string;
    fahrradtyp: string;
    beschreibung: string;
    zustand: BikeCondition;
  };
  bikeErrors: { [key: string]: boolean };
  rahmenSearchResults: Bicycle[];
  showRahmenDropdown: boolean;
  rahmenSearchTimeout: any;
  gesamtmiete: number;
  rabatt: number;
  berechneterPreis: number;
  preisInfo: string;
  kaution: number;
  zahlungsart: PaymentMethod | '';
  kautionZahlungsart: PaymentMethod | '';
  zustandBeiUebergabe: string;
  busyPeriods: BusyPeriod[];
  busyPeriodsLoading: boolean;
}

function createEmptyBikeEntry(): BikeEntry {
  return {
    selectedBike: null,
    isQuickAddMode: false,
    isCollapsed: false,
    rentalBikeId: null,
    isExisting: false,
    originalBicycleId: null,
    bikeEdit: {
      rahmennummer: '',
      marke: '',
      modell: '',
      rahmengroesse: '',
      farbe: '',
      reifengroesse: '',
      fahrradtyp: '',
      beschreibung: '',
      zustand: BikeCondition.Gebraucht,
    },
    bikeErrors: {},
    rahmenSearchResults: [],
    showRahmenDropdown: false,
    rahmenSearchTimeout: null,
    gesamtmiete: 0,
    rabatt: 0,
    berechneterPreis: 0,
    preisInfo: '',
    kaution: 0,
    zahlungsart: '',
    kautionZahlungsart: '',
    zustandBeiUebergabe: 'Gut',
    busyPeriods: [],
    busyPeriodsLoading: false,
  };
}

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
  imports: [CommonModule, FormsModule, RouterLink, BikeSelectorComponent, SignaturePadComponent],
  template: `
    <datalist id="brandList">
      <option *ngFor="let b of brands" [value]="b"></option>
    </datalist>
    <datalist id="modelList">
      <option *ngFor="let m of models" [value]="m"></option>
    </datalist>
    <div class="page">
      <div class="page-header">
        <h1>
          {{ isEditMode ? 'Mietvertrag bearbeiten' : (fromBookingId ? 'Mietvertrag aus Anfrage' : 'Neue Vermietung') }}
        </h1>
        <a [routerLink]="backLink" class="btn btn-outline">Zurück</a>
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

        <!-- Wizard progress (mobile only) -->
        <div class="wizard-progress" *ngIf="isMobile">
          <div class="wizard-progress-top">
            <span class="wizard-step-count">Schritt {{ currentStep + 1 }} / {{ totalSteps }}</span>
            <span class="wizard-step-name">{{ currentStepLabel }}</span>
          </div>
          <div class="wizard-progress-bar">
            <div class="wizard-progress-fill" [style.width.%]="((currentStep + 1) / totalSteps) * 100"></div>
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

          <!-- STEP 0: Mietdauer mit Kalender — FIRST: dates must be chosen before bikes -->
          <div class="wizard-step" [class.wizard-hidden]="isMobile && currentStep !== 0">
          <div class="form-card">
            <h2>Mietdauer</h2>

            <div class="calendar-wrap">
              <div class="calendar">
                <div class="cal-nav">
                  <button type="button" class="cal-nav-btn" (click)="prevMonth()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <span class="cal-title">{{ calendarMonthName }} {{ calendarYear }}</span>
                  <button type="button" class="cal-nav-btn" (click)="nextMonth()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
                    [class.closed]="day && isClosedDay(day)"
                    [class.range-start]="day && isDayRangeStart(day)"
                    [class.range-end]="day && isDayRangeEnd(day)"
                    [class.in-range]="day && isDayInRange(day)"
                    [class.today]="day && isDayToday(day)"
                    [class.picking-end]="pickingState === 'end' && day && !isClosedDay(day) && !isDayRangeStart(day)"
                    (click)="day && onCalendarDayClick(day)"
                  >
                    <span *ngIf="day">{{ day.getDate() }}</span>
                    <div class="busy-tooltip closed-tooltip" *ngIf="day && isClosedDay(day)">
                      Feiertag
                    </div>
                  </div>
                </div>

                <div class="cal-legend">
                  <span class="legend-item">
                    <span class="legend-dot closed-dot"></span> Geschlossen
                  </span>
                  <span class="legend-item">
                    <span class="legend-dot selected-dot"></span> Ausgewählt
                  </span>
                </div>

                <div class="cal-hint" *ngIf="pickingState === 'start'">Startdatum klicken</div>
                <div class="cal-hint" *ngIf="pickingState === 'end'">Enddatum klicken</div>
              </div>
            </div>

            <div class="date-display" *ngIf="startDatum || endDatum">
              <div class="date-chip" [class.active]="!!startDatum">
                <label>Mietbeginn</label>
                <span>{{ startDatum ? (startDatum | date: 'dd.MM.yyyy') : '–' }}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <div class="date-chip" [class.active]="!!endDatum">
                <label>Mietende</label>
                <span>{{ endDatum ? (endDatum | date: 'dd.MM.yyyy') : '–' }}</span>
              </div>
              <button type="button" class="btn-reset-dates" *ngIf="startDatum" (click)="resetDates()" title="Zurücksetzen">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <input type="hidden" [(ngModel)]="startDatum" name="startDatum" required />
            <input type="hidden" [(ngModel)]="endDatum" name="endDatum" required />

            <div class="form-grid" style="margin-top: 16px;">
              <div class="field full" *ngIf="isEditMode">
                <label>Beleg-Nr</label>
                <input
                  [(ngModel)]="mietvertragNummer"
                  name="mietvertragNummer"
                  placeholder="z.B. 042"
                  autocomplete="off"
                />
                <span style="font-size:0.75rem;color:var(--text-muted,#94a3b8);margin-top:4px;">Belegnummer des Mietvertrags. Leer lassen, um sie nicht zu ändern.</span>
              </div>
              <div class="field full">
                <label>Notizen</label>
                <textarea [(ngModel)]="notizen" name="notizen" rows="3"></textarea>
              </div>
            </div>
          </div>
          </div>
          <!-- /STEP 0 -->

          <!-- STEP 1: Fahrrad — Verfügbarkeit + Fahrradkarten -->
          <div class="wizard-step" [class.wizard-hidden]="isMobile && currentStep !== 1">
          <!-- Availability status after date selection -->
          <div class="avail-loading-bar" *ngIf="availabilityLoading">
            <span>Verfügbare Fahrräder werden geladen…</span>
          </div>
          <div class="avail-none-bar" *ngIf="datesReady && !availabilityLoading && availableBikes.length === 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Keine Fahrräder für diesen Zeitraum verfügbar.
          </div>
          <div class="avail-count-bar" *ngIf="datesReady && !availabilityLoading && availableBikes.length > 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            {{ availableBikes.length }} Fahrrad{{ availableBikes.length !== 1 ? 'räder' : '' }} für diesen Zeitraum verfügbar
          </div>
          <div class="select-dates-hint" *ngIf="!datesReady && !availabilityLoading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Bitte zuerst Mietdauer auswählen, um verfügbare Fahrräder zu sehen.
          </div>

          <ng-container *ngIf="datesReady">
          <!-- Bicycle cards (1+) -->
          <div class="form-card bike-card" [class.is-collapsed]="b.isCollapsed" *ngFor="let b of bikes; let i = index; trackBy: trackByIndex">
            <div class="bike-card-header">
              <h2>
                {{ bikes.length > 1 ? (i + 1) + '. Fahrrad' : 'Fahrrad auswählen' }}
                <span *ngIf="b.isCollapsed && (b.selectedBike || b.isQuickAddMode)" class="bike-summary">
                  – {{ b.bikeEdit.marke }} {{ b.bikeEdit.modell }}<ng-container *ngIf="b.gesamtmiete"> · {{ b.gesamtmiete | number: '1.2-2' }} €</ng-container>
                </span>
              </h2>
              <div class="bike-card-actions">
                <button
                  *ngIf="b.selectedBike || b.isQuickAddMode"
                  type="button"
                  class="btn-collapse-bike"
                  (click)="toggleCollapse(i)"
                  [title]="b.isCollapsed ? 'Erweitern' : 'Einklappen'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" [style.transform]="b.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'" style="transition: transform .15s">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  {{ b.isCollapsed ? 'Erweitern' : 'Einklappen' }}
                </button>
                <button
                  *ngIf="bikes.length > 1"
                  type="button"
                  class="btn-remove-bike"
                  (click)="removeBike(i)"
                  title="Fahrrad entfernen"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Entfernen
                </button>
              </div>
            </div>

            <div class="bike-card-body" *ngIf="!b.isCollapsed">
            <app-bike-selector
              [bikes]="getAvailableBikesFor(i)"
              [selectedBike]="b.selectedBike"
              (selectedBikeChange)="onSelectedBikeUpdated(i, $event)"
              [allowQuickAdd]="true"
              [requireConfirmSelection]="true"
              (bikeSelected)="onBikeSelected(i, $event)"
              (quickAddRequested)="onQuickAddBike(i)"
            ></app-bike-selector>

            <!-- Bike details form (quick-add or edit-selected) -->
            <div class="bike-details-form" *ngIf="b.selectedBike || b.isQuickAddMode" [class.is-quick-add]="b.isQuickAddMode">
              <h3>
                <span *ngIf="b.isQuickAddMode" class="quick-add-badge">🆕 Neues Fahrrad</span>
                <span *ngIf="!b.isQuickAddMode">🚲 Fahrrad-Details</span>
              </h3>
              <div class="form-grid">
                <!-- Rahmennummer with autocomplete -->
                <div
                  class="field full rahmen-autocomplete-wrapper"
                  [class.field-error]="b.bikeErrors['rahmennummer']"
                >
                  <label>Rahmennummer <ng-container *ngIf="b.isQuickAddMode">*</ng-container></label>
                  <input
                    [(ngModel)]="b.bikeEdit.rahmennummer"
                    [name]="'bikeRahmen_' + i"
                    (ngModelChange)="b.bikeErrors['rahmennummer'] = false; onRahmennummerChange(i, $event)"
                    (focus)="onRahmennummerChange(i, b.bikeEdit.rahmennummer)"
                    (blur)="hideRahmenDropdown(i)"
                    style="text-transform: uppercase"
                    placeholder="Rahmennummer eingeben..."
                    autocomplete="off"
                    [required]="b.isQuickAddMode"
                  />
                  <span class="error-msg" *ngIf="b.bikeErrors['rahmennummer']">Pflichtfeld</span>
                  <div
                    class="rahmen-dropdown"
                    *ngIf="b.rahmenSearchResults.length > 0 && b.showRahmenDropdown"
                  >
                    <div
                      class="rahmen-dropdown-item"
                      *ngFor="let bk of b.rahmenSearchResults"
                      (mousedown)="selectRahmenBike(i, bk)"
                    >
                      <span class="rahmen-nr">{{ bk.rahmennummer }}</span>
                      <span class="rahmen-info">{{ bk.marke }} {{ bk.modell }}</span>
                      <span class="rahmen-badge" *ngIf="bk.status === 'Available'">Verfügbar</span>
                      <span class="rahmen-badge sold" *ngIf="bk.status === 'Sold'">Verkauft</span>
                    </div>
                  </div>
                </div>
                <div class="field" [class.field-error]="b.bikeErrors['marke']">
                  <label>Marke *</label>
                  <input
                    [(ngModel)]="b.bikeEdit.marke"
                    [name]="'bikeMarke_' + i"
                    list="brandList"
                    autocomplete="off"
                    required
                    (ngModelChange)="b.bikeErrors['marke'] = false"
                  />
                  <span class="error-msg" *ngIf="b.bikeErrors['marke']">Pflichtfeld</span>
                </div>
                <div class="field">
                  <label>Modell</label>
                  <input
                    [(ngModel)]="b.bikeEdit.modell"
                    [name]="'bikeModell_' + i"
                    list="modelList"
                    autocomplete="off"
                  />
                </div>
                <div class="field">
                  <label>Rahmengröße</label>
                  <input
                    [(ngModel)]="b.bikeEdit.rahmengroesse"
                    [name]="'bikeRahmengroesse_' + i"
                    placeholder="z.B. 52, 56, M, L"
                  />
                </div>
                <div class="field">
                  <label>Farbe</label>
                  <div class="color-chips">
                    <button
                      type="button"
                      *ngFor="let c of colorOptions"
                      class="color-chip"
                      [class.selected]="isColorSelected(b.bikeEdit.farbe, c.value)"
                      [style.--chip-color]="c.hex"
                      (click)="b.bikeEdit.farbe = toggleColor(b.bikeEdit.farbe, c.value)"
                    >
                      <span class="chip-dot"></span>
                      {{ c.label }}
                    </button>
                  </div>
                </div>
                <div class="field">
                  <label>Reifengröße</label>
                  <select [(ngModel)]="b.bikeEdit.reifengroesse" [name]="'bikeReifen_' + i">
                    <option value="">-- Auswählen --</option>
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
                  <label>Fahrradtyp</label>
                  <select [(ngModel)]="b.bikeEdit.fahrradtyp" [name]="'bikeFahrradtyp_' + i">
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
                <div class="field full">
                  <label>Beschreibung / Ausstattung</label>
                  <textarea
                    [(ngModel)]="b.bikeEdit.beschreibung"
                    [name]="'bikeBeschr_' + i"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Per-bike pricing & payment -->
            <div class="bike-pricing" *ngIf="b.selectedBike || b.isQuickAddMode">
              <div class="price-calc" *ngIf="rentalDays > 0 && b.selectedBike">
                <div class="calc-header">
                  <span class="calc-days">{{ rentalDays }} Tag{{ rentalDays > 1 ? 'e' : '' }}</span>
                  <span class="calc-price">
                    Berechneter Preis: {{ b.berechneterPreis | number: '1.2-2' }} €
                  </span>
                </div>
                <div class="calc-breakdown" *ngIf="b.preisInfo">
                  <span class="calc-info">{{ b.preisInfo }}</span>
                </div>
              </div>

              <div class="form-grid" style="margin-top: 16px;">
                <div class="field">
                  <label>Gesamtmiete (€, inkl. MwSt.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    [(ngModel)]="b.gesamtmiete"
                    [name]="'gesamtmiete_' + i"
                    required
                    min="0"
                  />
                </div>
                <div class="field">
                  <label>Rabatt (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    [(ngModel)]="b.rabatt"
                    [name]="'rabatt_' + i"
                    min="0"
                    (ngModelChange)="onRabattChanged(i)"
                  />
                </div>
                <div class="field">
                  <label>Kaution (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    [(ngModel)]="b.kaution"
                    [name]="'kaution_' + i"
                    required
                    min="0"
                  />
                </div>
                <div class="field">
                  <label>Zahlungsart Miete *</label>
                  <select [(ngModel)]="b.zahlungsart" [name]="'zahlungsart_' + i" required>
                    <option value="" disabled>Bitte wählen…</option>
                    <option value="Bar">Bar</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Karte">Karte</option>
                    <option value="Überweisung">Überweisung</option>
                  </select>
                </div>
                <div class="field">
                  <label>Zahlungsart Kaution *</label>
                  <select [(ngModel)]="b.kautionZahlungsart" [name]="'kautionZahlungsart_' + i" required>
                    <option value="" disabled>Bitte wählen…</option>
                    <option value="Bar">Bar</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Karte">Karte</option>
                    <option value="Überweisung">Überweisung</option>
                  </select>
                </div>
              </div>
            </div>
            </div>
          </div>

          <button
            type="button"
            class="btn-add-bike"
            (click)="addBike()"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Weiteres Fahrrad hinzufügen
          </button>
          </ng-container>
          </div>
          <!-- /STEP 1 -->

          <!-- STEP 2: Zubehör -->
          <div class="wizard-step" [class.wizard-hidden]="isMobile && currentStep !== 2">
          <ng-container *ngIf="datesReady">
          <!-- Zubehör -->
          <div class="form-card">
            <div class="section-header">
              <h2>Zubehör</h2>
            </div>
            <div class="accessory-empty" *ngIf="availableAccessories.length === 0">
              Noch kein Mietzubehör angelegt. Unter „Mietzubehör" können Sie
              Artikel (mit Foto und Preis) hinzufügen.
            </div>
            <div class="accessory-quantity-grid" *ngIf="availableAccessories.length > 0">
              <div class="accessory-quantity-item" *ngFor="let acc of availableAccessories">
                <label [attr.for]="'acc_' + acc.id">
                  {{ acc.bezeichnung }}
                  <span class="acc-price">{{ acc.tagespreis | number: '1.2-2' }} €/Tag</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  [id]="'acc_' + acc.id"
                  [name]="'accessoryQty_' + acc.id"
                  [ngModel]="catalogAccessoryQty[acc.id] || 0"
                  (ngModelChange)="onCatalogAccessoryQtyChange(acc.id, $event)"
                  placeholder="0"
                />
              </div>
            </div>
            <div class="accessory-total-row" *ngIf="accessoryGrandTotal() > 0">
              <span>Zubehör gesamt ({{ rentalDays }} Tage):</span>
              <strong>{{ accessoryGrandTotal() | number: '1.2-2' }} €</strong>
            </div>
          </div>
          </ng-container>
          </div>
          <!-- /STEP 2 -->

          <!-- STEP 3: Mieter -->
          <div class="wizard-step" [class.wizard-hidden]="isMobile && currentStep !== 3">
          <ng-container *ngIf="datesReady">
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
                <label>Telefon</label>
                <input
                  [(ngModel)]="customer.telefon"
                  name="customerTelefon"
                />
              </div>
              <div class="field">
                <label>E-Mail *</label>
                <input
                  [(ngModel)]="customer.email"
                  name="customerEmail"
                  type="email"
                  required
                />
              </div>
            </div>
          </div>
          </ng-container>
          </div>
          <!-- /STEP 3 -->

          <!-- STEP 4: AGB & Unterschrift -->
          <div class="wizard-step" [class.wizard-hidden]="isMobile && currentStep !== 4">
          <ng-container *ngIf="datesReady">
          <!-- AGB & Unterschrift -->
          <div class="form-card">
            <h2>AGB &amp; Unterschrift</h2>
            <div class="form-grid">
              <div class="field">
                <label>Ort</label>
                <input [(ngModel)]="unterschriftOrt" name="unterschriftOrt" placeholder="Freiburg" />
              </div>
              <div class="field" style="display:flex;align-items:center;gap:8px;padding-top:22px;">
                <input
                  type="checkbox"
                  [(ngModel)]="agbAkzeptiert"
                  name="agbAkzeptiert"
                  id="agbCheck"
                  required
                  style="width:18px;height:18px;cursor:pointer;"
                />
                <label for="agbCheck" style="cursor:pointer;margin:0;">Ich habe die AGB gelesen und akzeptiert</label>
              </div>
            </div>
            <div style="margin-top:12px;">
              <label style="font-weight:600;font-size:0.9rem;">Unterschrift Mieter</label>
              <div *ngIf="isEditMode && existingSignature && !mieterUnterschrift" style="margin-bottom:8px;">
                <p style="font-size:0.8rem;color:#64748b;margin-bottom:4px;">Vorhandene Unterschrift:</p>
                <img [src]="existingSignature" style="max-height:60px;border:1px solid #e2e8f0;border-radius:4px;" />
              </div>
              <app-signature-pad [(ngModel)]="mieterUnterschrift" name="mieterUnterschrift"></app-signature-pad>
              <p *ngIf="isEditMode" style="font-size:0.75rem;color:#94a3b8;margin-top:4px;">Neu unterschreiben, um die vorhandene Unterschrift zu ersetzen.</p>
            </div>
          </div>
          </ng-container>
          </div>
          <!-- /STEP 4 -->

        </div>

        <!-- Wizard nav (mobile only) -->
        <div class="wizard-nav" *ngIf="isMobile">
          <a [routerLink]="backLink" class="btn btn-outline wizard-back" *ngIf="currentStep === 0">Abbrechen</a>
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
            [disabled]="submitting || !canSubmit || !f.form.valid"
          >
            {{ submitButtonLabel }}
          </button>
        </div>

        <div class="form-actions" *ngIf="!isMobile">
          <a [routerLink]="backLink" class="btn btn-outline">Abbrechen</a>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="submitting || !canSubmit || !f.form.valid"
          >
            {{ submitButtonLabel }}
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
      .bike-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
      }
      .bike-card.is-collapsed .bike-card-header {
        margin-bottom: 0;
      }
      .bike-card-header h2 {
        margin: 0;
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
      }
      .bike-card-header .bike-summary {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--text-muted);
      }
      .bike-card-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-shrink: 0;
      }
      .btn-collapse-bike {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        font-size: 0.82rem;
        font-weight: 600;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        background: transparent;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn-collapse-bike:hover {
        border-color: var(--primary, #3b82f6);
        color: var(--primary, #3b82f6);
      }
      .btn-remove-bike {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        font-size: 0.82rem;
        font-weight: 600;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        background: transparent;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn-remove-bike:hover {
        border-color: #ef4444;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.06);
      }
      .btn-add-bike {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        font-size: 0.9rem;
        font-weight: 600;
        border: 1.5px dashed var(--accent-primary, #6366f1);
        border-radius: var(--radius-md, 10px);
        background: rgba(99, 102, 241, 0.04);
        color: var(--accent-primary, #6366f1);
        cursor: pointer;
        transition: all 0.15s;
      }
      .btn-add-bike:hover {
        background: rgba(99, 102, 241, 0.1);
      }
      .bike-pricing {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--border-light);
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
      .avail-loading-bar,
      .avail-none-bar,
      .avail-count-bar,
      .select-dates-hint {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 0.9rem;
      }
      .avail-loading-bar {
        background: var(--bg-secondary, #f3f4f6);
        color: var(--text-muted);
        font-style: italic;
      }
      .avail-none-bar {
        background: rgba(239, 68, 68, 0.08);
        color: #dc2626;
        border: 1px solid rgba(239, 68, 68, 0.2);
      }
      .avail-count-bar {
        background: rgba(34, 197, 94, 0.08);
        color: #16a34a;
        border: 1px solid rgba(34, 197, 94, 0.2);
      }
      .select-dates-hint {
        background: var(--bg-secondary, #f3f4f6);
        color: var(--text-muted);
        border: 1px dashed var(--border-light);
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
      .accessory-quantity-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 12px 16px;
        margin-top: 12px;
      }
      .accessory-quantity-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 12px;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card);
      }
      .accessory-quantity-item label {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .accessory-quantity-item label .acc-price {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-secondary, #64748b);
      }
      .accessory-quantity-item input {
        flex-shrink: 0;
        width: 70px;
        padding: 6px 8px;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-sm, 6px);
        font-size: 0.9rem;
        text-align: center;
        background: var(--bg-input, var(--bg-card));
        color: var(--text-primary);
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
      .bike-details-form {
        margin-top: 16px;
        padding: 16px;
        background: var(--bg-secondary, #f8fafc);
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .bike-details-form.is-quick-add {
        background: rgba(16, 185, 129, 0.04);
        border: 1.5px dashed #10b981;
      }
      .bike-details-form h3 {
        margin: 0 0 12px 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--accent-primary, #6366f1);
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
      .field.full {
        grid-column: 1 / -1;
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

        /* Prevent iOS zoom-on-focus (needs ≥16px) */
        input,
        select,
        textarea {
          font-size: 16px;
        }

        /* Tighter spacing on small screens */
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

        /* Larger touch targets */
        .cal-nav-btn {
          width: 40px;
          height: 40px;
        }
        .cal-day {
          font-size: 0.95rem;
        }
        .qty-btn {
          height: 40px;
          padding: 0 14px;
        }
        .btn-remove {
          width: 40px;
          height: 40px;
        }
        .btn-add-bike {
          width: 100%;
          padding: 14px;
        }
        .color-chip {
          padding: 8px 12px;
          font-size: 0.9rem;
        }
        .accessory-quantity-item input {
          width: 64px;
          padding: 8px;
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
  fromBookingAusweisPhotoPath: string | undefined = undefined;

  // ── Edit mode ──
  isEditMode = false;
  rentalId: number | null = null;
  existingSignature = '';
  mietvertragNummer = '';
  private removedExistingBikeIds: number[] = [];

  availableBikes: Bicycle[] = [];
  availabilityLoading = false;
  private pendingBikeIdToSelect: number | null = null;
  private pendingBookingBike: any = null;
  private pendingMultiBikes: Array<{ bikeId: number; srcBike: any; mietpreis?: number }> = [];
  brands: string[] = [];
  models: string[] = [];

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
    { value: 'Türkis', label: 'Türkis', hex: '#06b6d4' },
    { value: 'Lila', label: 'Lila', hex: '#a855f7' },
    { value: 'Dunkelblau', label: 'Dunkelblau', hex: '#1e3a5f' },
  ];

  bikes: BikeEntry[] = [createEmptyBikeEntry()];

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
  rentalDays = 0;
  notizen = '';
  submitting = false;
  mieterUnterschrift = '';
  agbAkzeptiert = false;
  unterschriftOrt = 'Freiburg';

  // ── Mobile wizard ──
  isMobile = false;
  currentStep = 0;
  readonly wizardSteps = ['Mietdauer', 'Fahrrad', 'Zubehör', 'Mieter', 'Unterschrift'];

  get totalSteps(): number {
    return this.wizardSteps.length;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.totalSteps - 1;
  }

  get currentStepLabel(): string {
    return this.wizardSteps[this.currentStep] ?? '';
  }

  get backLink(): any[] {
    return this.isEditMode && this.rentalId ? ['/rentals', this.rentalId] : ['/rentals'];
  }

  get submitButtonLabel(): string {
    if (this.submitting) {
      return this.isEditMode ? 'Wird gespeichert...' : 'Wird erstellt...';
    }
    if (this.isEditMode) return 'Änderungen speichern';
    return this.bikes.length > 1 ? 'Vermietungen anlegen' : 'Vermietung anlegen';
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
    // Forward navigation: validate each step in between
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
    switch (step) {
      case 0:
        if (!this.datesReady) {
          this.notificationService.error('Bitte Mietbeginn und Mietende auswählen.');
          return false;
        }
        return true;
      case 1:
        return this.validateBikesStep();
      case 3:
        return this.validateMieterStep();
      default:
        return true;
    }
  }

  private validateBikesStep(): boolean {
    for (let i = 0; i < this.bikes.length; i++) {
      const b = this.bikes[i];
      if (!b.selectedBike && !b.isQuickAddMode) {
        b.isCollapsed = false;
        this.notificationService.error(`Fahrrad ${i + 1}: bitte auswählen oder neu anlegen`);
        return false;
      }
      b.bikeErrors = {};
      if (b.isQuickAddMode && !b.bikeEdit.rahmennummer) b.bikeErrors['rahmennummer'] = true;
      if (!b.bikeEdit.marke) b.bikeErrors['marke'] = true;
      if (Object.values(b.bikeErrors).some((v) => v)) {
        b.isCollapsed = false;
        this.notificationService.error(
          `Fahrrad ${i + 1}: Rahmennummer und Marke ausfüllen`,
        );
        return false;
      }
      if (!b.zahlungsart) {
        b.isCollapsed = false;
        this.notificationService.error(`Fahrrad ${i + 1}: Zahlungsart Miete wählen`);
        return false;
      }
      if (!b.kautionZahlungsart) {
        b.isCollapsed = false;
        this.notificationService.error(`Fahrrad ${i + 1}: Zahlungsart Kaution wählen`);
        return false;
      }
    }
    return true;
  }

  private validateMieterStep(): boolean {
    const c = this.customer;
    if (
      !c.vorname ||
      !c.nachname ||
      !c.strasse ||
      !c.hausnummer ||
      !c.plz ||
      !c.stadt ||
      !c.email
    ) {
      this.notificationService.error('Bitte alle Pflichtfelder des Mieters ausfüllen.');
      return false;
    }
    return true;
  }

  availableAccessories: RentalAccessoryList[] = [];
  accessoryQuantities: Record<PredefinedAccessoryKey, number> = {
    helm: 0,
    schloss: 0,
    korb: 0,
    reparaturset: 0,
    licht: 0,
    handyhalter: 0,
  };

  readonly accessoryKeys = ACCESSORY_KEYS;
  readonly accessoryLabels: Record<PredefinedAccessoryKey, string> = {
    helm: 'Helm',
    schloss: 'Schloss',
    korb: 'Korb',
    reparaturset: 'Reparaturset',
    licht: 'Fahrradlicht',
    handyhalter: 'Handyhalterung',
  };

  onAccessoryQuantityChange(key: PredefinedAccessoryKey, value: unknown) {
    const n = Number(value);
    this.accessoryQuantities[key] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  // ── Catalog-driven Zubehör (managed Mietzubehör items) ──
  catalogAccessoryQty: Record<number, number> = {};
  /** Existing accessories to pre-select once the catalog has loaded. */
  private prefillAccessories: { bezeichnung: string; menge: number }[] = [];

  onCatalogAccessoryQtyChange(id: number, value: unknown) {
    const n = Number(value);
    const qty = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    if (qty > 0) this.catalogAccessoryQty[id] = qty;
    else delete this.catalogAccessoryQty[id];
  }

  accessoryGrandTotal(): number {
    const days = this.rentalDays > 0 ? this.rentalDays : 1;
    return this.availableAccessories.reduce((sum, acc) => {
      const qty = this.catalogAccessoryQty[acc.id] || 0;
      return sum + acc.tagespreis * qty * days;
    }, 0);
  }

  /** Builds the accessory payload (priced per day server-side) from the catalog selection. */
  private buildCatalogAccessories(): RentalAccessoryItemCreate[] {
    return this.availableAccessories
      .filter((acc) => (this.catalogAccessoryQty[acc.id] || 0) > 0)
      .map((acc) => ({
        rentalAccessoryId: acc.id,
        bezeichnung: acc.bezeichnung,
        tagespreis: acc.tagespreis,
        verlustgebuehr: acc.verlustgebuehr,
        menge: this.catalogAccessoryQty[acc.id],
      }));
  }

  /** Re-applies pre-fill once both the catalog and the source entity are loaded. */
  private applyAccessoryPrefill() {
    if (
      this.prefillAccessories.length === 0 ||
      this.availableAccessories.length === 0
    )
      return;
    for (const item of this.prefillAccessories) {
      const match = this.availableAccessories.find(
        (a) =>
          a.bezeichnung.trim().toLowerCase() ===
          item.bezeichnung.trim().toLowerCase(),
      );
      if (match && item.menge > 0) this.catalogAccessoryQty[match.id] = item.menge;
    }
  }

  // ── Calendar ──
  readonly weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  calendarYear = new Date().getFullYear();
  calendarMonth = new Date().getMonth();
  pickingState: 'start' | 'end' = 'start';

  trackByIndex = (i: number) => i;

  get anyBusyLoading(): boolean {
    return this.bikes.some((b) => b.busyPeriodsLoading);
  }

  get combinedBusyPeriods(): BusyPeriod[] {
    return this.bikes.flatMap((b) => b.busyPeriods);
  }

  get hasAnyBikeReady(): boolean {
    return this.bikes.some((b) => !!b.selectedBike || b.isQuickAddMode);
  }

  get datesReady(): boolean {
    return !!this.startDatum && !!this.endDatum;
  }

  get canSubmit(): boolean {
    if (!this.startDatum || !this.endDatum) return false;
    return this.bikes.every((b) => !!b.selectedBike || b.isQuickAddMode);
  }

  getAvailableBikesFor(i: number): Bicycle[] {
    const otherSelectedIds = this.bikes
      .map((b, idx) => (idx !== i ? b.selectedBike?.id : null))
      .filter((x): x is number => x != null);
    return this.availableBikes.filter((b) => !otherSelectedIds.includes(b.id));
  }

  addBike() {
    for (const b of this.bikes) {
      if (b.selectedBike || b.isQuickAddMode) b.isCollapsed = true;
    }
    this.bikes.push(createEmptyBikeEntry());
  }

  removeBike(i: number) {
    if (this.bikes.length <= 1) return;
    const b = this.bikes[i];
    if (b?.isExisting && b.rentalBikeId != null) {
      this.removedExistingBikeIds.push(b.rentalBikeId);
    }
    this.bikes.splice(i, 1);
  }

  toggleCollapse(i: number) {
    this.bikes[i].isCollapsed = !this.bikes[i].isCollapsed;
  }

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

  onRahmennummerChange(i: number, value: string) {
    const b = this.bikes[i];
    if (!b) return;
    b.rahmenSearchResults = [];
    if (b.rahmenSearchTimeout) clearTimeout(b.rahmenSearchTimeout);
    if (!value || value.trim().length < 2) {
      b.showRahmenDropdown = false;
      return;
    }
    b.rahmenSearchTimeout = setTimeout(() => {
      this.bicycleService.search(value.trim()).subscribe({
        next: (bikes) => {
          const otherSelected = this.bikes
            .map((x, idx) => (idx !== i ? x.selectedBike?.id : null))
            .filter((x): x is number => x != null);
          b.rahmenSearchResults = bikes.filter(
            (bk) =>
              bk.status !== 'Sold' &&
              !otherSelected.includes(bk.id) &&
              bk.rahmennummer
                ?.toUpperCase()
                .includes(value.trim().toUpperCase()),
          );
          b.showRahmenDropdown = b.rahmenSearchResults.length > 0;
        },
        error: () => {},
      });
    }, 300);
  }

  hideRahmenDropdown(i: number) {
    setTimeout(() => {
      const b = this.bikes[i];
      if (b) b.showRahmenDropdown = false;
    }, 200);
  }

  selectRahmenBike(i: number, bike: Bicycle) {
    const b = this.bikes[i];
    if (!b) return;
    b.showRahmenDropdown = false;
    b.rahmenSearchResults = [];
    this.onBikeSelected(i, bike);
  }

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
    return this.combinedBusyPeriods.some((p) => {
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
    // Sonntage werden im Client (Mietvertrag) nicht gesperrt – nur Feiertage.
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
    const overlaps = this.combinedBusyPeriods.some((p) => {
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
    this.availableBikes = [];
    this.bikes = [createEmptyBikeEntry()];
    this.rentalDays = 0;
  }

  private loadBusyPeriodsFor(i: number, bikeId: number) {
    const b = this.bikes[i];
    if (!b) return;
    b.busyPeriodsLoading = true;
    b.busyPeriods = [];
    this.bicycleService.getBusyPeriods(bikeId).subscribe({
      next: (periods) => {
        b.busyPeriods = periods;
        b.busyPeriodsLoading = false;
      },
      error: () => {
        b.busyPeriodsLoading = false;
      },
    });
  }

  ngOnInit() {
    this.updateIsMobile();

    this.accessoryService.getActive().subscribe({
      next: (list) => {
        this.availableAccessories = list;
        this.applyAccessoryPrefill();
      },
    });

    this.bicycleService.getBrands().subscribe({
      next: (res) => (this.brands = res),
      error: () => {},
    });
    this.bicycleService.getModels().subscribe({
      next: (res) => (this.models = res),
      error: () => {},
    });

    // ── Edit mode: route param /rentals/edit/:id ──
    const editId = this.route.snapshot.paramMap.get('id');
    if (editId) {
      this.isEditMode = true;
      this.rentalId = Number(editId);
      this.loadRentalForEdit(this.rentalId);
      return;
    }

    const bookingId = this.route.snapshot.queryParamMap.get('bookingId');
    const bicycleIdParam = this.route.snapshot.queryParamMap.get('bicycleId');
    if (bookingId) {
      this.fromBookingId = Number(bookingId);
      this.bookingService.getById(this.fromBookingId).subscribe({
        next: (booking) => {
          this.customer.vorname = booking.vorname;
          this.customer.nachname = booking.nachname;
          this.customer.telefon = booking.telefon || '';
          this.customer.email = booking.email || '';
          this.customer.strasse = booking.strasse || '';
          this.customer.hausnummer = booking.hausNr || '';
          this.customer.plz = booking.plz || '';
          this.customer.stadt = booking.ort || '';
          this.notizen = booking.notizen || '';
          if (booking.ausweisPhotoPath) {
            this.fromBookingAusweisPhotoPath = booking.ausweisPhotoPath;
          }

          if (booking.accessories && booking.accessories.length > 0) {
            this.prefillAccessories = booking.accessories.map((a) => ({
              bezeichnung: a.bezeichnung,
              menge: Math.max(0, Math.floor(Number(a.menge) || 0)),
            }));
            this.applyAccessoryPrefill();
          }

          const allBikes = booking.bikes?.length > 0 ? booking.bikes : null;
          const targetBikeId = bicycleIdParam ? Number(bicycleIdParam) : null;

          if (allBikes && allBikes.length > 1 && !targetBikeId) {
            // Multi-bike booking: use overall min/max dates
            const starts = allBikes.map((bk) => bk.startDatum.split('T')[0]);
            const ends = allBikes.map((bk) => bk.endDatum.split('T')[0]);
            this.startDatum = starts.reduce((a, b) => (a < b ? a : b));
            this.endDatum = ends.reduce((a, b) => (a > b ? a : b));
            this.pickingState = 'start';
            const start = new Date(this.startDatum);
            this.calendarMonth = start.getMonth();
            this.calendarYear = start.getFullYear();

            // Queue all bikes for auto-selection after availability loads
            this.pendingMultiBikes = allBikes.map((bk) => ({
              bikeId: bk.bicycleId,
              srcBike: bk,
              mietpreis: bk.gesamtpreis ?? undefined,
            }));
          } else {
            // Single-bike or targeted bike
            const bookingBike =
              targetBikeId && allBikes
                ? allBikes.find((bk) => bk.bicycleId === targetBikeId)
                : allBikes?.[0];

            const bikeStartDatum = bookingBike?.startDatum ?? booking.startDatum;
            const bikeEndDatum = bookingBike?.endDatum ?? booking.endDatum;
            this.startDatum = bikeStartDatum.split('T')[0];
            this.endDatum = bikeEndDatum.split('T')[0];
            this.pickingState = 'start';
            const start = new Date(this.startDatum);
            this.calendarMonth = start.getMonth();
            this.calendarYear = start.getFullYear();

            const firstBike = this.bikes[0];
            if (bookingBike?.gesamtpreis) {
              firstBike.gesamtmiete = bookingBike.gesamtpreis;
            } else if (booking.gesamtpreis) {
              firstBike.gesamtmiete = booking.gesamtpreis;
            }

            const bikeId = targetBikeId ?? bookingBike?.bicycleId ?? booking.bicycle?.id;
            if (bikeId) {
              this.pendingBikeIdToSelect = bikeId;
              this.pendingBookingBike = bookingBike ?? (booking.bicycle as any);
            }
          }

          this.onDatesChanged(); // triggers loadAvailableForPeriod → auto-selects bike(s)
        },
        error: () => {
          this.notificationService.error('Buchung konnte nicht geladen werden');
        },
      });
    }
  }

  private loadRentalForEdit(id: number) {
    this.rentalService.getById(id).subscribe({
      next: (rental) => this.prefillFromRental(rental),
      error: () => {
        this.notificationService.error('Mietvertrag konnte nicht geladen werden');
        this.router.navigate(['/rentals']);
      },
    });
  }

  private prefillFromRental(rental: Rental) {
    // Mieter
    if (rental.customer) {
      this.customer = {
        vorname: rental.customer.vorname || '',
        nachname: rental.customer.nachname || '',
        strasse: rental.customer.strasse || '',
        hausnummer: rental.customer.hausnummer || '',
        plz: rental.customer.plz || '',
        stadt: rental.customer.stadt || '',
        telefon: rental.customer.telefon || '',
        email: rental.customer.email || '',
      };
    }
    this.mietvertragNummer = rental.mietvertragNummer || '';
    this.notizen = rental.notizen || '';
    this.agbAkzeptiert = rental.agbAkzeptiert || false;
    this.unterschriftOrt = rental.unterschriftOrt || 'Freiburg';
    this.existingSignature = rental.mieterUnterschrift || '';

    // Dates
    if (rental.startDatum) this.startDatum = rental.startDatum.split('T')[0];
    if (rental.endDatum) this.endDatum = rental.endDatum.split('T')[0];
    if (this.startDatum) {
      const start = new Date(this.startDatum);
      this.calendarMonth = start.getMonth();
      this.calendarYear = start.getFullYear();
    }
    this.pickingState = 'start';

    // Bikes → one BikeEntry per existing RentalBike
    this.bikes = rental.bikes.map((rb: RentalBike, idx: number) => {
      const entry = createEmptyBikeEntry();
      entry.rentalBikeId = rb.id;
      entry.isExisting = true;
      entry.originalBicycleId = rb.bicycleId;
      entry.selectedBike = rb.bicycle ?? ({ id: rb.bicycleId } as Bicycle);
      entry.isCollapsed = idx > 0;
      entry.bikeEdit = {
        rahmennummer: rb.rahmennummer || rb.bicycle?.rahmennummer || '',
        marke: rb.bicycle?.marke || '',
        modell: rb.bicycle?.modell || '',
        rahmengroesse: rb.bicycle?.rahmengroesse || '',
        farbe: rb.farbe || rb.bicycle?.farbe || '',
        reifengroesse: rb.bicycle?.reifengroesse || '',
        fahrradtyp: rb.bicycle?.fahrradtyp || '',
        beschreibung: rb.bicycle?.beschreibung || '',
        zustand: rb.bicycle?.zustand || BikeCondition.Gebraucht,
      };
      entry.gesamtmiete = rb.mietpreis;
      entry.kaution = rb.kaution;
      // Rental-level fields live on the first bike (mirrors the create flow)
      entry.rabatt = idx === 0 ? rental.rabatt || 0 : 0;
      entry.zahlungsart = rental.zahlungsart || '';
      entry.kautionZahlungsart = rental.kautionZahlungsart || '';
      return entry;
    });
    if (this.bikes.length === 0) this.bikes = [createEmptyBikeEntry()];

    // Accessories → pre-select the matching catalog items
    this.prefillAccessories = (rental.accessories ?? []).map((a) => ({
      bezeichnung: a.bezeichnung,
      menge: Math.max(0, Math.floor(Number(a.menge) || 0)),
    }));
    this.applyAccessoryPrefill();

    this.recalcDaysAndPrices();
    this.loadAvailableForPeriod();
  }

  private recalcDaysAndPrices() {
    if (this.startDatum && this.endDatum) {
      const start = new Date(this.startDatum);
      const end = new Date(this.endDatum);
      const diffDays = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      this.rentalDays = Math.max(0, diffDays + 1);
    } else {
      this.rentalDays = 0;
    }
    if (this.rentalDays > 0) {
      this.bikes.forEach((_, i) => {
        const b = this.bikes[i];
        if (b.selectedBike) b.berechneterPreis = this.calculatePriceFor(i, this.rentalDays);
      });
    }
  }

  onBikeSelected(i: number, bike: Bicycle) {
    const b = this.bikes[i];
    if (!b) return;
    b.selectedBike = bike;
    b.isQuickAddMode = false;
    b.bikeEdit = {
      rahmennummer: bike.rahmennummer || '',
      marke: bike.marke || '',
      modell: bike.modell || '',
      rahmengroesse: bike.rahmengroesse || '',
      farbe: bike.farbe || '',
      reifengroesse: bike.reifengroesse || '',
      fahrradtyp: bike.fahrradtyp || '',
      beschreibung: bike.beschreibung || '',
      zustand: bike.zustand || BikeCondition.Gebraucht,
    };
    b.bikeErrors = {};
    if (bike.kaution != null) {
      b.kaution = bike.kaution;
    }
    this.loadBusyPeriodsFor(i, bike.id);
    this.recalcPriceFor(i);
  }

  onSelectedBikeUpdated(i: number, bike: Bicycle | null) {
    const b = this.bikes[i];
    if (!b) return;
    b.selectedBike = bike;
    if (!bike) return;
    if (bike.rahmennummer) b.bikeEdit.rahmennummer = bike.rahmennummer;
    if (bike.reifengroesse) b.bikeEdit.reifengroesse = bike.reifengroesse;
    if (bike.fahrradtyp) b.bikeEdit.fahrradtyp = bike.fahrradtyp;
    if (bike.rahmengroesse) b.bikeEdit.rahmengroesse = bike.rahmengroesse;
    if (bike.farbe) b.bikeEdit.farbe = bike.farbe;
    if (bike.marke) b.bikeEdit.marke = bike.marke;
    if (bike.modell) b.bikeEdit.modell = bike.modell;
    if (bike.kaution != null) b.kaution = bike.kaution;
    if (this.rentalDays > 0) {
      b.berechneterPreis = this.calculatePriceFor(i, this.rentalDays);
    }
  }

  onQuickAddBike(i: number) {
    const b = this.bikes[i];
    if (!b) return;
    b.isQuickAddMode = true;
    b.selectedBike = null;
    b.busyPeriods = [];
    b.bikeEdit = {
      rahmennummer: '',
      marke: '',
      modell: '',
      rahmengroesse: '',
      farbe: '',
      reifengroesse: '',
      fahrradtyp: '',
      beschreibung: '',
      zustand: BikeCondition.Gebraucht,
    };
    b.bikeErrors = {};
    b.rahmenSearchResults = [];
    b.showRahmenDropdown = false;
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
    switch (key) {
      case 'helm':
        return n.includes('helm');
      case 'schloss':
        return n.includes('schloss');
      case 'korb':
        return n.includes('korb');
      case 'reparaturset':
        return n.includes('reparatur') || n.includes('tamir') || n.includes('repair');
      case 'licht':
        return n.includes('licht') || n.includes('light') || n.includes('lampe');
      case 'handyhalter':
        return n.includes('handy');
    }
  }

  private getDefaultAccessoryLabel(key: PredefinedAccessoryKey): string {
    return this.accessoryLabels[key];
  }

  private buildAccessoryFromKey(
    key: PredefinedAccessoryKey,
    menge: number,
  ): AccessoryLine {
    const found = this.availableAccessories.find((a) =>
      this.matchesAccessoryKey(a.bezeichnung, key),
    );

    return {
      rentalAccessoryId: found?.id,
      bezeichnung: found?.bezeichnung || this.getDefaultAccessoryLabel(key),
      tagespreis: found?.tagespreis || 0,
      verlustgebuehr: found?.verlustgebuehr ?? 30,
      menge,
    };
  }

  recalcPriceFor(i: number) {
    const b = this.bikes[i];
    if (!b) return;
    if (this.rentalDays > 0) {
      b.berechneterPreis = this.calculatePriceFor(i, this.rentalDays);
      b.gesamtmiete = Math.max(0, b.berechneterPreis - (b.rabatt || 0));
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
    this.rentalDays = Math.max(0, diffDays + 1);
    if (this.rentalDays > 0) {
      this.bikes.forEach((_, i) => this.recalcPriceFor(i));
    }
    this.loadAvailableForPeriod();
  }

  private loadAvailableForPeriod() {
    this.availabilityLoading = true;
    this.bicycleService.getAvailableForPeriod(this.startDatum, this.endDatum).subscribe({
      next: (bikes) => {
        // In edit mode the rental's own bikes are "Rented" and won't be returned
        // by the availability endpoint — re-add them so they stay selectable.
        const extra = this.bikes
          .map((b) => b.selectedBike)
          .filter((sb): sb is Bicycle => !!sb && sb.id != null && !bikes.some((x) => x.id === sb.id));
        this.availableBikes = extra.length > 0 ? [...bikes, ...extra] : bikes;
        this.availabilityLoading = false;

        if (this.pendingMultiBikes.length > 0) {
          const pending = this.pendingMultiBikes;
          this.pendingMultiBikes = [];

          // Ensure we have enough bike slots
          while (this.bikes.length < pending.length) {
            this.bikes.push(createEmptyBikeEntry());
          }

          pending.forEach((entry, i) => {
            const match = bikes.find((b) => b.id === entry.bikeId);
            if (match) {
              if (i > 0) this.bikes[i - 1].isCollapsed = true;
              this.onBikeSelected(i, match);
              if (entry.mietpreis) this.bikes[i].gesamtmiete = entry.mietpreis;
            } else if (entry.srcBike) {
              const slot = this.bikes[i];
              slot.isQuickAddMode = false;
              slot.selectedBike = { id: entry.bikeId } as Bicycle;
              slot.bikeEdit = {
                rahmennummer: '',
                marke: entry.srcBike.marke || '',
                modell: entry.srcBike.modell || '',
                rahmengroesse: entry.srcBike.rahmengroesse || '',
                farbe: entry.srcBike.farbe || '',
                reifengroesse: '',
                fahrradtyp: '',
                beschreibung: '',
                zustand: BikeCondition.Gebraucht,
              };
              if (entry.mietpreis) slot.gesamtmiete = entry.mietpreis;
              if (entry.srcBike.kaution != null) slot.kaution = entry.srcBike.kaution;
              this.loadBusyPeriodsFor(i, entry.bikeId);
            }
          });
        } else if (this.pendingBikeIdToSelect != null) {
          const match = bikes.find((b) => b.id === this.pendingBikeIdToSelect);
          const bikeId = this.pendingBikeIdToSelect;
          const srcBike = this.pendingBookingBike;
          this.pendingBikeIdToSelect = null;
          this.pendingBookingBike = null;
          if (match) {
            this.onBikeSelected(0, match);
          } else if (srcBike) {
            const firstBike = this.bikes[0];
            firstBike.isQuickAddMode = false;
            firstBike.selectedBike = { id: srcBike.bicycleId ?? srcBike.id } as Bicycle;
            firstBike.bikeEdit = {
              rahmennummer: '',
              marke: srcBike.marke || '',
              modell: srcBike.modell || '',
              rahmengroesse: srcBike.rahmengroesse || '',
              farbe: srcBike.farbe || '',
              reifengroesse: srcBike.reifengroesse || '',
              fahrradtyp: srcBike.fahrradtyp || '',
              beschreibung: srcBike.beschreibung || '',
              zustand: srcBike.zustand || BikeCondition.Gebraucht,
            };
            this.loadBusyPeriodsFor(0, bikeId!);
          }
        }
      },
      error: () => {
        this.availabilityLoading = false;
      },
    });
  }

  onRabattChanged(i: number) {
    const b = this.bikes[i];
    if (!b) return;
    if (b.berechneterPreis > 0)
      b.gesamtmiete = Math.max(0, b.berechneterPreis - (b.rabatt || 0));
  }

  calculatePriceFor(i: number, days: number): number {
    const b = this.bikes[i];
    if (!b) return 0;
    const config = b.selectedBike;
    if (!config) {
      b.preisInfo = '';
      return 0;
    }
    const result = calculateRentalPrice(config, days);
    b.preisInfo = result.info;
    return result.total ?? 0;
  }

  submit() {
    if (this.submitting) return;

    for (let i = 0; i < this.bikes.length; i++) {
      const b = this.bikes[i];
      if (!b.selectedBike && !b.isQuickAddMode) {
        this.notificationService.error(
          `Fahrrad ${i + 1}: bitte auswählen oder neu anlegen`,
        );
        return;
      }
      if (b.isQuickAddMode || b.selectedBike) {
        b.bikeErrors = {};
        if (b.isQuickAddMode && !b.bikeEdit.rahmennummer) b.bikeErrors['rahmennummer'] = true;
        if (!b.bikeEdit.marke) b.bikeErrors['marke'] = true;
        if (Object.values(b.bikeErrors).some((v) => v)) {
          this.notificationService.error(
            `Fahrrad ${i + 1}: Rahmennummer und Marke ausfüllen`,
          );
          return;
        }
      }
    }

    if (!this.agbAkzeptiert) {
      this.notificationService.error('Bitte die AGB akzeptieren.');
      if (this.isMobile) this.currentStep = this.totalSteps - 1;
      return;
    }
    // In edit mode the existing signature is kept if no new one is drawn.
    if (!this.mieterUnterschrift && !(this.isEditMode && this.existingSignature)) {
      this.notificationService.error('Bitte die Unterschrift des Mieters erfassen.');
      if (this.isMobile) this.currentStep = this.totalSteps - 1;
      return;
    }

    if (this.isEditMode) {
      this.submitEdit();
      return;
    }

    this.submitting = true;

    const bikeIdResolves = this.bikes.map((b) => {
      if (b.isQuickAddMode) {
        return this.bicycleService
          .create({
            rahmennummer: b.bikeEdit.rahmennummer.toUpperCase(),
            marke: b.bikeEdit.marke,
            modell: b.bikeEdit.modell,
            rahmengroesse: b.bikeEdit.rahmengroesse || undefined,
            farbe: b.bikeEdit.farbe || undefined,
            reifengroesse: b.bikeEdit.reifengroesse || undefined,
            fahrradtyp: b.bikeEdit.fahrradtyp || undefined,
            beschreibung: b.bikeEdit.beschreibung || undefined,
            status: 'Available',
            zustand: b.bikeEdit.zustand || BikeCondition.Gebraucht,
            isRentable: false,
          } as any)
          .pipe(map((bike) => bike.id));
      }
      const sel = b.selectedBike!;
      const bikeUpdate: BicycleUpdate = {
        marke: b.bikeEdit.marke,
        modell: b.bikeEdit.modell,
        rahmennummer: b.bikeEdit.rahmennummer || undefined,
        rahmengroesse: b.bikeEdit.rahmengroesse || undefined,
        farbe: b.bikeEdit.farbe || undefined,
        reifengroesse: b.bikeEdit.reifengroesse || '',
        fahrradtyp: b.bikeEdit.fahrradtyp || undefined,
        beschreibung: b.bikeEdit.beschreibung || undefined,
        status: sel.status as any,
        zustand: b.bikeEdit.zustand || (sel.zustand || 'Gebraucht') as BikeCondition,
        isRentable: sel.isRentable,
        rentalPriceDay1: sel.rentalPriceDay1,
        rentalPriceDay2: sel.rentalPriceDay2,
        rentalPriceDay3: sel.rentalPriceDay3,
        rentalPriceDay4: sel.rentalPriceDay4,
        rentalPriceDay5: sel.rentalPriceDay5,
        rentalPriceDay6: sel.rentalPriceDay6,
        rentalPriceDay7: sel.rentalPriceDay7,
        rentalPriceAdditionalDayAfter7: sel.rentalPriceAdditionalDayAfter7,
      };
      return this.bicycleService
        .update(sel.id, bikeUpdate)
        .pipe(map(() => sel.id));
    });

    const accessoriesPayload: RentalAccessoryItemCreate[] =
      this.buildCatalogAccessories();

    forkJoin(bikeIdResolves)
      .pipe(
        switchMap((bicycleIds: number[]) => {
          // Use the first bike's payment methods as the rental-level defaults
          const firstBike = this.bikes[0];
          const payload: RentalCreate = {
            customer: this.customer,
            rabatt: firstBike.rabatt || 0,
            zahlungsart: firstBike.zahlungsart as PaymentMethod,
            kautionZahlungsart: firstBike.kautionZahlungsart as PaymentMethod,
            notizen: this.notizen || undefined,
            accessories:
              accessoriesPayload.length > 0 ? accessoriesPayload : undefined,
            mieterUnterschrift: this.mieterUnterschrift || undefined,
            agbAkzeptiert: this.agbAkzeptiert,
            unterschriftOrt: this.unterschriftOrt || undefined,
            ausweisPhotoPath: this.fromBookingAusweisPhotoPath,
            bikes: this.bikes.map((b, i) => ({
              bicycleId: bicycleIds[i],
              rahmennummer: b.bikeEdit?.rahmennummer || undefined,
              farbe: b.bikeEdit?.farbe || undefined,
              startDatum: this.startDatum,
              endDatum: this.endDatum,
              mietpreis: b.gesamtmiete,
              kaution: b.kaution,
              zustandBeiUebergabe:
                b.zustandBeiUebergabe as BikeConditionAtHandover,
            })),
          };
          return this.rentalService.create(payload);
        }),
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            this.bikes.length > 1
              ? 'Vermietung mit mehreren Fahrrädern angelegt'
              : 'Vermietung erfolgreich angelegt',
          );
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

  /** Creates (quick-add) or updates the underlying Bicycle and yields its id. */
  private resolveBicycleId(b: BikeEntry): Observable<number> {
    if (b.isQuickAddMode) {
      return this.bicycleService
        .create({
          rahmennummer: b.bikeEdit.rahmennummer.toUpperCase(),
          marke: b.bikeEdit.marke,
          modell: b.bikeEdit.modell,
          rahmengroesse: b.bikeEdit.rahmengroesse || undefined,
          farbe: b.bikeEdit.farbe || undefined,
          reifengroesse: b.bikeEdit.reifengroesse || undefined,
          fahrradtyp: b.bikeEdit.fahrradtyp || undefined,
          beschreibung: b.bikeEdit.beschreibung || undefined,
          status: 'Available',
          zustand: b.bikeEdit.zustand || BikeCondition.Gebraucht,
          isRentable: false,
        } as any)
        .pipe(map((bike) => bike.id));
    }
    const sel = b.selectedBike;
    if (!sel) return of(0);
    const bikeUpdate: BicycleUpdate = {
      marke: b.bikeEdit.marke,
      modell: b.bikeEdit.modell,
      rahmennummer: b.bikeEdit.rahmennummer || undefined,
      rahmengroesse: b.bikeEdit.rahmengroesse || undefined,
      farbe: b.bikeEdit.farbe || undefined,
      reifengroesse: b.bikeEdit.reifengroesse || '',
      fahrradtyp: b.bikeEdit.fahrradtyp || undefined,
      beschreibung: b.bikeEdit.beschreibung || undefined,
      status: sel.status as any,
      zustand: b.bikeEdit.zustand || ((sel.zustand || 'Gebraucht') as BikeCondition),
      isRentable: sel.isRentable,
      rentalPriceDay1: sel.rentalPriceDay1,
      rentalPriceDay2: sel.rentalPriceDay2,
      rentalPriceDay3: sel.rentalPriceDay3,
      rentalPriceDay4: sel.rentalPriceDay4,
      rentalPriceDay5: sel.rentalPriceDay5,
      rentalPriceDay6: sel.rentalPriceDay6,
      rentalPriceDay7: sel.rentalPriceDay7,
      rentalPriceAdditionalDayAfter7: sel.rentalPriceAdditionalDayAfter7,
    };
    return this.bicycleService.update(sel.id, bikeUpdate).pipe(map(() => sel.id));
  }

  private submitEdit() {
    if (!this.rentalId) return;
    this.submitting = true;

    const accessoriesPayload: RentalAccessoryItemCreate[] =
      this.buildCatalogAccessories();

    const resolves = this.bikes.map((b) =>
      this.resolveBicycleId(b).pipe(map((bicycleId) => ({ b, bicycleId }))),
    );

    forkJoin(resolves)
      .pipe(
        switchMap((results) => {
          const firstBike = this.bikes[0];
          const existingBikes: RentalBikeUpdate[] = [];
          const newBikes: RentalBikeCreate[] = [];

          for (const { b, bicycleId } of results) {
            if (b.isExisting && b.rentalBikeId != null) {
              existingBikes.push({
                id: b.rentalBikeId,
                bicycleId: bicycleId !== b.originalBicycleId ? bicycleId : undefined,
                rahmennummer: b.bikeEdit.rahmennummer || undefined,
                farbe: b.bikeEdit.farbe || undefined,
                mietpreis: b.gesamtmiete,
                kaution: b.kaution,
              });
            } else {
              newBikes.push({
                bicycleId,
                rahmennummer: b.bikeEdit.rahmennummer || undefined,
                farbe: b.bikeEdit.farbe || undefined,
                startDatum: this.startDatum,
                endDatum: this.endDatum,
                mietpreis: b.gesamtmiete,
                kaution: b.kaution,
                zustandBeiUebergabe: b.zustandBeiUebergabe as BikeConditionAtHandover,
              });
            }
          }

          const update: RentalUpdate = {
            customer: this.customer,
            mietvertragNummer: this.mietvertragNummer?.trim() || undefined,
            startDatum: this.startDatum,
            endDatum: this.endDatum,
            rabatt: firstBike.rabatt || 0,
            zahlungsart: firstBike.zahlungsart as PaymentMethod,
            kautionZahlungsart: firstBike.kautionZahlungsart as PaymentMethod,
            notizen: this.notizen || undefined,
            mieterUnterschrift: this.mieterUnterschrift || undefined,
            agbAkzeptiert: this.agbAkzeptiert,
            unterschriftOrt: this.unterschriftOrt || undefined,
            bikes: existingBikes.length > 0 ? existingBikes : undefined,
            newBikes: newBikes.length > 0 ? newBikes : undefined,
            removeBikeIds:
              this.removedExistingBikeIds.length > 0 ? this.removedExistingBikeIds : undefined,
            accessories: accessoriesPayload,
          };
          return this.rentalService.update(this.rentalId!, update);
        }),
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Änderungen gespeichert');
          this.router.navigate(['/rentals', this.rentalId!]);
        },
        error: (err) => {
          this.submitting = false;
          this.notificationService.error(
            err.error?.error || 'Fehler beim Speichern der Änderungen',
          );
        },
      });
  }
}
