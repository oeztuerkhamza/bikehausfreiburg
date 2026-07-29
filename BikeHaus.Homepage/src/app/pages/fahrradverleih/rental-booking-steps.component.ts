import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';
import {
  PublicRentalBicycle,
  RentalBikeImage,
  RentalBookingCreate,
  RentalBookingBikeCreate,
  RentalAccessoryPublic,
  RentalBookingAccessoryCreate,
} from '../../models/models';
import { calculateRentalPrice } from '../../utils/rental-pricing';
import {
  isClosureDay,
  rangeOverlapsClosure,
} from '../../utils/rental-closures';
import { LOCALE_BY_LANGUAGE } from '../../services/language-config';

interface CartBike {
  bike: PublicRentalBicycle;
  rahmennummer?: string;
  farbe?: string;
  kaution?: number;
  calculatedPrice?: number;
}

type BookingStep =
  | 'date-selection'
  | 'bike-selection'
  | 'bike-details'
  | 'choose-next'
  | 'accessory-selection'
  | 'customer-info'
  | 'review'
  | 'success';

const BOOKING_STEPS: readonly BookingStep[] = [
  'date-selection',
  'bike-selection',
  'bike-details',
  'choose-next',
  'accessory-selection',
  'customer-info',
  'review',
  'success',
];

/** Which of the 5 indicator positions a step belongs to. */
const INDICATOR_INDEX: Record<BookingStep, number> = {
  'date-selection': 1,
  'bike-selection': 2,
  'bike-details': 2,
  'choose-next': 2,
  'accessory-selection': 3,
  'customer-info': 4,
  review: 5,
  success: 6,
};

