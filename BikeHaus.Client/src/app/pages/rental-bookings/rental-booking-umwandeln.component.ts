import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RentalBookingService } from '../../services/rental-booking.service';
import { RentalService } from '../../services/rental.service';
import { NotificationService } from '../../services/notification.service';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';
import {
  RentalBooking,
  RentalBookingBike,
  RentalBookingStatus,
  RentalCreate,
  RentalBikeCreate,
  PaymentMethod,
  BikeConditionAtHandover,
} from '../../models/models';

interface BikeFormData {
  kaution: number;
  zustandBeiUebergabe: BikeConditionAtHandover;
}

@Component({
  selector: 'app-rental-booking-umwandeln',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SignaturePadComponent],
  template: `
    <div class="page" *ngIf="booking">
      <div class="page-header">
        <h1>Anfrage {{ booking.buchungsNummer }} umwandeln</h1>
        <a [routerLink]="['/rental-bookings', booking.id]" class="btn btn-outline">Zurück</a>
      </div>

      <div class="info-banner">
        Aus dieser Anfrage wird <strong>ein Mietvertrag</strong> mit
        {{ bikes.length }} {{ bikes.length === 1 ? 'Fahrrad' : 'Fahrrädern' }} erstellt.
        Zahlungsart gilt für den gesamten Vertrag, Kaution und Zustand pro Fahrrad.
      </div>

      <div class="section-card">
        <h2>Kundendaten</h2>
        <div class="info-rows">
          <div class="info-row">
            <span>Name:</span>
            <strong>{{ booking.vorname }} {{ booking.nachname }}</strong>
          </div>
          <div class="info-row" *ngIf="booking.email">
            <span>E-Mail:</span>
            <span>{{ booking.email }}</span>
          </div>
          <div class="info-row" *ngIf="booking.telefon">
            <span>Telefon:</span>
            <span>{{ booking.telefon }}</span>
          </div>
          <div class="info-row" *ngIf="booking.strasse || booking.hausNr">
            <span>Adresse:</span>
            <span>{{ booking.strasse }} {{ booking.hausNr }}</span>
          </div>
          <div class="info-row" *ngIf="booking.plz || booking.ort">
            <span>PLZ / Ort:</span>
            <span>{{ booking.plz }} {{ booking.ort }}</span>
          </div>
        </div>
      </div>

      <div class="section-card">
        <h2>Zahlung &amp; Notizen</h2>
        <div class="form-grid">
          <div class="field">
            <label>Zahlungsart Miete *</label>
            <select [(ngModel)]="zahlungsart" name="rental_zahlungsart" required>
              <option value="Bar">Bar</option>
              <option value="PayPal">PayPal</option>
              <option value="Karte">Karte</option>
              <option value="Überweisung">Überweisung</option>
            </select>
          </div>
          <div class="field">
            <label>Zahlungsart Kaution *</label>
            <select [(ngModel)]="kautionZahlungsart" name="rental_kaution_zahlungsart" required>
              <option value="Bar">Bar</option>
              <option value="PayPal">PayPal</option>
              <option value="Karte">Karte</option>
              <option value="Überweisung">Überweisung</option>
            </select>
          </div>
          <div class="field full">
            <label>Notizen</label>
            <textarea [(ngModel)]="notizen" name="rental_notizen" rows="2"></textarea>
          </div>
        </div>
      </div>

      <div class="bike-card" *ngFor="let bike of bikes; let i = index">
        <div class="bike-card-header">
          <h2>{{ bikes.length > 1 ? (i + 1) + '. Fahrrad' : 'Fahrrad' }}</h2>
          <span class="bike-label">{{ bike.marke }} {{ bike.modell }}</span>
        </div>

        <div class="bike-info">
          <div class="info-row">
            <span>Von:</span>
            <strong>{{ bike.startDatum | date: 'dd.MM.yyyy' }}</strong>
          </div>
          <div class="info-row">
            <span>Bis:</span>
            <strong>{{ bike.endDatum | date: 'dd.MM.yyyy' }}</strong>
          </div>
          <div class="info-row" *ngIf="bike.gesamtpreis">
            <span>Mietpreis:</span>
            <strong>{{ bike.gesamtpreis | number: '1.2-2' }} €</strong>
          </div>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>Kaution (€) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              [(ngModel)]="bikeForms[i].kaution"
              [name]="'kaution_' + i"
              required
            />
          </div>
          <div class="field">
            <label>Zustand bei Übergabe *</label>
            <select [(ngModel)]="bikeForms[i].zustandBeiUebergabe" [name]="'zustand_' + i" required>
              <option value="SehrGut">Sehr gut</option>
              <option value="Gut">Gut</option>
              <option value="Gebrauchsspuren">Gebrauchsspuren</option>
            </select>
          </div>
        </div>
      </div>

      <div class="section-card">
        <h2>Kundenunterschrift</h2>
        <p class="signature-hint">Bitte den Kunden hier unterschreiben lassen.</p>
        <app-signature-pad
          label=""
          [(ngModel)]="mieterUnterschrift"
          name="mieter_unterschrift"
        ></app-signature-pad>
      </div>

      <div class="form-actions">
        <a [routerLink]="['/rental-bookings', booking.id]" class="btn btn-outline">Abbrechen</a>
        <button class="btn btn-primary" (click)="submit()" [disabled]="submitting">
          {{ submitting
            ? 'Wird erstellt...'
            : (bikes.length > 1 ? 'Alle Mietverträge anlegen' : 'Mietvertrag anlegen') }}
        </button>
      </div>
    </div>

    <div class="loading" *ngIf="!booking && !loadError">Laden...</div>
    <div class="error-msg" *ngIf="loadError">Anfrage konnte nicht geladen werden.</div>
  `,
  styles: [`
    .page {
      max-width: 860px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .info-banner {
      background: rgba(99, 102, 241, 0.08);
      border: 1.5px solid rgba(99, 102, 241, 0.25);
      border-radius: 10px;
      padding: 10px 16px;
      font-size: 0.88rem;
      color: var(--accent-primary, #6366f1);
      margin-bottom: 20px;
    }
    .section-card, .bike-card {
      background: var(--bg-card, #fff);
      border: 1.5px solid var(--border-light, #e2e8f0);
      border-radius: var(--radius-lg, 14px);
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: var(--shadow-sm);
    }
    .section-card h2 {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 12px 0;
    }
    .bike-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .bike-card-header h2 {
      font-size: 1rem;
      font-weight: 700;
      margin: 0;
    }
    .bike-label {
      font-size: 0.9rem;
      color: var(--text-secondary, #64748b);
    }
    .bike-info {
      background: var(--bg-secondary, #f8fafc);
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }
    .info-rows {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      padding: 3px 0;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
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
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    input, select, textarea {
      padding: 9px 12px;
      border: 1.5px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-md, 10px);
      background: var(--bg-card, #fff);
      color: var(--text-primary);
      font-size: 0.92rem;
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--accent-primary, #6366f1);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
    }
    textarea { resize: vertical; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }
    .btn {
      padding: 9px 18px;
      border-radius: var(--radius-md, 10px);
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      border: 1.5px solid transparent;
      text-decoration: none;
      color: var(--text-primary);
      background: var(--bg-primary, #fff);
      display: inline-flex;
      align-items: center;
    }
    .btn-outline { border-color: var(--border-light, #e2e8f0); }
    .btn-outline:hover { border-color: var(--accent-primary, #6366f1); color: var(--accent-primary, #6366f1); }
    .btn-primary { background: var(--accent-primary, #6366f1); color: #fff; border-color: var(--accent-primary, #6366f1); }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .signature-hint { font-size: 0.85rem; color: var(--text-muted); margin: 0 0 10px 0; }
    .loading, .error-msg { text-align: center; padding: 40px; color: var(--text-muted); }
  `],
})
export class RentalBookingUmwandelnComponent implements OnInit {
  private bookingService = inject(RentalBookingService);
  private rentalService = inject(RentalService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  booking: RentalBooking | null = null;
  loadError = false;
  submitting = false;
  bikes: RentalBookingBike[] = [];
  bikeForms: BikeFormData[] = [];

  // Rental-level fields (apply to the whole contract)
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  kautionZahlungsart: PaymentMethod = PaymentMethod.Bar;
  notizen = '';
  mieterUnterschrift = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/rental-bookings']);
      return;
    }

