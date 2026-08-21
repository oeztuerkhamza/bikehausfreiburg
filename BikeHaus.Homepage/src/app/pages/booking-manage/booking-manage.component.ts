import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { ShopInfoService } from '../../services/shop-info.service';
import { TranslationService } from '../../services/translation.service';
import {
  LOCALE_BY_LANGUAGE,
  getRentalBookingPath,
  getRentalSlug,
} from '../../services/language-config';
import { RentalBookingLookup } from '../../models/models';
import { takeBookingHandoff } from '../../utils/booking-handoff';

type ManagePhase = 'form' | 'view';

/**
 * "Buchung verwalten" — Ansehen + Storno-Selfservice der Homepage.
 *
 * Ersetzt die vom API roh gerenderte HTML-Seite (`PublicRentalsController`,
 * `bookings/cancel`), die außerhalb von Design und Sprachen der Homepage lag.
 *
 * Ablauf, bewusst "erst ansehen, dann entscheiden": Buchungsnummer + E-Mail
 * gehen an den nebenwirkungsfreien `POST /rentals/bookings/lookup` (Phase
 * `view`). Ein Storno erfolgt ausschließlich von dort aus, nach einer
 * bewussten Rückfrage (`confirmingCancel`), und nur ein echter Klick auf
 * "Ja, stornieren" löst den einzigen zustandsverändernden Aufruf aus
 * (`POST /rentals/bookings/cancel`). Nach Erfolg bleibt die Seite in Phase
 * `view` und zeigt eine eigene Erfolgsmeldung — die zuvor geladenen
 * Buchungsdaten werden dafür wiederverwendet, denn der Storno-Endpunkt liefert
 * ein anderes, PII-haltiges Antwortformat (`RentalBookingCancelResult`), das
 * hier nicht zur Anzeige gebraucht wird.
 */
