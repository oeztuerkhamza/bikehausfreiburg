import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { CustomerService } from '../../services/customer.service';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';
import { Customer } from '../../models/models';

type NameField = 'vorname' | 'nachname';

/**
 * Vorschlagsliste für bestehende Kunden, gespeist aus GET /api/customers/search.
 *
 * Bewusst KEIN Auto-Ausfüllen beim Tippen: der Inhaber trifft die Entscheidung
 * "ist es dieser Kunde?" per Klick/Enter, danach werden die übrigen Felder
 * (Adresse, Telefon, E-Mail, Steuernummer) übernommen. Grund laut Vorgabe:
 * bei Namensgleichheit würde stilles Ausfüllen falsche Adressen in Verträge
 * schreiben.
 *
 * Diese Komponente besitzt nur Vorname/Nachname optisch — alle übrigen Felder
 * bleiben Sache des jeweiligen Formulars (unterschiedliche Feldnamen je
 * Vorgang), das auf (customerSelected) reagiert.
 *
 * Registriert sich absichtlich NICHT bei einem umgebenden ngForm
 * (ngModelOptions: standalone), damit sie sich in jedes bestehende
 * Formular einhängen lässt, ohne dessen Validierungslogik (canSubmit(),
 * f.valid, name-Kollisionen) zu verändern. Pflichtfeld-Prüfung bleibt beim
 * Formular (siehe requiredMark – nur optische Kennzeichnung mit *).
 */
