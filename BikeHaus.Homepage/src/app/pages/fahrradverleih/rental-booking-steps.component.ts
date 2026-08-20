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
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { ShopInfoService } from '../../services/shop-info.service';
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
  translateAccessoryName,
  translateBikeText,
} from '../../services/german-terms';
import { storeBookingHandoff } from '../../utils/booking-handoff';
import {
  isClosureDay,
  rangeOverlapsClosure,
} from '../../utils/rental-closures';
import {
  LOCALE_BY_LANGUAGE,
  getBookingManagePath,
} from '../../services/language-config';

interface CartBike {
  bike: PublicRentalBicycle;
  rahmennummer?: string;
  farbe?: string;
  kaution?: number;
  calculatedPrice?: number;
}

/**
 * Anzeige-Bündelung mehrerer identischer `CartBike`-Einträge (Stückzahl bei
 * Kinderrädern). `cartBikes` selbst bleibt flach — jeder physische Sitzplatz
 * ist ein eigener Eintrag, so wie ihn `RentalBookingService.CreateAsync` auch
 * als eigenen `RentalBookingBike` anlegt (eigene Kaution, eigene Rückgabe).
 * Diese Gruppe ist nur für die Darstellung/Bedienung; sie fasst Einträge mit
 * gleichem Rad + gleicher Farbe/Rahmennummer zusammen.
 */
interface CartGroup {
  key: string;
  representative: CartBike;
  items: CartBike[];
  count: number;
  totalPrice: number;
  isChild: boolean;
}

/**
 * Die Eingaben des Gasts — und **nur** die. Die Sprache stand hier einmal mit
 * drin, obwohl sie niemand eintippt: sie ist Kontext, nicht Eingabe. Über den
 * Entwurf im sessionStorage kam sie damit als alter Wert zurück (ein in Deutsch
 * begonnener Entwurf machte aus einer türkischen Buchung eine deutsche Mail).
 * Die Sprache wird deshalb erst beim Absenden aus `lang()` gelesen.
 */
interface BookingFormValues {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  strasse: string;
  hausNr: string;
  plz: string;
  ort: string;
  notizen: string;
  abholzeit: string;
}

interface BookingDraftEntry {
  bicycleId: number;
  rahmennummer?: string;
  farbe?: string;
}

/**
 * Zwischenstand einer Buchung im sessionStorage.
 *
 * Der Schritt selbst steht in der URL, der Inhalt lag bisher nur im Speicher der
 * Komponente: ein Reload — auf dem Handy schon der Wechsel in eine andere App —
 * warf den Gast zurück auf den Kalender. Vom Warenkorb wird nur die Fahrrad-ID
 * gespeichert; die Stammdaten kommen beim Wiederherstellen frisch vom Server,
 * damit niemand mit einem Rad weiterläuft, das inzwischen vergeben ist.
 */
interface BookingDraft {
  version: 1;
  savedAt: number;
  startDate: string;
  endDate: string;
  entries: BookingDraftEntry[];
  selectedBikeId: number | null;
  accessoryQtys: Record<number, number>;
  form: BookingFormValues;
  /**
   * Eingegebene Körpergröße im Auswahlschritt. Optional statt Versionssprung:
   * ein Entwurf ohne dieses Feld (aus einer Session vor dieser Änderung) ist
   * weiterhin gültig, die Eingabe bleibt dann einfach leer — kein Grund, den
   * ganzen Zwischenstand zu verwerfen.
   */
  riderHeightCm?: number | null;
}