@Component({
  selector: 'app-booking-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="manage-page">
      <div class="manage-inner">
        <a [routerLink]="backLink()" class="manage-back-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {{ t().rentalSteps?.backToInfo ?? 'Zurück zum Fahrradverleih' }}
        </a>

        <div class="manage-card">
          <h1>{{ t().bookingManage?.pageTitle ?? 'Buchung verwalten' }}</h1>

          <!-- Schritt 1: Buchungsnummer + E-Mail → nebenwirkungsfreier Lookup -->
          <form
            *ngIf="phase() === 'form'"
            (ngSubmit)="submitLookup()"
            class="manage-form"
          >
            <p class="manage-intro">
              {{
                t().bookingManage?.intro ??
                  'Geben Sie Ihre Buchungsnummer und die bei der Buchung angegebene E-Mail-Adresse ein.'
              }}
            </p>

            <div class="form-group">
              <label>{{
                t().rentalSteps?.bookingNumber ?? 'Buchungsnummer'
              }}</label>
              <input
                type="text"
                name="bookingNumber"
                [(ngModel)]="form.bookingNumber"
                [placeholder]="
                  t().bookingManage?.bookingNumberPlaceholder ??
                  'z. B. MB-2026-00123'
                "
                required
                autocomplete="off"
              />
            </div>

            <div class="form-group">
              <label>{{ t().rentalSteps?.email ?? 'E-Mail' }}</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="form.email"
                [placeholder]="
                  t().bookingManage?.emailPlaceholder ?? 'ihre@email.de'
                "
                required
                autocomplete="email"
                inputmode="email"
              />
            </div>

            <div *ngIf="error()" class="error-message">{{ error() }}</div>

            <button type="submit" class="btn-primary" [disabled]="isSubmitting()">
              {{
                isSubmitting()
                  ? (t().rentalSteps?.submitting ?? 'Wird gesendet...')
                  : (t().bookingManage?.findButton ?? 'Weiter')
              }}
            </button>
          </form>

          <!-- Schritt 2: reine Ansicht, kein Seiteneffekt bisher passiert. -->
          <div *ngIf="phase() === 'view' && result() as booking" class="manage-view">
            <div *ngIf="justCancelled()" class="alert-success">
              <strong>{{
                t().bookingManage?.cancelledTitle ?? 'Buchung storniert'
              }}</strong>
              <p>
                {{
                  t().bookingManage?.cancelledText ??
                    'Ihre Buchung wurde erfolgreich storniert.'
                }}
              </p>
            </div>

            <h2>{{ t().bookingManage?.viewTitle ?? 'Ihre Buchung' }}</h2>

            <dl class="result-summary">
              <dt>{{ t().rentalSteps?.bookingNumber ?? 'Buchungsnummer' }}</dt>
              <dd>{{ booking.buchungsNummer }}</dd>

              <dt>{{ t().bookingManage?.statusLabel ?? 'Status' }}</dt>
              <dd>{{ statusText(booking.status) }}</dd>

              <dt>{{ t().bookingManage?.periodLabel ?? 'Zeitraum' }}</dt>
              <dd>
                {{ formatDisplayDate(booking.startDatum) }} –
                {{ formatDisplayDate(booking.endDatum) }}
              </dd>

              <dt *ngIf="booking.abholzeit">
                {{ t().rentalSteps?.pickupTime ?? 'Abholzeit' }}
              </dt>
              <dd *ngIf="booking.abholzeit">
                {{ booking.abholzeit }} {{ t().rentalSteps?.oClock ?? 'Uhr' }}
              </dd>

              <dt *ngIf="booking.bikes?.length">
                {{ t().bookingManage?.bikesLabel ?? 'Fahrräder' }}
              </dt>
              <dd *ngIf="booking.bikes?.length">
                <span *ngFor="let bike of booking.bikes; let last = last">
                  {{ bike.marke }} {{ bike.modell
                  }}{{ last ? '' : ', ' }}
                </span>
              </dd>

              <dt *ngIf="booking.gesamtpreis != null">
                {{ t().bookingManage?.totalPriceLabel ?? 'Gesamtpreis' }}
              </dt>
              <dd *ngIf="booking.gesamtpreis != null">
                {{ formatPrice(booking.gesamtpreis) }}
              </dd>

              <dt *ngIf="booking.kaution != null">
                {{ t().rentalSteps?.deposit ?? 'Kaution' }}
              </dt>
              <dd *ngIf="booking.kaution != null">
                {{ formatPrice(booking.kaution) }}
              </dd>
            </dl>

            <!-- Storno nicht (mehr) möglich: nur ein erklärender Hinweis, kein Button. -->
            <p
              *ngIf="!justCancelled() && booking.status === 'Cancelled'"
              class="status-note"
            >
              {{
                t().bookingManage?.alreadyCancelledNote ??
                  'Diese Buchung wurde bereits storniert.'
              }}
            </p>
            <p
              *ngIf="
                !justCancelled() &&
                booking.status !== 'Cancelled' &&
                isPastBooking(booking.endDatum)
              "
              class="status-note"
            >
              {{
                t().bookingManage?.pastBookingNote ??
                  'Der Buchungszeitraum liegt in der Vergangenheit. Eine Stornierung ist online nicht mehr möglich.'
              }}
            </p>

            <!-- Storno-Weg: erst die bewusste Rückfrage, kein API-Aufruf beim Öffnen. -->
            <button
              *ngIf="!confirmingCancel() && canCancel(booking)"
              type="button"
              class="btn-danger"
              (click)="startCancelFlow()"
            >
              {{ t().bookingManage?.cancelButton ?? 'Buchung stornieren' }}
            </button>

            <div *ngIf="confirmingCancel()" class="manage-confirm">
              <h3>
                {{
                  t().bookingManage?.confirmTitle ??
                    'Buchung wirklich stornieren?'
                }}
              </h3>
              <p>
                {{
                  t().bookingManage?.confirmText ??
                    'Diese Aktion kann nicht rückgängig gemacht werden.'
                }}
              </p>

              <div *ngIf="error()" class="error-message">{{ error() }}</div>

              <div class="confirm-actions">
                <button
                  type="button"
                  class="btn-secondary"
                  (click)="cancelCancelFlow()"
                  [disabled]="isSubmitting()"
                >
                  {{ t().bookingManage?.confirmNo ?? 'Nein, Buchung behalten' }}
                </button>
                <button
                  type="button"
                  class="btn-danger"
                  (click)="confirmCancel(booking.buchungsNummer)"
                  [disabled]="isSubmitting()"
                >
                  {{
                    isSubmitting()
                      ? (t().rentalSteps?.submitting ?? 'Wird gesendet...')
                      : (t().bookingManage?.confirmYes ??
                        'Ja, endgültig stornieren')
                  }}
                </button>
              </div>
            </div>

            <div class="result-actions">
              <button type="button" class="btn-secondary" (click)="resetAll()">
                {{ t().bookingManage?.backToStart ?? 'Neue Anfrage stellen' }}
              </button>
              <a [routerLink]="newBookingLink()" class="btn-primary btn-link">
                {{
                  t().bookingManage?.newBookingLinkText ??
                    'Neue Buchung vornehmen'
                }}
              </a>
            </div>

            <!-- Direkter Draht zum Laden — bewusst ohne eigenes Label:
                 "WhatsApp" und die Telefonnummer sind sprachneutral, und die
                 bookingManage-Übersetzungen werden an anderer Stelle gepflegt. -->
            <div class="manage-contact">
              <a
                [href]="whatsappLink()"
                target="_blank"
                rel="noopener"
                class="manage-contact-link whatsapp"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                  />
                </svg>
                WhatsApp
              </a>
              <a [href]="phoneLink()" class="manage-contact-link">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                  />
                </svg>
                {{ shopPhoneDisplay() }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .manage-page {
        min-height: 100vh;
        background:
          radial-gradient(
            circle at top left,
            rgba(255, 87, 34, 0.12),
            transparent 30%
          ),
          linear-gradient(180deg, #0a101c 0%, #121b2b 100%);
        padding: 96px 1rem 4rem;
      }

      .manage-inner {
        max-width: 560px;
        margin: 0 auto;
      }

      .manage-back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: rgba(245, 248, 255, 0.72);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 600;
        padding: 0.35rem 0;
        margin-bottom: 0.75rem;
      }

      .manage-back-link:hover {
        color: #f5f8ff;
      }

      .manage-card {
        background: linear-gradient(
          160deg,
          rgba(10, 16, 28, 0.82),
          rgba(18, 27, 43, 0.94)
        );
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 18px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        color: #f5f8ff;
        padding: 2rem;
      }

      .manage-card h1 {
        margin: 0 0 1.25rem;
        font-size: 1.4rem;
        color: #f5f8ff;
      }

      .manage-card h2 {
        margin: 0 0 0.75rem;
        color: #f5f8ff;
        font-size: 1.15rem;
      }

      .manage-card h3 {
        margin: 0 0 0.5rem;
        color: #f5f8ff;
        font-size: 1.05rem;
      }

      .manage-card p {
        color: rgba(245, 248, 255, 0.75);
        line-height: 1.5;
      }

      .manage-intro {
        margin-top: 0;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-bottom: 1.1rem;
      }

      .form-group label {
        font-weight: 600;
        font-size: 0.9rem;
        color: #f5f8ff;
      }

      .form-group input {
        padding: 0.7rem 0.85rem;
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 8px;
        font-size: 1rem;
        background: rgba(255, 255, 255, 0.06);
        color: #f5f8ff;
      }

      .form-group input::placeholder {
        color: rgba(245, 248, 255, 0.4);
      }

      .error-message {
        background: rgba(220, 38, 38, 0.12);
        color: #fecaca;
        padding: 0.85rem 1rem;
        border-radius: 8px;
        margin: 0.5rem 0 1rem;
        border-left: 4px solid #ef4444;
        font-size: 0.92rem;
      }

      .alert-success {
        background: rgba(34, 197, 94, 0.12);
        border-left: 4px solid #22c55e;
        border-radius: 8px;
        padding: 0.85rem 1rem;
        margin-bottom: 1.25rem;
      }

      .alert-success strong {
        color: #bbf7d0;
        display: block;
        margin-bottom: 0.2rem;
      }

      .alert-success p {
        margin: 0;
        color: rgba(245, 248, 255, 0.8);
      }

      .status-note {
        background: rgba(255, 255, 255, 0.05);
        border-left: 4px solid rgba(255, 255, 255, 0.25);
        border-radius: 8px;
        padding: 0.85rem 1rem;
        margin: 0 0 1.25rem;
        font-size: 0.92rem;
      }

      .btn-primary,
      .btn-secondary,
      .btn-danger {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
      }

      .btn-primary,
      .btn-link {
        background: linear-gradient(135deg, #ff7a3a, #ff5722);
        color: #fff;
        text-decoration: none;
        display: inline-block;
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 18px rgba(255, 87, 34, 0.35);
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.16);
        color: #f5f8ff;
      }

      .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
      }

      .btn-danger {
        background: rgba(220, 38, 38, 0.85);
        color: #fff;
        margin-bottom: 1.25rem;
      }

      .btn-danger:hover:not(:disabled) {
        background: #dc2626;
      }

      .btn-primary:disabled,
      .btn-secondary:disabled,
      .btn-danger:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .result-summary {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.35rem 1rem;
        margin: 1rem 0 1.5rem;
        padding: 1rem 1.1rem;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .result-summary dt {
        color: rgba(245, 248, 255, 0.6);
        font-weight: 600;
        font-size: 0.85rem;
      }

      .result-summary dd {
        margin: 0;
        color: #f5f8ff;
        font-size: 0.95rem;
      }

      .manage-confirm {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        padding: 1rem 1.1rem;
        margin-bottom: 1.25rem;
      }

      .confirm-actions,
      .result-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .confirm-actions button,
      .result-actions > * {
        flex: 1;
        min-width: 160px;
      }

      .manage-contact {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-top: 1.25rem;
        padding-top: 1.1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
      }

      .manage-contact-link {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        color: rgba(245, 248, 255, 0.85);
        text-decoration: none;
        font-size: 0.92rem;
        font-weight: 600;
      }

      .manage-contact-link:hover {
        color: #f5f8ff;
      }

      .manage-contact-link.whatsapp svg {
        color: #25d366;
      }

      @media (max-width: 640px) {
        .manage-page {
          padding: 84px 0.6rem 3rem;
        }

        .manage-card {
          padding: 1.4rem;
        }

        .confirm-actions,
        .result-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class BookingManageComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private shopInfoService = inject(ShopInfoService);
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private route = inject(ActivatedRoute);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  phase = signal<ManagePhase>('form');
  isSubmitting = signal(false);
  error = signal('');
  result = signal<RentalBookingLookup | null>(null);

  /** Bewusste Rückfrage vor dem Storno-Aufruf; noch kein API-Aufruf. */
  confirmingCancel = signal(false);
  /** Zeigt die Erfolgsmeldung direkt nach einem Storno, statt erneut den
   *  generischen "bereits storniert"-Hinweis auszugeben. */
  justCancelled = signal(false);

  form = {
    bookingNumber: '',
    email: '',
  };

  backLink = () => ['/' + this.lang(), getRentalSlug(this.lang())];
  newBookingLink = () => getRentalBookingPath(this.lang());

  // ── Kontaktzeile (WhatsApp + Telefon) ──
  // Gleiche Quelle und gleicher Fallback wie contact.component.ts: Nummer aus
  // den gecachten Shop-Stammdaten, sonst die bekannte Ladennummer.
  shopPhoneDisplay(): string {
    return this.shopInfoService.shopInfo()?.telefon || '+49 155 6630 0011';
  }

  whatsappLink(): string {
    return `https://wa.me/${this.shopPhoneDisplay().replace(/[^0-9]/g, '')}`;
  }

  phoneLink(): string {
    return `tel:${this.shopPhoneDisplay().replace(/[^0-9+]/g, '')}`;
  }

  ngOnInit(): void {
    // Link aus der Bestätigungs-/Erinnerungs-E-Mail: ?bookingNumber=… füllt
    // nur das Buchungsnummern-Feld vor. Bewusst KEIN automatischer Lookup —
    // die E-Mail-Adresse steht nicht in der URL (Browserverlauf, geteilte
    // Links) und wird vom Gast als Eigentumsnachweis selbst eingetippt.
    const prefill = this.route.snapshot.queryParamMap.get('bookingNumber');
    if (prefill?.trim()) {
      this.form.bookingNumber = prefill.trim();
    }

    // Übergabe aus der Erfolgsseite der Buchung: bewusst über den
    // sessionStorage und nicht über Query-Parameter — in der URL stünde die
    // E-Mail-Adresse des Gasts im Browserverlauf und in jedem geteilten Link.
    // Der Eintrag wird beim Lesen entfernt. Liegen die Werte vor, muss der
    // Gast sie nicht erneut eintippen — der Lookup läuft dann direkt.
    const handoff = takeBookingHandoff();
    if (handoff) {
      this.form.bookingNumber = handoff.bookingNumber;
      this.form.email = handoff.email;
      this.performLookup();
    }

    const title = this.t().bookingManage?.pageTitle ?? 'Buchung verwalten';
    this.titleService.setTitle(`${title} | BikeHaus Freiburg`);
    const description =
      this.t().bookingManage?.metaDescription ??
      'Buchungsnummer und E-Mail eingeben, um Ihre Fahrradverleih-Buchung anzusehen oder zu stornieren.';
    this.metaService.updateTag({ name: 'description', content: description });
    // Kunden-Selfservice für eine einzelne Buchung — nichts, was Google zeigen soll.
    this.metaService.updateTag({ name: 'robots', content: 'noindex, follow' });
  }

  ngOnDestroy(): void {
    // Nicht in andere (indexierbare) Seiten hinein "noindex" mitnehmen.
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
  }

  submitLookup(): void {
    this.error.set('');
    if (!this.form.bookingNumber.trim() || !this.form.email.trim()) {
      this.error.set(
        this.t().bookingManage?.findError ??
          'Buchungsnummer oder E-Mail-Adresse ist nicht korrekt.',
      );
      return;
    }
    this.performLookup();
  }

  /**
   * Einziger nebenwirkungsfreier Aufruf: zeigt die Buchung an, ohne sie zu
   * verändern. Darf deshalb auch automatisch (per Handoff) laufen.
   */
  private performLookup(): void {
    this.error.set('');
    this.isSubmitting.set(true);
    this.apiService
      .lookupRentalBooking(this.form.bookingNumber.trim(), this.form.email.trim())
      .subscribe({
        next: (booking) => {
          this.isSubmitting.set(false);
          this.result.set(booking);
          this.confirmingCancel.set(false);
          this.justCancelled.set(false);
          this.phase.set('view');
        },
        error: () => {
          this.isSubmitting.set(false);
          // Absichtlich EIN Text für "Buchungsnummer unbekannt" und "E-Mail
          // passt nicht" (beide liefern denselben 404) sowie für sonstige
          // Fehler: wer welchen der beiden Werte falsch hat, darf ein
          // Angreifer nicht am Fehlertext erkennen können. Die konkrete
          // HTTP-Antwort wird deshalb bewusst nicht ausgewertet.
          this.error.set(
            this.t().bookingManage?.findError ??
              'Buchungsnummer oder E-Mail-Adresse ist nicht korrekt.',
          );
          this.phase.set('form');
        },
      });
  }

  /** Buchung darf storniert werden: noch nicht storniert und Zeitraum nicht vorbei. */
  canCancel(booking: RentalBookingLookup): boolean {
    return booking.status !== 'Cancelled' && !this.isPastBooking(booking.endDatum);
  }

  /**
   * Zeitraum bereits vorbei: das Fahrrad wurde entweder abgeholt und genutzt
   * oder der Gast ist nicht erschienen — beides ist im Laden längst bekannt
   * und ein nachträgliches Online-Storno würde an der Realität nichts mehr
   * ändern, nur die Buchhaltung verwirren. Deshalb bleibt der Storno-Button
   * ab dem Enddatum ausgeblendet; Änderungen an bereits abgelaufenen
   * Buchungen laufen ab hier nur noch über den Laden direkt.
   */
  isPastBooking(endDatum: string): boolean {
    if (!endDatum) return false;
    const end = new Date(endDatum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return end.getTime() < today.getTime();
  }

  /** Öffnet die Rückfrage — hier passiert noch nichts. */
  startCancelFlow(): void {
    this.error.set('');
    this.confirmingCancel.set(true);
  }

  cancelCancelFlow(): void {
    this.error.set('');
    this.confirmingCancel.set(false);
  }

  /**
   * Einziger Aufruf der Storno-Route — ausschließlich nach diesem bewussten
   * Klick, nie beim Laden der Seite oder beim Ansehen der Buchung.
   */
  confirmCancel(bookingNumber: string): void {
    this.error.set('');
    this.isSubmitting.set(true);
    this.apiService
      .cancelRentalBookingByCustomer(bookingNumber, this.form.email.trim())
      .subscribe({
        next: (cancelled) => {
          this.isSubmitting.set(false);
          this.confirmingCancel.set(false);
          this.justCancelled.set(true);
          // Anzeige bleibt bei den schon geladenen Lookup-Daten (die Storno-
          // Antwort ist ein anderes, PII-haltiges Format) — nur der Status
          // wird mit der Server-Antwort aktualisiert.
          const current = this.result();
          if (current) {
            this.result.set({ ...current, status: cancelled.status });
          }
        },
        error: () => {
          this.isSubmitting.set(false);
          this.error.set(
            this.t().bookingManage?.findError ??
              'Buchungsnummer oder E-Mail-Adresse ist nicht korrekt.',
          );
        },
      });
  }

  resetAll(): void {
    this.form = { bookingNumber: '', email: '' };
    this.error.set('');
    this.result.set(null);
    this.confirmingCancel.set(false);
    this.justCancelled.set(false);
    this.phase.set('form');
  }

  statusText(status: RentalBookingLookup['status']): string {
    const texts = this.t().bookingManage;
    switch (status) {
      case 'Pending':
        return texts?.statusPending ?? 'Ausstehend';
      case 'Approved':
        return texts?.statusApproved ?? 'Bestätigt';
      case 'Cancelled':
        return texts?.statusCancelled ?? 'Storniert';
      default:
        return status;
    }
  }

  private getLocaleForCurrentLanguage(): string {
    return LOCALE_BY_LANGUAGE[this.lang()] ?? 'de-DE';
  }

  formatDisplayDate(value: string): string {
    if (!value) return '—';
    const date = new Date(value);
    return new Intl.DateTimeFormat(this.getLocaleForCurrentLanguage(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  formatPrice(value: number | null | undefined): string {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat(this.getLocaleForCurrentLanguage(), {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}
