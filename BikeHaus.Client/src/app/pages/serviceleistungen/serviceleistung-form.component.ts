import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  ServiceleistungService,
  ServiceleistungCreate,
} from '../../services/serviceleistung.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';

/** Häufige Serviceleistungen am Fahrrad — per Klick auswählbar.
 *  Eigene Leistungen können zusätzlich manuell ergänzt werden. */
const SERVICE_KATALOG = [
  'Komplett-Service (Inspektion)',
  'Bremsen einstellen',
  'Bremsbeläge wechseln',
  'Schaltung einstellen',
  'Schaltzug / Bremszug wechseln',
  'Kette wechseln',
  'Kassette / Ritzel wechseln',
  'Reifen wechseln',
  'Schlauch wechseln',
  'Laufrad zentrieren',
  'Speichen wechseln',
  'Tretlager warten / wechseln',
  'Steuersatz einstellen',
  'Kette & Antrieb reinigen und schmieren',
  'Lichtanlage prüfen / einstellen',
  'E-Bike System- & Akku-Check',
];

@Component({
  selector: 'app-serviceleistung-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>
          {{ editId ? 'Servicebeleg bearbeiten' : 'Neuer Servicebeleg' }}
        </h1>
        <a routerLink="/serviceleistungen" class="btn btn-outline">{{
          t.back
        }}</a>
      </div>

      <form (ngSubmit)="submit()">
        <div class="form-sections">
          <!-- Beleg -->
          <div class="form-card">
            <h2>Beleg</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.date }} *</label>
                <input type="date" [(ngModel)]="datum" name="datum" required />
              </div>
              <div class="field">
                <label>Beleg-Nr.</label>
                <input type="text" [value]="belegNummer" disabled />
                <small class="hint"
                  >Wird automatisch vergeben. Es entsteht keine Rechnung — nur
                  ein Servicebeleg.</small
                >
              </div>
            </div>
          </div>

          <!-- Kunde -->
          <div class="form-card">
            <h2>{{ t.customer || 'Kunde' }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>Name *</label>
                <input
                  [(ngModel)]="form.kundeName"
                  name="kundeName"
                  required
                />
              </div>
              <div class="field">
                <label>Telefon</label>
                <input [(ngModel)]="form.kundeTelefon" name="kundeTelefon" />
              </div>
              <div class="field">
                <label>E-Mail</label>
                <input
                  type="email"
                  [(ngModel)]="form.kundeEmail"
                  name="kundeEmail"
                />
              </div>
              <div class="field">
                <label>Adresse</label>
                <input [(ngModel)]="form.kundeAdresse" name="kundeAdresse" />
              </div>
            </div>
          </div>

          <!-- Fahrrad -->
          <div class="form-card">
            <h2>{{ t.bicycle || 'Fahrrad' }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.brand || 'Marke' }}</label>
                <input [(ngModel)]="form.fahrradMarke" name="fahrradMarke" />
              </div>
              <div class="field">
                <label>{{ t.model || 'Modell' }}</label>
                <input [(ngModel)]="form.fahrradModell" name="fahrradModell" />
              </div>
              <div class="field">
                <label>{{ t.frameNumber || 'Rahmennummer' }}</label>
                <input
                  [(ngModel)]="form.rahmennummer"
                  name="rahmennummer"
                  style="text-transform: uppercase"
                />
              </div>
              <div class="field">
                <label>{{ t.color || 'Farbe' }}</label>
                <input [(ngModel)]="form.farbe" name="farbe" />
              </div>
            </div>
          </div>

          <!-- Serviceleistungen -->
          <div class="form-card">
            <h2>Serviceleistungen *</h2>
            <div class="service-chips">
              <button
                type="button"
                *ngFor="let s of katalog"
                class="service-chip"
                [class.selected]="isSelected(s)"
                (click)="toggle(s)"
              >
                <span class="chip-check">{{ isSelected(s) ? '✓' : '+' }}</span>
                {{ s }}
              </button>
            </div>

            <div class="custom-add">
              <input
                [(ngModel)]="customInput"
                name="customInput"
                placeholder="Weitere Leistung manuell eingeben..."
                (keydown.enter)="$event.preventDefault(); addCustom()"
              />
              <button
                type="button"
                class="btn btn-outline"
                (click)="addCustom()"
              >
                + Hinzufügen
              </button>
            </div>

            <div class="selected-list" *ngIf="gewaehlteLeistungen.length > 0">
              <div
                class="selected-item"
                *ngFor="let s of gewaehlteLeistungen; let i = index"
              >
                <span class="selected-nr">{{ i + 1 }}.</span>
                <span class="selected-text">{{ s }}</span>
                <button
                  type="button"
                  class="remove-btn"
                  (click)="remove(s)"
                  title="Entfernen"
                >
                  ✕
                </button>
              </div>
            </div>
            <small class="hint" *ngIf="gewaehlteLeistungen.length === 0"
              >Mindestens eine Leistung auswählen oder manuell
              hinzufügen.</small
            >
          </div>

          <!-- Teile, Preis & Zahlung -->
          <div class="form-card">
            <h2>Teile, Preis &amp; Zahlung</h2>
            <div class="form-grid">
              <div class="field full">
                <label>Verwendete Teile / Material</label>
                <textarea
                  [(ngModel)]="form.verwendeteTeile"
                  name="verwendeteTeile"
                  rows="2"
                  placeholder="z.B. Kette Shimano HG54, Schlauch 28 Zoll"
                ></textarea>
              </div>
              <div class="field">
                <label>{{ t.price || 'Preis' }} (€)</label>
                <input
                  type="number"
                  [(ngModel)]="form.preis"
                  name="preis"
                  step="0.01"
                  min="0"
                />
              </div>
              <div class="field">
                <label>{{ t.paymentMethod || 'Zahlungsart' }}</label>
                <select [(ngModel)]="form.zahlungsart" name="zahlungsart">
                  <option [ngValue]="null">
                    -- {{ t.selectOption || 'Auswählen' }} --
                  </option>
                  <option value="Bar">Bar</option>
                  <option value="Überweisung">Überweisung</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Karte">Karte</option>
                </select>
              </div>
              <div class="field full">
                <label>{{ t.notes || 'Notizen' }}</label>
                <textarea
                  [(ngModel)]="form.notizen"
                  name="notizen"
                  rows="2"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/serviceleistungen" class="btn btn-outline">{{
            t.cancel
          }}</a>
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            [disabled]="saving"
          >
            {{ saving ? t.saving : t.save }}
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
        box-sizing: border-box;
        font-family: inherit;
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .field input:disabled {
        opacity: 0.7;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field .hint,
      .hint {
        display: block;
        font-size: 0.73rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 4px;
      }

      /* Service chips */
      .service-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 14px;
      }
      .service-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 20px;
        background: var(--bg-card, #fff);
        font-size: 0.84rem;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .service-chip:hover {
        border-color: var(--accent-primary, #6366f1);
        background: var(--table-hover, #f1f5f9);
      }
      .service-chip.selected {
        border-color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        font-weight: 600;
      }
      .chip-check {
        font-weight: 800;
        color: var(--accent-primary, #6366f1);
      }

      .custom-add {
        display: flex;
        gap: 8px;
        margin-bottom: 14px;
      }
      .custom-add input {
        flex: 1;
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
      }
      .custom-add input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
      }

      .selected-list {
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        overflow: hidden;
      }
      .selected-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 14px;
        border-bottom: 1px solid var(--border-light, #f1f5f9);
        font-size: 0.88rem;
      }
      .selected-item:last-child {
        border-bottom: none;
      }
      .selected-nr {
        font-weight: 700;
        color: var(--accent-primary, #6366f1);
        min-width: 22px;
      }
      .selected-text {
        flex: 1;
        color: var(--text-primary);
      }
      .remove-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary, #94a3b8);
        font-size: 0.9rem;
        padding: 2px 6px;
        border-radius: 6px;
      }
      .remove-btn:hover {
        color: var(--accent-danger, #ef4444);
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        align-items: center;
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: #fff;
        border: none;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-lg {
        padding: 12px 28px;
        font-size: 0.95rem;
      }
    `,
  ],
})
export class ServiceleistungFormComponent implements OnInit {
  private serviceleistungService = inject(ServiceleistungService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  get t() {
    return this.translationService.translations();
  }

  katalog = SERVICE_KATALOG;
  selectedKatalog = new Set<string>();
  customLeistungen: string[] = [];
  customInput = '';

  editId: number | null = null;
  belegNummer = '...';
  datum = new Date().toISOString().split('T')[0];
  saving = false;

  form = {
    kundeName: '',
    kundeTelefon: null as string | null,
    kundeEmail: null as string | null,
    kundeAdresse: null as string | null,
    fahrradMarke: null as string | null,
    fahrradModell: null as string | null,
    rahmennummer: null as string | null,
    farbe: null as string | null,
    verwendeteTeile: null as string | null,
    preis: null as number | null,
    zahlungsart: null as string | null,
    notizen: null as string | null,
  };

  /** Ausgewählte Katalog-Leistungen (in Katalog-Reihenfolge) + manuelle. */
  get gewaehlteLeistungen(): string[] {
    return [
      ...this.katalog.filter((s) => this.selectedKatalog.has(s)),
      ...this.customLeistungen,
    ];
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = +idParam;
      this.serviceleistungService.getById(this.editId).subscribe({
        next: (item) => {
          this.belegNummer = item.belegNummer;
          this.datum = item.datum.split('T')[0];
          this.form = {
            kundeName: item.kundeName,
            kundeTelefon: item.kundeTelefon,
            kundeEmail: item.kundeEmail,
            kundeAdresse: item.kundeAdresse,
            fahrradMarke: item.fahrradMarke,
            fahrradModell: item.fahrradModell,
            rahmennummer: item.rahmennummer,
            farbe: item.farbe,
            verwendeteTeile: item.verwendeteTeile,
            preis: item.preis,
            zahlungsart: item.zahlungsart,
            notizen: item.notizen,
          };
          // Zeilen aufteilen: bekannte Katalogeinträge ankreuzen, Rest manuell
          const lines = item.durchgefuehrteArbeiten
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
          for (const line of lines) {
            if (this.katalog.includes(line)) {
              this.selectedKatalog.add(line);
            } else {
              this.customLeistungen.push(line);
            }
          }
        },
        error: () => this.router.navigate(['/serviceleistungen']),
      });
    } else {
      this.serviceleistungService.getNextBelegNummer().subscribe({
        next: (r) => (this.belegNummer = r.belegNummer),
        error: () => (this.belegNummer = ''),
      });
    }
  }

  isSelected(s: string): boolean {
    return this.selectedKatalog.has(s);
  }

  toggle(s: string) {
    if (this.selectedKatalog.has(s)) {
      this.selectedKatalog.delete(s);
    } else {
      this.selectedKatalog.add(s);
    }
  }

  addCustom() {
    const val = this.customInput.trim();
    if (!val) return;
    if (
      !this.customLeistungen.includes(val) &&
      !this.selectedKatalog.has(val)
    ) {
      this.customLeistungen.push(val);
    }
    this.customInput = '';
  }

  remove(s: string) {
    this.selectedKatalog.delete(s);
    this.customLeistungen = this.customLeistungen.filter((c) => c !== s);
  }

  submit() {
    if (!this.form.kundeName.trim()) {
      this.notificationService.error('Bitte den Kundennamen eingeben.');
      return;
    }
    if (this.gewaehlteLeistungen.length === 0) {
      this.notificationService.error(
        'Bitte mindestens eine Serviceleistung auswählen.',
      );
      return;
    }

    this.saving = true;
    const payload: ServiceleistungCreate = {
      datum: new Date(this.datum).toISOString(),
      kundeName: this.form.kundeName.trim(),
      kundeTelefon: this.form.kundeTelefon,
      kundeEmail: this.form.kundeEmail,
      kundeAdresse: this.form.kundeAdresse,
      fahrradMarke: this.form.fahrradMarke,
      fahrradModell: this.form.fahrradModell,
      rahmennummer: this.form.rahmennummer,
      farbe: this.form.farbe,
      durchgefuehrteArbeiten: this.gewaehlteLeistungen.join('\n'),
      verwendeteTeile: this.form.verwendeteTeile,
      preis: this.form.preis,
      zahlungsart: this.form.zahlungsart,
      notizen: this.form.notizen,
    };

    const request$ = this.editId
      ? this.serviceleistungService.update(this.editId, payload)
      : this.serviceleistungService.create(payload);

    request$.subscribe({
      next: (saved) => {
        this.saving = false;
        this.notificationService.success(
          `Servicebeleg ${saved.belegNummer} gespeichert.`,
        );
        this.router.navigate(['/serviceleistungen']);
      },
      error: () => {
        this.saving = false;
        this.notificationService.error('Speichern fehlgeschlagen.');
      },
    });
  }
}
