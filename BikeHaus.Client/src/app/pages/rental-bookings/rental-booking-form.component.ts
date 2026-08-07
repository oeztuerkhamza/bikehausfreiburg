import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RentalBookingService } from '../../services/rental-booking.service';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';
import { FormDraftService } from '../../services/form-draft.service';
import { Bicycle, Customer, RentalBookingCreate } from '../../models/models';
import { CustomerAutocompleteComponent } from '../../components/customer-autocomplete/customer-autocomplete.component';
import { DraftRestoredBannerComponent } from '../../components/draft-restored-banner/draft-restored-banner.component';

/** Nur echte Nutzereingaben; die Fahrrad-IDs sind Auswahl, keine Stammdaten —
 * onDatesChanged() räumt beim Neuladen ohnehin Räder raus, die inzwischen
 * nicht mehr verfügbar sind. */
interface RentalBookingFormDraft {
  startDatum: string;
  endDatum: string;
  abholzeit: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  sprache: string;
  notizen: string;
  selectedBikeIds: number[];
}

const DRAFT_KEY = 'bikehaus-draft-rental-booking-form';
const DRAFT_MAX_AGE_MS = 8 * 60 * 60 * 1000;

/**
 * Admin-seitige Anlage einer neuen Mietanfrage (z.B. Telefon/Laufkundschaft).
 * E-Mail ist optional — ohne E-Mail wird keine Kundenbestätigung verschickt.
 */
