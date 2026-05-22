import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RentalService } from '../../services/rental.service';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';
import { BikeSelectorComponent } from '../../components/bike-selector/bike-selector.component';
import {
  Rental,
  RentalBike,
  RentalUpdate,
  RentalBikeCreate,
  Bicycle,
  PaymentMethod,
  BikeConditionAtHandover,
} from '../../models/models';
import { calculateRentalPrice } from '../../utils/rental-pricing';

interface BikeEditSlot {
  rentalBikeId: number | null;   // null = newly added, not yet in DB
  isNew: boolean;
  selectedBike: Bicycle | null;
  originalBicycleId: number | null;
  rahmennummer: string;
  farbe: string;
  mietpreis: number;
  kaution: number;
  berechneterPreis: number;
  preisInfo: string;
  pendingRemove: boolean;        // marked for removal on save
}

@Component({
  selector: 'app-rental-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SignaturePadComponent, BikeSelectorComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Mietvertrag bearbeiten</h1>
        <a [routerLink]="rental ? ['/rentals', rental.id] : ['/rentals']" class="btn btn-outline">Zurück</a>
      </div>

      <div *ngIf="loading" class="loading">Laden...</div>
      <div *ngIf="error" class="error-msg">{{ error }}</div>

      <form *ngIf="rental && !loading" (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">

          <!-- Fahrräder -->
          <div class="form-card" *ngFor="let slot of visibleSlots; let i = index" [class.remove-pending]="slot.pendingRemove">
            <div class="bike-card-header">
              <h2>
                <span *ngIf="slot.isNew" class="new-badge">Neu</span>
                {{ visibleSlots.length > 1 ? (i + 1) + '. Fahrrad' : 'Fahrrad' }}
              </h2>
              <span class="bike-nr-badge" *ngIf="slot.selectedBike">
                {{ slot.selectedBike.marke }} {{ slot.selectedBike.modell }}
              </span>
              <button
                *ngIf="visibleSlots.length > 1 || slot.isNew"
                type="button"
                class="btn-remove-bike"
                (click)="toggleRemoveSlot(slot)"
                [title]="slot.pendingRemove ? 'Wiederherstellen' : 'Fahrrad entfernen'"
              >{{ slot.pendingRemove ? 'Wiederherstellen' : '✕ Entfernen' }}</button>
            </div>

            <!-- Bike selector -->
            <div class="selector-wrap">
              <app-bike-selector
                [bikes]="getAvailableBikesFor(i)"
                [selectedBike]="slot.selectedBike"
                (selectedBikeChange)="onSelectedBikeUpdated(i, $event)"
                [requireConfirmSelection]="true"
                (bikeSelected)="onBikeSelected(i, $event)"
              ></app-bike-selector>
            </div>

            <!-- Bike detail fields -->
            <div class="form-grid" style="margin-top: 16px;">
              <div class="field full">
                <label>Rahmennummer</label>
                <input type="text" [(ngModel)]="slot.rahmennummer" [name]="'rahmen_' + i" />
              </div>
              <div class="field">
                <label>Farbe</label>
                <input type="text" [(ngModel)]="slot.farbe" [name]="'farbe_' + i" />
              </div>
            </div>

            <!-- Pricing -->
            <div class="price-bar" *ngIf="rentalDays > 0">
              <span class="days-badge">{{ rentalDays }} Tag{{ rentalDays !== 1 ? 'e' : '' }}</span>
              <span class="calc-price">Berechneter Preis: {{ slot.berechneterPreis | number:'1.2-2' }} €</span>
            </div>
            <div class="calc-info" *ngIf="slot.preisInfo">{{ slot.preisInfo }}</div>

            <div class="form-grid" style="margin-top: 12px;">
              <div class="field">
                <label>Gesamtmiete (€) *</label>
                <input type="number" step="0.01" min="0" [(ngModel)]="slot.mietpreis" [name]="'miete_' + i" required />
              </div>
              <div class="field">
                <label>Kaution (€) *</label>
                <input type="number" step="0.01" min="0" [(ngModel)]="slot.kaution" [name]="'kaution_' + i" required />
              </div>
            </div>
          </div>

          <!-- Zahlungsart & Rabatt -->
          <div class="form-card">
            <h2>Zahlung</h2>
            <div class="form-grid">
              <div class="field">
                <label>Rabatt (€)</label>
                <input type="number" step="0.01" min="0" [(ngModel)]="rabatt" name="rabatt" />
              </div>
              <div class="field">
                <label>Zahlungsart Miete *</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">Bar</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Karte">Karte</option>
                  <option value="Überweisung">Überweisung</option>
                </select>
              </div>
              <div class="field">
                <label>Zahlungsart Kaution *</label>
                <select [(ngModel)]="kautionZahlungsart" name="kautionZahlungsart" required>
                  <option value="Bar">Bar</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Karte">Karte</option>
                  <option value="Überweisung">Überweisung</option>
                </select>
              </div>
              <div class="field full">
                <label>Notizen</label>
                <textarea [(ngModel)]="notizen" name="notizen" rows="3"></textarea>
              </div>
            </div>
          </div>

          <!-- Mietdaten -->
          <div class="form-card">
            <h2>Mietdaten</h2>
            <div class="form-grid">
              <div class="field">
                <label>Mietbeginn *</label>
                <input type="date" [(ngModel)]="startDatum" name="startDatum" required (ngModelChange)="onDatesChanged()" />
              </div>
              <div class="field">
                <label>Mietende *</label>
                <input type="date" [(ngModel)]="endDatum" name="endDatum" required (ngModelChange)="onDatesChanged()" />
              </div>
            </div>
          </div>

          <!-- Mieter -->
          <div class="form-card">
            <h2>Mieter</h2>
            <div class="form-grid">
              <div class="field">
                <label>Vorname *</label>
                <input [(ngModel)]="mieter.vorname" name="vorname" required />
              </div>
              <div class="field">
                <label>Nachname *</label>
                <input [(ngModel)]="mieter.nachname" name="nachname" required />
              </div>
              <div class="field">
                <label>Straße</label>
                <input [(ngModel)]="mieter.strasse" name="strasse" />
              </div>
              <div class="field">
                <label>Hausnummer</label>
                <input [(ngModel)]="mieter.hausnummer" name="hausnr" />
              </div>
              <div class="field">
                <label>PLZ</label>
                <input [(ngModel)]="mieter.plz" name="plz" />
              </div>
              <div class="field">
                <label>Stadt</label>
                <input [(ngModel)]="mieter.stadt" name="stadt" />
              </div>
              <div class="field">
                <label>Telefon</label>
                <input [(ngModel)]="mieter.telefon" name="telefon" />
              </div>
              <div class="field">
                <label>E-Mail</label>
                <input type="email" [(ngModel)]="mieter.email" name="email" />
              </div>
              <div class="field">
                <label>Ausweis-Nr.</label>
                <input [(ngModel)]="ausweisnNr" name="ausweisnNr" />
              </div>
            </div>
          </div>

          <!-- AGB & Unterschrift -->
          <div class="form-card">
            <h2>AGB &amp; Unterschrift</h2>
            <div class="form-grid">
              <div class="field">
                <label>Ort</label>
                <input [(ngModel)]="unterschriftOrt" name="unterschriftOrt" placeholder="Freiburg" />
              </div>
              <div class="field" style="display:flex;align-items:center;gap:8px;padding-top:22px;">
                <input type="checkbox" [(ngModel)]="agbAkzeptiert" name="agb" id="agbChk" style="width:18px;height:18px;cursor:pointer;" />
                <label for="agbChk" style="cursor:pointer;margin:0;">AGB gelesen und akzeptiert</label>
              </div>
            </div>
            <div style="margin-top:12px;">
              <label style="font-weight:600;font-size:0.9rem;">Unterschrift Mieter</label>
              <div *ngIf="rental!.mieterUnterschrift && !mieterUnterschrift" style="margin-bottom:8px;">
                <p style="font-size:0.8rem;color:#64748b;margin-bottom:4px;">Vorhandene Unterschrift:</p>
                <img [src]="rental!.mieterUnterschrift" style="max-height:60px;border:1px solid #e2e8f0;border-radius:4px;" />
              </div>
              <app-signature-pad [(ngModel)]="mieterUnterschrift" name="mieterUnterschrift"></app-signature-pad>
              <p style="font-size:0.75rem;color:#94a3b8;margin-top:4px;">Neu unterschreiben, um die vorhandene Unterschrift zu ersetzen.</p>
            </div>
          </div>

        </div>

        <!-- Fahrrad hinzufügen -->
        <div class="add-bike-row">
          <button type="button" class="btn btn-add-bike" (click)="addNewBikeSlot()">
            + Fahrrad hinzufügen
          </button>
        </div>

        <div class="form-actions">
          <a [routerLink]="rental ? ['/rentals', rental.id] : ['/rentals']" class="btn btn-outline">Abbrechen</a>
          <button type="submit" class="btn btn-primary" [disabled]="submitting">
            {{ submitting ? 'Wird gespeichert...' : 'Änderungen speichern' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page { max-width: 960px; margin: 0 auto; animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
    .loading, .error-msg { text-align: center; padding: 48px; font-size: 1.1rem; }
    .error-msg { color: var(--accent-danger, #ef4444); }
    .form-sections { display: flex; flex-direction: column; gap: 20px; }
    .form-card {
      background: var(--bg-card, #fff);
      border-radius: var(--radius-lg, 14px);
      padding: 24px;
      border: 1.5px solid var(--border-light, #e2e8f0);
      box-shadow: var(--shadow-sm);
    }
    .form-card h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; color: var(--text-primary); }
    .bike-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .bike-card-header h2 { margin-bottom: 0; }
    .bike-nr-badge { font-size: 0.85rem; color: var(--text-secondary, #64748b); }
    .selector-wrap { border: 1.5px solid var(--border-light, #e2e8f0); border-radius: var(--radius-md, 10px); padding: 12px; }
    .price-bar {
      display: flex; justify-content: space-between; align-items: center;
      background: rgba(99,102,241,0.07); border: 1.5px solid rgba(99,102,241,0.2);
      border-radius: 8px; padding: 8px 14px; margin-top: 14px;
    }
    .days-badge { background: var(--accent-primary, #6366f1); color: #fff; border-radius: 50px; padding: 2px 10px; font-size: 0.82rem; font-weight: 700; }
    .calc-price { font-weight: 700; font-size: 0.92rem; color: var(--accent-primary, #6366f1); }
    .calc-info { font-size: 0.8rem; color: var(--text-secondary, #64748b); margin-top: 4px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
    .field { display: flex; flex-direction: column; gap: 5px; }
    .field.full { grid-column: 1 / -1; }
    .field label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary, #64748b); text-transform: uppercase; letter-spacing: 0.03em; }
    .field input, .field select, .field textarea {
      width: 100%; padding: 9px 12px;
      border: 1.5px solid var(--border-light, #e2e8f0);
      border-radius: var(--radius-md, 10px);
      font-size: 0.92rem; background: var(--bg-card, #fff); color: var(--text-primary);
    }
    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none; border-color: var(--accent-primary, #6366f1);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
    }
    .form-actions { margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; }
    .btn {
      padding: 10px 22px; border-radius: var(--radius-md, 10px); font-weight: 600;
      font-size: 0.88rem; cursor: pointer; border: 1.5px solid transparent;
      text-decoration: none; display: inline-flex; align-items: center;
    }
    .btn-primary { background: var(--accent-primary, #6366f1); color: #fff; border-color: var(--accent-primary, #6366f1); }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-outline { border-color: var(--border-light, #e2e8f0); color: var(--text-primary); background: transparent; }
    .btn-outline:hover { border-color: var(--accent-primary, #6366f1); color: var(--accent-primary, #6366f1); }
    .new-badge { background: #10b981; color:#fff; border-radius:50px; padding:2px 8px; font-size:0.72rem; font-weight:700; margin-right:6px; vertical-align:middle; }
    .btn-remove-bike { margin-left:auto; padding:5px 12px; border:1.5px solid #ef4444; border-radius:8px; background:transparent; color:#ef4444; font-size:0.8rem; font-weight:600; cursor:pointer; }
    .btn-remove-bike:hover { background:#ef4444; color:#fff; }
    .remove-pending { opacity:0.5; border-color:#ef4444 !important; }
    .add-bike-row { display:flex; justify-content:flex-start; margin-top:4px; }
    .btn-add-bike { padding:10px 20px; border:2px dashed var(--accent-primary,#6366f1); border-radius:var(--radius-md,10px); background:transparent; color:var(--accent-primary,#6366f1); font-size:0.9rem; font-weight:700; cursor:pointer; }
    .btn-add-bike:hover { background:rgba(99,102,241,0.07); }
  `],
})
export class RentalEditComponent implements OnInit {
  private rentalService = inject(RentalService);
  private bicycleService = inject(BicycleService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  rental: Rental | null = null;
  loading = true;
  error = '';
  submitting = false;

  bikeSlots: BikeEditSlot[] = [];
  availableBikes: Bicycle[] = [];
  availabilityLoading = false;
  rentalDays = 0;

  get visibleSlots(): BikeEditSlot[] {
    return this.bikeSlots;
  }

  mieter = { vorname: '', nachname: '', strasse: '', hausnummer: '', plz: '', stadt: '', telefon: '', email: '' };
  ausweisnNr = '';
  startDatum = '';
  endDatum = '';
  rabatt = 0;
  zahlungsart: string = PaymentMethod.Bar;
  kautionZahlungsart: string = PaymentMethod.Bar;
  notizen = '';
  mieterUnterschrift = '';
  agbAkzeptiert = false;
  unterschriftOrt = 'Freiburg';

  get t() { return this.translationService.translations(); }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'Ungültige ID'; this.loading = false; return; }

    this.rentalService.getById(+id).subscribe({
      next: (rental) => {
        this.rental = rental;
        this.loadFormData(rental);
        this.loading = false;
        this.loadAvailableForPeriod();
      },
      error: () => { this.error = 'Mietvertrag nicht gefunden'; this.loading = false; },
    });
  }

  addNewBikeSlot() {
    this.bikeSlots.push({
      rentalBikeId: null,
      isNew: true,
      selectedBike: null,
      originalBicycleId: null,
      rahmennummer: '',
      farbe: '',
      mietpreis: 0,
      kaution: 0,
      berechneterPreis: 0,
      preisInfo: '',
      pendingRemove: false,
    });
    this.loadAvailableForPeriod();
  }

  toggleRemoveSlot(slot: BikeEditSlot) {
    if (slot.isNew) {
      this.bikeSlots.splice(this.bikeSlots.indexOf(slot), 1);
    } else {
      slot.pendingRemove = !slot.pendingRemove;
    }
  }

  private loadFormData(rental: Rental) {
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
    this.rabatt = rental.rabatt || 0;
    this.zahlungsart = rental.zahlungsart || PaymentMethod.Bar;
    this.kautionZahlungsart = rental.kautionZahlungsart || PaymentMethod.Bar;
    this.notizen = rental.notizen || '';
    this.agbAkzeptiert = rental.agbAkzeptiert || false;
    this.unterschriftOrt = rental.unterschriftOrt || 'Freiburg';

    if (rental.startDatum) this.startDatum = rental.startDatum.split('T')[0];
    if (rental.endDatum) this.endDatum = rental.endDatum.split('T')[0];

    this.recalcDays();

    this.bikeSlots = rental.bikes.map((rb: RentalBike) => ({
      rentalBikeId: rb.id,
      isNew: false,
      selectedBike: rb.bicycle ?? null,
      originalBicycleId: rb.bicycleId,
      rahmennummer: rb.rahmennummer || rb.bicycle?.rahmennummer || '',
      farbe: rb.farbe || rb.bicycle?.farbe || '',
      mietpreis: rb.mietpreis,
      kaution: rb.kaution,
      berechneterPreis: 0,
      preisInfo: '',
      pendingRemove: false,
    }));

    this.recalcAllPrices();
  }

  private recalcDays() {
    if (!this.startDatum || !this.endDatum) { this.rentalDays = 0; return; }
    const diff = Math.round((new Date(this.endDatum).getTime() - new Date(this.startDatum).getTime()) / 86400000);
    this.rentalDays = Math.max(0, diff + 1);
  }

  private recalcAllPrices() {
    this.bikeSlots.forEach(slot => {
      if (!slot.selectedBike || this.rentalDays <= 0) return;
      const result = calculateRentalPrice(slot.selectedBike as any, this.rentalDays);
      slot.berechneterPreis = result.total ?? 0;
      slot.preisInfo = result.info ?? '';
    });
  }

  onDatesChanged() {
    this.recalcDays();
    this.recalcAllPrices();
    this.loadAvailableForPeriod();
  }

  private loadAvailableForPeriod() {
    if (!this.startDatum || !this.endDatum) return;
    this.availabilityLoading = true;
    this.bicycleService.getAvailableForPeriod(this.startDatum, this.endDatum).subscribe({
      next: (bikes) => {
        // Include currently selected bikes even if they're busy (they're part of this rental)
        const currentIds = new Set(this.bikeSlots.map(s => s.selectedBike?.id).filter(Boolean));
        const extra = this.bikeSlots
          .filter(s => s.selectedBike && !bikes.some(b => b.id === s.selectedBike!.id))
          .map(s => s.selectedBike!);
        this.availableBikes = [...bikes, ...extra];
        this.availabilityLoading = false;
      },
      error: () => { this.availabilityLoading = false; },
    });
  }

  getAvailableBikesFor(i: number): Bicycle[] {
    const visibleSlots = this.visibleSlots;
    const otherIds = visibleSlots
      .map((s, idx) => idx !== i ? s.selectedBike?.id : null)
      .filter((id): id is number => id != null);
    return this.availableBikes.filter(b => !otherIds.includes(b.id));
  }

  onBikeSelected(i: number, bike: Bicycle) {
    const slot = this.visibleSlots[i];
    if (!slot) return;
    slot.selectedBike = bike;
    slot.rahmennummer = bike.rahmennummer || '';
    slot.farbe = bike.farbe || '';
    if (bike.kaution != null) slot.kaution = bike.kaution;
    const result = calculateRentalPrice(bike as any, this.rentalDays);
    slot.berechneterPreis = result.total ?? 0;
    slot.preisInfo = result.info ?? '';
  }

  onSelectedBikeUpdated(i: number, bike: Bicycle | null) {
    const slot = this.visibleSlots[i];
    if (!slot) return;
    slot.selectedBike = bike;
    if (!bike) return;
    if (bike.rahmennummer) slot.rahmennummer = bike.rahmennummer;
    if (bike.farbe) slot.farbe = bike.farbe;
    if (bike.kaution != null) slot.kaution = bike.kaution;
    if (this.rentalDays > 0) {
      const result = calculateRentalPrice(bike as any, this.rentalDays);
      slot.berechneterPreis = result.total ?? 0;
      slot.preisInfo = result.info ?? '';
    }
  }

  submit() {
    if (!this.rental || this.submitting) return;
    this.submitting = true;

    const removeBikeIds = this.bikeSlots
      .filter(s => !s.isNew && s.pendingRemove && s.rentalBikeId != null)
      .map(s => s.rentalBikeId as number);

    const existingSlots = this.bikeSlots.filter(s => !s.isNew && !s.pendingRemove);
    const newSlots = this.bikeSlots.filter(s => s.isNew && !s.pendingRemove && s.selectedBike != null);

    const newBikes: RentalBikeCreate[] = newSlots.map(slot => ({
      bicycleId: slot.selectedBike!.id,
      rahmennummer: slot.rahmennummer || undefined,
      farbe: slot.farbe || undefined,
      startDatum: this.startDatum,
      endDatum: this.endDatum,
      mietpreis: slot.mietpreis,
      kaution: slot.kaution,
      zustandBeiUebergabe: BikeConditionAtHandover.Gut,
    }));

    const update: RentalUpdate = {
      customer: this.mieter,
      ausweisnNr: this.ausweisnNr || undefined,
      startDatum: this.startDatum,
      endDatum: this.endDatum,
      rabatt: this.rabatt || 0,
      zahlungsart: this.zahlungsart as PaymentMethod,
      kautionZahlungsart: this.kautionZahlungsart as PaymentMethod,
      notizen: this.notizen || undefined,
      mieterUnterschrift: this.mieterUnterschrift || undefined,
      agbAkzeptiert: this.agbAkzeptiert,
      unterschriftOrt: this.unterschriftOrt || undefined,
      bikes: existingSlots.map(slot => ({
        id: slot.rentalBikeId as number,
        bicycleId: slot.selectedBike?.id !== slot.originalBicycleId ? slot.selectedBike?.id : undefined,
        rahmennummer: slot.rahmennummer || undefined,
        farbe: slot.farbe || undefined,
        mietpreis: slot.mietpreis,
        kaution: slot.kaution,
      })),
      newBikes: newBikes.length > 0 ? newBikes : undefined,
      removeBikeIds: removeBikeIds.length > 0 ? removeBikeIds : undefined,
    };

    this.rentalService.update(this.rental.id, update).subscribe({
      next: () => {
        this.notificationService.success('Änderungen gespeichert');
        this.router.navigate(['/rentals', this.rental!.id]);
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.error(err.error?.error || 'Fehler beim Speichern');
      },
    });
  }
}