@Component({
  selector: 'app-customer-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cust-ac">
      <div class="cust-ac-fields">
        <div class="field">
          <label
            >{{ resolvedVornameLabel
            }}<span *ngIf="requiredMark"> *</span></label
          >
          <input
            type="text"
            [ngModel]="vorname"
            [ngModelOptions]="{ standalone: true }"
            (ngModelChange)="onInput('vorname', $event)"
            (focus)="onFocus('vorname')"
            (blur)="onBlur()"
            (keydown)="onKeydown($event)"
            [disabled]="disabled"
            autocomplete="off"
          />
        </div>
        <div class="field">
          <label
            >{{ resolvedNachnameLabel
            }}<span *ngIf="requiredMark"> *</span></label
          >
          <input
            type="text"
            [ngModel]="nachname"
            [ngModelOptions]="{ standalone: true }"
            (ngModelChange)="onInput('nachname', $event)"
            (focus)="onFocus('nachname')"
            (blur)="onBlur()"
            (keydown)="onKeydown($event)"
            [disabled]="disabled"
            autocomplete="off"
          />
        </div>
      </div>

      <div
        class="cust-ac-dropdown"
        *ngIf="open && (results.length > 0 || searchedButEmpty || loading)"
        role="listbox"
      >
        <button
          type="button"
          class="cust-ac-item"
          *ngFor="let c of results; let i = index"
          [class.active]="i === highlightedIndex"
          role="option"
          (mousedown)="onItemMouseDown($event, c)"
          (mouseenter)="highlightedIndex = i"
        >
          <span class="cust-ac-name">{{ c.vorname }} {{ c.nachname }}</span>
          <span class="cust-ac-meta" *ngIf="c.stadt || c.telefon">
            <span *ngIf="c.stadt">{{ c.stadt }}</span>
            <span *ngIf="c.stadt && c.telefon"> · </span>
            <span *ngIf="c.telefon">{{ c.telefon }}</span>
          </span>
        </button>

        <div class="cust-ac-status" *ngIf="loading">
          {{ t.customerAutocompleteSearching }}
        </div>
        <div
          class="cust-ac-status cust-ac-empty"
          *ngIf="!loading && searchedButEmpty"
        >
          {{ t.customerAutocompleteNoMatch }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        grid-column: 1 / -1;
      }
      .cust-ac {
        position: relative;
      }
      .cust-ac-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 600px) {
        .cust-ac-fields {
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
      .field input {
        width: 100%;
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast, all 0.15s ease);
        box-sizing: border-box;
      }
      .field input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .field input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .cust-ac-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 60;
        margin-top: 4px;
        max-height: 280px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.12));
      }
      .cust-ac-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        width: 100%;
        min-height: 44px;
        padding: 9px 14px;
        border: none;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
        background: transparent;
        text-align: left;
        cursor: pointer;
        font: inherit;
        color: var(--text-primary);
      }
      .cust-ac-item:last-child {
        border-bottom: none;
      }
      .cust-ac-item:hover,
      .cust-ac-item.active {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      .cust-ac-name {
        font-weight: 600;
        font-size: 0.92rem;
      }
      .cust-ac-meta {
        font-size: 0.78rem;
        color: var(--text-secondary, #64748b);
      }
      .cust-ac-status {
        padding: 10px 14px;
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
      }

      @media (max-width: 640px) {
        .field input {
          font-size: 16px; /* iOS zoom-on-focus verhindern */
        }
        .cust-ac-item {
          padding: 12px 14px;
        }
      }
    `,
  ],
})
export class CustomerAutocompleteComponent implements OnInit, OnDestroy {
  private customerService = inject(CustomerService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);

  get t() {
    return this.translationService.translations();
  }

  @Input() vorname = '';
  @Output() vornameChange = new EventEmitter<string>();
  @Input() nachname = '';
  @Output() nachnameChange = new EventEmitter<string>();

  /** Optionale Label-Überschreibung, z.B. t.firstNameIntl im Ankauf/Verkauf. */
  @Input() vornameLabel?: string;
  @Input() nachnameLabel?: string;
  /** Nur optische Sternchen-Markierung; die eigentliche Pflichtprüfung bleibt beim Formular. */
  @Input() requiredMark = false;
  @Input() disabled = false;
  /**
   * Vom Formular gesetzt, sobald außer Vorname/Nachname bereits andere Felder
   * (Adresse, Telefon, E-Mail, …) befüllt sind. Steuert, ob vor der
   * Übernahme eines Vorschlags nachgefragt wird.
   */
  @Input() hasOtherData = false;
  @Input() minChars = 2;
  @Input() debounceMs = 300;

  @Output() customerSelected = new EventEmitter<Customer>();

  get resolvedVornameLabel(): string {
    return this.vornameLabel ?? this.t.firstName;
  }
  get resolvedNachnameLabel(): string {
    return this.nachnameLabel ?? this.t.lastName;
  }

  results: Customer[] = [];
  open = false;
  loading = false;
  searchedButEmpty = false;
  highlightedIndex = -1;

  private search$ = new Subject<string>();
  private sub?: Subscription;
  private blurTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.sub = this.search$
      .pipe(
        debounceTime(this.debounceMs),
        switchMap((term) => {
          const trimmed = term.trim();
          if (trimmed.length < this.minChars) {
            // Zu kurz für eine sinnvolle Suche: kein "nichts gefunden",
            // einfach normal weitertippen lassen ohne Meldung.
            return of<Customer[] | null>(null);
          }
          this.loading = true;
          return this.customerService.search(trimmed).pipe(
            catchError(() => of<Customer[]>([])),
          );
        }),
      )
      .subscribe((res) => {
        this.loading = false;
        if (res === null) {
          this.results = [];
          this.searchedButEmpty = false;
          this.open = false;
          return;
        }
        this.results = this.dedupe(res);
        this.searchedButEmpty = this.results.length === 0;
        this.highlightedIndex = this.results.length > 0 ? 0 : -1;
        this.open = true;
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    if (this.blurTimeout) clearTimeout(this.blurTimeout);
  }

  onInput(field: NameField, value: string) {
    if (field === 'vorname') {
      this.vorname = value;
      this.vornameChange.emit(value);
    } else {
      this.nachname = value;
      this.nachnameChange.emit(value);
    }
    this.search$.next(value);
  }

  onFocus(_field: NameField) {
    if (this.results.length > 0 || this.searchedButEmpty) this.open = true;
  }

  onBlur() {
    // (mousedown) auf den Vorschlägen feuert vor blur, daher reicht eine
    // kurze Verzögerung statt komplexer Fokus-Verfolgung.
    this.blurTimeout = setTimeout(() => (this.open = false), 150);
  }

  onItemMouseDown(event: MouseEvent, customer: Customer) {
    event.preventDefault();
    void this.choose(customer);
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.open || this.results.length === 0) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(
          this.highlightedIndex + 1,
          this.results.length - 1,
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
        break;
      case 'Enter':
        if (this.highlightedIndex >= 0) {
          event.preventDefault();
          void this.choose(this.results[this.highlightedIndex]);
        }
        break;
      case 'Escape':
        this.open = false;
        break;
    }
  }

  async choose(customer: Customer) {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }
    if (this.hasOtherData) {
      const ok = await this.dialogService.confirm({
        title: customer.fullName || `${customer.vorname} ${customer.nachname}`,
        message: this.t.customerAutocompleteOverwriteMessage,
        confirmText: this.t.customerAutocompleteOverwriteConfirm,
        type: 'confirm',
      });
      if (!ok) {
        this.open = false;
        return;
      }
    }
    this.vorname = customer.vorname;
    this.nachname = customer.nachname;
    this.vornameChange.emit(customer.vorname);
    this.nachnameChange.emit(customer.nachname);
    this.open = false;
    this.results = [];
    this.customerSelected.emit(customer);
  }

  /**
   * Entdoppelung: Der Server legt pro Vorgang bewusst einen neuen
   * Customer-Datensatz an (siehe CLAUDE.md, "one per rental/sale/purchase"),
   * damit alte Belege bei einer späteren Adressänderung nicht rückwirkend
   * verfälscht werden. Dieselbe Person taucht in der Suche daher oft
   * mehrfach auf.
   *
   * Gruppierung: normalisierter Name (Vor-/Nachname klein geschrieben,
   * getrimmt) + normalisierte Telefonnummer, ersatzweise E-Mail, als
   * "Fingerabdruck". Zwei Treffer mit gleichem Namen aber unterschiedlichem
   * Telefon/E-Mail gelten als zwei verschiedene Personen (z.B. Vater/Sohn)
   * und bleiben getrennt. Fehlt der Fingerabdruck bei beiden, werden sie
   * dennoch zusammengefasst — ohne Kontaktdaten lassen sie sich ohnehin
   * nicht unterscheiden, und fünf identische Namenszeilen sind schlechter
   * als ein zusammengefasster Vorschlag.
   *
   * Aus jeder Gruppe wird der Datensatz mit der höchsten Id gezeigt: die
   * Id ist in SQLite fortlaufend vergeben und damit ein verlässlicher
   * Näherungswert für "zuletzt angelegt" (CustomerDto liefert kein
   * CreatedAt an den Client).
   */
  private dedupe(customers: Customer[]): Customer[] {
    const groups = new Map<string, Customer>();
    for (const c of customers) {
      const key = this.dedupeKey(c);
      const existing = groups.get(key);
      if (!existing || c.id > existing.id) {
        groups.set(key, c);
      }
    }
    return Array.from(groups.values());
  }

  private dedupeKey(c: Customer): string {
    const name = `${this.normalize(c.vorname)}|${this.normalize(c.nachname)}`;
    const fingerprint =
      this.normalizePhone(c.telefon) || this.normalize(c.email) || '';
    return `${name}|${fingerprint}`;
  }

  private normalize(value?: string | null): string {
    return (value || '').trim().toLowerCase();
  }

  private normalizePhone(value?: string | null): string {
    return (value || '').replace(/[^\d+]/g, '');
  }
}