@Component({
  selector: 'app-rental-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CustomerAutocompleteComponent,
    DraftRestoredBannerComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Neue Mietanfrage</h1>
        <a routerLink="/rental-bookings" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <app-draft-restored-banner
        *ngIf="draftRestored"
        (discard)="discardDraft()"
      ></app-draft-restored-banner>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Zeitraum -->
          <div class="form-card">
            <h2>Zeitraum</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.from }} *</label>
                <input
                  type="date"
                  [(ngModel)]="startDatum"
                  name="startDatum"
                  required
                  (change)="onDatesChanged()"
                />
              </div>
              <div class="field">
                <label>{{ t.to }} *</label>
                <input
                  type="date"
                  [(ngModel)]="endDatum"
                  name="endDatum"
                  required
                  (change)="onDatesChanged()"
                />
              </div>
              <div class="field">
                <label>{{ t.abholzeit }}</label>
                <input type="time" [(ngModel)]="abholzeit" name="abholzeit" />
              </div>
            </div>
          </div>

          <!-- Fahrräder -->
          <div class="form-card">
            <h2>
              Fahrräder
              <span class="selected-count" *ngIf="selectedBikeIds().size > 0"
                >{{ selectedBikeIds().size }} ausgewählt</span
              >
            </h2>
            <p class="hint" *ngIf="!datesValid()">
              Bitte zuerst einen gültigen Zeitraum wählen.
            </p>
            <ng-container *ngIf="datesValid()">
              <input
                type="text"
                class="bike-filter"
                placeholder="Suchen (Marke, Modell)..."
                [ngModel]="bikeSearch()"
                (ngModelChange)="bikeSearch.set($event)"
                name="bikeSearch"
              />
              <p class="hint" *ngIf="loadingBikes()">Wird geladen...</p>
              <p class="hint" *ngIf="!loadingBikes() && filteredBikes().length === 0">
                Keine verfügbaren Mieträder für diesen Zeitraum.
              </p>
              <div class="bike-list">
                <label
                  *ngFor="let b of filteredBikes()"
                  class="bike-option"
                  [class.selected]="selectedBikeIds().has(b.id)"
                >
                  <input
                    type="checkbox"
                    [checked]="selectedBikeIds().has(b.id)"
                    (change)="toggleBike(b.id)"
                  />
                  <span class="bike-option-body">
                    <span class="bike-option-name">{{ b.marke }} {{ b.modell }}</span>
                    <span class="bike-option-meta">
                      <span *ngIf="b.rahmengroesse">{{ b.rahmengroesse }} · </span>
                      <span *ngIf="b.farbe">{{ b.farbe }} · </span>
                      <span *ngIf="b.rentalPriceDay1"
                        >ab {{ b.rentalPriceDay1 | number: '1.2-2' }} €/Tag</span
                      >
                    </span>
                  </span>
                </label>
              </div>
            </ng-container>
          </div>

          <!-- Kunde -->
          <div class="form-card">
            <h2>{{ t.customer }}</h2>
            <div class="form-grid">
              <app-customer-autocomplete
                [vorname]="vorname"
                (vornameChange)="vorname = $event"
                [nachname]="nachname"
                (nachnameChange)="nachname = $event"
                [requiredMark]="true"
                [hasOtherData]="hasOtherCustomerData()"
                (customerSelected)="onCustomerSelected($event)"
              ></app-customer-autocomplete>
              <div class="field">
                <label>E-Mail (optional)</label>
                <input type="email" [(ngModel)]="email" name="email" />
              </div>
              <div class="field">
                <label>{{ t.phone }}</label>
                <input [(ngModel)]="telefon" name="telefon" />
              </div>
              <div class="field">
                <label>{{ t.language }}</label>
                <!-- Bestimmt die Sprache aller Mails zu dieser Buchung. Die
                     Liste deckt jetzt alle Sprachen ab, für die es
                     Mailtexte gibt (RentalBookingMailTexts) — vorher standen
                     hier nur vier, und fr/tr wurden serverseitig ohnehin still
                     auf Deutsch zurückgesetzt. -->
                <select [(ngModel)]="sprache" name="sprache">
                  <option value="de">Deutsch</option>
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="it">Italiano</option>
                  <option value="nl">Nederlands</option>
                  <option value="pl">Polski</option>
                  <option value="ru">Русский</option>
                  <option value="ar">العربية</option>
                  <option value="da">Dansk</option>
                  <option value="no">Norsk</option>
                </select>
              </div>
              <div class="field full">
                <label>{{ t.notes }}</label>
                <textarea [(ngModel)]="notizen" name="notizen" rows="2"></textarea>
              </div>
            </div>
            <p class="hint">
              Ohne E-Mail-Adresse erhält der Kunde keine Bestätigungs-Mails.
            </p>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="
              !f.valid ||
              !vorname.trim() ||
              !nachname.trim() ||
              selectedBikeIds().size === 0 ||
              saving()
            "
          >
            {{ saving() ? 'Wird gespeichert...' : 'Anfrage anlegen' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 700px;
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
      .form-card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 20px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
        margin-bottom: 16px;
      }
      .form-card h2 {
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .selected-count {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--primary, #2563eb);
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field label {
        font-size: 0.82rem;
        font-weight: 600;
      }
      .field input,
      .field select,
      .field textarea,
      .bike-filter {
        padding: 8px 10px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 8px;
        font-size: 0.9rem;
        background: var(--bg-input, #fff);
        color: inherit;
      }
      .bike-filter {
        width: 100%;
        margin-bottom: 10px;
      }
      .hint {
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
        margin: 6px 0 0;
      }
      .bike-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 320px;
        overflow-y: auto;
      }
      .bike-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 8px;
        cursor: pointer;
      }
      .bike-option.selected {
        border-color: var(--primary, #2563eb);
        background: var(--primary-soft, rgba(37, 99, 235, 0.06));
      }
      .bike-option-body {
        display: flex;
        flex-direction: column;
      }
      .bike-option-name {
        font-weight: 600;
        font-size: 0.9rem;
      }
      .bike-option-meta {
        font-size: 0.78rem;
        color: var(--text-secondary, #64748b);
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
      }
    `,
  ],
})
export class RentalBookingFormComponent implements OnInit, OnDestroy {
  private bookingService = inject(RentalBookingService);
  private bicycleService = inject(BicycleService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private formDraftService = inject(FormDraftService);
  draftRestored = false;
  private draftAutosaveHandle: ReturnType<typeof setInterval> | undefined;

  startDatum = '';
  endDatum = '';
  abholzeit = '';
  vorname = '';
  nachname = '';
  email = '';
  telefon = '';
  sprache = 'de';
  notizen = '';

  /**
   * Steuert, ob die Kunden-Vorschlagsliste vor der Übernahme nachfragt.
   * Diese Schnellanfrage kennt keine Adresse/Steuernummer — nur Telefon und
   * E-Mail lassen sich hier überhaupt überschreiben.
   */
  hasOtherCustomerData(): boolean {
    return !!(this.telefon?.trim() || this.email?.trim());
  }

  onCustomerSelected(customer: Customer) {
    this.telefon = customer.telefon || this.telefon;
    this.email = customer.email || this.email;
  }

  availableBikes = signal<Bicycle[]>([]);
  selectedBikeIds = signal<Set<number>>(new Set());
  bikeSearch = signal('');
  loadingBikes = signal(false);
  saving = signal(false);

  filteredBikes = computed(() => {
    const term = this.bikeSearch().toLowerCase();
    const bikes = this.availableBikes();
    if (!term) return bikes;
    return bikes.filter(
      (b) =>
        b.marke.toLowerCase().includes(term) ||
        b.modell.toLowerCase().includes(term),
    );
  });

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.startDatum = today;
    this.endDatum = today;

    this.restoreDraftIfAny();
    this.onDatesChanged();

    this.draftAutosaveHandle = setInterval(() => this.saveDraftSnapshot(), 3000);
  }

  ngOnDestroy() {
    if (this.draftAutosaveHandle) clearInterval(this.draftAutosaveHandle);
  }

  private restoreDraftIfAny() {
    const draft = this.formDraftService.load<RentalBookingFormDraft>(
      DRAFT_KEY,
      DRAFT_MAX_AGE_MS,
    );
    if (!draft) return;

    if (draft.startDatum) this.startDatum = draft.startDatum;
    if (draft.endDatum) this.endDatum = draft.endDatum;
    this.abholzeit = draft.abholzeit ?? '';
    this.vorname = draft.vorname ?? '';
    this.nachname = draft.nachname ?? '';
    this.email = draft.email ?? '';
    this.telefon = draft.telefon ?? '';
    this.sprache = draft.sprache ?? 'de';
    this.notizen = draft.notizen ?? '';
    if (Array.isArray(draft.selectedBikeIds)) {
      // onDatesChanged() (unten in ngOnInit) filtert Räder raus, die für den
      // wiederhergestellten Zeitraum inzwischen nicht mehr verfügbar sind.
      this.selectedBikeIds.set(new Set(draft.selectedBikeIds));
    }

    this.draftRestored = true;
  }

  private saveDraftSnapshot() {
    const draft: RentalBookingFormDraft = {
      startDatum: this.startDatum,
      endDatum: this.endDatum,
      abholzeit: this.abholzeit,
      vorname: this.vorname,
      nachname: this.nachname,
      email: this.email,
      telefon: this.telefon,
      sprache: this.sprache,
      notizen: this.notizen,
      selectedBikeIds: Array.from(this.selectedBikeIds()),
    };
    this.formDraftService.save(DRAFT_KEY, draft);
  }

  discardDraft() {
    this.formDraftService.clear(DRAFT_KEY);
    if (typeof window !== 'undefined') window.location.reload();
  }

  datesValid(): boolean {
    return (
      !!this.startDatum && !!this.endDatum && this.endDatum >= this.startDatum
    );
  }

  onDatesChanged() {
    if (!this.datesValid()) {
      this.availableBikes.set([]);
      return;
    }
    this.loadingBikes.set(true);
    this.bicycleService
      .getAvailableForPeriod(this.startDatum, this.endDatum)
      .subscribe({
        next: (bikes) => {
          this.availableBikes.set(bikes);
          // Auswahl auf noch verfügbare Räder beschränken
          const availableIds = new Set(bikes.map((b) => b.id));
          this.selectedBikeIds.update((sel) => {
            const next = new Set<number>();
            sel.forEach((id) => {
              if (availableIds.has(id)) next.add(id);
            });
            return next;
          });
          this.loadingBikes.set(false);
        },
        error: () => {
          this.loadingBikes.set(false);
          this.notificationService.error(this.t.saveError);
        },
      });
  }

  toggleBike(id: number) {
    this.selectedBikeIds.update((sel) => {
      const next = new Set(sel);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  submit() {
    if (!this.datesValid() || this.selectedBikeIds().size === 0) return;
    if (!this.vorname.trim() || !this.nachname.trim()) return;

    const dto: RentalBookingCreate = {
      bikes: Array.from(this.selectedBikeIds()).map((bicycleId) => ({
        bicycleId,
        startDatum: this.startDatum,
        endDatum: this.endDatum,
      })),
      vorname: this.vorname.trim(),
      nachname: this.nachname.trim(),
      email: this.email.trim() || undefined,
      telefon: this.telefon.trim() || undefined,
      sprache: this.sprache,
      notizen: this.notizen.trim() || undefined,
      abholzeit: this.abholzeit || undefined,
    };

    this.saving.set(true);
    this.bookingService.create(dto).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.notificationService.success(this.t.saveSuccess);
        this.formDraftService.clear(DRAFT_KEY);
        this.router.navigate(['/rental-bookings', created.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.error || this.t.saveError);
      },
    });
  }
}