const DRAFT_STORAGE_KEY = 'bikehaus-rental-booking-draft';
/** Älteres bleibt liegen: Preise und Verfügbarkeit sind dann nicht mehr aktuell. */
const DRAFT_MAX_AGE_MS = 12 * 60 * 60 * 1000;

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
        <!-- Vertrauenszeile: die stärksten Fakten (sofort bestätigt, keine
             Online-Zahlung, kostenlose Stornierung) VOR dem Formular zeigen,
             nicht erst auf der Erfolgsseite. -->
        <ul class="trust-row" role="list">
          <li>
            {{ t().rentalSteps?.trustInstantConfirm ?? 'Sofort bestätigt' }}
          </li>
          <li>
            {{
              t().rentalSteps?.trustPayAtPickup ??
                'Keine Online-Zahlung – bezahlt wird bei Abholung'
            }}
          </li>
          <li>
            {{
              t().rentalSteps?.trustFreeCancellation ?? 'Kostenlose Stornierung'
            }}
          </li>
        </ul>
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

        <div *ngIf="conflictNotice()" class="conflict-notice">
          {{ conflictNotice() }}
        </div>

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
          <div class="bike-filter-row">
            <span class="filter-row-label">{{
              t().rentalSteps?.filterType ?? 'Typ'
            }}</span>
            <div class="bike-filter-chips">
              <button
                type="button"
                class="filter-chip"
                [class.active]="effectiveTypeFilter() === 'all'"
                (click)="bikeTypeFilter.set('all')"
              >
                {{ t().rentalSteps?.filterAll ?? 'Alle' }}
                <span class="chip-count">{{ selectableBikes().length }}</span>
              </button>
              <button
                type="button"
                class="filter-chip"
                *ngFor="let group of bikeTypeGroups()"
                [class.active]="effectiveTypeFilter() === group.key"
                (click)="bikeTypeFilter.set(group.key)"
              >
                {{ localizedTerm(group.label) }}
                <span class="chip-count">{{ group.count }}</span>
              </button>
            </div>
          </div>

          <!-- Zweite Zeile: "passt das Rad zu mir?" ist die Frage, die vor dem
               Typ kommt. Statt fester Stufen-Chips trägt der Gast seine eigene
               Größe ein — natürlicher als "150–160" anzuklicken. Intern bleibt
               die Zuordnung Rad→Bereich unverändert (koerpergroesseVonCm/
               koerpergroesseBisCm); ohne jede gepflegte Größe im aktuellen
               Typ-Filter bleibt die Zeile ganz weg. -->
          <div class="bike-filter-row" *ngIf="hasHeightData()">
            <span class="filter-row-label">
              {{ t().rentalSteps?.riderHeightQuestion ?? 'Wie groß sind Sie?' }}
              (cm)
            </span>
            <div class="height-filter-input">
              <input
                type="number"
                inputmode="numeric"
                class="height-input"
                [min]="RIDER_HEIGHT_MIN"
                [max]="RIDER_HEIGHT_MAX"
                [attr.aria-label]="
                  t().rentalSteps?.riderHeightQuestion ?? 'Wie groß sind Sie?'
                "
                [placeholder]="
                  t().rentalSteps?.riderHeightPlaceholder ?? 'z. B. 175'
                "
                [ngModel]="riderHeightInput()"
                (ngModelChange)="riderHeightInput.set($event)"
              />
              <button
                type="button"
                class="height-reset"
                *ngIf="riderHeightInput() !== null"
                (click)="riderHeightInput.set(null)"
              >
                {{ t().rentalSteps?.showAllSizes ?? 'Alle Größen anzeigen' }}
              </button>
              <!-- Trefferzahl erst, wenn die Eingabe wirklich filtert — beim
                   Tippen von "17" stünde sonst die Gesamtzahl als "Treffer" da. -->
              <span
                class="height-match-count"
                *ngIf="effectiveRiderHeightCm() !== null"
              >
                {{ t().rentalSteps?.matchingBikes ?? 'Passende Räder' }}:
                <span class="chip-count">{{ filteredBikes().length }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Kachel wie in der Verfügbarkeitsansicht im Laden: Bild, Name,
             kurze Merkmale als Chips, darunter der Preis. Die ganze Kachel ist
             der Knopf — das spart die Extra-Schaltfläche und lässt die Räder
             nebeneinander vergleichbar bleiben. -->
        <ng-template #bikeCardTpl let-bike>
          <div
            (click)="toggleBikeInCart(bike)"
            (keydown.enter)="toggleBikeInCart(bike)"
            (keydown.space)="$event.preventDefault(); toggleBikeInCart(bike)"
            class="bike-card"
            [class.selected]="isInCart(bike)"
            role="button"
            tabindex="0"
            [attr.aria-pressed]="isInCart(bike)"
            [attr.aria-label]="bike.marke + ' ' + bike.modell"
          >
            <span class="pick" [class.on]="isInCart(bike)" aria-hidden="true">
              {{ isInCart(bike) ? '✓' : '+' }}
            </span>
            <div class="bike-image">
              <img
                *ngIf="getMainImage(bike)"
                [src]="getImageUrl(getMainImage(bike)?.filePath)"
                [alt]="bike.modell"
              />
              <div class="img-placeholder" *ngIf="!getMainImage(bike)">🚲</div>
            </div>
            <div class="bike-info">
              <h3>{{ bikeName(bike) }}</h3>

              <!-- Typ, Rahmen, Reifen und Körpergröße als Chips statt als
                   Beschriftungsliste: dieselben Angaben, eine Zeile statt vier,
                   und auf dem Handy gut lesbar. -->
              <div class="badges">
                <span class="badge" *ngIf="bike.art || bike.fahrradtyp">
                  {{ localizedTerm(bike.art || bike.fahrradtyp) }}
                </span>
                <span class="badge" *ngIf="shortSize(bike.rahmengroesse)">
                  {{ t().rentalSteps?.frameSize ?? 'Rahmengröße' }}
                  {{ shortSize(bike.rahmengroesse) }}
                </span>
                <span class="badge" *ngIf="shortSize(bike.reifengroesse)">
                  {{ shortSize(bike.reifengroesse) }}"
                </span>
                <!-- "Passt das Rad zu mir?" bleibt auf jeder Kachel sichtbar. -->
                <span class="badge" *ngIf="riderHeight(bike)">
                  ↕ {{ riderHeight(bike) }}
                </span>
              </div>

              <!-- Kinderräder sind Sammelanzeigen — davon lassen sich mehrere
                   Stück direkt auf der Kachel wählen. -->
              <div
                class="card-qty"
                *ngIf="isInCart(bike) && isChildrensBike(bike)"
                (click)="$event.stopPropagation()"
              >
                <button
                  type="button"
                  (click)="decBikeQuantity(bike, $event)"
                  [attr.aria-label]="
                    t().rentalSteps?.decreaseQuantity ?? 'Anzahl verringern'
                  "
                >
                  −
                </button>
                <span class="qty-value">{{ cartCountFor(bike) }}×</span>
                <button
                  type="button"
                  (click)="incBikeQuantity(bike, $event)"
                  [disabled]="cartCountFor(bike) >= CHILD_QTY_MAX"
                  [attr.aria-label]="
                    t().rentalSteps?.increaseQuantity ?? 'Anzahl erhöhen'
                  "
                >
                  +
                </button>
              </div>

              <span class="bike-info-spacer" aria-hidden="true"></span>

              <!-- Der Zeitraum steht bereits fest, also den Preis für genau
                   diesen Zeitraum zeigen statt "ab X €/Tag": bisher musste man
                   jedes Rad öffnen, um zu erfahren, was es wirklich kostet. -->
              <div class="price-row" *ngIf="daysCount() > 0">
                <span class="bike-price">
                  <strong>{{ formatPrice(calculatePrice(bike, daysCount())) }}</strong>
                  <span class="price-period">
                    {{ t().rentalSteps?.forDays ?? 'für' }} {{ daysCount() }}
                    {{
                      daysCount() === 1
                        ? (t().rentalSteps?.day ?? 'Tag')
                        : (t().rentalSteps?.days ?? 'Tage')
                    }}
                  </span>
                </span>
                <span class="bike-deposit" *ngIf="bike.kaution">
                  {{ t().rentalSteps?.deposit ?? 'Kaution' }}
                  {{ formatPrice(bike.kaution) }}
                </span>
              </div>

              <!-- Fotos und alle Angaben bleiben erreichbar, ohne dass der Weg
                   zur Auswahl darüber führt. -->
              <button
                type="button"
                class="card-details-link"
                (click)="$event.stopPropagation(); selectBikeForDetails(bike)"
              >
                {{ t().rentalSteps?.bikeDetails ?? 'Fahrraddetails' }}
              </button>
            </div>
          </div>
        </ng-template>

        <div
          *ngIf="!loadingAvailableBikes() && filteredBikes().length > 0"
          class="bike-grid"
        >
          <ng-container *ngFor="let bike of filteredBikes()">
            <ng-container
              *ngTemplateOutlet="bikeCardTpl; context: { $implicit: bike }"
            ></ng-container>
          </ng-container>
        </div>

        <!-- Räder ohne gepflegte Körpergröße verschwinden nicht mehr aus der
             Liste, sobald gefiltert wird — das würde vorhandenen Bestand
             verstecken. Sie stehen stattdessen sichtbar abgesetzt darunter. -->
        <div
          *ngIf="!loadingAvailableBikes() && unspecifiedHeightBikes().length > 0"
          class="unspecified-height-block"
        >
          <p class="unspecified-height-note">
            {{
              t().rentalSteps?.unspecifiedHeightNote ??
                'Zu diesen Rädern liegt keine Größenangabe vor – bitte fragen Sie uns.'
            }}
          </p>
          <div class="bike-grid">
            <ng-container *ngFor="let bike of unspecifiedHeightBikes()">
              <ng-container
                *ngTemplateOutlet="bikeCardTpl; context: { $implicit: bike }"
              ></ng-container>
            </ng-container>
          </div>
        </div>

        <div
          *ngIf="
            !loadingAvailableBikes() &&
            effectiveRiderHeightCm() !== null &&
            filteredBikes().length === 0 &&
            unspecifiedHeightBikes().length === 0
          "
          class="no-bikes"
        >
          {{
            t().rentalSteps?.noBikesForHeight ??
              'Für diese Größe ist aktuell kein Rad hinterlegt.'
          }}
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

        <!-- Sammelzeile für die Auswahl: mehrere Räder antippen und mit einem
             Klick weiter. Bleibt am unteren Rand stehen, damit sie auch beim
             Scrollen durch die Liste sichtbar ist. -->
        <div class="select-bar" *ngIf="cartBikes().length > 0">
          <span class="sel-count">
            <strong>{{ cartBikes().length }}</strong>
            {{
              cartBikes().length === 1
                ? (t().rentalSteps?.bikeInCart ?? 'Fahrrad')
                : (t().rentalSteps?.bikesInCart ?? 'Fahrräder')
            }}
            <span class="sel-total">{{ formatPrice(getTotalPrice()) }}</span>
          </span>
          <button type="button" class="sel-next" (click)="goToAccessoryStep()">
            {{ t().rentalSteps?.continueToBooking ?? 'Mit Buchung fortfahren' }} →
          </button>
        </div>
      </div>

      <!-- Step 3: Bike Details -->
      <div
        *ngIf="currentStep() === 'bike-details' && selectedBike()"
        class="step-container"
      >
        <h2>{{ bikeName(selectedBike()!) }}</h2>
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
              {{ localizedTerm(selectedBike()!.fahrradtyp) }}
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
                {{ formatPrice(calculatePrice(selectedBike()!, daysCount())) }}
              </p>
              <p
                class="deposit-info"
                *ngIf="depositOf(selectedBike()) !== null"
              >
                <strong>{{ t().rentalSteps?.deposit ?? 'Kaution' }}:</strong>
                {{ formatPrice(depositOf(selectedBike())) }}
              </p>
            </div>

            <!-- Nur Kinderräder sind gepoolte Anzeigen (mehrfach buchbar); bei
                 Erwachsenenrädern ist jedes Rad ein Einzelstück, dort wäre
                 eine Stückzahl > 1 eine Doppelbuchung desselben Rads. -->
            <div class="child-qty-picker" *ngIf="isChildrensBike(selectedBike())">
              <label class="child-qty-label" for="child-qty-input">
                {{ t().rentalSteps?.childBikeQuantityLabel ?? 'Anzahl' }}
              </label>
              <div class="child-qty-stepper">
                <button
                  type="button"
                  (click)="decChildQtyToAdd()"
                  [disabled]="childQtyToAdd() <= CHILD_QTY_MIN"
                  [attr.aria-label]="
                    t().rentalSteps?.decreaseQuantity ?? 'Anzahl verringern'
                  "
                >
                  −
                </button>
                <input
                  id="child-qty-input"
                  type="number"
                  inputmode="numeric"
                  class="child-qty-input"
                  name="childQty"
                  [min]="CHILD_QTY_MIN"
                  [max]="CHILD_QTY_MAX"
                  [ngModel]="childQtyToAdd()"
                  (ngModelChange)="setChildQtyToAdd($event)"
                />
                <button
                  type="button"
                  (click)="incChildQtyToAdd()"
                  [disabled]="childQtyToAdd() >= CHILD_QTY_MAX"
                  [attr.aria-label]="
                    t().rentalSteps?.increaseQuantity ?? 'Anzahl erhöhen'
                  "
                >
                  +
                </button>
              </div>
              <p class="child-qty-hint">
                {{
                  t().rentalSteps?.childBikeQuantityHint ??
                    'Mehrere Kinderräder dieser Größe können Sie in einem Schritt buchen.'
                }}
              </p>
              <p class="child-qty-total" *ngIf="childQtyToAdd() > 1">
                {{ childQtyToAdd() }} ×
                {{ formatPrice(calculatePrice(selectedBike()!, daysCount())) }}
                =
                <strong>{{
                  formatPrice(
                    calculatePrice(selectedBike()!, daysCount()) *
                      childQtyToAdd()
                  )
                }}</strong>
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
            <li *ngFor="let group of cartGroups()" class="cart-list-item">
              <span class="cart-list-item-name">
                {{ group.representative.bike.marke }}
                {{ group.representative.bike.modell }}
              </span>
              <span class="cart-list-item-qty" *ngIf="group.isChild">
                <button
                  type="button"
                  class="qty-btn"
                  (click)="decGroupQuantity(group)"
                  [attr.aria-label]="
                    t().rentalSteps?.decreaseQuantity ?? 'Anzahl verringern'
                  "
                >
                  −
                </button>
                <span class="qty-value">{{ group.count }}</span>
                <button
                  type="button"
                  class="qty-btn"
                  (click)="incGroupQuantity(group)"
                  [disabled]="group.count >= CHILD_QTY_MAX"
                  [attr.aria-label]="
                    t().rentalSteps?.increaseQuantity ?? 'Anzahl erhöhen'
                  "
                >
                  +
                </button>
              </span>
              <span class="cart-list-item-qty-static" *ngIf="!group.isChild && group.count > 1">
                {{ group.count }}×
              </span>
              <span class="item-price">{{ formatPrice(group.totalPrice) }}</span>
            </li>
          </ul>
          <p class="cart-total">
            <strong
              >{{ t().rentalSteps?.totalRental ?? 'Gesamtmiete' }}:</strong
            >
            {{ formatPrice(getTotalPrice()) }}
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
                [alt]="accessoryName(acc.bezeichnung)"
              />
              <div *ngIf="!acc.bildPfad" class="accessory-photo-empty">🚲</div>
            </div>
            <div class="accessory-body">
              <h3>{{ accessoryName(acc.bezeichnung) }}</h3>
              <p *ngIf="acc.beschreibung" class="accessory-desc">
                {{ acc.beschreibung }}
              </p>
              <p class="accessory-price">
                <ng-container *ngIf="acc.tagespreis > 0; else accFree">
                  <ng-container *ngIf="acc.einmalig; else accPerDay">
                    {{ formatPrice(acc.tagespreis) }}
                    {{ t().rentalSteps?.accessoryOneTime ?? 'einmalig' }}
                    <span class="accessory-only-if-used">
                      ({{ t().rentalSteps?.accessoryOnlyIfUsed ?? 'nur bei Verbrauch' }})
                    </span>
                  </ng-container>
                  <ng-template #accPerDay>
                    {{ formatPrice(acc.tagespreis) }} /
                    {{ t().rentalSteps?.day ?? 'Tag' }}
                  </ng-template>
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
          <strong>{{ formatPrice(accessoryTotal()) }}</strong>
        </div>

        <div class="accessory-actions">
          <button (click)="goToStep('customer-info')" class="btn-primary">
            {{ t().rentalSteps?.continue ?? 'Weiter' }}
          </button>
          <!-- Zurück in die Radauswahl: der frühere Zwischenschritt
               ("Fahrrad hinzugefügt") kommt im Ablauf nicht mehr vor. -->
          <button (click)="goToStep('bike-selection')" class="btn-secondary">
            {{ t().rentalSteps?.back ?? 'Zurück' }}
          </button>
        </div>
      </div>

      <!-- Step 4: Customer Information -->
      <div *ngIf="currentStep() === 'customer-info'" class="step-container">
        <h2>{{ t().rentalSteps?.yourInfo ?? 'Ihre Angaben' }}</h2>

        <div class="cart-summary">
          <h3>{{ t().rentalSteps?.cartItems ?? 'Ausgewählte Fahrräder' }}:</h3>
          <div *ngFor="let group of cartGroups()" class="cart-item">
            <div class="cart-item-info">
              <strong>
                {{ group.representative.bike.marke }}
                {{ group.representative.bike.modell }}
              </strong>
              <p>
                {{ formatDisplayDate(selectedStartDate) }} -
                {{ formatDisplayDate(selectedEndDate) }}
              </p>
              <p *ngIf="group.representative.farbe">
                {{ t().rentalSteps?.colorLabel ?? 'Farbe' }}:
                {{ group.representative.farbe }}
              </p>
              <p *ngIf="group.representative.rahmennummer">
                {{ t().rentalSteps?.frameNumberLabel ?? 'Rahmennummer' }}:
                {{ group.representative.rahmennummer }}
              </p>
              <div class="cart-item-qty" *ngIf="group.isChild">
                <span class="cart-item-qty-label"
                  >{{
                    t().rentalSteps?.childBikeQuantityLabel ?? 'Anzahl'
                  }}:</span
                >
                <button
                  type="button"
                  class="qty-btn"
                  (click)="decGroupQuantity(group)"
                  [attr.aria-label]="
                    t().rentalSteps?.decreaseQuantity ?? 'Anzahl verringern'
                  "
                >
                  −
                </button>
                <span class="qty-value">{{ group.count }}</span>
                <button
                  type="button"
                  class="qty-btn"
                  (click)="incGroupQuantity(group)"
                  [disabled]="group.count >= CHILD_QTY_MAX"
                  [attr.aria-label]="
                    t().rentalSteps?.increaseQuantity ?? 'Anzahl erhöhen'
                  "
                >
                  +
                </button>
              </div>
            </div>
            <div class="item-price">
              <p>{{ formatPrice(group.totalPrice) }}</p>
              <button (click)="removeGroup(group)" class="btn-remove">
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

        <!-- autocomplete-Tokens + id/for auf jedem Feld: der Browser füllt
             Name/Adresse mit einem Tipp aus, Labels fokussieren ihr Feld und
             Screenreader lesen sie vor. Die PLZ bleibt bewusst Freitext ohne
             Zahlen-Tastatur: ausländische Postleitzahlen enthalten Buchstaben
             (NL "1234 AB", GB "SW1A 1AA"). -->
        <form (ngSubmit)="submitBooking()" class="customer-form">
          <div class="form-group">
            <label for="booking-vorname"
              >{{ t().rentalSteps?.firstName ?? 'Vorname' }} *:</label
            >
            <input
              id="booking-vorname"
              type="text"
              autocomplete="given-name"
              [(ngModel)]="bookingForm.vorname"
              (input)="clearInvalid('vorname')"
              [class.is-invalid]="fieldInvalid('vorname')"
              [attr.aria-invalid]="fieldInvalid('vorname') || null"
              name="vorname"
              required
            />
          </div>
          <div class="form-group">
            <label for="booking-nachname"
              >{{ t().rentalSteps?.lastName ?? 'Nachname' }} *:</label
            >
            <input
              id="booking-nachname"
              type="text"
              autocomplete="family-name"
              [(ngModel)]="bookingForm.nachname"
              (input)="clearInvalid('nachname')"
              [class.is-invalid]="fieldInvalid('nachname')"
              [attr.aria-invalid]="fieldInvalid('nachname') || null"
              name="nachname"
              required
            />
          </div>
          <div class="form-group">
            <label for="booking-email"
              >{{ t().rentalSteps?.email ?? 'E-Mail' }} *:</label
            >
            <input
              id="booking-email"
              type="email"
              autocomplete="email"
              [(ngModel)]="bookingForm.email"
              (input)="clearInvalid('email')"
              [class.is-invalid]="fieldInvalid('email')"
              [attr.aria-invalid]="fieldInvalid('email') || null"
              name="email"
              required
            />
          </div>
          <div class="form-group">
            <label for="booking-telefon"
              >{{ t().rentalSteps?.phone ?? 'Telefon' }} *:</label
            >
            <input
              id="booking-telefon"
              type="tel"
              autocomplete="tel"
              [(ngModel)]="bookingForm.telefon"
              (input)="clearInvalid('telefon')"
              [class.is-invalid]="fieldInvalid('telefon')"
              [attr.aria-invalid]="fieldInvalid('telefon') || null"
              name="telefon"
              required
            />
          </div>
          <div class="form-group">
            <label for="booking-strasse"
              >{{ t().rentalSteps?.street ?? 'Straße' }} *:</label
            >
            <input
              id="booking-strasse"
              type="text"
              autocomplete="address-line1"
              [(ngModel)]="bookingForm.strasse"
              (input)="clearInvalid('strasse')"
              [class.is-invalid]="fieldInvalid('strasse')"
              [attr.aria-invalid]="fieldInvalid('strasse') || null"
              name="strasse"
              required
            />
          </div>
          <div class="form-group">
            <label for="booking-hausNr"
              >{{ t().rentalSteps?.houseNumber ?? 'Hausnummer' }} *:</label
            >
            <input
              id="booking-hausNr"
              type="text"
              autocomplete="address-line2"
              [(ngModel)]="bookingForm.hausNr"
              (input)="clearInvalid('hausNr')"
              [class.is-invalid]="fieldInvalid('hausNr')"
              [attr.aria-invalid]="fieldInvalid('hausNr') || null"
              name="hausNr"
              required
            />
          </div>
          <div class="form-group">
            <label for="booking-plz"
              >{{ t().rentalSteps?.postalCode ?? 'Postleitzahl' }} *:</label
            >
            <input
              id="booking-plz"
              type="text"
              autocomplete="postal-code"
              [(ngModel)]="bookingForm.plz"
              (input)="clearInvalid('plz')"
              [class.is-invalid]="fieldInvalid('plz')"
              [attr.aria-invalid]="fieldInvalid('plz') || null"
              name="plz"
              required
            />
          </div>
          <div class="form-group">
            <label for="booking-ort"
              >{{ t().rentalSteps?.city ?? 'Stadt' }} *:</label
            >
            <input
              id="booking-ort"
              type="text"
              autocomplete="address-level2"
              [(ngModel)]="bookingForm.ort"
              (input)="clearInvalid('ort')"
              [class.is-invalid]="fieldInvalid('ort')"
              [attr.aria-invalid]="fieldInvalid('ort') || null"
              name="ort"
              required
            />
          </div>
          <div class="form-group">
            <label for="booking-abholzeit"
              >{{ t().rentalSteps?.pickupTime ?? 'Abholzeit' }} *:</label
            >
            <select
              id="booking-abholzeit"
              [(ngModel)]="bookingForm.abholzeit"
              (change)="clearInvalid('abholzeit')"
              [class.is-invalid]="fieldInvalid('abholzeit')"
              [attr.aria-invalid]="fieldInvalid('abholzeit') || null"
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
            <label for="booking-notizen"
              >{{ t().rentalSteps?.notes ?? 'Notizen' }}:</label
            >
            <textarea
              id="booking-notizen"
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
          <div *ngFor="let group of cartGroups()" class="review-item">
            <p>
              <strong
                >{{ group.count > 1 ? group.count + '× ' : '' }}
                {{ group.representative.bike.marke }}
                {{ group.representative.bike.modell }}</strong
              >
            </p>
            <p>
              {{ formatDisplayDate(selectedStartDate) }} -
              {{ formatDisplayDate(selectedEndDate) }} ({{ daysCount() }}
              {{ t().rentalSteps?.days ?? 'Tage' }})
            </p>
            <p *ngIf="group.representative.farbe">
              {{ t().rentalSteps?.colorLabel ?? 'Farbe' }}:
              {{ group.representative.farbe }}
            </p>
            <p *ngIf="group.representative.rahmennummer">
              {{ t().rentalSteps?.frameNumberLabel ?? 'Rahmennummer' }}:
              {{ group.representative.rahmennummer }}
            </p>
            <p class="price">
              {{ t().rentalSteps?.priceLabel ?? 'Preis' }}:
              {{ formatPrice(group.totalPrice) }}
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
              <strong>{{ sel.menge }}× {{ accessoryName(sel.accessory.bezeichnung) }}</strong>
            </p>
            <p class="price">
              <ng-container *ngIf="sel.accessory.tagespreis > 0; else selFree">
                <ng-container *ngIf="sel.accessory.einmalig; else selPerDay">
                  {{ formatPrice(sel.accessory.tagespreis) }}
                  {{ t().rentalSteps?.accessoryOneTime ?? 'einmalig' }} –
                  {{ t().rentalSteps?.accessoryOnlyIfUsed ?? 'nur bei Verbrauch' }}
                </ng-container>
                <ng-template #selPerDay>
                  {{ formatPrice(sel.accessory.tagespreis) }} ×
                  {{ daysCount() }} {{ t().rentalSteps?.days ?? 'Tage' }} =
                  {{ formatPrice(sel.lineTotal) }}
                </ng-template>
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
            <strong>{{ formatPrice(accessoryTotal()) }}</strong>
          </p>
          <p>
            {{ t().rentalSteps?.totalRental ?? 'Gesamtmiete' }}:
            <strong>{{ formatPrice(getTotalPrice()) }}</strong>
          </p>
          <p *ngIf="hasKnownDeposit()">
            {{ t().rentalSteps?.totalDeposit ?? 'Gesamtkaution' }}:
            <strong>{{ formatPrice(getTotalDeposit()) }}</strong>
          </p>
          <p class="info-note">
            {{
              t().rentalSteps?.depositNote ??
                'Die Kaution wird bei Rückgabe des Fahrrads erstattet.'
            }}
          </p>
        </div>

        <!-- Was bei der Abholung passiert: ohne diesen Block erwartet mancher
             Gast nach "Buchung bestätigen" eine Bezahlseite — und die
             Nur-bar-Regel der Kaution stand bisher allein in der E-Mail. -->
        <div class="pickup-info">
          <h3>
            {{ t().rentalSteps?.pickupInfoTitle ?? 'Bezahlung & Abholung' }}
          </h3>
          <p>
            {{
              t().rentalSteps?.paymentAtPickupNote ??
                'Keine Online-Zahlung: Miete und Kaution zahlen Sie bequem bei der Abholung im Laden (Miete bar oder mit Karte).'
            }}
          </p>
          <p *ngIf="hasKnownDeposit()">
            {{
              t().rentalSteps?.depositCashNote ??
                'Wichtig: Die Kaution kann ausschließlich in bar bezahlt werden.'
            }}
          </p>
          <p>
            {{
              t().rentalSteps?.bringPhotoIdNote ??
                'Bitte bringen Sie zur Abholung einen gültigen Lichtbildausweis mit.'
            }}
          </p>
        </div>

        <div class="terms-acceptance">
          <label class="terms-label">
            <!-- Den Zustand aus dem Häkchen selbst lesen, nicht blind umdrehen:
                 ein Tipp auf das Label kann auf dem Handy zwei change-Ereignisse
                 auslösen (Label und Eingabefeld). Mit "umdrehen" hoben die sich
                 gegenseitig auf — das Häkchen blitzte auf und ging wieder aus,
                 der Bestätigen-Knopf blieb grau, und der Gast konnte nicht
                 buchen. So gelesen ist zweimal dasselbe Ereignis harmlos. -->
            <input
              type="checkbox"
              [checked]="termsAccepted()"
              (change)="onTermsToggled($event)"
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

        <p class="success-confirmed-note">
          {{
            t().rentalSteps?.bookingConfirmedNote ??
              'Ihre Buchung ist bereits bestätigt – eine weitere Freigabe ist nicht nötig.'
          }}
        </p>

        <!-- Abhol-Fakten auch hier: die Erfolgsseite ist der Screenshot- und
             Spam-Ordner-Fallback der Bestätigungsmail. -->
        <div class="pickup-info pickup-info--success">
          <p>
            {{
              t().rentalSteps?.paymentAtPickupNote ??
                'Keine Online-Zahlung: Miete und Kaution zahlen Sie bequem bei der Abholung im Laden (Miete bar oder mit Karte).'
            }}
          </p>
          <p *ngIf="hasKnownDeposit()">
            {{
              t().rentalSteps?.depositCashNote ??
                'Wichtig: Die Kaution kann ausschließlich in bar bezahlt werden.'
            }}
          </p>
          <p>
            {{
              t().rentalSteps?.bringPhotoIdNote ??
                'Bitte bringen Sie zur Abholung einen gültigen Lichtbildausweis mit.'
            }}
          </p>
        </div>

        <div class="success-actions">
          <button
            type="button"
            class="btn-secondary"
            (click)="addBookingToCalendar()"
          >
            {{ t().rentalSteps?.addToCalendar ?? 'Zum Kalender hinzufügen' }}
          </button>
        </div>

        <!-- Weg zum Laden: Adresse/Telefon kommen aus ShopInfoService, nicht
             hartcodiert — auf dem Server (SSR) ist der Wert beim ersten Render
             noch leer und erscheint sobald der Browser ihn nachgeladen hat. -->
        <div class="directions-block" *ngIf="shopAddress()">
          <h3>{{ t().rentalSteps?.directionsTitle ?? 'Weg zum Laden' }}</h3>
          <p class="directions-address">{{ shopAddress() }}</p>
          <p class="directions-links">
            <a
              *ngIf="mapsUrl()"
              [href]="mapsUrl()"
              target="_blank"
              rel="noopener"
              class="directions-link"
            >
              {{ t().rentalSteps?.showOnMap ?? 'Route anzeigen' }}
            </a>
            <a *ngIf="shopPhone()" [href]="telHref()" class="directions-link">
              {{ shopPhone() }}
            </a>
          </p>
        </div>

        <p class="manage-booking-note">
          {{
            t().rentalSteps?.manageBookingNote ??
              'Sie möchten etwas ändern oder stornieren? Nutzen Sie dazu den Link in der Bestätigungsmail oder verwalten Sie Ihre Buchung online.'
          }}
          <a
            [routerLink]="manageBookingHref()"
            (click)="handOffBookingToManagePage()"
            class="manage-booking-link"
          >
            {{ t().rentalSteps?.manageBookingLinkText ?? 'Buchung verwalten' }}
          </a>
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
        position: relative;
        border: 1px solid var(--rb-border);
        background: var(--rb-surface);
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
        /* Vollständige Namen brauchen je Rad unterschiedlich viele Zeilen; die
           Spalte hält die Preiszeile trotzdem auf einer Linie. */
        display: flex;
        flex-direction: column;
      }

      .bike-card:hover,
      .bike-card:focus-visible {
        border-color: rgba(255, 87, 34, 0.52);
        box-shadow: 0 8px 20px rgba(255, 87, 34, 0.2);
        transform: translateY(-2px);
        outline: none;
      }

      /* Zeigt an, dass die ganze Kachel der Knopf ist — ohne Hover (Handy)
         wäre das sonst nicht zu sehen. */
      .pick {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 2;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        font-size: 0.95rem;
        font-weight: 700;
        color: #fff;
        background: rgba(15, 23, 42, 0.42);
        pointer-events: none;
        transition: background 0.2s ease;
      }
      .bike-card:hover .pick,
      .bike-card:focus-visible .pick {
        background: var(--rb-accent);
      }

      .bike-image {
        width: 100%;
        aspect-ratio: 4 / 3;
        background: rgba(255, 255, 255, 0.04);
        overflow: hidden;
      }

      .bike-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .img-placeholder {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        font-size: 2.4rem;
        opacity: 0.35;
      }

      .bike-info {
        padding: 0.85rem 0.9rem 0.9rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .bike-info h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: 700;
        /* Marke und Modell stehen immer vollständig da: ein abgeschnittener
           Name ("24 - 24 zoll Kinder…") verrät nicht, welches Rad das ist, und
           genau danach wird hier ausgewählt. Die Kacheln einer Reihe wachsen
           dafür auf die höchste – lieber eine Zeile mehr als ein halber Name. */
        overflow-wrap: anywhere;
      }

      /* Merkmale als Chips: gleiche Angaben wie vorher, aber ohne die
         Beschriftungsspalte, die die Kachel unruhig gemacht hat. */
      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
      }
      .badge {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 6px;
        background: rgba(127, 127, 127, 0.14);
        color: var(--rb-text-soft);
        white-space: nowrap;
      }

      /* Ausgewählt: die Kachel bleibt in der Liste stehen und ist deutlich
         markiert — so sieht man beim Weiterscrollen, was schon drin ist. */
      .bike-card.selected {
        border-color: var(--rb-accent);
        box-shadow: 0 0 0 2px var(--rb-accent) inset;
      }

      .pick.on {
        background: var(--rb-accent);
      }

      /* Stückzahl für Kinderräder direkt auf der Kachel. */
      .card-qty {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        margin-top: 0.55rem;
        padding: 3px;
        border-radius: 999px;
        /* An die Akzentfarbe der Seite gebunden statt an ein festes Orange —
           sonst steht eine orange Pille in einer grünen Kachel. */
        border: 1px solid color-mix(in srgb, var(--rb-accent) 45%, transparent);
        background: color-mix(in srgb, var(--rb-accent) 12%, transparent);
      }
      .card-qty button {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1px solid color-mix(in srgb, var(--rb-accent) 55%, transparent);
        background: transparent;
        color: var(--rb-accent);
        font-size: 1.05rem;
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
      }
      .card-qty button:hover:not(:disabled) {
        background: var(--rb-accent);
        color: #fff;
      }
      .card-qty button:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .card-qty .qty-value {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--rb-accent);
        min-width: 2.1rem;
        text-align: center;
        letter-spacing: 0.02em;
      }

      /* Fotos und alle Angaben bleiben einen Klick entfernt, ohne im Weg zu stehen. */
      .card-details-link {
        margin-top: 0.5rem;
        padding: 0;
        background: none;
        border: none;
        color: var(--rb-text-muted, #6b7280);
        font-size: 0.75rem;
        font-weight: 600;
        text-decoration: underline;
        cursor: pointer;
        align-self: flex-start;
      }
      .card-details-link:hover {
        color: var(--rb-accent);
      }

      /* Auswahlleiste: klebt am unteren Rand, solange etwas gewählt ist. */
      .select-bar {
        position: sticky;
        bottom: 0;
        z-index: 5;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin: 0 0 1.5rem;
        padding: 0.75rem 1rem;
        border: 1px solid var(--rb-border);
        border-radius: 12px;
        /* --rb-surface ist nur ein heller Schleier (6 % Weiß) — über den
           Fahrradfotos war die Leiste dadurch kaum zu lesen. Deshalb ein
           eigener, deckender Grund statt der halbtransparenten Fläche. */
        background: rgba(10, 16, 28, 0.94);
        backdrop-filter: blur(8px);
        box-shadow: 0 -6px 22px rgba(0, 0, 0, 0.45);
      }
      .sel-count {
        font-size: 0.9rem;
        display: flex;
        align-items: baseline;
        gap: 0.4rem;
        flex: 1;
        min-width: 0;
      }
      .sel-count strong {
        font-size: 1.15rem;
        font-weight: 800;
      }
      .sel-total {
        color: var(--rb-accent);
        font-weight: 800;
      }
      .sel-next {
        padding: 0.6rem 1.1rem;
        border: none;
        border-radius: 999px;
        background: var(--rb-accent);
        color: #fff;
        font-size: 0.9rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
      }
      .sel-next:hover {
        filter: brightness(1.08);
      }

      /* Hält die Preiszeile aller Kacheln einer Reihe auf einer Linie. */
      .bike-info-spacer {
        flex: 1 1 auto;
        min-height: 0.7rem;
      }

      .price-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 0.5rem;
        border-top: 1px solid var(--rb-border);
        padding-top: 0.6rem;
      }

      .bike-price {
        color: var(--rb-accent);
        font-weight: 600;
        margin: 0;
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 0.3rem;
      }
      .bike-price strong {
        font-size: 1.15rem;
        font-weight: 800;
      }
      .price-period {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--rb-text-muted, #6b7280);
      }

      .bike-deposit {
        margin: 0;
        font-size: 0.74rem;
        color: var(--rb-text-muted, #6b7280);
        white-space: nowrap;
      }

      /* ── Typ- und Körpergrößen-Filter über dem Raster ── */
      .bike-filter-bar {
        margin: 1.25rem 0 0.25rem;
      }
      .bike-filter-row {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .bike-filter-row + .bike-filter-row {
        margin-top: 0.7rem;
      }
      .filter-row-label {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--rb-text-muted, #6b7280);
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

      /* ── Körpergrößen-Eingabe (ersetzt die früheren Stufen-Chips) ── */
      .height-filter-input {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.6rem;
      }
      .height-input {
        width: 5.5rem;
        padding: 0.45rem 0.7rem;
        border-radius: 999px;
        border: 1px solid var(--rb-border);
        background: transparent;
        color: inherit;
        font-size: 0.9rem;
        font-weight: 600;
        text-align: center;
        font-family: inherit;
      }
      .height-input:focus-visible {
        outline: none;
        border-color: var(--rb-accent);
      }
      /* Klar erkennbarer Weg zurück zu "alle Größen" — kein verstecktes X im Input. */
      .height-reset {
        background: none;
        border: none;
        padding: 0;
        color: var(--rb-accent);
        font-size: 0.82rem;
        font-weight: 600;
        text-decoration: underline;
        cursor: pointer;
      }
      .height-reset:hover {
        opacity: 0.8;
      }
      .height-match-count {
        font-size: 0.82rem;
        color: var(--rb-text-muted, #6b7280);
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
      }

      /* Räder ohne gepflegte Körpergröße: eigene Gruppe statt stillem
         Ausblenden — sichtbar abgesetzt unterhalb der Treffer. */
      .unspecified-height-block {
        margin-top: 1.5rem;
        padding-top: 1.25rem;
        border-top: 1px dashed var(--rb-border);
      }
      .unspecified-height-note {
        font-size: 0.82rem;
        color: var(--rb-text-muted, #6b7280);
        margin: 0 0 0.75rem;
      }

      .selection-actions {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
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

      /* Stückzahl-Auswahl im Detailschritt (nur Kinderräder). */
      .child-qty-picker {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--rb-surface);
        border: 1px solid var(--rb-border);
        border-radius: 8px;
      }

      .child-qty-label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.6rem;
      }

      .child-qty-stepper {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .child-qty-stepper button {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        border-radius: 8px;
        border: 1.5px solid var(--rb-border);
        background: transparent;
        color: var(--rb-text);
        font-size: 1.2rem;
        line-height: 1;
        cursor: pointer;
      }

      .child-qty-stepper button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .child-qty-input {
        width: 4rem;
        flex-shrink: 0;
        text-align: center;
        padding: 0.5rem;
        border: 1px solid var(--rb-border);
        border-radius: 6px;
        font-size: 1rem;
        background: rgba(255, 255, 255, 0.04);
        color: var(--rb-text);
      }

      .child-qty-hint {
        margin: 0.6rem 0 0;
        font-size: 0.85rem;
      }

      .child-qty-total {
        margin: 0.5rem 0 0;
        font-size: 0.95rem;
        color: var(--rb-text-soft);
      }

      .child-qty-total strong {
        color: var(--rb-accent);
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
      .form-group select,
      .form-group textarea {
        padding: 0.75rem;
        border: 1px solid var(--rb-border);
        border-radius: 6px;
        /* 16px fest, nicht rem: unter 16px zoomt iOS-Safari bei jedem Fokus
           in das Formular hinein (Mobile-Root ist 15px). */
        font-size: 16px;
        font-family: inherit;
        background: var(--rb-surface);
        color: var(--rb-text);
      }

      .form-group input.is-invalid,
      .form-group select.is-invalid,
      .form-group textarea.is-invalid {
        border-color: #ef4444;
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

      /* Cart-Liste im Schritt "choose-next": Name muss schrumpfen dürfen
         (min-width: 0 + Ellipsis), die Stückzahl-Steuerung und der Preis
         dagegen nie — sonst kippt die Namensspalte bei wenig Platz auf eine
         einzelne Zeichenbreite (schon einmal in einer Nachbarliste passiert). */
      .cart-list {
        list-style: none;
        margin: 0 0 1rem;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .cart-list-item {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.6rem 0.75rem;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 6px;
      }

      .cart-list-item-name {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cart-list-item-qty,
      .cart-item-qty {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        flex-shrink: 0;
      }

      .cart-item-qty {
        margin-top: 0.5rem;
      }

      .cart-item-qty-label {
        font-size: 0.85rem;
        color: var(--rb-text-soft);
      }

      .cart-list-item-qty-static {
        flex-shrink: 0;
        color: var(--rb-text-soft);
        font-size: 0.85rem;
      }

      .qty-btn {
        width: 26px;
        height: 26px;
        flex-shrink: 0;
        border-radius: 6px;
        border: 1.5px solid var(--rb-border);
        background: transparent;
        color: var(--rb-text);
        font-size: 1rem;
        line-height: 1;
        cursor: pointer;
      }

      .qty-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .qty-value {
        min-width: 1.25rem;
        text-align: center;
        font-weight: 700;
        flex-shrink: 0;
      }

      .cart-count,
      .cart-total {
        margin: 0 0 0.75rem;
        font-size: 0.95rem;
      }

      .cart-total {
        margin: 0.75rem 0 0;
        padding-top: 0.75rem;
        border-top: 1px solid var(--rb-border);
        font-size: 1.05rem;
      }

      .choose-next-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-top: 1rem;
      }

      /* .cart-item (customer-info-Schritt) ist ein Zwei-Spalten-Flexrow: die
         Info-Spalte muss schrumpfen dürfen, der Preis/Entfernen-Block bleibt
         fest — sonst derselbe Kipp-Effekt wie in .cart-list-item. */
      .cart-item-info {
        flex: 1 1 auto;
        min-width: 0;
      }

      .item-price {
        flex-shrink: 0;
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
      .accessory-only-if-used {
        display: block;
        color: var(--rb-text-muted, #64748b);
        font-weight: 500;
        font-size: 0.82rem;
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

      .trust-row {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem 1.25rem;
        padding: 0;
        margin: -0.25rem 0 1.25rem;
      }

      .trust-row li {
        font-size: 0.85rem;
        color: var(--rb-text-soft);
      }

      .trust-row li::before {
        content: '✓ ';
        color: #64d68a;
        font-weight: 700;
      }

      .pickup-info {
        background: var(--rb-surface);
        border: 1px solid var(--rb-border);
        border-radius: 8px;
        padding: 1.1rem 1.25rem;
        margin-bottom: 2rem;
      }

      .pickup-info h3 {
        margin: 0 0 0.5rem;
        font-size: 1.02rem;
      }

      .pickup-info p {
        margin: 0.4rem 0;
        font-size: 0.9rem;
        color: var(--rb-text-soft);
      }

      .pickup-info--success {
        margin: 1.25rem auto;
        max-width: 420px;
        text-align: left;
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

      .success-confirmed-note {
        color: #64d68a !important;
        font-weight: 600;
        font-size: 0.95rem !important;
      }

      .success-actions {
        display: flex;
        justify-content: center;
        margin: 1.25rem 0;
      }

      .success-actions .btn-secondary {
        flex: none;
        min-width: 220px;
      }

      .directions-block {
        margin: 1.5rem auto;
        max-width: 420px;
        padding: 1.25rem 1.5rem;
        border-radius: 12px;
        background: var(--rb-surface);
        border: 1px solid var(--rb-border);
        text-align: left;
      }

      .directions-block h3 {
        margin: 0 0 0.5rem;
        font-size: 1.05rem;
      }

      .directions-address {
        margin: 0 0 0.75rem !important;
        font-size: 0.95rem !important;
      }

      .directions-links {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin: 0 !important;
      }

      .directions-link {
        color: var(--rb-accent);
        text-decoration: underline;
        text-underline-offset: 2px;
        font-weight: 600;
        font-size: 0.9rem !important;
      }

      .manage-booking-note {
        font-size: 0.88rem !important;
        color: var(--rb-text-soft) !important;
        max-width: 480px;
        margin: 1.5rem auto !important;
        line-height: 1.5;
      }

      .manage-booking-link {
        color: var(--rb-accent);
        text-decoration: underline;
        text-underline-offset: 2px;
        font-weight: 600;
        white-space: nowrap;
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

      /* Kein Fehler des Gastes, sondern eine überholte Auswahl — deshalb
         Bernstein statt Rot. */
      .conflict-notice {
        background: rgba(245, 158, 11, 0.12);
        color: #fde68a;
        padding: 1rem;
        border-radius: 6px;
        margin: 1rem 0;
        border-left: 4px solid #f59e0b;
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
          aspect-ratio: 4 / 3;
        }

        .bike-info {
          padding: 0.5rem 0.55rem 0.6rem;
        }

        .bike-info h3 {
          font-size: 0.8rem;
          margin-bottom: 0.3rem;
          /* Auch auf der schmalen Kachel vollständig – notfalls über mehrere
             Zeilen, statt "24 - 24 zoll Kinder…" zu zeigen. */
          line-height: 1.25;
        }

        /* Auf der schmalen Kachel bleiben die Chips in einer scrollfreien
           Reihe: kleiner Text, enger Abstand. */
        .badges {
          gap: 0.22rem;
        }

        .badge {
          font-size: 0.64rem;
          padding: 2px 6px;
        }

        .bike-price strong {
          font-size: 0.95rem;
        }

        .price-period,
        .bike-deposit {
          font-size: 0.64rem;
        }

        .price-row {
          padding-top: 0.45rem;
          /* Preis und Kaution passen nebeneinander nicht mehr in 160 px. */
          flex-direction: column;
          align-items: flex-start;
          gap: 0.1rem;
        }

        .bike-info-spacer {
          min-height: 0.4rem;
        }

        .card-details-link {
          font-size: 0.66rem;
          margin-top: 0.35rem;
        }

        .card-qty {
          gap: 0.35rem;
          margin-top: 0.4rem;
        }
        .card-qty button {
          width: 24px;
          height: 24px;
          font-size: 0.95rem;
        }
        .card-qty .qty-value {
          font-size: 0.98rem;
          min-width: 1.9rem;
        }

        .select-bar {
          gap: 0.5rem;
          padding: 0.6rem 0.75rem;
        }
        .sel-count {
          font-size: 0.78rem;
        }
        .sel-count strong {
          font-size: 1rem;
        }
        .sel-next {
          padding: 0.5rem 0.9rem;
          font-size: 0.8rem;
        }

        .pick {
          width: 22px;
          height: 22px;
          font-size: 0.8rem;
          top: 6px;
          right: 6px;
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

        .bike-filter-row + .bike-filter-row {
          margin-top: 0.5rem;
        }

        /* 375px-Handy: Eingabe, Zurücksetzen-Link und Trefferzahl bleiben in
           einer Zeile lesbar statt breit umzubrechen. */
        .height-filter-input {
          gap: 0.4rem 0.6rem;
        }

        .height-input {
          width: 4.2rem;
          padding: 0.3rem 0.5rem;
          font-size: 0.82rem;
        }

        .height-reset,
        .height-match-count {
          font-size: 0.72rem;
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
  private shopInfoService = inject(ShopInfoService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private document = inject(DOCUMENT);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  // ── Erfolgsseite: Weg zum Laden ──
  // ShopInfoService cacht die Stammdaten des Ladens (Adresse/Telefon kommen
  // aus dem Backend, nicht hartcodiert). Beim SSR-Rendern ist der Wert noch
  // leer (die Service-Konstruktion überspringt den Remote-Call serverseitig);
  // im Browser füllt sich das Signal kurz nach dem Laden nach.
  private shopInfo = this.shopInfoService.shopInfo;

  shopAddress = computed(() => {
    const info = this.shopInfo();
    if (!info) return '';
    const line1 = [info.strasse, info.hausnummer].filter(Boolean).join(' ');
    const line2 = [info.plz, info.stadt].filter(Boolean).join(' ');
    return [line1, line2].filter(Boolean).join(', ');
  });

  mapsUrl = computed(() => {
    const address = this.shopAddress();
    if (!address) return '';
    return (
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(address)
    );
  });

  shopPhone = computed(() => this.shopInfo()?.telefon ?? '');

  telHref = computed(() => {
    const phone = this.shopPhone();
    return phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : '';
  });

  /** Ziel des "Buchung verwalten"-Links auf der Erfolgsseite. */
  manageBookingHref(): string {
    return getBookingManagePath(this.lang());
  }

  /**
   * Füllt das Formular der Seite "Buchung verwalten" vor, ohne Buchungsnummer
   * und E-Mail in die URL zu schreiben — die stünden sonst im Browserverlauf und
   * in jedem geteilten Link. Läuft synchron vor der Navigation des routerLink.
   */
  handOffBookingToManagePage(): void {
    storeBookingHandoff({
      bookingNumber: this.bookingNumber(),
      email: this.bookingForm.email,
    });
  }

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

  /** Plausible Grenzen für die Kinderrad-Stückzahl; auch im Template gebraucht. */
  readonly CHILD_QTY_MIN = 1;
  readonly CHILD_QTY_MAX = 10;

  /**
   * Stückzahl, die im Detailschritt vor "Zur Buchung hinzufügen" gewählt wird —
   * nur bei Kinderrädern sichtbar. Beim Absenden wird daraus kein Mengenfeld,
   * sondern n einzelne `CartBike`-Einträge mit derselben `bicycleId` (s.
   * `addBikeToCart`): jedes physische Rad bekommt später eigene Kaution,
   * Rückgabe und Zustand, genau wie bei einem einzeln hinzugefügten Rad.
   */
  childQtyToAdd = signal(1);

  private clampChildQty(value: number | null | undefined): number {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return this.CHILD_QTY_MIN;
    return Math.min(this.CHILD_QTY_MAX, Math.max(this.CHILD_QTY_MIN, n));
  }

  setChildQtyToAdd(value: number | string | null): void {
    this.childQtyToAdd.set(this.clampChildQty(Number(value)));
  }

  incChildQtyToAdd(): void {
    this.childQtyToAdd.update((v) => this.clampChildQty(v + 1));
  }

  decChildQtyToAdd(): void {
    this.childQtyToAdd.update((v) => this.clampChildQty(v - 1));
  }

  /**
   * Bündelt `cartBikes()` für die Anzeige nach Rad + Farbe + Rahmennummer.
   * Nur für Darstellung/Bedienung — die zugrundeliegenden Einträge bleiben
   * flach und einzeln (Entwurf, Konflikt-Wiederherstellung, Absenden greifen
   * unverändert auf `cartBikes()` zu).
   */
  cartGroups = computed<CartGroup[]>(() => {
    const groups = new Map<string, CartGroup>();
    const order: string[] = [];
    for (const item of this.cartBikes()) {
      const key = `${item.bike.id}|${item.rahmennummer ?? ''}|${item.farbe ?? ''}`;
      let group = groups.get(key);
      if (!group) {
        group = {
          key,
          representative: item,
          items: [],
          count: 0,
          totalPrice: 0,
          isChild: this.isChildrensBike(item.bike),
        };
        groups.set(key, group);
        order.push(key);
      }
      group.items.push(item);
      group.count++;
      group.totalPrice += item.calculatedPrice || 0;
    }
    return order.map((key) => groups.get(key)!);
  });

  // ── Auswahl direkt in der Liste ───────────────────────────────────────────
  // Antippen legt das Rad in die Buchung oder nimmt es wieder heraus; mehrere
  // Räder werden nacheinander angetippt und gemeinsam mit einem "Weiter"
  // übernommen.

  /** Wie oft steckt dieses Rad in der Buchung? (Kinderräder: Stückzahl) */
  cartCountFor(bike: PublicRentalBicycle): number {
    return this.cartBikes().filter((item) => item.bike.id === bike.id).length;
  }

  isInCart(bike: PublicRentalBicycle): boolean {
    return this.cartCountFor(bike) > 0;
  }

  toggleBikeInCart(bike: PublicRentalBicycle): void {
    this.conflictNotice.set('');
    if (this.isInCart(bike)) {
      this.cartBikes.update((items) => items.filter((i) => i.bike.id !== bike.id));
      this.saveDraft();
      return;
    }
    this.addBikesDirect(bike, 1);
  }

  /** Kinderräder sind Sammelanzeigen: davon dürfen mehrere Stück gebucht werden. */
  incBikeQuantity(bike: PublicRentalBicycle, event: Event): void {
    event.stopPropagation();
    if (!this.isChildrensBike(bike)) return;
    if (this.cartCountFor(bike) >= this.CHILD_QTY_MAX) return;
    this.addBikesDirect(bike, 1);
  }

  decBikeQuantity(bike: PublicRentalBicycle, event: Event): void {
    event.stopPropagation();
    const items = this.cartBikes().filter((i) => i.bike.id === bike.id);
    if (items.length === 0) return;
    const last = items[items.length - 1];
    this.cartBikes.update((list) => {
      const idx = list.lastIndexOf(last);
      return idx === -1 ? list : [...list.slice(0, idx), ...list.slice(idx + 1)];
    });
    this.saveDraft();
  }

  /** Legt n Einträge dieses Rads in die Buchung (jedes Rad bleibt ein eigener Eintrag). */
  private addBikesDirect(bike: PublicRentalBicycle, qty: number): void {
    const price = this.calculatePrice(bike, this.daysCount());
    const items: CartBike[] = Array.from({ length: qty }, () => ({
      bike,
      rahmennummer: undefined,
      farbe: undefined,
      kaution: bike.kaution ?? undefined,
      calculatedPrice: price,
    }));
    this.cartBikes.update((list) => [...list, ...items]);
    this.saveDraft();
  }

  /** Fügt der Gruppe ein weiteres identisches Rad hinzu (nur Kinderräder). */
  incGroupQuantity(group: CartGroup): void {
    if (!group.isChild || group.count >= this.CHILD_QTY_MAX) return;
    const template = group.representative;
    this.cartBikes.update((items) => [...items, { ...template }]);
    this.saveDraft();
  }

  /** Entfernt ein Rad aus der Gruppe; bei der letzten Stückzahl fliegt die
   * ganze Gruppe raus (entspricht dem alten "×"-Entfernen-Knopf). */
  decGroupQuantity(group: CartGroup): void {
    if (group.count <= 1) {
      this.removeGroup(group);
      return;
    }
    const toRemove = group.items[group.items.length - 1];
    this.cartBikes.update((items) => {
      const idx = items.lastIndexOf(toRemove);
      if (idx === -1) return items;
      return [...items.slice(0, idx), ...items.slice(idx + 1)];
    });
    this.saveDraft();
  }

  /** Entfernt alle Einträge einer Gruppe aus dem Warenkorb. */
  removeGroup(group: CartGroup): void {
    const toRemove = new Set(group.items);
    this.cartBikes.update((items) => items.filter((i) => !toRemove.has(i)));
    this.saveDraft();
  }

  selectableBikes = computed(() => {
    // Gewählte Räder bleiben in der Liste stehen und sind dort als ausgewählt
    // markiert — man tippt sie nacheinander an und geht einmal weiter. Früher
    // verschwand ein Rad, sobald es in der Buchung war; dann brauchte es den
    // Umweg über "Weiteres Fahrrad hinzufügen".
    //
    // Immer alphabetisch nach dem angezeigten Namen: die Reihenfolge aus der
    // API ist die Anlagereihenfolge im Bestand und wechselt daher von Anfrage
    // zu Anfrage. Zahlen werden dabei als Zahl verglichen, damit "20 Zoll" vor
    // "24 Zoll" und "100" nicht vor "20" steht.
    const collator = new Intl.Collator(
      LOCALE_BY_LANGUAGE[this.lang()] ?? 'de-DE',
      { numeric: true, sensitivity: 'base' },
    );
    return this.availableBikes()
      .slice()
      .sort((a, b) => collator.compare(this.bikeLabel(a), this.bikeLabel(b)));
  });

  /** Name der Kachel: Marke und Modell, so wie sie dort auch stehen. */
  /**
   * Fahrrad- und Zubehörnamen kommen auf Deutsch aus der Verwaltung. Auf einer
   * anderssprachigen Seite werden die bekannten Begriffe darin übersetzt
   * ("20 zoll Kinder Fahrrad" → "20 inch kids' bike"); Marken und Maße bleiben.
   */
  bikeName(bike: PublicRentalBicycle): string {
    return translateBikeText(this.bikeLabel(bike), this.lang());
  }

  /** Einzelbegriff wie ein Typ-Chip ("Kinderrad") oder das Feld "Typ". */
  localizedTerm(value: string | null | undefined): string {
    return translateBikeText(value, this.lang());
  }

  accessoryName(value: string | null | undefined): string {
    return translateAccessoryName(value, this.lang());
  }

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

  /**
   * Ein gewählter Chip kann verschwinden, sobald sich der Zeitraum (und damit
   * die Verfügbarkeit) ändert. Statt dann ein leeres Raster zu zeigen, fällt
   * der Filter auf "Alle" zurück, ohne dass die Auswahl aktiv zurückgesetzt
   * werden muss.
   */
  effectiveTypeFilter = computed(() => {
    const key = this.bikeTypeFilter();
    if (key === 'all') return 'all';
    return this.bikeTypeGroups().some((group) => group.key === key)
      ? key
      : 'all';
  });

  typeFilteredBikes = computed(() => {
    const filter = this.effectiveTypeFilter();
    if (filter === 'all') return this.selectableBikes();
    return this.selectableBikes().filter(
      (bike) => this.normalizeBikeType(bike) === filter,
    );
  });

  /**
   * Eingegebene Körpergröße des Gasts in cm ("Wie groß sind Sie?"); `null` =
   * kein Filter. Freie Zahleneingabe statt fester Chips-Stufen, weil das für
   * Gäste die natürlichere Frage ist — die Zuordnung Rad→Bereich über
   * koerpergroesseVonCm/koerpergroesseBisCm bleibt intern unverändert.
   */
  riderHeightInput = signal<number | null>(null);

  /** Plausible Grenzen für die Eingabe; auch im Template für [min]/[max] gebraucht. */
  readonly RIDER_HEIGHT_MIN = 100;
  readonly RIDER_HEIGHT_MAX = 220;

  /**
   * Wirksame Körpergröße: alles außerhalb des plausiblen Bereichs zählt als
   * "kein Filter". Beim Tippen von "170" steht zwischendurch "1" und "17" im
   * Feld — geklemmt würde daraus kurz ein Filter auf 100 cm und das Raster
   * sprang auf Kinderräder. Ebenso greift der Filter nicht, wenn die
   * Eingabezeile gar nicht sichtbar ist (kein Rad im aktuellen Typ-Filter hat
   * eine gepflegte Größe): ein unsichtbarer Filter, den niemand zurücksetzen
   * kann, wäre schlimmer als keiner.
   */
  effectiveRiderHeightCm = computed(() => {
    const raw = this.riderHeightInput();
    if (raw === null || Number.isNaN(raw)) return null;
    if (raw < this.RIDER_HEIGHT_MIN || raw > this.RIDER_HEIGHT_MAX) return null;
    return this.hasHeightData() ? raw : null;
  });

  /**
   * Ob im aktuellen Typ-Filter überhaupt Räder mit gepflegter Körpergröße
   * stehen — ohne das bleibt die Eingabezeile ganz weg statt einen Filter
   * anzubieten, der nirgends greift.
   */
  hasHeightData = computed(() =>
    this.typeFilteredBikes().some(
      (bike) => bike.koerpergroesseVonCm != null || bike.koerpergroesseBisCm != null,
    ),
  );

  /**
   * Passt ein Rad zur eingegebenen Größe? Ist nur eine Grenze gepflegt, gilt
   * die offene Seite als passend (z.B. nur "ab 165 cm" gepflegt → auch für
   * 210 cm ein Treffer).
   */
  private matchesRiderHeight(bike: PublicRentalBicycle, heightCm: number): boolean {
    const from = bike.koerpergroesseVonCm ?? null;
    const to = bike.koerpergroesseBisCm ?? null;
    if (from !== null && heightCm < from) return false;
    if (to !== null && heightCm > to) return false;
    return true;
  }

  /**
   * Treffer für die eingegebene Größe. Räder ohne jede gepflegte Angabe
   * gehören NICHT hierher — sie würden sonst bei jeder Eingabe unsichtbar aus
   * dem Bestand verschwinden. Sie stehen separat in `unspecifiedHeightBikes`.
   */
  filteredBikes = computed(() => {
    const height = this.effectiveRiderHeightCm();
    const bikes = this.typeFilteredBikes();
    if (height === null) return bikes;
    return bikes.filter(
      (bike) =>
        (bike.koerpergroesseVonCm != null || bike.koerpergroesseBisCm != null) &&
        this.matchesRiderHeight(bike, height),
    );
  });

  /**
   * Räder ohne gepflegte Körpergröße: nur relevant, solange eine Größe
   * eingegeben ist. Statt sie mit den anderen Nicht-Treffern verschwinden zu
   * lassen, tauchen sie hinter den Treffern in einer eigenen Gruppe auf — das
   * versteckt keinen Bestand.
   */
  unspecifiedHeightBikes = computed(() => {
    if (this.effectiveRiderHeightCm() === null) return [];
    return this.typeFilteredBikes().filter(
      (bike) => bike.koerpergroesseVonCm == null && bike.koerpergroesseBisCm == null,
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
    // Symbole statt "ab"/"bis": die Angabe steht auf jeder Kachel und wäre in
    // den anderen elf Sprachen sonst das einzige deutsche Wort darin.
    if (from) return `≥ ${from} cm`;
    if (to) return `≤ ${to} cm`;
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
  /**
   * Hinweis über dem Fahrradraster, wenn das Absenden an der Verfügbarkeit
   * gescheitert ist — jemand war im gleichen Zeitraum schneller.
   */
  conflictNotice = signal('');
  isSubmitting = signal(false);
  bookingNumber = signal('');
  termsAccepted = signal(false);

  /**
   * Übernimmt den Zustand des Häkchens, statt den bisherigen umzudrehen.
   * Idempotent: kommt dasselbe Ereignis zweimal an (Tipp auf das Label löst auf
   * dem Handy Label **und** Eingabefeld aus), bleibt das Ergebnis dasselbe.
   */
  onTermsToggled(event: Event): void {
    this.termsAccepted.set((event.target as HTMLInputElement)?.checked === true);
  }

  bookingForm: BookingFormValues = {
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    strasse: '',
    hausNr: '',
    plz: '',
    ort: '',
    notizen: '',
    abholzeit: '',
  };

  // Pickup-time slots (30-min) for the START day, based on the shop's rental
  // handover hours: Mon–Thu 10:00–18:00, Fri 10:00–13:00 & 15:00–18:00 (lunch
  // break), Sat 11:00–18:00, Sun closed. Last pickup is 17:30 (return by 18:00).
  abholzeitSlots(): string[] {
    if (!this.selectedStartDate) return [];
    return this.slotsForDateKey(this.selectedStartDate);
  }

  /**
   * Vorlauf für eine Abholung am selben Tag: Zeiten, die weniger als eine halbe
   * Stunde entfernt sind, stehen nicht mehr zur Wahl.
   */
  private static readonly SAME_DAY_LEAD_MINUTES = 30;

  /**
   * Abholzeiten eines konkreten Tages. Am laufenden Tag bleiben nur Zeiten
   * stehen, die noch kommen — ohne diesen Filter liess sich um 17:00 Uhr noch
   * eine Abholung um 10:00 Uhr desselben Tages buchen.
   */
  private slotsForDateKey(dateKey: string): string[] {
    const day = new Date(`${dateKey}T00:00:00`).getDay();
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
    if (dateKey !== this.formatDateKey(new Date())) return slots;

    const now = new Date();
    const earliest =
      now.getHours() * 60 +
      now.getMinutes() +
      RentalBookingStepsComponent.SAME_DAY_LEAD_MINUTES;
    return slots.filter((slot) => {
      const [hours, minutes] = slot.split(':').map(Number);
      return hours * 60 + minutes >= earliest;
    });
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
    if (normalized < this.getMinSelectableDate()) return false;
    if (this.isClosedDay(normalized)) return false;
    // Heute fällt aus der Auswahl, sobald keine Abholzeit mehr übrig ist. Sonst
    // merkt der Gast erst im Formular, dass für heute nichts mehr geht — nach
    // vier Schritten Aufwand.
    if (this.isToday(normalized)) {
      return this.slotsForDateKey(this.formatDateKey(normalized)).length > 0;
    }
    return true;
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

    if (isPlatformBrowser(this.platformId)) {
      this.watchForPageLeave();
    }

    if (wantsDeepLink) {
      // Came from the fleet/detail page with dates + a chosen bike: pre-fill the
      // cart so the flow resolves straight to the requested step (choose-next).
      this.applyDeepLink(start!, end!, Number(bikeId), () =>
        this.listenToStepParam(),
      );
      return;
    }

    const draft = this.readDraft();
    if (draft) {
      this.applyDraft(draft, () => this.listenToStepParam());
      return;
    }

    this.listenToStepParam();
  }

  /**
   * Sichert den Zwischenstand, wenn die Seite in den Hintergrund geht oder
   * verlassen wird. Deckt genau den häufigen Fall ab: mitten im Formular kurz in
   * eine andere App wechseln, um die Adresse nachzusehen.
   */
  private watchForPageLeave(): void {
    const save = () => this.saveDraft();
    const onVisibility = () => {
      if (this.document.visibilityState === 'hidden') save();
    };
    this.document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', save);
    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', save);
    });
  }

  /** Schreibt den Zwischenstand; ohne Zeitraum gibt es nichts zu merken. */
  private saveDraft(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.bookingNumber()) return;
    if (!this.selectedStartDate || !this.selectedEndDate) {
      this.clearDraft();
      return;
    }
    const draft: BookingDraft = {
      version: 1,
      savedAt: Date.now(),
      startDate: this.selectedStartDate,
      endDate: this.selectedEndDate,
      entries: this.cartBikes().map((item) => ({
        bicycleId: item.bike.id,
        rahmennummer: item.rahmennummer,
        farbe: item.farbe,
      })),
      selectedBikeId: this.selectedBike()?.id ?? null,
      accessoryQtys: this.accessoryQtys(),
      form: { ...this.bookingForm },
      riderHeightCm: this.riderHeightInput(),
    };
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Privater Modus oder voller Speicher: der Entwurf ist Komfort, kein Muss.
    }
  }

  private clearDraft(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // s. saveDraft
    }
  }

  /**
   * Übernimmt die gemerkten Eingaben Feld für Feld.
   *
   * Bewusst kein `{ ...this.bookingForm, ...draft.form }`: ein Spread nimmt
   * alles mit, was irgendwann einmal im Entwurf gelandet ist. Genau so kam die
   * Sprache eines alten Entwurfs zurück und schickte die Bestätigungsmail auf
   * Deutsch, obwohl der Gast auf Türkisch gebucht hatte. Was hier nicht
   * ausdrücklich steht, kommt nicht zurück.
   */
  private restoreForm(form: Partial<BookingFormValues> | undefined): void {
    if (!form) return;
    const text = (value: unknown): string =>
      typeof value === 'string' ? value : '';
    this.bookingForm = {
      vorname: text(form.vorname),
      nachname: text(form.nachname),
      email: text(form.email),
      telefon: text(form.telefon),
      strasse: text(form.strasse),
      hausNr: text(form.hausNr),
      plz: text(form.plz),
      ort: text(form.ort),
      notizen: text(form.notizen),
      abholzeit: text(form.abholzeit),
    };
  }

  /** Liest den Entwurf und verwirft ihn, wenn er nicht mehr taugt. */
  private readDraft(): BookingDraft | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    } catch {
      return null;
    }
    if (!raw) return null;

    try {
      const draft = JSON.parse(raw) as BookingDraft;
      const usable =
        draft?.version === 1 &&
        Date.now() - (draft.savedAt ?? 0) < DRAFT_MAX_AGE_MS &&
        !!draft.startDate &&
        !!draft.endDate &&
        // Ein Zeitraum, der inzwischen in der Vergangenheit liegt oder in eine
        // Betriebsferien fällt, darf nicht zurückkommen.
        draft.startDate >= this.formatDateKey(this.getMinSelectableDate()) &&
        !rangeOverlapsClosure(draft.startDate, draft.endDate);
      if (!usable) {
        this.clearDraft();
        return null;
      }
      return draft;
    } catch {
      this.clearDraft();
      return null;
    }
  }

  /** Stellt einen Zwischenstand wieder her, dann läuft `done()`. */
  private applyDraft(draft: BookingDraft, done: () => void): void {
    this.selectedStartDate = draft.startDate;
    this.selectedEndDate = draft.endDate;
    const start = new Date(`${draft.startDate}T00:00:00`);
    this.calendarMonth.set(new Date(start.getFullYear(), start.getMonth(), 1));
    this.apiService
      .getAvailableBikes(new Date(draft.startDate), new Date(draft.endDate))
      .subscribe({
        next: (bikes) => {
          this.availableBikes.set(bikes);
          this.bikesLoaded.set(true);
          const byId = new Map(bikes.map((bike) => [bike.id, bike]));
          const days = this.daysCount();
          const restored: CartBike[] = [];
          for (const entry of draft.entries ?? []) {
            const bike = byId.get(entry.bicycleId);
            // Nicht mehr frei: das Rad fällt heraus, der Rest bleibt stehen.
            if (!bike) continue;
            restored.push({
              bike,
              rahmennummer: entry.rahmennummer,
              farbe: entry.farbe,
              kaution: bike.kaution ?? undefined,
              calculatedPrice: this.calculatePrice(bike, days),
            });
          }
          this.cartBikes.set(restored);
          if (restored.length < (draft.entries?.length ?? 0)) {
            this.conflictNotice.set(
              this.t().rentalSteps?.bookingConflict ??
                'Eines Ihrer Fahrräder wurde zwischenzeitlich gebucht. Die Verfügbarkeit ist aktualisiert — bitte wählen Sie erneut.',
            );
          }
          this.selectedBike.set(
            draft.selectedBikeId != null
              ? (byId.get(draft.selectedBikeId) ?? null)
              : null,
          );
          this.accessoryQtys.set(draft.accessoryQtys ?? {});
          this.restoreForm(draft.form);
          this.riderHeightInput.set(draft.riderHeightCm ?? null);
          // Der Zubehör-Katalog wird sonst erst im Zubehör-Schritt geladen —
          // ohne ihn stünden die gemerkten Mengen in der Übersicht nicht drin.
          if (Object.keys(this.accessoryQtys()).length > 0) {
            this.loadAccessories();
          }
          done();
        },
        error: () => done(),
      });
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
                kaution: bike.kaution ?? undefined,
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
    this.conflictNotice.set('');

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
    this.conflictNotice.set('');
    this.selectedBike.set(bike);
    this.currentImageIndex.set(0);
    this.selectedBikeColor = '';
    this.selectedBikeFrameNumber = '';
    // Ein Stand von einer vorherigen Auswahl (z. B. 3 Kinderräder) darf nicht
    // an einem anderen Rad hängen bleiben — jedes Rad startet bei 1 Stück.
    this.childQtyToAdd.set(1);
    this.goToStep('bike-details');
  }

  /**
   * Legt das gewählte Rad im Warenkorb an. Bei Kinderrädern entstehen dabei
   * so viele einzelne `CartBike`-Einträge wie in `childQtyToAdd` gewählt
   * wurden — dieselbe `bicycleId` mehrfach, kein Mengenfeld. So legt der
   * Server je Eintrag einen eigenen `RentalBookingBike` mit eigener Kaution
   * an; die Stückzahl ist reine Eingabe, keine Datenstruktur.
   */
  addBikeToCart(): void {
    const bike = this.selectedBike();
    if (!bike) return;

    const price = this.calculatePrice(bike, this.daysCount());
    const qty = this.isChildrensBike(bike)
      ? this.clampChildQty(this.childQtyToAdd())
      : 1;
    const rahmennummer = this.selectedBikeFrameNumber || undefined;
    const farbe = this.selectedBikeColor || undefined;
    const kaution = bike.kaution ?? undefined;

    const newItems: CartBike[] = Array.from({ length: qty }, () => ({
      bike,
      rahmennummer,
      farbe,
      kaution,
      calculatedPrice: price,
    }));

    // Zurück in die Liste: dort steht das Rad jetzt als ausgewählt, und man
    // kann direkt das nächste antippen oder unten weitergehen. Der frühere
    // Zwischenschritt ("Fahrrad hinzugefügt — weiteres Rad?") entfällt damit.
    this.cartBikes.update((items) => [...items, ...newItems]);
    this.saveDraft();
    this.goToStep('bike-selection');
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
    this.saveDraft();
  }

  decAccessory(id: number): void {
    const map = { ...this.accessoryQtys() };
    const next = (map[id] ?? 0) - 1;
    if (next <= 0) delete map[id];
    else map[id] = next;
    this.accessoryQtys.set(map);
    this.saveDraft();
  }

  /**
   * Zubehör-Summe = Σ (Tagespreis × Menge × Miettage).
   *
   * Einmaliges Zubehör (Verbrauchsmaterial wie ein Schlauch) zählt nicht mit:
   * es wird nur berechnet, wenn es tatsächlich verbraucht wurde, und das steht
   * erst bei der Rückgabe im Laden fest. Der Server rechnet genauso.
   */
  accessoryTotal = computed(() => {
    const days = this.getRentalDays();
    const qtys = this.accessoryQtys();
    return this.accessories().reduce((sum, acc) => {
      const qty = qtys[acc.id] ?? 0;
      if (acc.einmalig) return sum;
      return sum + acc.tagespreis * qty * days;
    }, 0);
  });

  /** true, sobald einmaliges Zubehör gewählt wurde (Hinweistext im Ablauf). */
  hasEinmaligesAccessory = computed(() => {
    const qtys = this.accessoryQtys();
    return this.accessories().some(
      (acc) => acc.einmalig === true && (qtys[acc.id] ?? 0) > 0,
    );
  });

  /** Accessories with a positive quantity, for the review/summary lists. */
  selectedAccessories = computed(() => {
    const qtys = this.accessoryQtys();
    return this.accessories()
      .filter((acc) => (qtys[acc.id] ?? 0) > 0)
      .map((acc) => ({
        accessory: acc,
        menge: qtys[acc.id],
        lineTotal: acc.einmalig
          ? 0
          : acc.tagespreis * qtys[acc.id] * this.getRentalDays(),
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

  /**
   * Kaution eines Rades, so wie sie im Bestand gepflegt ist — oder null, wenn
   * dort keine steht. Vorher stand hier ein fest verdrahteter Ersatzwert von
   * 300 €: der wurde dem Kunden angezeigt und mit der Buchung gespeichert,
   * obwohl ihn niemand gepflegt hatte. Ohne Angabe wird die Kaution jetzt
   * lieber nicht genannt — verbindlich ist der Wert aus dem Bestand, den der
   * Server ohnehin selbst einsetzt.
   */
  depositOf(bike: PublicRentalBicycle | null | undefined): number | null {
    return bike?.kaution ?? null;
  }

  /** True, sobald für mindestens ein Rad im Warenkorb eine Kaution gepflegt ist. */
  hasKnownDeposit(): boolean {
    return this.cartBikes().some((item) => item.kaution != null);
  }

  getTotalDeposit(): number {
    return this.cartBikes().reduce((sum, item) => sum + (item.kaution ?? 0), 0);
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
      // Kaution bewusst nicht mitsenden: verbindlich ist der Wert aus dem
      // Bestand, den der Server selbst einsetzt. Sonst entscheidet der Client
      // darüber, was später im Vertrag steht.
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
      // Sprache immer aus dem aktuellen Zustand, nie aus dem Formular oder
      // dem Entwurf — ein alter Wert schickte sonst die Mail in der falschen
      // Sprache raus.
      sprache: this.lang(),
      notizen: this.bookingForm.notizen || undefined,
      accessories: accessories.length > 0 ? accessories : undefined,
      abholzeit: this.bookingForm.abholzeit || undefined,
    };

    this.apiService.createRentalBooking(dto).subscribe({
      next: (response) => {
        this.bookingNumber.set(response.buchungsNummer);
        this.isSubmitting.set(false);
        // Gebucht ist gebucht: der Entwurf darf nicht liegenbleiben, sonst käme
        // die Buchung beim nächsten Aufruf der Seite wieder hoch.
        this.clearDraft();
        this.goToStep('success');
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        // 409 = der Zeitraum ist inzwischen belegt, 404 = das Rad oder ein
        // Zubehör gibt es nicht mehr. Beides ist kein Formularfehler, sondern
        // eine überholte Verfügbarkeit: neu laden, die vergriffenen Räder aus
        // der Buchung nehmen und zurück in die Auswahl — mit Begründung. Vorher
        // stand hier für jeden Fehler dieselbe Meldung, und der Gast blieb mit
        // einem ausgefüllten Formular stehen, ohne zu wissen, was fehlt.
        const status = (err as HttpErrorResponse)?.status;
        if (status === 409 || status === 404) {
          this.recoverFromStaleAvailability();
          return;
        }
        this.bookingError.set(
          this.t().rentalSteps?.bookingError ??
            'Fehler beim Erstellen der Buchung',
        );
        this.goToStep('review');
      },
    });
  }

  /**
   * Holt die Verfügbarkeit für den gewählten Zeitraum neu, wirft die inzwischen
   * vergriffenen Räder aus der Buchung und schickt den Gast in die Auswahl
   * zurück. Kinderräder sind gepoolte Anzeigen und bleiben immer buchbar, sie
   * fallen also nie heraus.
   */
  private recoverFromStaleAvailability(): void {
    this.bookingError.set('');
    this.conflictNotice.set(
      this.t().rentalSteps?.bookingConflict ??
        'Eines Ihrer Fahrräder wurde zwischenzeitlich gebucht. Die Verfügbarkeit ist aktualisiert — bitte wählen Sie erneut.',
    );
    this.loadingAvailableBikes.set(true);
    this.apiService
      .getAvailableBikes(
        new Date(this.selectedStartDate),
        new Date(this.selectedEndDate),
      )
      .subscribe({
        next: (bikes) => {
          this.availableBikes.set(bikes);
          this.bikesLoaded.set(true);
          this.loadingAvailableBikes.set(false);
          const stillFree = new Set(bikes.map((bike) => bike.id));
          this.cartBikes.update((items) =>
            items.filter(
              (item) =>
                stillFree.has(item.bike.id) || this.isChildrensBike(item.bike),
            ),
          );
          this.goToStep('bike-selection');
        },
        error: () => {
          // Auch das Nachladen scheitert: dann bleibt nur die allgemeine
          // Meldung, damit der Gast nicht auf einem leeren Raster landet.
          this.loadingAvailableBikes.set(false);
          this.conflictNotice.set('');
          this.bookingError.set(
            this.t().rentalSteps?.bookingError ??
              'Fehler beim Erstellen der Buchung',
          );
        },
      });
  }

  /**
   * Felder, die beim letzten Absenden ungültig waren. Steuert die rote
   * Markierung im Formular; eine Eingabe im Feld nimmt sie wieder weg.
   */
  invalidFields = signal<ReadonlySet<string>>(new Set<string>());

  fieldInvalid(field: string): boolean {
    return this.invalidFields().has(field);
  }

  clearInvalid(field: string): void {
    if (!this.invalidFields().has(field)) return;
    this.invalidFields.update((fields) => {
      const next = new Set(fields);
      next.delete(field);
      return next;
    });
  }

  validateForm(): boolean {
    // Alle Fehler auf einmal einsammeln statt beim ersten abzubrechen: vorher
    // brauchte der Gast pro fehlendem Feld eine eigene Absende-Runde und
    // musste das gemeinte Feld selbst suchen.
    const rs = this.t().rentalSteps;
    const errors: { field: string; message: string }[] = [];
    if (!this.bookingForm.vorname.trim())
      errors.push({
        field: 'vorname',
        message: rs?.firstNameRequired ?? 'Vorname erforderlich',
      });
    if (!this.bookingForm.nachname.trim())
      errors.push({
        field: 'nachname',
        message: rs?.lastNameRequired ?? 'Nachname erforderlich',
      });
    if (
      !this.bookingForm.email.trim() ||
      !this.isValidEmail(this.bookingForm.email)
    )
      errors.push({
        field: 'email',
        message: rs?.emailRequired ?? 'Gültige E-Mail erforderlich',
      });
    if (!this.bookingForm.telefon.trim())
      errors.push({
        field: 'telefon',
        message: rs?.phoneRequired ?? 'Telefon erforderlich',
      });
    if (!this.bookingForm.strasse.trim())
      errors.push({
        field: 'strasse',
        message: rs?.streetRequired ?? 'Straße erforderlich',
      });
    if (!this.bookingForm.hausNr.trim())
      errors.push({
        field: 'hausNr',
        message: rs?.houseNumberRequired ?? 'Hausnummer erforderlich',
      });
    if (!this.bookingForm.plz.trim())
      errors.push({
        field: 'plz',
        message: rs?.postalCodeRequired ?? 'Postleitzahl erforderlich',
      });
    if (!this.bookingForm.ort.trim())
      errors.push({
        field: 'ort',
        message: rs?.cityRequired ?? 'Stadt erforderlich',
      });
    if (
      !this.bookingForm.abholzeit ||
      !this.abholzeitSlots().includes(this.bookingForm.abholzeit)
    )
      errors.push({
        field: 'abholzeit',
        message: rs?.pickupTimeRequired ?? 'Bitte wählen Sie eine Abholzeit',
      });

    this.invalidFields.set(new Set(errors.map((e) => e.field)));
    if (errors.length > 0) {
      this.bookingError.set(errors[0].message);
      this.focusField(errors[0].field);
      return false;
    }
    this.bookingError.set('');
    return true;
  }

  /**
   * Fokussiert das erste ungültige Feld, sobald die Markierungen gerendert
   * sind.
   */
  private focusField(field: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      const el = document.getElementById(`booking-${field}`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  startNewBooking(): void {
    this.clearDraft();
    this.selectedStartDate = '';
    this.selectedEndDate = '';
    this.selectedBike.set(null);
    this.cartBikes.set([]);
    this.bookingNumber.set('');
    this.bikesLoaded.set(false);
    this.termsAccepted.set(false);
    this.conflictNotice.set('');
    this.bookingError.set('');
    this.bookingForm = {
      vorname: '',
      nachname: '',
      email: '',
      telefon: '',
      strasse: '',
      hausNr: '',
      plz: '',
      ort: '',
        notizen: '',
      abholzeit: '',
    };
    this.goToStep('date-selection');
  }

  // ── Erfolgsseite: Kalendereintrag (.ics) ──
  // Selbst zusammengesetzt statt einer Bibliothek. Läuft ausschließlich im
  // Browser (Blob + Download-Link gibt es serverseitig nicht).

  addBookingToCalendar(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const ics = this.buildIcsContent();
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = `bikehaus-buchung-${this.bookingNumber() || 'termin'}.ics`;
    this.document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  private buildIcsContent(): string {
    const pickup = this.bookingForm.abholzeit || '10:00';
    const [pickupHours, pickupMinutes] = pickup
      .split(':')
      .map((part) => Number(part) || 0);

    const start = new Date(`${this.selectedStartDate}T00:00:00`);
    start.setHours(pickupHours, pickupMinutes, 0, 0);
    // Ende = Start + Anzahl Miettage. So bleibt ein mehrtägiger Zeitraum auch
    // im Kalender mehrtägig, statt nach 24 Stunden am Starttag zu enden.
    const end = new Date(start);
    end.setDate(end.getDate() + Math.max(1, this.daysCount()));

    const steps = this.t().rentalSteps;
    // Gruppiert statt Zeile pro Zeile: bei mehreren gleichen Kinderrädern
    // stünde sonst "Kinderrad 20 Zoll, Kinderrad 20 Zoll, ..." im Kalendertext.
    const bikeNames = this.cartGroups()
      .map((group) => {
        const label = this.bikeLabel(group.representative.bike);
        return group.count > 1 ? `${group.count}× ${label}` : label;
      })
      .filter(Boolean)
      .join(', ');
    const address = this.shopAddress();

    const summaryBase =
      steps?.calendarEventTitle ?? 'Fahrradverleih BikeHaus Freiburg';
    const summary = this.bookingNumber()
      ? `${summaryBase} – ${this.bookingNumber()}`
      : summaryBase;

    const descriptionLines = [
      bikeNames
        ? `${steps?.bikeDetails ?? 'Fahrraddetails'}: ${bikeNames}`
        : '',
      `${steps?.pickupTime ?? 'Abholzeit'}: ${pickup} ${steps?.oClock ?? 'Uhr'}`.trim(),
      this.bookingNumber()
        ? `${steps?.bookingNumber ?? 'Buchungsnummer'}: ${this.bookingNumber()}`
        : '',
    ].filter(Boolean);

    const uid = `${this.bookingNumber() || Date.now()}@bikehausfreiburg.com`;

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BikeHaus Freiburg//Fahrradverleih//DE',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${this.formatIcsUtcStamp(new Date())}`,
      `DTSTART:${this.formatIcsLocalStamp(start)}`,
      `DTEND:${this.formatIcsLocalStamp(end)}`,
      `SUMMARY:${this.escapeIcsText(summary)}`,
      `DESCRIPTION:${this.escapeIcsText(descriptionLines.join('\n'))}`,
      address ? `LOCATION:${this.escapeIcsText(address)}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean);

    return lines.map((line) => this.foldIcsLine(line)).join('\r\n') + '\r\n';
  }

  /** UTC-Zeitstempel für DTSTAMP, Format YYYYMMDDTHHMMSSZ. */
  private formatIcsUtcStamp(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
      `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
    );
  }

  /**
   * Lokaler ("floating") Zeitstempel ohne Zeitzonen-Suffix, Format
   * YYYYMMDDTHHMMSS. Ohne VTIMEZONE-Block interpretieren Kalender-Apps das als
   * Wanduhrzeit am Ort des Betrachters — für ein Geschäft mit lokalem Publikum
   * eine vertretbare Vereinfachung gegenüber einem vollständigen VTIMEZONE.
   */
  private formatIcsLocalStamp(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
      `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
    );
  }

  /** Escaping nach RFC 5545 §3.3.11 für TEXT-Werte. */
  private escapeIcsText(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  /**
   * Zeilenumbruch nach RFC 5545 §3.1: Zeilen über 75 Zeichen werden gefaltet,
   * Folgezeilen beginnen mit einem Leerzeichen. Zählt Zeichen statt Oktette —
   * bei Umlauten in Adresse/Namen eine bewusste Vereinfachung ohne Bibliothek.
   */
  private foldIcsLine(line: string): string {
    const maxLen = 75;
    if (line.length <= maxLen) return line;
    const parts: string[] = [line.slice(0, maxLen)];
    let rest = line.slice(maxLen);
    while (rest.length > 0) {
      parts.push(` ${rest.slice(0, maxLen - 1)}`);
      rest = rest.slice(maxLen - 1);
    }
    return parts.join('\r\n');
  }

  goToStep(step: BookingStep): void {
    // Jeder Schrittwechsel sichert den Zwischenstand — damit auch das, was im
    // Formular schon eingetippt war, einen Reload übersteht.
    this.saveDraft();
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