@Component({
  selector: 'app-rental-booking-steps',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="rental-booking-steps-container">
      <!-- Step Indicator (sticky — the process flow stays visible at all times) -->
      <div class="steps-indicator">
        <div
          class="step"
          *ngFor="let label of stepLabels(); let i = index"
          [class.active]="indicatorIndex() === i + 1"
          [class.done]="indicatorIndex() > i + 1"
        >
          <span class="step-num">
            <ng-container *ngIf="indicatorIndex() > i + 1; else numTpl"
              >✓</ng-container
            >
            <ng-template #numTpl>{{ i + 1 }}</ng-template>
          </span>
          <span class="step-label">{{ label }}</span>
        </div>
      </div>

      <!-- Step 1: Date Selection -->
      <div *ngIf="currentStep() === 'date-selection'" class="step-container">
        <h2>
          {{ t().rentalSteps?.selectDates ?? 'Wählen Sie einen Zeitraum' }}
        </h2>
        <div class="closure-notice" *ngIf="closureNotice()" role="note">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{{ closureNotice() }}</span>
        </div>
        <div class="calendar-shell" id="rental-calendar">
          <div class="calendar-header">
            <button
              type="button"
              class="calendar-nav"
              (click)="prevCalendarMonth()"
              [attr.aria-label]="
                t().rentalSteps?.previousMonth ?? 'Vorheriger Monat'
              "
            >
              ‹
            </button>
            <div class="calendar-month-label">{{ calendarMonthLabel() }}</div>
            <button
              type="button"
              class="calendar-nav"
              (click)="nextCalendarMonth()"
              [attr.aria-label]="t().rentalSteps?.nextMonth ?? 'Nächster Monat'"
            >
              ›
            </button>
          </div>

          <p class="calendar-hint">
            {{
              t().rentalSteps?.calendarHint ??
                'Wählen Sie zuerst den Starttermin und dann den Endtermin. Sonntage sind geschlossen; Feiertage bitte vorab per WhatsApp anfragen.'
            }}
          </p>

          <!-- Live selection state — makes it obvious what to tap next -->
          <p class="selection-hint" *ngIf="!selectedStartDate">
            {{
              t().rentalSteps?.chooseStartDate ?? 'Bitte Starttermin antippen'
            }}
          </p>
          <p
            class="selection-hint"
            *ngIf="selectedStartDate && !selectedEndDate"
          >
            {{
              t().rentalSteps?.chooseEndDate ?? 'Jetzt den Endtermin antippen'
            }}
          </p>

          <div class="calendar-weekdays">
            <div
              *ngFor="let weekday of weekdayLabels()"
              class="calendar-weekday"
            >
              {{ weekday }}
            </div>
          </div>

          <div class="calendar-grid">
            <ng-container *ngFor="let week of calendarWeeks()">
              <button
                *ngFor="let day of week"
                type="button"
                class="calendar-day"
                [class.is-empty]="!day"
                [class.is-start]="day && isCalendarStart(day)"
                [class.is-end]="day && isCalendarEnd(day)"
                [class.in-range]="day && isCalendarInRange(day)"
                [class.is-today]="day && isToday(day)"
                [class.is-closed]="day && !isSelectableCalendarDay(day)"
                [disabled]="!day || !isSelectableCalendarDay(day)"
                (click)="day && selectCalendarDay(day)"
              >
                <span *ngIf="day">{{ day.getDate() }}</span>
              </button>
            </ng-container>
          </div>
        </div>

        <div
          class="selected-range-summary"
          [class.is-complete]="selectedStartDate && selectedEndDate"
        >
          <div>
            <strong>{{ t().rentalSteps?.startDate ?? 'Startdatum' }}:</strong>
            <span>{{
              selectedStartDate ? formatDisplayDate(selectedStartDate) : '—'
            }}</span>
          </div>
          <div>
            <strong>{{ t().rentalSteps?.endDate ?? 'Enddatum' }}:</strong>
            <span>{{
              selectedEndDate ? formatDisplayDate(selectedEndDate) : '—'
            }}</span>
          </div>
          <div *ngIf="daysCount() > 0" class="range-days">
            <strong>{{ daysCount() }}</strong>
            {{
              daysCount() === 1
                ? (t().rentalSteps?.day ?? 'Tag')
                : (t().rentalSteps?.days ?? 'Tage')
            }}
          </div>
        </div>
        <button
          (click)="proceedToBikeSelection()"
          class="btn-primary"
          [disabled]="!selectedStartDate || !selectedEndDate"
        >
          {{ t().rentalSteps?.continue ?? 'Weiter' }}
        </button>
        <div *ngIf="dateRangeError()" class="error-message">
          {{ dateRangeError() }}
        </div>
      </div>

      <!-- Step 2: Bike Selection (filtered by availability) -->
      <div *ngIf="currentStep() === 'bike-selection'" class="step-container">
        <h2>{{ t().rentalSteps?.selectBike ?? 'Wählen Sie ein Fahrrad' }}</h2>
        <p class="date-range-display">
          {{ formatDisplayDate(selectedStartDate) }}
          {{ t().rentalSteps?.to ?? 'bis' }}
          {{ formatDisplayDate(selectedEndDate) }} ({{ daysCount() }}
          {{ t().rentalSteps?.days ?? 'Tage' }})
        </p>

        <div *ngIf="loadingAvailableBikes()" class="loading">
          {{ t().rentalSteps?.loading ?? 'Laden...' }}
        </div>

        <div
          *ngIf="!loadingAvailableBikes() && selectableBikes().length === 0"
          class="no-bikes"
        >
          {{
            t().rentalSteps?.noBikesAvailable ??
              'Keine Fahrräder für diesen Zeitraum verfügbar'
          }}
        </div>

        <!-- Anzahl + Typ-Filter: eine lange, ungefilterte Liste ist der Punkt,
             an dem Gäste am ehesten aussteigen. Die Filter entstehen aus den
             tatsächlich verfügbaren Rädern, es gibt also nie eine leere Auswahl. -->
        <div
          *ngIf="!loadingAvailableBikes() && selectableBikes().length > 0"
          class="bike-filter-bar"
        >
          <div class="bike-filter-chips">
            <button
              type="button"
              class="filter-chip"
              [class.active]="bikeTypeFilter() === 'all'"
              (click)="bikeTypeFilter.set('all')"
            >
              {{ t().rentalSteps?.filterAll ?? 'Alle' }}
              <span class="chip-count">{{ selectableBikes().length }}</span>
            </button>
            <button
              type="button"
              class="filter-chip"
              *ngFor="let group of bikeTypeGroups()"
              [class.active]="bikeTypeFilter() === group.key"
              (click)="bikeTypeFilter.set(group.key)"
            >
              {{ group.label }}
              <span class="chip-count">{{ group.count }}</span>
            </button>
          </div>
        </div>

        <div
          *ngIf="!loadingAvailableBikes() && filteredBikes().length > 0"
          class="bike-grid"
        >
          <div
            *ngFor="let bike of filteredBikes()"
            (click)="selectBikeForDetails(bike)"
            class="bike-card"
          >
            <div class="bike-image">
              <img
                *ngIf="getMainImage(bike)"
                [src]="getImageUrl(getMainImage(bike)?.filePath)"
                [alt]="bike.modell"
              />
            </div>
            <div class="bike-info">
              <h3>{{ bike.marke }} {{ bike.modell }}</h3>
              <p class="bike-type">{{ bike.art || bike.fahrradtyp }}</p>
              <!-- Kurz genug, um auch auf dem Handy zu bleiben (dort ist die
                   ausführliche Spec-Liste ausgeblendet) und die wichtigste
                   Frage bei der Auswahl: passt das Rad zu mir? -->
              <p class="bike-size" *ngIf="riderHeight(bike)">
                {{ t().rentalSteps?.riderHeight ?? 'Körpergröße' }}:
                {{ riderHeight(bike) }}
              </p>
              <!-- Die Größe ist bei der Auswahl genauso wichtig wie der Name,
                   also steht sie auf jeder Kachel – auch auf dem Handy. Gezeigt
                   wird nur das Maß, der ausführliche Satz aus den Stammdaten
                   steht in der Detailansicht. -->
              <ul class="bike-specs-inline">
                <li *ngIf="shortSize(bike.rahmengroesse)">
                  <span class="spec-label"
                    >{{ t().rentalSteps?.frameSize ?? 'Rahmengröße' }}:</span
                  >
                  {{ shortSize(bike.rahmengroesse) }}
                </li>
                <li *ngIf="shortSize(bike.reifengroesse)">
                  <span class="spec-label"
                    >{{ t().rentalSteps?.tireSize ?? 'Reifengröße' }}:</span
                  >
                  {{ shortSize(bike.reifengroesse) }}
                </li>
              </ul>
              <!-- Der Zeitraum steht bereits fest, also den Preis für genau
                   diesen Zeitraum zeigen statt "ab X €/Tag": bisher musste man
                   jedes Rad öffnen, um zu erfahren, was es wirklich kostet. -->
              <p class="bike-price" *ngIf="daysCount() > 0">
                <strong>{{ formatPrice(calculatePrice(bike, daysCount())) }}</strong>
                <span class="price-period">
                  {{ t().rentalSteps?.forDays ?? 'für' }} {{ daysCount() }}
                  {{
                    daysCount() === 1
                      ? (t().rentalSteps?.day ?? 'Tag')
                      : (t().rentalSteps?.days ?? 'Tage')
                  }}
                </span>
              </p>
              <p class="bike-deposit" *ngIf="bike.kaution">
                {{ t().rentalSteps?.deposit ?? 'Kaution' }}:
                {{ formatPrice(bike.kaution) }}
              </p>
              <span class="bike-info-spacer" aria-hidden="true"></span>
              <!-- Visible affordance; click bubbles to the card handler -->
              <button type="button" class="btn-select-bike">
                {{ t().rentalSteps?.selectThisBike ?? 'Auswählen' }} →
              </button>
            </div>
          </div>
        </div>

        <!-- Der Zurück-Knopf stand im Grid und wurde dadurch wie eine weitere
             Fahrradkachel zwischen die Räder gesetzt. -->
        <div
          class="selection-actions"
          *ngIf="!loadingAvailableBikes() && selectableBikes().length > 0"
        >
          <button (click)="goToStep('date-selection')" class="btn-secondary">
            {{ t().rentalSteps?.back ?? 'Zurück' }}
          </button>
        </div>
      </div>

      <!-- Step 3: Bike Details -->
      <div
        *ngIf="currentStep() === 'bike-details' && selectedBike()"
        class="step-container"
      >
        <h2>{{ selectedBike()!.marke }} {{ selectedBike()!.modell }}</h2>
        <div class="bike-details">
          <div class="bike-images">
            <button
              *ngIf="getMainImage(selectedBike()!)"
              type="button"
              class="main-image-zoom"
              (click)="openLightbox()"
              [attr.aria-label]="
                t().rentalSteps?.zoomImage ?? 'Bild vergrößern'
              "
            >
              <img
                [src]="getImageUrl(getMainImage(selectedBike()!)?.filePath)"
                [alt]="selectedBike()!.modell"
                class="main-image"
              />
              <span class="zoom-badge" aria-hidden="true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </span>
            </button>
            <div
              class="image-thumbnails"
              *ngIf="getImages(selectedBike()!).length > 1"
            >
              <img
                *ngFor="let img of getImages(selectedBike()!)"
                [src]="getImageUrl(img.filePath)"
                (click)="
                  currentImageIndex.set(getImages(selectedBike()!).indexOf(img))
                "
                [class.active]="
                  currentImageIndex() ===
                  getImages(selectedBike()!).indexOf(img)
                "
                class="thumbnail"
              />
            </div>
          </div>

          <div class="bike-specs">
            <div class="spec" *ngIf="selectedBike()!.fahrradtyp">
              <strong>{{ t().rentalSteps?.type ?? 'Typ' }}:</strong>
              {{ selectedBike()!.fahrradtyp }}
            </div>
            <div class="spec" *ngIf="riderHeight(selectedBike()!)">
              <strong
                >{{ t().rentalSteps?.riderHeight ?? 'Körpergröße' }}:</strong
              >
              {{ riderHeight(selectedBike()!) }}
            </div>
            <div class="spec" *ngIf="selectedBike()!.rahmengroesse">
              <strong
                >{{ t().rentalSteps?.frameSize ?? 'Rahmengröße' }}:</strong
              >
              {{ selectedBike()!.rahmengroesse }}
            </div>
            <div class="spec" *ngIf="selectedBike()!.reifengroesse">
              <strong>{{ t().rentalSteps?.tireSize ?? 'Reifengröße' }}:</strong>
              {{ selectedBike()!.reifengroesse }}
            </div>
            <div class="spec" *ngIf="selectedBike()!.farbe">
              <strong>{{ t().rentalSteps?.color ?? 'Farbe' }}:</strong>
              {{ selectedBike()!.farbe }}
            </div>
            <div class="spec" *ngIf="selectedBike()!.beschreibung">
              <strong
                >{{ t().rentalSteps?.description ?? 'Beschreibung' }}:</strong
              >
              {{ selectedBike()!.beschreibung }}
            </div>

            <div class="price-info">
              <p class="total-price">
                <strong
                  >{{ t().rentalSteps?.totalRental ?? 'Mietbetrag' }}:</strong
                >
                €{{ calculatePrice(selectedBike()!, daysCount()) }}
              </p>
              <p class="deposit-info">
                <strong>{{ t().rentalSteps?.deposit ?? 'Kaution' }}:</strong>
                €{{ selectedBike()!.kaution || 300 }}
              </p>
            </div>
          </div>
        </div>

        <div class="booking-actions">
          <button (click)="addBikeToCart()" class="btn-primary">
            {{ t().rentalSteps?.addToCart ?? 'Zur Buchung hinzufügen' }}
          </button>
          <button (click)="goToStep('bike-selection')" class="btn-secondary">
            {{ t().rentalSteps?.selectDifferent ?? 'Anderes Fahrrad wählen' }}
          </button>
        </div>
      </div>

      <!-- Step 3b: Choose next action (continue to checkout OR add another bike) -->
      <div
        *ngIf="currentStep() === 'choose-next'"
        class="step-container choose-next-container"
      >
        <h2>
          {{ t().rentalSteps?.bikeAdded ?? 'Fahrrad zur Buchung hinzugefügt' }}
        </h2>

        <div class="cart-summary">
          <p class="cart-count">
            <strong>{{ cartBikes().length }}</strong>
            {{
              cartBikes().length === 1
                ? (t().rentalSteps?.bikeInCart ?? 'Fahrrad in der Buchung')
                : (t().rentalSteps?.bikesInCart ?? 'Fahrräder in der Buchung')
            }}
          </p>
          <ul class="cart-list">
            <li *ngFor="let item of cartBikes()" class="cart-list-item">
              <span>{{ item.bike.marke }} {{ item.bike.modell }}</span>
              <span class="item-price">€{{ item.calculatedPrice }}</span>
            </li>
          </ul>
          <p class="cart-total">
            <strong
              >{{ t().rentalSteps?.totalRental ?? 'Gesamtmiete' }}:</strong
            >
            €{{ getTotalPrice() }}
          </p>
        </div>

        <div class="choose-next-actions">
          <button (click)="goToAccessoryStep()" class="btn-primary">
            {{ t().rentalSteps?.continueToBooking ?? 'Mit Buchung fortfahren' }}
          </button>
          <button (click)="goToStep('bike-selection')" class="btn-secondary">
            {{
              t().rentalSteps?.addAnotherBike ?? '+ Weiteres Fahrrad hinzufügen'
            }}
          </button>
        </div>
      </div>

      <!-- Step 3c: Accessory Selection (optional add-ons) -->
      <div
        *ngIf="currentStep() === 'accessory-selection'"
        class="step-container"
      >
        <h2>{{ t().rentalSteps?.accessoryTitle ?? 'Zubehör hinzufügen' }}</h2>
        <p class="accessory-intro">
          {{
            t().rentalSteps?.accessorySubtitle ??
              'Optionales Zubehör für Ihre Miete (Preis pro Tag).'
          }}
        </p>

        <div *ngIf="loadingAccessories()" class="accessory-loading">
          {{ t().rentalSteps?.loading ?? 'Laden...' }}
        </div>

        <div
          *ngIf="!loadingAccessories() && accessories().length === 0"
          class="accessory-empty"
        >
          {{ t().rentalSteps?.accessoryNone ?? 'Kein Zubehör verfügbar.' }}
        </div>

        <div class="accessory-grid" *ngIf="accessories().length > 0">
          <div
            *ngFor="let acc of accessories()"
            class="accessory-card"
            [class.selected]="accessoryQty(acc.id) > 0"
          >
            <div class="accessory-photo">
              <img
                *ngIf="acc.bildPfad"
                [src]="getImageUrl(acc.bildPfad)"
                [alt]="acc.bezeichnung"
              />
              <div *ngIf="!acc.bildPfad" class="accessory-photo-empty">🚲</div>
            </div>
            <div class="accessory-body">
              <h3>{{ acc.bezeichnung }}</h3>
              <p *ngIf="acc.beschreibung" class="accessory-desc">
                {{ acc.beschreibung }}
              </p>
              <p class="accessory-price">
                <ng-container *ngIf="acc.tagespreis > 0; else accFree">
                  €{{ acc.tagespreis }} /
                  {{ t().rentalSteps?.day ?? 'Tag' }}
                </ng-container>
                <ng-template #accFree>{{
                  t().rentalSteps?.free ?? 'Kostenlos'
                }}</ng-template>
              </p>
            </div>
            <div class="accessory-qty">
              <button
                type="button"
                (click)="decAccessory(acc.id)"
                [disabled]="accessoryQty(acc.id) === 0"
                aria-label="−"
              >
                −
              </button>
              <span>{{ accessoryQty(acc.id) }}</span>
              <button
                type="button"
                (click)="incAccessory(acc.id)"
                aria-label="+"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="accessory-summary" *ngIf="accessoryTotal() > 0">
          <span
            >{{ t().rentalSteps?.accessoryTotal ?? 'Zubehör gesamt' }}:</span
          >
          <strong>€{{ accessoryTotal() }}</strong>
        </div>

        <div class="accessory-actions">
          <button (click)="goToStep('customer-info')" class="btn-primary">
            {{ t().rentalSteps?.continue ?? 'Weiter' }}
          </button>
          <button (click)="goToStep('choose-next')" class="btn-secondary">
            {{ t().rentalSteps?.back ?? 'Zurück' }}
          </button>
        </div>
      </div>

      <!-- Step 4: Customer Information -->
      <div *ngIf="currentStep() === 'customer-info'" class="step-container">
        <h2>{{ t().rentalSteps?.yourInfo ?? 'Ihre Angaben' }}</h2>

        <div class="cart-summary">
          <h3>{{ t().rentalSteps?.cartItems ?? 'Ausgewählte Fahrräder' }}:</h3>
          <div *ngFor="let item of cartBikes()" class="cart-item">
            <div>
              <strong>{{ item.bike.marke }} {{ item.bike.modell }}</strong>
              <p>
                {{ formatDisplayDate(selectedStartDate) }} -
                {{ formatDisplayDate(selectedEndDate) }}
              </p>
              <p *ngIf="item.farbe">
                {{ t().rentalSteps?.colorLabel ?? 'Farbe' }}: {{ item.farbe }}
              </p>
              <p *ngIf="item.rahmennummer">
                {{ t().rentalSteps?.frameNumberLabel ?? 'Rahmennummer' }}:
                {{ item.rahmennummer }}
              </p>
            </div>
            <div class="item-price">
              <p>€{{ item.calculatedPrice }}</p>
              <button (click)="removeFromCart(item)" class="btn-remove">
                ×
              </button>
            </div>
          </div>
          <button
            (click)="goToStep('bike-selection')"
            class="btn-secondary"
            style="width: 100%;"
          >
            {{
              t().rentalSteps?.addAnotherBike ?? '+ Weiteres Fahrrad hinzufügen'
            }}
          </button>
        </div>

        <form (ngSubmit)="submitBooking()" class="customer-form">
          <div class="form-group">
            <label>{{ t().rentalSteps?.firstName ?? 'Vorname' }} *:</label>
            <input
              type="text"
              [(ngModel)]="bookingForm.vorname"
              name="vorname"
              required
            />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.lastName ?? 'Nachname' }} *:</label>
            <input
              type="text"
              [(ngModel)]="bookingForm.nachname"
              name="nachname"
              required
            />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.email ?? 'E-Mail' }} *:</label>
            <input
              type="email"
              [(ngModel)]="bookingForm.email"
              name="email"
              required
            />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.phone ?? 'Telefon' }} *:</label>
            <input
              type="tel"
              [(ngModel)]="bookingForm.telefon"
              name="telefon"
              required
            />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.street ?? 'Straße' }} *:</label>
            <input
              type="text"
              [(ngModel)]="bookingForm.strasse"
              name="strasse"
              required
            />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.houseNumber ?? 'Hausnummer' }} *:</label>
            <input
              type="text"
              [(ngModel)]="bookingForm.hausNr"
              name="hausNr"
              required
            />
          </div>
          <div class="form-group">
            <label
              >{{ t().rentalSteps?.postalCode ?? 'Postleitzahl' }} *:</label
            >
            <input
              type="text"
              [(ngModel)]="bookingForm.plz"
              name="plz"
              required
            />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.city ?? 'Stadt' }} *:</label>
            <input
              type="text"
              [(ngModel)]="bookingForm.ort"
              name="ort"
              required
            />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.pickupTime ?? 'Abholzeit' }} *:</label>
            <select
              [(ngModel)]="bookingForm.abholzeit"
              name="abholzeit"
              required
            >
              <option value="" disabled>
                {{ t().rentalSteps?.pickupTimeSelect ?? 'Uhrzeit wählen' }}
              </option>
              <option *ngFor="let slot of abholzeitSlots()" [value]="slot">
                {{ slot }} {{ t().rentalSteps?.oClock ?? 'Uhr' }}
              </option>
            </select>
            <small class="field-hint" *ngIf="abholzeitSlots().length === 0">
              {{
                t().rentalSteps?.pickupTimeClosed ??
                  'An diesem Tag ist der Laden geschlossen. Bitte ein anderes Startdatum wählen.'
              }}
            </small>
            <small class="field-hint" *ngIf="abholzeitSlots().length > 0">
              {{
                t().rentalSteps?.pickupTimeHint ??
                  'Zu welcher Uhrzeit möchten Sie das Fahrrad abholen?'
              }}
            </small>
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.notes ?? 'Notizen' }}:</label>
            <textarea
              [(ngModel)]="bookingForm.notizen"
              name="notizen"
            ></textarea>
          </div>

          <div *ngIf="bookingError()" class="error-message">
            {{ bookingError() }}
          </div>

          <div class="form-actions">
            <button
              type="button"
              (click)="goToStep('bike-selection')"
              class="btn-secondary"
            >
              {{ t().rentalSteps?.back ?? 'Zurück' }}
            </button>
            <button
              type="submit"
              class="btn-primary"
              [disabled]="isSubmitting()"
            >
              {{
                isSubmitting()
                  ? (t().rentalSteps?.submitting ?? 'Wird gesendet...')
                  : (t().rentalSteps?.continue ?? 'Weiter')
              }}
            </button>
          </div>
        </form>
      </div>

      <!-- Step 5: Review & Confirm -->
      <div
        *ngIf="currentStep() === 'review'"
        class="step-container review-section"
      >
        <h2>{{ t().rentalSteps?.confirmBooking ?? 'Buchung bestätigen' }}</h2>

        <div class="review-section">
          <h3>{{ t().rentalSteps?.bikeDetails ?? 'Fahrraddetails' }}:</h3>
          <div *ngFor="let item of cartBikes()" class="review-item">
            <p>
              <strong>{{ item.bike.marke }} {{ item.bike.modell }}</strong>
            </p>
            <p>
              {{ formatDisplayDate(selectedStartDate) }} -
              {{ formatDisplayDate(selectedEndDate) }} ({{ daysCount() }}
              {{ t().rentalSteps?.days ?? 'Tage' }})
            </p>
            <p *ngIf="item.farbe">
              {{ t().rentalSteps?.colorLabel ?? 'Farbe' }}: {{ item.farbe }}
            </p>
            <p *ngIf="item.rahmennummer">
              {{ t().rentalSteps?.frameNumberLabel ?? 'Rahmennummer' }}:
              {{ item.rahmennummer }}
            </p>
            <p class="price">
              {{ t().rentalSteps?.priceLabel ?? 'Preis' }}: €{{
                item.calculatedPrice
              }}
            </p>
          </div>
        </div>

        <div class="review-section" *ngIf="selectedAccessories().length > 0">
          <h3>{{ t().rentalSteps?.accessoryTitle ?? 'Zubehör' }}:</h3>
          <div
            *ngFor="let sel of selectedAccessories()"
            class="review-item accessory-review-item"
          >
            <p>
              <strong>{{ sel.menge }}× {{ sel.accessory.bezeichnung }}</strong>
            </p>
            <p class="price">
              <ng-container *ngIf="sel.accessory.tagespreis > 0; else selFree">
                €{{ sel.accessory.tagespreis }} × {{ daysCount() }}
                {{ t().rentalSteps?.days ?? 'Tage' }} = €{{ sel.lineTotal }}
              </ng-container>
              <ng-template #selFree>{{
                t().rentalSteps?.free ?? 'Kostenlos'
              }}</ng-template>
            </p>
          </div>
        </div>

        <div class="review-section">
          <h3>{{ t().rentalSteps?.contactInfo ?? 'Kontaktinformationen' }}:</h3>
          <p>{{ bookingForm.vorname }} {{ bookingForm.nachname }}</p>
          <p>{{ bookingForm.email }}</p>
          <p *ngIf="bookingForm.telefon">{{ bookingForm.telefon }}</p>
          <p *ngIf="bookingForm.strasse">
            {{ bookingForm.strasse }} {{ bookingForm.hausNr }}
          </p>
          <p *ngIf="bookingForm.plz">
            {{ bookingForm.plz }} {{ bookingForm.ort }}
          </p>
          <p *ngIf="bookingForm.abholzeit">
            <strong>{{ t().rentalSteps?.pickupTime ?? 'Abholzeit' }}:</strong>
            {{ bookingForm.abholzeit }} {{ t().rentalSteps?.oClock ?? 'Uhr' }}
          </p>
        </div>

        <div class="price-summary">
          <h3>{{ t().rentalSteps?.priceSummary ?? 'Preisübersicht' }}:</h3>
          <p *ngIf="accessoryTotal() > 0">
            {{ t().rentalSteps?.accessoryTotal ?? 'Zubehör gesamt' }}:
            <strong>€{{ accessoryTotal() }}</strong>
          </p>
          <p>
            {{ t().rentalSteps?.totalRental ?? 'Gesamtmiete' }}:
            <strong>€{{ getTotalPrice() }}</strong>
          </p>
          <p>
            {{ t().rentalSteps?.totalDeposit ?? 'Gesamtkaution' }}:
            <strong>€{{ getTotalDeposit() }}</strong>
          </p>
          <p class="info-note">
            {{
              t().rentalSteps?.depositNote ??
                'Die Kaution wird bei Rückgabe des Fahrrads erstattet.'
            }}
          </p>
        </div>

        <div class="terms-acceptance">
          <label class="terms-label">
            <input
              type="checkbox"
              [checked]="termsAccepted()"
              (change)="termsAccepted.set(!termsAccepted())"
              class="terms-checkbox"
            />
            <span>
              {{ t().rentalSteps?.termsPrefix ?? 'Ich akzeptiere die' }}
              <a
                href="/assets/fahrradverleih-bedingungen.pdf"
                target="_blank"
                rel="noopener"
                class="terms-link"
                >{{
                  t().rentalSteps?.termsLinkText ?? 'Fahrradverleih-Bedingungen'
                }}</a
              >
            </span>
          </label>
        </div>

        <div class="confirm-actions">
          <button (click)="goToStep('customer-info')" class="btn-secondary">
            {{ t().rentalSteps?.back ?? 'Zurück' }}
          </button>
          <button
            (click)="confirmAndSubmit()"
            class="btn-primary"
            [disabled]="isSubmitting() || !termsAccepted()"
          >
            {{
              isSubmitting()
                ? (t().rentalSteps?.submitting ?? 'Wird gesendet...')
                : (t().rentalSteps?.confirm ?? 'Buchung bestätigen')
            }}
          </button>
        </div>

        <div *ngIf="bookingError()" class="error-message">
          {{ bookingError() }}
        </div>
      </div>

      <!-- Success -->
      <div
        *ngIf="currentStep() === 'success'"
        class="step-container success-section"
      >
        <h2>
          {{ t().rentalSteps?.bookingSuccess ?? 'Buchung erfolgreich!' }}
        </h2>
        <p>
          {{
            t().rentalSteps?.confirmationSent ??
              'Eine Bestätigungsmail wurde an'
          }}
          <strong>{{ bookingForm.email }}</strong>
          {{ t().rentalSteps?.sent ?? 'gesendet' }}
        </p>
        <p *ngIf="bookingNumber()">
          <strong
            >{{ t().rentalSteps?.bookingNumber ?? 'Buchungsnummer' }}:</strong
          >
          {{ bookingNumber() }}
        </p>
        <button (click)="startNewBooking()" class="btn-primary">
          {{ t().rentalSteps?.newBooking ?? 'Neue Buchung' }}
        </button>
      </div>

      <!-- Fullscreen image lightbox (pinch zoom / double-tap / wheel) -->
      <div
        *ngIf="lightboxOpen() && selectedBike()"
        class="lightbox"
        (click)="closeLightbox()"
      >
        <button
          type="button"
          class="lb-close"
          (click)="closeLightbox(); $event.stopPropagation()"
          [attr.aria-label]="t().rentalSteps?.closeLabel ?? 'Schließen'"
        >
          ×
        </button>

        <div
          class="lb-stage"
          #lbStage
          (click)="$event.stopPropagation()"
          (pointerdown)="onLbPointerDown($event)"
          (pointermove)="onLbPointerMove($event)"
          (pointerup)="onLbPointerUp($event)"
          (pointercancel)="onLbPointerUp($event)"
          (wheel)="onLbWheel($event)"
        >
          <img
            [src]="getImageUrl(getMainImage(selectedBike()!)?.filePath)"
            [alt]="selectedBike()!.modell"
            class="lb-img"
            draggable="false"
            [style.transform]="
              'translate(' +
              lightboxTx() +
              'px,' +
              lightboxTy() +
              'px) scale(' +
              lightboxScale() +
              ')'
            "
          />
        </div>

        <div class="lb-controls" (click)="$event.stopPropagation()">
          <button
            type="button"
            class="lb-btn"
            (click)="lbZoom(-1)"
            aria-label="−"
          >
            −
          </button>
          <button
            type="button"
            class="lb-btn"
            (click)="lbZoom(1)"
            aria-label="+"
          >
            +
          </button>
        </div>

        <ng-container *ngIf="getImages(selectedBike()!).length > 1">
          <button
            type="button"
            class="lb-nav lb-prev"
            (click)="lbStep(-1); $event.stopPropagation()"
            [attr.aria-label]="t().rentalSteps?.prevImage ?? 'Vorheriges Bild'"
          >
            ‹
          </button>
          <button
            type="button"
            class="lb-nav lb-next"
            (click)="lbStep(1); $event.stopPropagation()"
            [attr.aria-label]="t().rentalSteps?.nextImage ?? 'Nächstes Bild'"
          >
            ›
          </button>
          <div class="lb-counter" (click)="$event.stopPropagation()">
            {{ currentImageIndex() + 1 }} /
            {{ getImages(selectedBike()!).length }}
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .rental-booking-steps-container {
        --rb-bg: rgba(10, 16, 28, 0.82);
        --rb-surface: rgba(255, 255, 255, 0.06);
        --rb-surface-strong: rgba(255, 255, 255, 0.1);
        --rb-border: rgba(255, 255, 255, 0.16);
        --rb-text: #f5f8ff;
        --rb-text-soft: rgba(245, 248, 255, 0.72);
        --rb-accent: var(--color-accent, #ff5722);
        max-width: 900px;
        margin: 2rem auto;
        padding: 2rem;
        background: linear-gradient(
          160deg,
          var(--rb-bg),
          rgba(18, 27, 43, 0.94)
        );
        border: 1px solid var(--rb-border);
        border-radius: 18px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        color: var(--rb-text);
      }

      .rental-booking-steps-container h2,
      .rental-booking-steps-container h3,
      .rental-booking-steps-container strong,
      .rental-booking-steps-container label {
        color: var(--rb-text);
      }

      .rental-booking-steps-container p {
        color: var(--rb-text-soft);
      }

      /* Sticky stepper: the process flow stays visible while scrolling.
         top must clear the fixed site header (108px desktop / 92px mobile). */
      .steps-indicator {
        position: sticky;
        top: 112px;
        z-index: 20;
        display: flex;
        gap: 0.25rem;
        margin: -2rem -2rem 1.75rem;
        padding: 0.85rem 1rem;
        background: rgba(10, 16, 28, 0.94);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--rb-border);
        border-radius: 18px 18px 0 0;
      }

      .step {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
        text-align: center;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--rb-text-soft);
        position: relative;
      }

      /* Connector line between the circles */
      .step:not(:first-child)::before {
        content: '';
        position: absolute;
        top: 14px;
        right: calc(50% + 18px);
        width: calc(100% - 36px);
        height: 2px;
        background: var(--rb-border);
      }

      .step.done:not(:first-child)::before {
        background: rgba(255, 87, 34, 0.6);
      }

      .step-num {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--rb-surface);
        border: 2px solid var(--rb-border);
        font-size: 0.85rem;
        font-weight: 700;
        z-index: 1;
      }

      .step.active .step-num {
        background: var(--rb-accent);
        border-color: var(--rb-accent);
        color: #fff;
        box-shadow: 0 2px 12px rgba(255, 87, 34, 0.5);
      }

      .step.done .step-num {
        background: rgba(255, 87, 34, 0.2);
        border-color: rgba(255, 87, 34, 0.6);
        color: var(--rb-accent);
      }

      .step.active {
        color: var(--rb-text);
      }

      .step-label {
        line-height: 1.2;
      }

      .step-container {
        animation: fadeIn 0.3s ease-in;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .date-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin: 1.5rem 0;
      }

      .date-input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .date-input-group label {
        font-weight: 600;
      }

      .date-input-group input {
        padding: 0.75rem;
        border: 1px solid var(--rb-border);
        border-radius: 6px;
        font-size: 1rem;
        background: var(--rb-surface);
        color: var(--rb-text);
      }

      .closure-notice {
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        margin: 1rem 0 0;
        padding: 0.85rem 1rem;
        border-radius: 10px;
        background: rgba(255, 87, 34, 0.12);
        border: 1px solid rgba(255, 87, 34, 0.45);
        color: var(--rb-text);
        font-size: 0.92rem;
        font-weight: 600;
        line-height: 1.45;
      }

      .closure-notice svg {
        flex-shrink: 0;
        margin-top: 1px;
        color: var(--rb-accent);
      }

      /* Calendar styles */
      .calendar-shell {
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.02),
          rgba(255, 255, 255, 0.01)
        );
        border: 1px solid rgba(255, 255, 255, 0.04);
        padding: 1rem;
        border-radius: 10px;
        margin: 1rem 0 1.5rem 0;
      }

      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }

      .calendar-nav {
        background: transparent;
        border: none;
        color: var(--rb-text);
        font-size: 1.4rem;
        padding: 0.25rem 0.6rem;
        cursor: pointer;
        border-radius: 6px;
      }

      .calendar-nav:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      .calendar-month-label {
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--rb-text);
      }

      .calendar-hint {
        color: var(--rb-text-soft);
        margin: 0 0 0.75rem 0;
        font-size: 0.95rem;
      }

      .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 6px;
        margin-bottom: 6px;
      }

      .calendar-weekday {
        text-align: center;
        color: var(--rb-text-soft);
        font-weight: 600;
        font-size: 0.85rem;
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 6px;
      }

      .calendar-day {
        height: 40px;
        border-radius: 6px;
        background: transparent;
        border: none;
        color: var(--rb-text);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          background 0.15s,
          transform 0.08s;
      }

      .calendar-day span {
        display: inline-block;
        width: 28px;
        text-align: center;
      }

      /* Hover only on devices that actually hover — on touch screens the
         last-tapped day keeps :hover ("sticky hover") and the faint hover
         background would wash out the selected end date. Also never dim
         already-selected days. */
      @media (hover: hover) {
        .calendar-day:hover:not(.is-empty):not(.is-closed):not(.is-start):not(
            .is-end
          ) {
          background: rgba(255, 255, 255, 0.03);
          transform: translateY(-2px);
        }
      }

      .calendar-day.is-empty {
        visibility: hidden;
      }

      .calendar-day.is-closed {
        background: rgba(255, 255, 255, 0.02);
        color: rgba(245, 248, 255, 0.28);
        cursor: not-allowed;
        text-decoration: line-through;
      }

      .calendar-day.is-start,
      .calendar-day.is-end {
        background: var(--rb-accent);
        color: #fff;
        font-weight: 800;
        box-shadow: 0 2px 12px rgba(255, 87, 34, 0.55);
        font-weight: 700;
        box-shadow: 0 6px 18px rgba(255, 87, 34, 0.12);
      }

      .calendar-day.in-range {
        background: rgba(255, 87, 34, 0.06);
        color: var(--rb-text);
      }

      .calendar-day.is-today {
        border: 1px dashed rgba(245, 248, 255, 0.12);
      }

      .selection-hint {
        margin: 0 0 0.75rem;
        padding: 0.5rem 0.85rem;
        border-radius: 8px;
        background: rgba(255, 87, 34, 0.12);
        border: 1px dashed rgba(255, 87, 34, 0.5);
        color: var(--rb-text);
        font-size: 0.92rem;
        font-weight: 600;
      }

      .selected-range-summary {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem 1.5rem;
        margin-top: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        border: 1px solid var(--rb-border);
        background: var(--rb-surface);
      }

      .selected-range-summary.is-complete {
        border-color: rgba(255, 87, 34, 0.55);
        background: rgba(255, 87, 34, 0.1);
      }

      .selected-range-summary .range-days {
        margin-left: auto;
        padding: 0.25rem 0.7rem;
        border-radius: 999px;
        background: var(--rb-accent);
        color: #fff;
        font-weight: 700;
        font-size: 0.9rem;
      }

      .date-range-display {
        background: var(--rb-surface);
        border: 1px solid var(--rb-border);
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 1.5rem;
        font-weight: 500;
      }

      .bike-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 1rem;
        margin: 1.25rem 0 2rem;
      }

      /* Ab Desktop-Breite feste vier Spalten: die Kacheln sollen nebeneinander
         vergleichbar sein, nicht einzeln bildschirmfüllend. */
      @media (min-width: 1100px) {
        .bike-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      .bike-card {
        border: 1px solid var(--rb-border);
        background: var(--rb-surface);
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        /* Vollständige Namen brauchen je Rad unterschiedlich viele Zeilen; die
           Spalte hält den Auswählen-Knopf trotzdem auf einer Linie. */
        display: flex;
        flex-direction: column;
      }

      .bike-card:hover {
        border-color: rgba(255, 87, 34, 0.52);
        box-shadow: 0 8px 20px rgba(255, 87, 34, 0.2);
        transform: translateY(-2px);
      }

      .bike-image {
        width: 100%;
        height: 150px;
        background: rgba(255, 255, 255, 0.04);
        overflow: hidden;
      }

      .bike-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .bike-info {
        padding: 1rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .bike-info h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.05rem;
        /* Marke und Modell stehen immer vollständig da: ein abgeschnittener
           Name ("24 - 24 zoll Kinder…") verrät nicht, welches Rad das ist, und
           genau danach wird hier ausgewählt. Die Kacheln einer Reihe wachsen
           dafür auf die höchste – lieber eine Zeile mehr als ein halber Name. */
        overflow-wrap: anywhere;
      }

      .bike-type {
        color: var(--rb-text-soft);
        font-size: 0.9rem;
        margin: 0.25rem 0;
      }

      .bike-specs-inline {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .bike-specs-inline li {
        font-size: 0.85rem;
        color: var(--rb-text-soft);
        /* Notbremse für Stammdaten, die trotz shortSize() ein ganzer Satz
           bleiben; das Maß steht darin vorn, der Rest in der Detailansicht. */
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .bike-specs-inline .spec-label {
        color: var(--rb-text);
        font-weight: 600;
        margin-right: 0.25rem;
      }

      .bike-price {
        color: var(--rb-accent);
        font-weight: 600;
        margin: 0.5rem 0 0 0;
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 0.35rem;
      }
      .bike-price strong {
        font-size: 1.25rem;
        font-weight: 800;
      }
      .price-period {
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--rb-text-muted, #6b7280);
      }
      .bike-size {
        margin: 0.15rem 0 0 0;
        font-size: 0.82rem;
        color: var(--rb-text-soft);
      }

      /* Schiebt den Auswählen-Knopf an den Kachelboden, mit garantiertem
         Mindestabstand zum Text darüber. */
      .bike-info-spacer {
        flex: 1 1 auto;
        min-height: 0.85rem;
      }

      .bike-deposit {
        margin: 0.25rem 0 0 0;
        font-size: 0.82rem;
        color: var(--rb-text-muted, #6b7280);
      }

      /* ── Typ-Filter über dem Raster ── */
      .bike-filter-bar {
        margin: 1.25rem 0 0.25rem;
      }
      .bike-filter-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0.85rem;
        border-radius: 999px;
        border: 1px solid var(--rb-border);
        background: transparent;
        color: inherit;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .filter-chip:hover {
        border-color: var(--rb-accent);
      }
      .filter-chip.active {
        border-color: var(--rb-accent);
        background: rgba(255, 87, 34, 0.14);
        color: var(--rb-accent);
      }
      .chip-count {
        font-size: 0.75rem;
        font-weight: 700;
        opacity: 0.7;
      }

      .selection-actions {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
      }

      .btn-select-bike {
        width: 100%;
        padding: 0.7rem 1rem;
        background: rgba(255, 87, 34, 0.14);
        border: 1px solid rgba(255, 87, 34, 0.55);
        border-radius: 8px;
        color: var(--rb-accent);
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        transition:
          background 0.2s ease,
          color 0.2s ease;
      }

      .bike-card:hover .btn-select-bike,
      .btn-select-bike:hover,
      .btn-select-bike:focus-visible {
        background: var(--rb-accent);
        color: #fff;
      }

      .bike-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin: 2rem 0;
      }

      .bike-images {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .main-image {
        width: 100%;
        max-height: 400px;
        object-fit: contain;
        border-radius: 8px;
      }

      .main-image-zoom {
        position: relative;
        display: block;
        width: 100%;
        padding: 0;
        border: none;
        background: transparent;
        cursor: zoom-in;
      }

      .zoom-badge {
        position: absolute;
        right: 10px;
        bottom: 10px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(10, 16, 28, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.28);
        color: #fff;
        pointer-events: none;
      }

      /* ── Lightbox ── */
      .lightbox {
        position: fixed;
        inset: 0;
        z-index: 5000;
        background: rgba(4, 7, 13, 0.96);
      }

      .lb-stage {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        touch-action: none;
        cursor: grab;
      }

      .lb-stage:active {
        cursor: grabbing;
      }

      .lb-img {
        max-width: 100%;
        max-height: 100%;
        user-select: none;
        -webkit-user-drag: none;
        will-change: transform;
      }

      .lb-close,
      .lb-btn,
      .lb-nav {
        position: absolute;
        z-index: 2;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.22);
        background: rgba(20, 28, 44, 0.8);
        color: #fff;
        font-size: 1.5rem;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .lb-close {
        top: max(14px, env(safe-area-inset-top));
        right: 14px;
        font-size: 1.7rem;
      }

      .lb-controls {
        position: absolute;
        bottom: max(18px, env(safe-area-inset-bottom));
        left: 50%;
        transform: translateX(-50%);
        z-index: 2;
        display: flex;
        gap: 0.75rem;
      }

      .lb-controls .lb-btn {
        position: static;
      }

      .lb-nav {
        top: 50%;
        transform: translateY(-50%);
      }

      .lb-prev {
        left: 10px;
      }

      .lb-next {
        right: 10px;
      }

      .lb-counter {
        position: absolute;
        top: max(20px, env(safe-area-inset-top));
        left: 50%;
        transform: translateX(-50%);
        z-index: 2;
        padding: 0.3rem 0.85rem;
        border-radius: 999px;
        background: rgba(20, 28, 44, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #fff;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .image-thumbnails {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
      }

      .thumbnail {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 6px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: border-color 0.3s;
      }

      .thumbnail.active {
        border-color: var(--rb-accent);
      }

      .bike-specs {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .spec {
        padding: 0.75rem;
        background: var(--rb-surface);
        border: 1px solid var(--rb-border);
        border-radius: 6px;
        font-size: 0.9rem;
      }

      .spec strong {
        display: block;
        color: var(--rb-text);
        margin-bottom: 0.25rem;
      }

      .price-info {
        padding: 1rem;
        background: rgba(255, 87, 34, 0.09);
        border-radius: 6px;
        border-left: 4px solid var(--rb-accent);
      }

      .price-info h3 {
        margin: 0 0 0.75rem 0;
        font-size: 1rem;
      }

      .price-info p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
      }

      .total-price {
        font-size: 1.1rem !important;
        font-weight: 600 !important;
        color: var(--rb-accent);
      }

      .deposit-info {
        color: var(--rb-text-soft);
      }

      .color-selection,
      .frame-number-input {
        padding: 0.75rem;
        background: var(--rb-surface);
        border: 1px solid var(--rb-border);
        border-radius: 6px;
      }

      .color-selection label,
      .frame-number-input label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .color-selection input,
      .frame-number-input input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--rb-border);
        border-radius: 4px;
        font-size: 0.9rem;
        background: rgba(255, 255, 255, 0.04);
        color: var(--rb-text);
      }

      .customer-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin: 2rem 0;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-group label {
        font-weight: 600;
        font-size: 0.95rem;
      }

      .form-group input,
      .form-group textarea {
        padding: 0.75rem;
        border: 1px solid var(--rb-border);
        border-radius: 6px;
        font-size: 0.95rem;
        font-family: inherit;
        background: var(--rb-surface);
        color: var(--rb-text);
      }

      .form-group textarea {
        grid-column: 1 / -1;
        resize: vertical;
        min-height: 100px;
      }

      .form-actions {
        grid-column: 1 / -1;
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .cart-summary {
        background: var(--rb-surface);
        border: 1px solid var(--rb-border);
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }

      .cart-summary h3 {
        margin: 0 0 1rem 0;
      }

      .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 6px;
        margin-bottom: 0.75rem;
        border-left: 4px solid var(--rb-accent);
      }

      .cart-item p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        color: var(--rb-text-soft);
      }

      .item-price {
        text-align: right;
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .item-price p {
        font-weight: 600;
        font-size: 1.1rem;
        color: var(--rb-accent);
      }

      .btn-remove {
        background: #d93d3d;
        color: white;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn-remove:hover {
        background: #b62323;
      }

      .review-section {
        background: var(--rb-surface);
        border: 1px solid var(--rb-border);
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
      }

      .review-section h3 {
        margin: 0 0 1rem 0;
        font-size: 1.05rem;
        color: var(--rb-text);
      }

      .accessory-intro {
        color: var(--rb-muted, #94a3b8);
        margin: 0 0 1.25rem;
        font-size: 0.95rem;
      }
      .accessory-loading,
      .accessory-empty {
        padding: 1.5rem 0;
        color: var(--rb-muted, #94a3b8);
      }
      .accessory-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .accessory-card {
        display: flex;
        flex-direction: column;
        background: rgba(255, 255, 255, 0.04);
        border: 1.5px solid rgba(255, 255, 255, 0.09);
        border-radius: 10px;
        overflow: hidden;
        transition:
          border-color 0.2s,
          box-shadow 0.2s;
      }
      .accessory-card.selected {
        border-color: var(--rb-accent);
        box-shadow: 0 0 0 2px rgba(255, 87, 34, 0.25);
      }
      /* Flaches 4:1-Band: hält die Zubehörliste auf dem Handy kompakt, statt
         dass jedes Foto den halben Bildschirm füllt. object-fit: contain, damit
         hochformatige Artikel (z. B. ein Schloss) nicht zu einem unkenntlichen
         Streifen beschnitten werden. */
      .accessory-photo {
        aspect-ratio: 4 / 1;
        background: rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
      }
      .accessory-photo img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .accessory-photo-empty {
        font-size: 2rem;
        opacity: 0.5;
      }
      .accessory-body {
        padding: 0.75rem 0.9rem;
        flex: 1;
      }
      .accessory-body h3 {
        margin: 0 0 0.35rem;
        font-size: 1rem;
      }
      .accessory-desc {
        margin: 0 0 0.4rem;
        font-size: 0.82rem;
        color: var(--rb-muted, #94a3b8);
      }
      .accessory-price {
        margin: 0;
        color: var(--rb-accent);
        font-weight: 700;
      }
      .accessory-qty {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.6rem 0.9rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
      .accessory-qty button {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        border: 1.5px solid rgba(255, 255, 255, 0.15);
        background: transparent;
        color: inherit;
        font-size: 1.15rem;
        line-height: 1;
        cursor: pointer;
      }
      .accessory-qty button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .accessory-qty span {
        min-width: 1.5rem;
        text-align: center;
        font-weight: 700;
      }
      .accessory-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.2rem;
        background: rgba(255, 87, 34, 0.09);
        border-radius: 8px;
        border-left: 4px solid var(--rb-accent);
        margin-bottom: 1.25rem;
        font-size: 1.05rem;
      }
      .accessory-summary strong {
        color: var(--rb-accent);
      }
      .accessory-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .review-item {
        background: rgba(255, 255, 255, 0.04);
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 0.75rem;
        border-left: 4px solid var(--rb-accent);
      }

      .review-item p {
        margin: 0.25rem 0;
        font-size: 0.95rem;
      }

      .review-item .price {
        color: var(--rb-accent);
        font-weight: 600;
        margin-top: 0.5rem;
      }

      .price-summary {
        background: rgba(255, 87, 34, 0.09);
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid var(--rb-accent);
        margin-bottom: 2rem;
      }

      .price-summary h3 {
        margin: 0 0 1rem 0;
      }

      .price-summary p {
        margin: 0.5rem 0;
        font-size: 0.95rem;
      }

      .price-summary strong {
        font-size: 1.1rem;
        color: var(--rb-accent);
      }

      .info-note {
        font-size: 0.85rem !important;
        color: var(--rb-text-soft) !important;
        font-style: italic;
        margin-top: 1rem !important;
      }

      .success-section {
        text-align: center;
        padding: 3rem 1.5rem;
      }

      .success-section h2 {
        color: #64d68a;
        margin-bottom: 1rem;
      }

      .success-section p {
        margin: 0.75rem 0;
        font-size: 1.05rem;
      }

      .loading,
      .no-bikes {
        text-align: center;
        padding: 3rem 1rem;
        font-size: 1.1rem;
        color: var(--rb-text-soft);
      }

      .error-message {
        background: rgba(220, 38, 38, 0.12);
        color: #fecaca;
        padding: 1rem;
        border-radius: 6px;
        margin: 1rem 0;
        border-left: 4px solid #ef4444;
      }

      .terms-acceptance {
        margin: 1.5rem 0 0.5rem;
        padding: 1rem 1.25rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
      }

      .terms-label {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;
        font-size: 0.9rem;
        line-height: 1.5;
        color: var(--rb-text-soft);
      }

      .terms-checkbox {
        width: 18px;
        height: 18px;
        min-width: 18px;
        margin-top: 2px;
        accent-color: var(--rb-accent);
        cursor: pointer;
      }

      .terms-link {
        color: var(--rb-accent);
        text-decoration: underline;
        text-underline-offset: 2px;

        &:hover {
          opacity: 0.85;
        }
      }

      .booking-actions,
      .confirm-actions {
        display: flex;
        gap: 1rem;
        margin: 2rem 0;
        flex-wrap: wrap;
      }

      .btn-primary,
      .btn-secondary {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-primary {
        background: linear-gradient(135deg, #ff7a3a, var(--rb-accent));
        color: white;
        flex: 1;
        min-width: 150px;
      }

      .btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #ff8850, #ff6b33);
        transform: translateY(-2px);
        box-shadow: 0 8px 18px rgba(255, 87, 34, 0.35);
      }

      .btn-primary:disabled {
        background: rgba(255, 255, 255, 0.2);
        cursor: not-allowed;
      }

      .btn-secondary {
        background: var(--rb-surface);
        border: 1px solid var(--rb-border);
        color: var(--rb-text);
        flex: 1;
        min-width: 150px;
      }

      .btn-secondary:hover {
        background: var(--rb-surface-strong);
      }

      @media (max-width: 768px) {
        .rental-booking-steps-container {
          padding: 1rem;
        }

        .date-inputs,
        .bike-details,
        .customer-form {
          grid-template-columns: 1fr;
        }

        /* Zwei Kacheln nebeneinander: vorher füllte eine einzige Karte den
           ganzen Bildschirm, sodass man 46 Räder blind durchscrollen musste. */
        .bike-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.7rem;
        }

        .bike-image {
          height: 84px;
        }

        .bike-info {
          padding: 0.5rem 0.55rem 0.6rem;
        }

        .bike-info h3 {
          font-size: 0.8rem;
          margin-bottom: 0.2rem;
          /* Auch auf der schmalen Kachel vollständig – notfalls über mehrere
             Zeilen, statt "24 - 24 zoll Kinder…" zu zeigen. */
          line-height: 1.25;
        }

        .bike-type {
          font-size: 0.7rem;
          margin: 0;
        }

        /* Die Größe bleibt auf dem Handy sichtbar: shortSize() kürzt den Satz
           aus den Stammdaten auf das Maß, damit die Kachel eng bleibt. */
        .bike-specs-inline {
          margin: 0.25rem 0;
          gap: 0.1rem;
        }

        .bike-specs-inline li {
          font-size: 0.68rem;
          -webkit-line-clamp: 1;
        }

        .bike-price strong {
          font-size: 1rem;
        }

        .price-period,
        .bike-deposit,
        .bike-size {
          font-size: 0.68rem;
        }

        .bike-info-spacer {
          min-height: 0.4rem;
        }

        .btn-select-bike {
          padding: 0.45rem 0.5rem;
          font-size: 0.75rem;
        }

        /* Eine scrollbare Zeile statt drei umbrechender Reihen: die Chips
           schoben das Raster sonst weit unter die Bildschirmkante. */
        .bike-filter-chips {
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 0.2rem;
        }

        .bike-filter-chips::-webkit-scrollbar {
          display: none;
        }

        .filter-chip {
          padding: 0.3rem 0.6rem;
          font-size: 0.75rem;
          white-space: nowrap;
          flex: 0 0 auto;
        }

        .bike-filter-bar {
          margin: 0.75rem 0 0;
        }

        .date-range-display {
          font-size: 0.78rem;
          margin: 0.3rem 0 0;
        }

        .steps-indicator {
          top: 96px;
          margin: -1rem -1rem 1.25rem;
          padding: 0.6rem 0.4rem;
          gap: 0.15rem;
        }

        .step {
          font-size: 0.66rem;
        }

        .step-num {
          width: 24px;
          height: 24px;
          font-size: 0.78rem;
        }

        .step:not(:first-child)::before {
          top: 12px;
          right: calc(50% + 15px);
          width: calc(100% - 30px);
        }

        .booking-actions,
        .confirm-actions {
          flex-direction: column;
        }

        .btn-primary,
        .btn-secondary {
          flex: 1;
        }
      }
    `,
  ],
})
export class RentalBookingStepsComponent implements OnInit {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  currentStep = signal<BookingStep>('date-selection');
  indicatorIndex = computed(() => INDICATOR_INDEX[this.currentStep()]);
  stepLabels = computed(() => {
    const steps = this.t().rentalSteps;
    return [
      steps?.dateSelection ?? 'Termin wählen',
      steps?.bikeSelection ?? 'Fahrrad wählen',
      steps?.accessoryStep ?? 'Zubehör',
      steps?.customerInfo ?? 'Daten eintragen',
      steps?.review ?? 'Bestätigung',
    ];
  });
  selectedStartDate = '';
  selectedEndDate = '';
  // Holiday-closure banner shown above the calendar (empty string when there is
  // no upcoming closure to announce).
  closureNotice = computed(() => this.t().rentalSteps?.closureNotice ?? '');
  calendarMonth = signal(this.getInitialCalendarMonth());
  selectedBike = signal<PublicRentalBicycle | null>(null);
  selectedBikeColor = '';
  selectedBikeFrameNumber = '';
  currentImageIndex = signal(0);

  weekdayLabels = computed(() => this.getWeekdayLabels());
  calendarMonthLabel = computed(() =>
    this.formatCalendarMonth(this.calendarMonth()),
  );
  calendarWeeks = computed(() => this.buildCalendarWeeks(this.calendarMonth()));

  availableBikes = signal<PublicRentalBicycle[]>([]);
  loadingAvailableBikes = signal(false);
  /** True once availability was fetched for the selected dates. */
  bikesLoaded = signal(false);
  cartBikes = signal<CartBike[]>([]);

  selectableBikes = computed(() => {
    // Children's bikes (Art = "Kinder") are generic/pooled listings (e.g. one
    // "24 Zoll" ad standing in for several interchangeable bikes), so they stay
    // selectable even after being added and can be booked more than once. Regular
    // bikes disappear from the list once they are in the cart.
    const cartIds = new Set(
      this.cartBikes()
        .filter((item) => !this.isChildrensBike(item.bike))
        .map((item) => item.bike.id),
    );
    // Immer alphabetisch nach dem angezeigten Namen: die Reihenfolge aus der
    // API ist die Anlagereihenfolge im Bestand und wechselt daher von Anfrage
    // zu Anfrage. Zahlen werden dabei als Zahl verglichen, damit "20 Zoll" vor
    // "24 Zoll" und "100" nicht vor "20" steht.
    const collator = new Intl.Collator(
      LOCALE_BY_LANGUAGE[this.lang()] ?? 'de-DE',
      { numeric: true, sensitivity: 'base' },
    );
    return this.availableBikes()
      .filter((bike) => !cartIds.has(bike.id))
      .sort((a, b) => collator.compare(this.bikeLabel(a), this.bikeLabel(b)));
  });

  /** Name der Kachel: Marke und Modell, so wie sie dort auch stehen. */
  bikeLabel(bike: PublicRentalBicycle): string {
    return `${bike.marke ?? ''} ${bike.modell ?? ''}`.trim();
  }

  /** Aktiver Typ-Filter im Auswahlschritt ("all" = keiner). */
  bikeTypeFilter = signal<string>('all');

  /**
   * Typ-Gruppen aus den verfügbaren Rädern (Art bzw. Fahrradtyp), alphabetisch
   * und jeweils mit Anzahl. Bewusst aus den Daten abgeleitet statt fest
   * verdrahtet: so gibt es keine Filter, hinter denen nichts steht.
   */
  /**
   * Die Typangaben im Bestand sind über Jahre frei getippt worden: "City" und
   * "Cityrad", "Trekking" und "Trekkingrad" stehen nebeneinander. Ungefiltert
   * ergäbe das doppelte Chips für dieselbe Sache — also auf eine gemeinsame
   * Bezeichnung ziehen. Unbekannte Werte bleiben, wie sie sind.
   */
  private normalizeBikeType(bike: PublicRentalBicycle): string {
    const raw = (bike.art || bike.fahrradtyp || '').trim();
    const key = raw.toLowerCase();
    if (!key) return '';
    if (key.includes('kinder')) return 'Kinderrad';
    if (key.includes('e-bike') || key.includes('ebike') || key.includes('pedelec'))
      return 'E-Bike';
    if (key.includes('mtb') || key.includes('mountain')) return 'Mountainbike';
    if (key.includes('renn')) return 'Rennrad';
    if (key.includes('gravel')) return 'Gravelbike';
    if (key.includes('trekking')) return 'Trekking';
    if (key.includes('city')) return 'City';
    if (key.includes('lasten')) return 'Lastenrad';
    return raw;
  }

  bikeTypeGroups = computed(() => {
    const counts = new Map<string, number>();
    for (const bike of this.selectableBikes()) {
      const label = this.normalizeBikeType(bike);
      if (!label) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ key: label, label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  });

  filteredBikes = computed(() => {
    const filter = this.bikeTypeFilter();
    if (filter === 'all') return this.selectableBikes();
    return this.selectableBikes().filter(
      (bike) => this.normalizeBikeType(bike) === filter,
    );
  });

  /**
   * Beträge in der Sprache des Besuchers: 25,00 € statt €25. Vorher stand das
   * Euro-Zeichen vorne und ohne Nachkommastellen — in keiner der acht Sprachen
   * die übliche Schreibweise.
   */
  formatPrice(value: number | null | undefined): string {
    const amount = Number(value) || 0;
    const locale = LOCALE_BY_LANGUAGE[this.lang()] ?? 'de-DE';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Empfohlene Körpergröße als kurzer Text ("165–180 cm"). Ist nur eine Grenze
   * gepflegt, wird daraus "ab 165 cm" bzw. "bis 180 cm"; ohne Angabe leer.
   */
  riderHeight(bike: PublicRentalBicycle | null | undefined): string {
    const from = bike?.koerpergroesseVonCm ?? null;
    const to = bike?.koerpergroesseBisCm ?? null;
    if (from && to) return `${from}–${to} cm`;
    if (from) return `ab ${from} cm`;
    if (to) return `bis ${to} cm`;
    return '';
  }

  /**
   * Rahmen- und Reifengröße werden in den Stammdaten häufig als ganzer Satz
   * gepflegt ("50 cm – geeignet für ca. 165–180 cm Körpergröße"). Für die
   * Auswahlkachel bleibt nur das Maß davor stehen ("50 cm"); der vollständige
   * Text steht in der Detailansicht. Bindestriche werden nicht getrennt, damit
   * Angaben wie "26-28 Zoll" oder "M - 50 cm" ganz bleiben.
   */
  shortSize(value: string | null | undefined): string {
    const raw = (value ?? '').trim();
    if (!raw) return '';
    const measure = raw.split(/[–—(;,]/)[0].trim();
    return measure || raw;
  }

  isChildrensBike(bike: PublicRentalBicycle | null | undefined): boolean {
    // The "Kinder" marker can live in Art (gender) or Fahrradtyp (bike type),
    // depending on how the bike was created, so check both.
    return `${bike?.art ?? ''} ${bike?.fahrradtyp ?? ''}`
      .toLowerCase()
      .includes('kinder');
  }

  dateRangeError = signal('');
  bookingError = signal('');
  isSubmitting = signal(false);
  bookingNumber = signal('');
  termsAccepted = signal(false);

  bookingForm = {
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    strasse: '',
    hausNr: '',
    plz: '',
    ort: '',
    sprache: this.lang(),
    notizen: '',
    abholzeit: '',
  };

  // Pickup-time slots (30-min) for the START day, based on the shop's rental
  // handover hours: Mon–Thu 10:00–18:00, Fri 10:00–13:00 & 15:00–18:00 (lunch
  // break), Sat 11:00–18:00, Sun closed. Last pickup is 17:30 (return by 18:00).
  abholzeitSlots(): string[] {
    if (!this.selectedStartDate) return [];
    const day = new Date(`${this.selectedStartDate}T00:00:00`).getDay();
    const slots: string[] = [];
    const push = (fromH: number, fromM: number, toH: number, toM: number) => {
      for (let t = fromH * 60 + fromM; t <= toH * 60 + toM; t += 30) {
        const h = Math.floor(t / 60);
        const mm = t % 60;
        slots.push(
          `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
        );
      }
    };
    if (day >= 1 && day <= 4) {
      push(10, 0, 17, 30); // Mon–Thu
    } else if (day === 5) {
      push(10, 0, 12, 30); // Fri morning
      push(15, 0, 17, 30); // Fri afternoon (after 13–15 break)
    } else if (day === 6) {
      push(11, 0, 17, 30); // Sat
    }
    return slots;
  }

  // Plain method, NOT computed(): selectedStart/EndDate are not signals, so a
  // computed would cache its first value forever (stale day counts → prices).
  daysCount(): number {
    if (!this.selectedStartDate || !this.selectedEndDate) return 0;
    const start = new Date(`${this.selectedStartDate}T00:00:00`);
    const end = new Date(`${this.selectedEndDate}T00:00:00`);
    const diff =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }

  private getLocaleForCurrentLanguage(): string {
    switch (this.lang()) {
      case 'en':
        return 'en-GB';
      case 'fr':
        return 'fr-FR';
      case 'tr':
        return 'tr-TR';
      case 'es':
        return 'es-ES';
      case 'it':
        return 'it-IT';
      case 'ar':
        return 'ar-SA';
      case 'ru':
        return 'ru-RU';
      default:
        return 'de-DE';
    }
  }

  private getInitialCalendarMonth(): Date {
    const minDate = this.getMinSelectableDate();
    return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  }

  private getMinSelectableDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  formatDisplayDate(value: string): string {
    if (!value) return '—';
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat(this.getLocaleForCurrentLanguage(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  formatCalendarMonth(date: Date): string {
    return new Intl.DateTimeFormat(this.getLocaleForCurrentLanguage(), {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  getWeekdayLabels(): string[] {
    const locale = this.getLocaleForCurrentLanguage();
    const monday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
        new Date(
          monday.getFullYear(),
          monday.getMonth(),
          monday.getDate() + index,
        ),
      ),
    );
  }

  buildCalendarWeeks(month: Date): Array<Array<Date | null>> {
    const year = month.getFullYear();
    const currentMonth = month.getMonth();
    const firstDay = new Date(year, currentMonth, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
    const cells: Array<Date | null> = [];

    for (let i = 0; i < offset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, currentMonth, day));
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: Array<Array<Date | null>> = [];
    for (let index = 0; index < cells.length; index += 7) {
      weeks.push(cells.slice(index, index + 7));
    }
    return weeks;
  }

  prevCalendarMonth(): void {
    const month = this.calendarMonth();
    this.calendarMonth.set(
      new Date(month.getFullYear(), month.getMonth() - 1, 1),
    );
  }

  nextCalendarMonth(): void {
    const month = this.calendarMonth();
    this.calendarMonth.set(
      new Date(month.getFullYear(), month.getMonth() + 1, 1),
    );
  }

  isCalendarStart(date: Date): boolean {
    return this.selectedStartDate === this.formatDateKey(date);
  }

  isCalendarEnd(date: Date): boolean {
    return this.selectedEndDate === this.formatDateKey(date);
  }

  isCalendarInRange(date: Date): boolean {
    if (!this.selectedStartDate || !this.selectedEndDate) return false;
    const key = this.formatDateKey(date);
    return key > this.selectedStartDate && key < this.selectedEndDate;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  isSelectableCalendarDay(date: Date): boolean {
    const normalized = this.normalizeDate(date);
    return (
      normalized >= this.getMinSelectableDate() && !this.isClosedDay(normalized)
    );
  }

  selectCalendarDay(date: Date): void {
    if (!this.isSelectableCalendarDay(date)) return;

    const selectedDate = this.formatDateKey(date);
    // Any change invalidates the previously fetched availability list.
    this.bikesLoaded.set(false);
    if (
      !this.selectedStartDate ||
      (this.selectedStartDate && this.selectedEndDate) ||
      selectedDate < this.selectedStartDate
    ) {
      this.selectedStartDate = selectedDate;
      this.selectedEndDate = '';
      this.calendarMonth.set(new Date(date.getFullYear(), date.getMonth(), 1));
      return;
    }

    this.selectedEndDate = selectedDate;
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
    const fmt = (d: Date) => this.formatDateKey(d);
    const add = (d: Date, days: number) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
    const easter = this.easterDate(year);
    const holidays = new Set<string>([
      fmt(new Date(year, 0, 1)),
      fmt(new Date(year, 0, 6)),
      fmt(new Date(year, 4, 1)),
      fmt(new Date(year, 9, 3)),
      fmt(new Date(year, 10, 1)),
      fmt(new Date(year, 11, 25)),
      fmt(new Date(year, 11, 26)),
      fmt(add(easter, -2)),
      fmt(easter),
      fmt(add(easter, 1)),
      fmt(add(easter, 39)),
      fmt(add(easter, 49)),
      fmt(add(easter, 50)),
      fmt(add(easter, 60)),
    ]);
    this.bwHolidayCache.set(year, holidays);
    return holidays;
  }

  isClosedDay(date: Date): boolean {
    if (isClosureDay(date)) return true;
    if (date.getDay() === 0) return true;
    return this.getBWHolidays(date.getFullYear()).has(this.formatDateKey(date));
  }

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const start = qp.get('start');
    const end = qp.get('end');
    const bikeId = qp.get('bikeId');
    const wantsDeepLink =
      isPlatformBrowser(this.platformId) &&
      !!start &&
      !!end &&
      !!bikeId &&
      this.cartBikes().length === 0 &&
      !this.bookingNumber();

    if (wantsDeepLink) {
      // Came from the fleet/detail page with dates + a chosen bike: pre-fill the
      // cart so the flow resolves straight to the requested step (choose-next).
      this.applyDeepLink(start!, end!, Number(bikeId), () =>
        this.listenToStepParam(),
      );
    } else {
      this.listenToStepParam();
    }
  }

  /** Pre-populates dates + cart from a deep link, then runs `done()`. */
  private applyDeepLink(
    start: string,
    end: string,
    bikeId: number,
    done: () => void,
  ): void {
    // A deep link spanning the holiday closure must not pre-fill the cart —
    // drop to the empty date-selection step so the user picks valid dates.
    if (rangeOverlapsClosure(start, end)) {
      done();
      return;
    }
    this.selectedStartDate = start;
    this.selectedEndDate = end;
    // Re-check availability for the range — the bike may have been booked since
    // the fleet/detail page was loaded.
    this.apiService
      .getAvailableBikes(new Date(start), new Date(end))
      .subscribe({
        next: (bikes) => {
          const bike = bikes.find((b) => b.id === bikeId);
          if (bike) {
            this.availableBikes.set(bikes);
            this.bikesLoaded.set(true);
            this.selectedBike.set(bike);
            this.cartBikes.set([
              {
                bike,
                kaution: bike.kaution || 300,
                calculatedPrice: this.calculatePrice(bike, this.daysCount()),
              },
            ]);
          }
          done();
        },
        error: () => done(),
      });
  }

  /** Mirrors the URL `?step=` into component state (and normalizes bad links). */
  private listenToStepParam(): void {
    // Steps live in the URL (?step=…) so the browser back button moves one
    // step back instead of leaving the page and losing all state.
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const raw = params.get('step');
        const requested: BookingStep = BOOKING_STEPS.includes(
          raw as BookingStep,
        )
          ? (raw as BookingStep)
          : 'date-selection';
        const resolved = this.resolveStep(requested);

        if (resolved !== requested && isPlatformBrowser(this.platformId)) {
          // Stale history entry / deep link without state → normalize the URL
          // in place; the subscription re-fires with the resolved step.
          this.syncStepToUrl(resolved, true);
          return;
        }
        const changed = this.currentStep() !== resolved;
        this.currentStep.set(resolved);
        if (changed) this.closeLightbox();
        // Query-param-only navigations don't trigger the router's scroll
        // restoration — jump to the top of the flow ourselves so the user
        // always lands at the step indicator (mobile UX feedback).
        if (changed && isPlatformBrowser(this.platformId)) {
          queueMicrotask(() => window.scrollTo({ top: 0 }));
        }
      });
  }

  /** Downgrades a requested step when its prerequisites are missing. */
  private resolveStep(requested: BookingStep): BookingStep {
    // After a successful booking, never re-enter confirm/form steps via
    // history — protects against accidental double bookings.
    if (this.bookingNumber() && requested !== 'date-selection') {
      return 'success';
    }
    const hasDates = !!this.selectedStartDate && !!this.selectedEndDate;
    switch (requested) {
      case 'success':
        return this.bookingNumber() ? 'success' : 'date-selection';
      case 'review':
      case 'customer-info':
      case 'accessory-selection':
      case 'choose-next':
        return this.cartBikes().length > 0 ? requested : 'date-selection';
      case 'bike-details':
        return this.selectedBike() && hasDates ? requested : 'date-selection';
      case 'bike-selection':
        return hasDates && this.bikesLoaded() ? requested : 'date-selection';
      default:
        return 'date-selection';
    }
  }

  private syncStepToUrl(step: BookingStep, replace: boolean): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { step: step === 'date-selection' ? null : step },
      queryParamsHandling: 'merge',
      replaceUrl: replace,
    });
  }

  proceedToBikeSelection(): void {
    this.dateRangeError.set('');

    if (!this.selectedStartDate || !this.selectedEndDate) {
      this.dateRangeError.set(
        this.t().rentalSteps?.selectBothDates ??
          'Bitte wählen Sie Start- und Enddatum',
      );
      return;
    }

    const start = new Date(this.selectedStartDate);
    const end = new Date(this.selectedEndDate);

    if (start > end) {
      this.dateRangeError.set(
        this.t().rentalSteps?.invalidDateRange ??
          'Enddatum muss nach Startdatum liegen',
      );
      return;
    }

    // The shop is on holiday during the closure window — reject ranges that
    // begin before and end after it (individual closure days are already
    // un-selectable in the calendar).
    if (rangeOverlapsClosure(this.selectedStartDate, this.selectedEndDate)) {
      this.dateRangeError.set(
        this.t().rentalSteps?.closurePeriodError ??
          'In diesem Zeitraum machen wir Urlaub. Bitte wählen Sie andere Daten.',
      );
      return;
    }

    this.loadingAvailableBikes.set(true);
    this.apiService.getAvailableBikes(start, end).subscribe({
      next: (bikes) => {
        this.availableBikes.set(bikes);
        this.bikesLoaded.set(true);
        this.loadingAvailableBikes.set(false);
        this.goToStep('bike-selection');
      },
      error: () => {
        this.dateRangeError.set(
          this.t().rentalSteps?.loadError ?? 'Fehler beim Laden der Fahrräder',
        );
        this.loadingAvailableBikes.set(false);
      },
    });
  }

  selectBikeForDetails(bike: PublicRentalBicycle): void {
    this.selectedBike.set(bike);
    this.currentImageIndex.set(0);
    this.selectedBikeColor = '';
    this.selectedBikeFrameNumber = '';
    this.goToStep('bike-details');
  }

  addBikeToCart(): void {
    if (!this.selectedBike()) return;

    const price = this.calculatePrice(this.selectedBike()!, this.daysCount());
    const cartItem: CartBike = {
      bike: this.selectedBike()!,
      rahmennummer: this.selectedBikeFrameNumber || undefined,
      farbe: this.selectedBikeColor || undefined,
      kaution: this.selectedBike()!.kaution || 300,
      calculatedPrice: price,
    };

    this.cartBikes.update((items) => [...items, cartItem]);
    this.goToStep('choose-next');
  }

  removeFromCart(item: CartBike): void {
    this.cartBikes.update((items) => items.filter((i) => i !== item));
  }

  calculatePrice(bike: PublicRentalBicycle, days: number): number {
    return calculateRentalPrice(bike.preise, days).total ?? 0;
  }

  getTotalPrice(): number {
    return (
      this.cartBikes().reduce(
        (sum, item) => sum + (item.calculatedPrice || 0),
        0,
      ) + this.accessoryTotal()
    );
  }

  // ── Zubehör (accessories) ──
  accessories = signal<RentalAccessoryPublic[]>([]);
  loadingAccessories = signal(false);
  accessoriesLoaded = false;
  /** Map accessoryId → selected quantity. */
  accessoryQtys = signal<Record<number, number>>({});

  /** Inclusive rental days across the selected date range. */
  getRentalDays(): number {
    if (!this.selectedStartDate || !this.selectedEndDate) return 1;
    const start = new Date(this.selectedStartDate);
    const end = new Date(this.selectedEndDate);
    const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    return Math.max(1, diff + 1);
  }

  accessoryQty(id: number): number {
    return this.accessoryQtys()[id] ?? 0;
  }

  incAccessory(id: number): void {
    const map = { ...this.accessoryQtys() };
    map[id] = (map[id] ?? 0) + 1;
    this.accessoryQtys.set(map);
  }

  decAccessory(id: number): void {
    const map = { ...this.accessoryQtys() };
    const next = (map[id] ?? 0) - 1;
    if (next <= 0) delete map[id];
    else map[id] = next;
    this.accessoryQtys.set(map);
  }

  /** Zubehör-Summe = Σ (Tagespreis × Menge × Miettage). */
  accessoryTotal = computed(() => {
    const days = this.getRentalDays();
    const qtys = this.accessoryQtys();
    return this.accessories().reduce((sum, acc) => {
      const qty = qtys[acc.id] ?? 0;
      return sum + acc.tagespreis * qty * days;
    }, 0);
  });

  /** Accessories with a positive quantity, for the review/summary lists. */
  selectedAccessories = computed(() => {
    const qtys = this.accessoryQtys();
    return this.accessories()
      .filter((acc) => (qtys[acc.id] ?? 0) > 0)
      .map((acc) => ({
        accessory: acc,
        menge: qtys[acc.id],
        lineTotal: acc.tagespreis * qtys[acc.id] * this.getRentalDays(),
      }));
  });

  goToAccessoryStep(): void {
    this.loadAccessories();
    this.goToStep('accessory-selection');
  }

  loadAccessories(): void {
    if (this.accessoriesLoaded) return;
    this.loadingAccessories.set(true);
    this.apiService.getRentalAccessories().subscribe({
      next: (items) => {
        this.accessories.set((items ?? []).filter((a) => a.aktiv));
        this.accessoriesLoaded = true;
        this.loadingAccessories.set(false);
      },
      error: () => {
        this.accessories.set([]);
        this.loadingAccessories.set(false);
      },
    });
  }

  getTotalDeposit(): number {
    return this.cartBikes().reduce(
      (sum, item) => sum + (item.kaution || 300),
      0,
    );
  }

  submitBooking(): void {
    if (!this.validateForm()) return;
    this.goToStep('review');
  }

  confirmAndSubmit(): void {
    this.bookingError.set('');
    this.isSubmitting.set(true);

    const bikes: RentalBookingBikeCreate[] = this.cartBikes().map((item) => ({
      bicycleId: item.bike.id,
      startDatum: this.selectedStartDate,
      endDatum: this.selectedEndDate,
      rahmennummer: item.rahmennummer,
      farbe: item.farbe,
      kaution: item.kaution,
    }));

    const accessories: RentalBookingAccessoryCreate[] =
      this.selectedAccessories().map((sel) => ({
        rentalAccessoryId: sel.accessory.id,
        menge: sel.menge,
      }));

    const dto: RentalBookingCreate = {
      bikes,
      vorname: this.bookingForm.vorname,
      nachname: this.bookingForm.nachname,
      email: this.bookingForm.email,
      telefon: this.bookingForm.telefon || undefined,
      strasse: this.bookingForm.strasse || undefined,
      hausNr: this.bookingForm.hausNr || undefined,
      plz: this.bookingForm.plz || undefined,
      ort: this.bookingForm.ort || undefined,
      sprache: this.bookingForm.sprache,
      notizen: this.bookingForm.notizen || undefined,
      accessories: accessories.length > 0 ? accessories : undefined,
      abholzeit: this.bookingForm.abholzeit || undefined,
    };

    this.apiService.createRentalBooking(dto).subscribe({
      next: (response) => {
        this.bookingNumber.set(response.buchungsNummer);
        this.isSubmitting.set(false);
        this.goToStep('success');
      },
      error: () => {
        this.bookingError.set(
          this.t().rentalSteps?.bookingError ??
            'Fehler beim Erstellen der Buchung',
        );
        this.isSubmitting.set(false);
        this.goToStep('review');
      },
    });
  }

  validateForm(): boolean {
    if (!this.bookingForm.vorname.trim()) {
      this.bookingError.set(
        this.t().rentalSteps?.firstNameRequired ?? 'Vorname erforderlich',
      );
      return false;
    }
    if (!this.bookingForm.nachname.trim()) {
      this.bookingError.set(
        this.t().rentalSteps?.lastNameRequired ?? 'Nachname erforderlich',
      );
      return false;
    }
    if (
      !this.bookingForm.email.trim() ||
      !this.isValidEmail(this.bookingForm.email)
    ) {
      this.bookingError.set(
        this.t().rentalSteps?.emailRequired ?? 'Gültige E-Mail erforderlich',
      );
      return false;
    }
    if (!this.bookingForm.telefon.trim()) {
      this.bookingError.set(
        this.t().rentalSteps?.phoneRequired ?? 'Telefon erforderlich',
      );
      return false;
    }
    if (!this.bookingForm.strasse.trim()) {
      this.bookingError.set(
        this.t().rentalSteps?.streetRequired ?? 'Straße erforderlich',
      );
      return false;
    }
    if (!this.bookingForm.hausNr.trim()) {
      this.bookingError.set(
        this.t().rentalSteps?.houseNumberRequired ?? 'Hausnummer erforderlich',
      );
      return false;
    }
    if (!this.bookingForm.plz.trim()) {
      this.bookingError.set(
        this.t().rentalSteps?.postalCodeRequired ?? 'Postleitzahl erforderlich',
      );
      return false;
    }
    if (!this.bookingForm.ort.trim()) {
      this.bookingError.set(
        this.t().rentalSteps?.cityRequired ?? 'Stadt erforderlich',
      );
      return false;
    }
    if (
      !this.bookingForm.abholzeit ||
      !this.abholzeitSlots().includes(this.bookingForm.abholzeit)
    ) {
      this.bookingError.set(
        this.t().rentalSteps?.pickupTimeRequired ??
          'Bitte wählen Sie eine Abholzeit',
      );
      return false;
    }
    this.bookingError.set('');
    return true;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  startNewBooking(): void {
    this.selectedStartDate = '';
    this.selectedEndDate = '';
    this.selectedBike.set(null);
    this.cartBikes.set([]);
    this.bookingNumber.set('');
    this.bikesLoaded.set(false);
    this.termsAccepted.set(false);
    this.bookingForm = {
      vorname: '',
      nachname: '',
      email: '',
      telefon: '',
      strasse: '',
      hausNr: '',
      plz: '',
      ort: '',
      sprache: this.lang(),
      notizen: '',
      abholzeit: '',
    };
    this.goToStep('date-selection');
  }

  goToStep(step: BookingStep): void {
    if (isPlatformBrowser(this.platformId)) {
      // Push the step into the URL; the queryParamMap subscription applies it.
      // Router scrollPositionRestoration ('top') scrolls the page up so the
      // user always lands at the step indicator — never on unrelated content.
      this.syncStepToUrl(step, false);
    } else {
      this.currentStep.set(step);
    }
  }

  getImages(bike: PublicRentalBicycle | null): RentalBikeImage[] {
    if (!bike) return [];
    return [...bike.images].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  }

  getMainImage(bike: PublicRentalBicycle | null): RentalBikeImage | null {
    if (!bike) return null;
    const images = this.getImages(bike);
    if (images.length === 0) return null;
    const index = Math.max(
      0,
      Math.min(this.currentImageIndex(), images.length - 1),
    );
    return images[index];
  }

  getImageUrl(path?: string | null): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;

    const base = environment.apiUrl
      .replace('/api/public', '')
      .replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  // ── Image lightbox (pinch zoom / pan / double-tap / wheel) ──
  lightboxOpen = signal(false);
  lightboxScale = signal(1);
  lightboxTx = signal(0);
  lightboxTy = signal(0);

  private lbPointers = new Map<number, { x: number; y: number }>();
  private lbPinchStart: {
    dist: number;
    scale: number;
    midX: number;
    midY: number;
    tx: number;
    ty: number;
  } | null = null;
  private lbPanStart: { x: number; y: number; tx: number; ty: number } | null =
    null;
  /** Time/position of the last completed clean tap (short, no movement). */
  private lbLastTap = 0;
  private lbLastTapPos = { x: 0, y: 0 };
  /** Current press, candidate for becoming a tap on pointerup. */
  private lbDown: { t: number; x: number; y: number } | null = null;
  private lbSwipeDx = 0;

  private lbKeyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.closeLightbox();
    else if (e.key === 'ArrowLeft') this.lbStep(-1);
    else if (e.key === 'ArrowRight') this.lbStep(1);
  };

  openLightbox(): void {
    this.lbResetTransform();
    this.lightboxOpen.set(true);
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.overflow = 'hidden';
      window.addEventListener('keydown', this.lbKeyHandler);
    }
  }

  closeLightbox(): void {
    if (!this.lightboxOpen()) return;
    this.lightboxOpen.set(false);
    this.lbPointers.clear();
    this.lbPinchStart = null;
    this.lbPanStart = null;
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', this.lbKeyHandler);
    }
  }

  /** Switch to previous/next image, wrapping around. */
  lbStep(dir: number): void {
    const images = this.getImages(this.selectedBike());
    if (images.length < 2) return;
    const next =
      (this.currentImageIndex() + dir + images.length) % images.length;
    this.currentImageIndex.set(next);
    this.lbResetTransform();
  }

  /** +/- buttons. */
  lbZoom(dir: number): void {
    const factor = dir > 0 ? 1.6 : 1 / 1.6;
    this.lbSetScaleAnchored(this.lightboxScale() * factor, 0, 0);
  }

  onLbPointerDown(e: PointerEvent): void {
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // pointer may already be released — capture is best-effort
    }
    this.lbPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.lbPointers.size === 2) {
      const [p1, p2] = [...this.lbPointers.values()];
      const c = this.lbStageCenter();
      this.lbPinchStart = {
        dist: Math.hypot(p1.x - p2.x, p1.y - p2.y),
        scale: this.lightboxScale(),
        midX: (p1.x + p2.x) / 2 - c.x,
        midY: (p1.y + p2.y) / 2 - c.y,
        tx: this.lightboxTx(),
        ty: this.lightboxTy(),
      };
      this.lbPanStart = null;
      this.lbDown = null;
      this.lbLastTap = 0;
    } else if (this.lbPointers.size === 1) {
      const now = Date.now();
      const nearLastTap =
        Math.hypot(
          e.clientX - this.lbLastTapPos.x,
          e.clientY - this.lbLastTapPos.y,
        ) < 40;
      if (now - this.lbLastTap < 300 && nearLastTap) {
        // double tap: toggle zoom anchored at the tap point
        const c = this.lbStageCenter();
        if (this.lightboxScale() > 1) {
          this.lbResetTransform();
        } else {
          this.lbSetScaleAnchored(2.5, e.clientX - c.x, e.clientY - c.y);
        }
        this.lbLastTap = 0;
        this.lbDown = null;
      } else {
        this.lbDown = { t: now, x: e.clientX, y: e.clientY };
      }
      this.lbPanStart = {
        x: e.clientX,
        y: e.clientY,
        tx: this.lightboxTx(),
        ty: this.lightboxTy(),
      };
      this.lbSwipeDx = 0;
    }
  }

  onLbPointerMove(e: PointerEvent): void {
    if (!this.lbPointers.has(e.pointerId)) return;
    this.lbPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.lbPointers.size === 2 && this.lbPinchStart) {
      const [p1, p2] = [...this.lbPointers.values()];
      const st = this.lbPinchStart;
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const ns = Math.min(4, Math.max(1, (st.scale * dist) / st.dist));
      // keep the content point under the pinch midpoint stationary
      const tx = st.midX - ((st.midX - st.tx) * ns) / st.scale;
      const ty = st.midY - ((st.midY - st.ty) * ns) / st.scale;
      this.lightboxScale.set(ns);
      this.lbApplyPan(tx, ty, ns);
    } else if (this.lbPointers.size === 1 && this.lbPanStart) {
      const dx = e.clientX - this.lbPanStart.x;
      const dy = e.clientY - this.lbPanStart.y;
      if (this.lightboxScale() > 1) {
        this.lbApplyPan(
          this.lbPanStart.tx + dx,
          this.lbPanStart.ty + dy,
          this.lightboxScale(),
        );
      } else if (Math.abs(dx) > Math.abs(dy)) {
        this.lbSwipeDx = dx;
      }
    }
  }

  onLbPointerUp(e: PointerEvent): void {
    this.lbPointers.delete(e.pointerId);
    if (this.lbPointers.size < 2) this.lbPinchStart = null;
    if (this.lbPointers.size === 0) {
      // Only a short, motionless press counts as a tap (and can later form
      // a double tap) — releasing a drag must not arm the double-tap timer.
      const d = this.lbDown;
      if (
        d &&
        Date.now() - d.t < 250 &&
        Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10
      ) {
        this.lbLastTap = Date.now();
        this.lbLastTapPos = { x: d.x, y: d.y };
      } else {
        this.lbLastTap = 0;
      }
      this.lbDown = null;
      if (this.lightboxScale() === 1 && Math.abs(this.lbSwipeDx) > 60) {
        this.lbStep(this.lbSwipeDx < 0 ? 1 : -1);
      }
      this.lbPanStart = null;
      this.lbSwipeDx = 0;
    }
  }

  onLbWheel(e: WheelEvent): void {
    e.preventDefault();
    const c = this.lbStageCenter();
    const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    this.lbSetScaleAnchored(
      this.lightboxScale() * factor,
      e.clientX - c.x,
      e.clientY - c.y,
    );
  }

  private lbResetTransform(): void {
    this.lightboxScale.set(1);
    this.lightboxTx.set(0);
    this.lightboxTy.set(0);
  }

  /** Set scale keeping the focal point (relative to stage center) fixed. */
  private lbSetScaleAnchored(scale: number, fx: number, fy: number): void {
    const s = this.lightboxScale();
    const ns = Math.min(4, Math.max(1, scale));
    const tx = fx - ((fx - this.lightboxTx()) * ns) / s;
    const ty = fy - ((fy - this.lightboxTy()) * ns) / s;
    this.lightboxScale.set(ns);
    this.lbApplyPan(tx, ty, ns);
  }

  /** Clamp the pan so the image cannot be dragged fully out of view. */
  private lbApplyPan(tx: number, ty: number, scale: number): void {
    if (scale <= 1) {
      this.lightboxTx.set(0);
      this.lightboxTy.set(0);
      return;
    }
    let maxX = Infinity;
    let maxY = Infinity;
    if (isPlatformBrowser(this.platformId)) {
      const stage = document.querySelector('.lb-stage');
      const img = stage?.querySelector('img');
      if (stage && img) {
        maxX = Math.max(0, (img.clientWidth * scale - stage.clientWidth) / 2);
        maxY = Math.max(0, (img.clientHeight * scale - stage.clientHeight) / 2);
      }
    }
    this.lightboxTx.set(Math.min(maxX, Math.max(-maxX, tx)));
    this.lightboxTy.set(Math.min(maxY, Math.max(-maxY, ty)));
  }

  private lbStageCenter(): { x: number; y: number } {
    if (!isPlatformBrowser(this.platformId)) return { x: 0, y: 0 };
    const rect = document.querySelector('.lb-stage')?.getBoundingClientRect();
    return rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: 0, y: 0 };
  }
}