    this.bookingService.getById(id).subscribe({
      next: (booking) => {
        if (booking.status !== RentalBookingStatus.Approved) {
          this.notificationService.error('Anfrage muss zuerst bestätigt werden.');
          this.router.navigate(['/rental-bookings', id]);
          return;
        }
        this.booking = booking;
        this.bikes =
          booking.bikes?.length > 0
            ? booking.bikes
            : booking.bicycle
              ? [{
                  id: 0,
                  bicycleId: booking.bicycle.id,
                  marke: (booking.bicycle as any).marke ?? '',
                  modell: (booking.bicycle as any).modell ?? '',
                  startDatum: booking.startDatum,
                  endDatum: booking.endDatum,
                  gesamtpreis: booking.gesamtpreis ?? undefined,
                }]
              : [];
        this.bikeForms = this.bikes.map((bk) => ({
          kaution: bk.kaution ?? 0,
          zustandBeiUebergabe: BikeConditionAtHandover.Gut,
        }));
      },
      error: () => {
        this.loadError = true;
      },
    });
  }

  submit() {
    if (this.submitting || !this.booking) return;
    this.submitting = true;

    const customer = {
      vorname: this.booking.vorname,
      nachname: this.booking.nachname,
      email: this.booking.email || undefined,
      telefon: this.booking.telefon || undefined,
      strasse: this.booking.strasse || undefined,
      hausnummer: this.booking.hausNr || undefined,
      plz: this.booking.plz || undefined,
      stadt: this.booking.ort || undefined,
    };

    const bikes: RentalBikeCreate[] = this.bikes.map((bike, i) => {
      const form = this.bikeForms[i];
      return {
        bicycleId: bike.bicycleId,
        rahmennummer: bike.rahmennummer || undefined,
        farbe: bike.farbe || undefined,
        startDatum: bike.startDatum.split('T')[0],
        endDatum: bike.endDatum.split('T')[0],
        mietpreis: bike.gesamtpreis ?? 0,
        kaution: form.kaution,
        zustandBeiUebergabe: form.zustandBeiUebergabe,
      };
    });

    const payload: RentalCreate = {
      bikes,
      customer,
      rabatt: 0,
      zahlungsart: this.zahlungsart,
      kautionZahlungsart: this.kautionZahlungsart,
      notizen: this.notizen || undefined,
      mieterUnterschrift: this.mieterUnterschrift || undefined,
      agbAkzeptiert: !!this.mieterUnterschrift,
    };

    this.rentalService.create(payload).subscribe({
      next: () => {
        const bookingId = this.booking!.id;
        const afterCreate = () => {
          this.notificationService.success('Mietvertrag erfolgreich angelegt.');
          this.router.navigate(['/rental-bookings', bookingId]);
        };
        if (this.mieterUnterschrift) {
          this.bookingService.saveSignature(bookingId, this.mieterUnterschrift).subscribe({
            next: afterCreate,
            error: afterCreate,
          });
        } else {
          afterCreate();
        }
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.error(
          err.error?.error || 'Fehler beim Erstellen des Mietvertrags.',
        );
      },
    });
  }
}
