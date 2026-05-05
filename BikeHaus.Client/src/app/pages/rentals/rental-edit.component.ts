import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RentalService } from '../../services/rental.service';
import { TranslationService } from '../../services/translation.service';
import {
  Rental,
  RentalUpdate,
  PaymentMethod,
  BikeConditionAtHandover,
} from '../../models/models';
import { calculateRentalPrice } from '../../utils/rental-pricing';

@Component({
  selector: 'app-rental-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Mietvertrag bearbeiten</h1>
        <a routerLink="/rentals" class="btn btn-outline">Zurück</a>
      </div>

      <div *ngIf="loading" class="loading">Laden...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <form *ngIf="rental && !loading" (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Bicycle info (read-only) -->
          <div class="form-card">
            <h2>Fahrrad</h2>
            <div class="bike-info" *ngIf="rental.bicycle">
              <div class="info-row">
                <span class="label">Marke/Modell:</span>
                <span
                  >{{ rental.bicycle.marke }} {{ rental.bicycle.modell }}</span
                >
              </div>
              <div class="info-row">
                <span class="label">Rahmennummer:</span>
                <span style="text-transform: uppercase">{{
                  rental.bicycle.rahmennummer
                }}</span>
              </div>
              <div class="info-row" *ngIf="rental.bicycle.farbe">
                <span class="label">Farbe:</span>
                <span>{{ rental.bicycle.farbe }}</span>
              </div>
            </div>
            <p class="hint">Fahrrad kann nicht geändert werden.</p>
          </div>

          <!-- Mieter info -->
          <div class="form-card">
            <h2>Mieter</h2>
            <div class="form-grid">
              <div class="field">
                <label>Vorname</label>
                <input
                  [(ngModel)]="mieter.vorname"
                  name="mieterVorname"
                  required
                />
              </div>
              <div class="field">
                <label>Nachname</label>
                <input
                  [(ngModel)]="mieter.nachname"
                  name="mieterNachname"
                  required
                />
              </div>
              <div class="field">
                <label>Straße</label>
                <input [(ngModel)]="mieter.strasse" name="mieterStrasse" />
              </div>
              <div class="field">
                <label>Hausnummer</label>
                <input [(ngModel)]="mieter.hausnummer" name="mieterHausnr" />
              </div>
              <div class="field">
                <label>PLZ</label>
                <input [(ngModel)]="mieter.plz" name="mieterPlz" />
              </div>
              <div class="field">
                <label>Stadt</label>
                <input [(ngModel)]="mieter.stadt" name="mieterStadt" />
              </div>
              <div class="field">
                <label>Telefon</label>
                <input [(ngModel)]="mieter.telefon" name="mieterTelefon" />
              </div>
              <div class="field">
                <label>E-Mail</label>
                <input
                  [(ngModel)]="mieter.email"
                  name="mieterEmail"
                  type="email"
                />
              </div>
              <div class="field">
                <label>Ausweis-Nr.</label>
                <input [(ngModel)]="ausweisnNr" name="ausweisnNr" />
              </div>
            </div>
          </div>

          <!-- Mietdetails -->
          <div class="form-card">
            <h2>Mietdetails</h2>
            <div class="form-grid">
              <div class="field">
                <label>Mietbeginn</label>
                <input
                  type="date"
                  [(ngModel)]="startDatum"
                  name="startDatum"
                  required
                  (ngModelChange)="onDatesChanged()"
                />
              </div>
              <div class="field">
                <label>Mietende</label>
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
            </div>

            <div class="form-grid" style="margin-top: 12px;">
              <div class="field">
                <label>Gesamtmiete (€)</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="gesamtmiete"
                  name="gesamtmiete"
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
                <label>Kaution (€)</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="kaution"
                  name="kaution"
                />
              </div>
              <div class="field">
                <label>Zahlungsart</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart">
                  <option value="Bar">Bar</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Karte">Karte</option>
                  <option value="Überweisung">Überweisung</option>
                </select>
              </div>
              <div class="field">
                <label>Zustand bei Übergabe</label>
                <select
                  [(ngModel)]="zustandBeiUebergabe"
                  name="zustandBeiUebergabe"
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
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            [disabled]="submitting"
          >
            {{ submitting ? 'Wird gespeichert...' : 'Änderungen speichern' }}
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
      .loading,
      .error {
        text-align: center;
        padding: 48px;
        font-size: 1.1rem;
        color: var(--text-secondary, #64748b);
      }
      .error {
        color: var(--accent-danger, #ef4444);
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
      .bike-info {
        background: var(--bg-secondary, #f8fafc);
        padding: 16px;
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        margin-bottom: 12px;
      }
      .info-row {
        display: flex;
        gap: 12px;
        padding: 4px 0;
      }
      .info-row .label {
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        min-width: 140px;
        font-size: 0.88rem;
      }
      .hint {
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
        font-style: italic;
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
      .form-actions {
        margin-top: 24px;
        text-align: right;
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
        border: 1.5px solid var(--border-color, #e2e8f0);
        color: var(--text-primary);
      }
      .btn-outline:hover {
        background: var(--bg-secondary, #f1f5f9);
      }
      .btn-lg {
        padding: 12px 32px;
        font-size: 1.05rem;
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
export class RentalEditComponent implements OnInit {
  private translationService = inject(TranslationService);

  rental: Rental | null = null;
  loading = true;
  error = '';
  submitting = false;

  mieter = {
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
  gesamtmiete = 0;
  rabatt = 0;
  berechneterPreis = 0;
  rentalDays = 0;
  preisInfo = '';
  kaution = 0;
  zahlungsart: string = PaymentMethod.Bar;
  zustandBeiUebergabe = 'Gut';
  notizen = '';

  get t() {
    return this.translationService.translations();
  }

  constructor(
    private rentalService: RentalService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Ungültige Mietvertrag-ID';
      this.loading = false;
      return;
    }

    this.rentalService.getById(+id).subscribe({
      next: (rental) => {
        this.rental = rental;
        this.loadFormData(rental);
        this.loading = false;
      },
      error: () => {
        this.error = 'Mietvertrag nicht gefunden';
        this.loading = false;
      },
    });
  }

  private loadFormData(rental: Rental) {
    // Load mieter data
    if (rental.customer) {
      this.mieter = {
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

    this.ausweisnNr = rental.ausweisnNr || '';
    this.gesamtmiete = rental.gesamtmiete;
    this.rabatt = rental.rabatt || 0;
    this.kaution = rental.kaution;
    this.zahlungsart = rental.zahlungsart || PaymentMethod.Bar;
    this.zustandBeiUebergabe = rental.zustandBeiUebergabe || 'Gut';
    this.notizen = rental.notizen || '';

    // Format dates
    if (rental.startDatum) {
      const d = new Date(rental.startDatum);
      this.startDatum = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    if (rental.endDatum) {
      const d = new Date(rental.endDatum);
      this.endDatum = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    // Calculate days and price info
    this.recalcDays();
  }

  private recalcDays() {
    if (!this.startDatum || !this.endDatum) return;
    const start = new Date(this.startDatum);
    const end = new Date(this.endDatum);
    const diffDays = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    this.rentalDays = Math.max(0, diffDays + 1);
    if (this.rentalDays > 0) {
      this.berechneterPreis = this.calculatePrice(this.rentalDays);
    }
  }

  onDatesChanged() {
    if (!this.startDatum || !this.endDatum) return;
    const start = new Date(this.startDatum);
    const end = new Date(this.endDatum);
    const diffDays = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    this.rentalDays = Math.max(0, diffDays + 1);
    if (this.rentalDays > 0) {
      this.berechneterPreis = this.calculatePrice(this.rentalDays);
      this.gesamtmiete = Math.max(
        0,
        this.berechneterPreis - (this.rabatt || 0),
      );
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
    const bicycle = this.rental?.bicycle;
    if (!bicycle) {
      this.preisInfo = '';
      return 0;
    }

    const result = calculateRentalPrice(bicycle, days);
    this.preisInfo = result.info;
    return result.total ?? 0;
  }

  submit() {
    if (!this.rental) return;
    this.submitting = true;

    const update: RentalUpdate = {
      customer: this.mieter,
      ausweisnNr: this.ausweisnNr || undefined,
      startDatum: this.startDatum,
      endDatum: this.endDatum,
      gesamtmiete: this.gesamtmiete,
      rabatt: this.rabatt || 0,
      kaution: this.kaution,
      zahlungsart: this.zahlungsart as PaymentMethod,
      zustandBeiUebergabe: this.zustandBeiUebergabe as BikeConditionAtHandover,
      notizen: this.notizen || undefined,
    };

    this.rentalService.update(this.rental.id, update).subscribe({
      next: () => {
        this.router.navigate(['/rentals', this.rental!.id]);
      },
      error: () => {
        this.submitting = false;
        alert('Fehler beim Speichern der Änderungen');
      },
    });
  }
}
