import {
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import {
  PublicRentalBicycle,
  RentalBikeImage,
  RentalBookingCreate,
  RentalBookingBikeCreate,
} from '../../models/models';
import { calculateRentalPrice } from '../../utils/rental-pricing';

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
  | 'customer-info'
  | 'review'
  | 'success';

@Component({
  selector: 'app-rental-booking-steps',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="rental-booking-steps-container">
      <!-- Step Indicator -->
      <div class="steps-indicator">
        <div [class.active]="currentStep() === 'date-selection'" class="step">
          1. {{ t().rentalSteps?.dateSelection ?? 'Termin wählen' }}
        </div>
        <div [class.active]="currentStep() === 'bike-selection'" class="step">
          2. {{ t().rentalSteps?.bikeSelection ?? 'Fahrrad wählen' }}
        </div>
        <div [class.active]="currentStep() === 'customer-info'" class="step">
          3. {{ t().rentalSteps?.customerInfo ?? 'Daten eintragen' }}
        </div>
        <div [class.active]="currentStep() === 'review'" class="step">
          4. {{ t().rentalSteps?.review ?? 'Bestätigung' }}
        </div>
      </div>

      <!-- Step 1: Date Selection -->
      <div *ngIf="currentStep() === 'date-selection'" class="step-container">
        <h2>
          {{ t().rentalSteps?.selectDates ?? 'Wählen Sie einen Zeitraum' }}
        </h2>
        <div class="date-inputs">
          <div class="date-input-group">
            <label>{{ t().rentalSteps?.startDate ?? 'Startdatum' }}:</label>
            <input
              type="date"
              [(ngModel)]="selectedStartDate"
              [min]="minDate()"
            />
          </div>
          <div class="date-input-group">
            <label>{{ t().rentalSteps?.endDate ?? 'Enddatum' }}:</label>
            <input
              type="date"
              [(ngModel)]="selectedEndDate"
              [min]="selectedStartDate"
            />
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
          {{ selectedStartDate }} bis {{ selectedEndDate }} ({{ daysCount() }}
          {{ t().rentalSteps?.days ?? 'Tage' }})
        </p>

        <div *ngIf="loadingAvailableBikes()" class="loading">
          {{ t().rentalSteps?.loading ?? 'Laden...' }}
        </div>

        <div
          *ngIf="!loadingAvailableBikes() && availableBikes().length === 0"
          class="no-bikes"
        >
          {{
            t().rentalSteps?.noBikesAvailable ??
              'Keine Fahrräder für diesen Zeitraum verfügbar'
          }}
        </div>

        <div
          *ngIf="!loadingAvailableBikes() && availableBikes().length > 0"
          class="bike-grid"
        >
          <div
            *ngFor="let bike of availableBikes()"
            (click)="selectBikeForDetails(bike)"
            class="bike-card"
          >
            <div class="bike-image">
              <img
                *ngIf="getMainImage(bike)"
                [src]="bike.images[0]?.filePath"
                [alt]="bike.modell"
              />
            </div>
            <div class="bike-info">
              <h3>{{ bike.marke }} {{ bike.modell }}</h3>
              <p class="bike-type">{{ bike.art || bike.fahrradtyp }}</p>
              <p class="bike-price" *ngIf="bike.preise.day1 !== undefined">
                {{ t().rentalSteps?.from ?? 'ab' }} €{{ bike.preise.day1 }}/{{
                  t().rentalSteps?.day ?? 'Tag'
                }}
              </p>
            </div>
          </div>
        </div>

        <button (click)="goToStep('date-selection')" class="btn-secondary">
          {{ t().rentalSteps?.back ?? 'Zurück' }}
        </button>
      </div>

      <!-- Step 3: Bike Details -->
      <div
        *ngIf="currentStep() === 'bike-details' && selectedBike()"
        class="step-container"
      >
        <h2>{{ selectedBike()!.marke }} {{ selectedBike()!.modell }}</h2>
        <div class="bike-details">
          <div class="bike-images">
            <img
              *ngIf="getMainImage(selectedBike()!)"
              [src]="getMainImage(selectedBike()!)!.filePath"
              [alt]="selectedBike()!.modell"
              class="main-image"
            />
            <div
              class="image-thumbnails"
              *ngIf="getImages(selectedBike()!).length > 1"
            >
              <img
                *ngFor="let img of getImages(selectedBike()!)"
                [src]="img.filePath"
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
              <h3>{{ t().rentalSteps?.pricing ?? 'Preisberechnung' }}</h3>
              <p>
                {{ selectedStartDate }} - {{ selectedEndDate }} ({{
                  daysCount()
                }}
                {{ t().rentalSteps?.days ?? 'Tage' }})
              </p>
              <p class="total-price">
                <strong
                  >{{ t().rentalSteps?.rentalPrice ?? 'Mietpreis' }}:</strong
                >
                €{{ calculatePrice(selectedBike()!, daysCount()) }}
              </p>
              <p class="deposit-info">
                <strong>{{ t().rentalSteps?.deposit ?? 'Kaution' }}:</strong>
                €{{ selectedBike()!.kaution || 300 }}
              </p>
            </div>

            <div class="color-selection" *ngIf="selectedBike()!.farbe">
              <label
                >{{
                  t().rentalSteps?.selectColor ??
                    'Farbe wählen (falls verfügbar)'
                }}:</label
              >
              <input type="text" [(ngModel)]="selectedBikeColor" />
            </div>

            <div class="frame-number-input">
              <label
                >{{ t().rentalSteps?.frameNumber ?? 'Rahmennummer' }} ({{
                  t().rentalSteps?.optional ?? 'optional'
                }}):</label
              >
              <input type="text" [(ngModel)]="selectedBikeFrameNumber" />
            </div>
          </div>
        </div>

        <div class="booking-actions">
          <button (click)="addBikeToCart()" class="btn-primary">
            {{ t().rentalSteps?.addToCart ?? 'Zum Warenkorb hinzufügen' }}
          </button>
          <button (click)="goToStep('bike-selection')" class="btn-secondary">
            {{ t().rentalSteps?.selectDifferent ?? 'Anderes Fahrrad wählen' }}
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
              <p>{{ selectedStartDate }} - {{ selectedEndDate }}</p>
              <p *ngIf="item.farbe">Farbe: {{ item.farbe }}</p>
              <p *ngIf="item.rahmennummer">
                Rahmennummer: {{ item.rahmennummer }}
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
            <label>{{ t().rentalSteps?.phone ?? 'Telefon' }}:</label>
            <input
              type="tel"
              [(ngModel)]="bookingForm.telefon"
              name="telefon"
            />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.street ?? 'Straße' }}:</label>
            <input
              type="text"
              [(ngModel)]="bookingForm.strasse"
              name="strasse"
            />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.houseNumber ?? 'Hausnummer' }}:</label>
            <input type="text" [(ngModel)]="bookingForm.hausNr" name="hausNr" />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.postalCode ?? 'Postleitzahl' }}:</label>
            <input type="text" [(ngModel)]="bookingForm.plz" name="plz" />
          </div>
          <div class="form-group">
            <label>{{ t().rentalSteps?.city ?? 'Stadt' }}:</label>
            <input type="text" [(ngModel)]="bookingForm.ort" name="ort" />
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

          <button
            type="button"
            (click)="goToStep('bike-selection')"
            class="btn-secondary"
          >
            {{ t().rentalSteps?.back ?? 'Zurück' }}
          </button>
          <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
            {{
              isSubmitting()
                ? (t().rentalSteps?.submitting ?? 'Wird gesendet...')
                : (t().rentalSteps?.continue ?? 'Weiter')
            }}
          </button>
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
              {{ selectedStartDate }} - {{ selectedEndDate }} ({{ daysCount() }}
              Tage)
            </p>
            <p *ngIf="item.farbe">Farbe: {{ item.farbe }}</p>
            <p *ngIf="item.rahmennummer">
              Rahmennummer: {{ item.rahmennummer }}
            </p>
            <p class="price">Preis: €{{ item.calculatedPrice }}</p>
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
        </div>

        <div class="price-summary">
          <h3>{{ t().rentalSteps?.priceSummary ?? 'Preisübersicht' }}:</h3>
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

        <div class="confirm-actions">
          <button (click)="goToStep('customer-info')" class="btn-secondary">
            {{ t().rentalSteps?.back ?? 'Zurück' }}
          </button>
          <button
            (click)="confirmAndSubmit()"
            class="btn-primary"
            [disabled]="isSubmitting()"
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
        <h2>{{ t().rentalSteps?.bookingSuccess ?? 'Buchung erfolgreich!' }}</h2>
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
    </div>
  `,
  styles: [
    `
      .rental-booking-steps-container {
        max-width: 900px;
        margin: 2rem auto;
        padding: 2rem;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .steps-indicator {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .step {
        padding: 0.75rem 1.5rem;
        background: #f0f0f0;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        color: #666;
      }

      .step.active {
        background: #007bff;
        color: white;
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
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1rem;
      }

      .date-range-display {
        background: #f9f9f9;
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 1.5rem;
        font-weight: 500;
      }

      .bike-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
      }

      .bike-card {
        border: 2px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .bike-card:hover {
        border-color: #007bff;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
        transform: translateY(-2px);
      }

      .bike-image {
        width: 100%;
        height: 200px;
        background: #f0f0f0;
        overflow: hidden;
      }

      .bike-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .bike-info {
        padding: 1rem;
      }

      .bike-info h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
      }

      .bike-type {
        color: #666;
        font-size: 0.9rem;
        margin: 0.25rem 0;
      }

      .bike-price {
        color: #007bff;
        font-weight: 600;
        margin: 0.5rem 0 0 0;
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
        border-color: #007bff;
      }

      .bike-specs {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .spec {
        padding: 0.75rem;
        background: #f9f9f9;
        border-radius: 6px;
        font-size: 0.9rem;
      }

      .spec strong {
        display: block;
        color: #333;
        margin-bottom: 0.25rem;
      }

      .price-info {
        padding: 1rem;
        background: #e7f3ff;
        border-radius: 6px;
        border-left: 4px solid #007bff;
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
        color: #007bff;
      }

      .deposit-info {
        color: #666;
      }

      .color-selection,
      .frame-number-input {
        padding: 0.75rem;
        background: #f9f9f9;
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
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.9rem;
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
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
        font-family: inherit;
      }

      .form-group textarea {
        grid-column: 1 / -1;
        resize: vertical;
        min-height: 100px;
      }

      .cart-summary {
        background: #f9f9f9;
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
        background: white;
        border-radius: 6px;
        margin-bottom: 0.75rem;
        border-left: 4px solid #007bff;
      }

      .cart-item p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        color: #666;
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
        color: #007bff;
      }

      .btn-remove {
        background: #ff4444;
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
        background: #cc0000;
      }

      .review-section {
        background: #f9f9f9;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
      }

      .review-section h3 {
        margin: 0 0 1rem 0;
        font-size: 1.05rem;
        color: #333;
      }

      .review-item {
        background: white;
        padding: 1rem;
        border-radius: 6px;
        margin-bottom: 0.75rem;
        border-left: 4px solid #007bff;
      }

      .review-item p {
        margin: 0.25rem 0;
        font-size: 0.95rem;
      }

      .review-item .price {
        color: #007bff;
        font-weight: 600;
        margin-top: 0.5rem;
      }

      .price-summary {
        background: #e7f3ff;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #007bff;
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
        color: #007bff;
      }

      .info-note {
        font-size: 0.85rem !important;
        color: #666 !important;
        font-style: italic;
        margin-top: 1rem !important;
      }

      .success-section {
        text-align: center;
        padding: 3rem 1.5rem;
      }

      .success-section h2 {
        color: #28a745;
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
        color: #666;
      }

      .error-message {
        background: #fee;
        color: #c00;
        padding: 1rem;
        border-radius: 6px;
        margin: 1rem 0;
        border-left: 4px solid #c00;
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
        background: #007bff;
        color: white;
        flex: 1;
        min-width: 150px;
      }

      .btn-primary:hover:not(:disabled) {
        background: #0056b3;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
      }

      .btn-primary:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #f0f0f0;
        color: #333;
        flex: 1;
        min-width: 150px;
      }

      .btn-secondary:hover {
        background: #ddd;
      }

      @media (max-width: 768px) {
        .rental-booking-steps-container {
          padding: 1rem;
        }

        .date-inputs,
        .bike-grid,
        .bike-details,
        .customer-form {
          grid-template-columns: 1fr;
        }

        .bike-grid {
          grid-template-columns: 1fr;
        }

        .steps-indicator {
          flex-direction: column;
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
  private isBrowser = isPlatformBrowser(this.platformId);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  currentStep = signal<BookingStep>('date-selection');
  selectedStartDate = '';
  selectedEndDate = '';
  selectedBike = signal<PublicRentalBicycle | null>(null);
  selectedBikeColor = '';
  selectedBikeFrameNumber = '';
  currentImageIndex = signal(0);

  availableBikes = signal<PublicRentalBicycle[]>([]);
  loadingAvailableBikes = signal(false);
  cartBikes = signal<CartBike[]>([]);

  dateRangeError = signal('');
  bookingError = signal('');
  isSubmitting = signal(false);
  bookingNumber = signal('');

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
  };

  minDate = computed(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });

  daysCount = computed(() => {
    if (!this.selectedStartDate || !this.selectedEndDate) return 0;
    const start = new Date(this.selectedStartDate);
    const end = new Date(this.selectedEndDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  });

  ngOnInit(): void {
    // Initialize
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

    if (start >= end) {
      this.dateRangeError.set(
        this.t().rentalSteps?.invalidDateRange ??
          'Enddatum muss nach Startdatum liegen',
      );
      return;
    }

    this.loadingAvailableBikes.set(true);
    this.apiService.getAvailableBikes(start, end).subscribe({
      next: (bikes) => {
        this.availableBikes.set(bikes);
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
    this.goToStep('customer-info');
  }

  removeFromCart(item: CartBike): void {
    this.cartBikes.update((items) => items.filter((i) => i !== item));
  }

  calculatePrice(bike: PublicRentalBicycle, days: number): number {
    return calculateRentalPrice(bike.preise, days).total ?? 0;
  }

  getTotalPrice(): number {
    return this.cartBikes().reduce(
      (sum, item) => sum + (item.calculatedPrice || 0),
      0,
    );
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
    };
    this.goToStep('date-selection');
  }

  goToStep(step: BookingStep): void {
    this.currentStep.set(step);
    if (this.isBrowser) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
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
}
