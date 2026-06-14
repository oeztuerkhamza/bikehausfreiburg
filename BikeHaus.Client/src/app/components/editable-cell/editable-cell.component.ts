import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface EditableSelectOption {
  value: unknown;
  label: string;
}

/**
 * Reusable inline-editable table cell.
 *
 * Shows a formatted value in view mode; double-clicking swaps in the
 * appropriate input (text / number / date / select / toggle). Enter or blur
 * commits, Escape cancels. It emits `save` with the new value only when the
 * value actually changed — the parent is responsible for persisting it
 * (optimistic update + revert on error).
 *
 * The cell stops click/dblclick propagation so it never triggers row-level
 * handlers (e.g. an actions menu) on the containing list row.
 */
@Component({
  selector: 'app-editable-cell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <span
      *ngIf="!editing"
      class="ec-view"
      [class.ec-right]="align === 'right'"
      [class.ec-center]="align === 'center'"
      [class.ec-disabled]="disabled"
      [title]="disabled ? '' : editHint"
      (click)="$event.stopPropagation()"
      (dblclick)="startEdit($event)"
    >
      <span class="ec-text">{{ viewText }}</span>
      <span class="ec-pencil" *ngIf="!disabled">✎</span>
    </span>

    <ng-container *ngIf="editing">
      <input
        *ngIf="type === 'text' || type === 'number'"
        #editor
        [type]="type === 'number' ? 'number' : 'text'"
        [step]="type === 'number' ? 'any' : null"
        class="ec-input"
        [class.ec-right]="align === 'right'"
        [(ngModel)]="draft"
        [placeholder]="placeholder"
        (click)="$event.stopPropagation()"
        (keydown.enter)="commit()"
        (keydown.escape)="cancel()"
        (blur)="commit()"
      />

      <input
        *ngIf="type === 'date'"
        #editor
        type="date"
        class="ec-input"
        [(ngModel)]="draft"
        (click)="$event.stopPropagation()"
        (keydown.enter)="commit()"
        (keydown.escape)="cancel()"
        (blur)="commit()"
      />

      <select
        *ngIf="type === 'select'"
        #editor
        class="ec-input"
        [(ngModel)]="draft"
        (click)="$event.stopPropagation()"
        (keydown.escape)="cancel()"
        (change)="commit()"
        (blur)="commit()"
      >
        <option *ngFor="let o of options" [ngValue]="o.value">
          {{ o.label }}
        </option>
      </select>

      <input
        *ngIf="type === 'toggle'"
        #editor
        type="checkbox"
        class="ec-checkbox"
        [(ngModel)]="draft"
        (click)="$event.stopPropagation()"
        (change)="commit()"
        (keydown.escape)="cancel()"
        (blur)="commit()"
      />
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ec-view {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        padding: 2px 4px;
        margin: -2px -4px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.12s;
      }
      .ec-view.ec-right {
        justify-content: flex-end;
      }
      .ec-view.ec-center {
        justify-content: center;
      }
      .ec-view:not(.ec-disabled):hover {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .ec-view.ec-disabled {
        cursor: default;
      }
      .ec-pencil {
        font-size: 0.72rem;
        opacity: 0;
        color: var(--accent-primary, #6366f1);
        transition: opacity 0.12s;
      }
      .ec-view:hover .ec-pencil {
        opacity: 0.7;
      }
      .ec-input {
        width: 100%;
        min-width: 90px;
        box-sizing: border-box;
        padding: 5px 8px;
        border: 1.5px solid var(--accent-primary, #6366f1);
        border-radius: 7px;
        font-size: 0.88rem;
        font-family: inherit;
        background: var(--bg-card, #fff);
        color: var(--text-primary, #1e293b);
      }
      .ec-input.ec-right {
        text-align: right;
      }
      .ec-input:focus {
        outline: none;
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.15));
      }
      .ec-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
    `,
  ],
})
export class EditableCellComponent {
  /** Raw underlying value (number, ISO date string, enum value, boolean…). */
  @Input() value: unknown;
  @Input() type: 'text' | 'number' | 'date' | 'select' | 'toggle' = 'text';
  /** Options for `select` type. */
  @Input() options: EditableSelectOption[] = [];
  /** Pre-formatted text shown in view mode (e.g. "150,00 €"). Falls back to value. */
  @Input() display: string | null = null;
  /** Empty `number` input commits null when true, otherwise keeps the old value. */
  @Input() nullable = false;
  @Input() placeholder = '';
  @Input() align: 'left' | 'right' | 'center' = 'left';
  @Input() disabled = false;
  /** Tooltip shown on hover in view mode. */
  @Input() editHint = '';

  /** Emits the new value when it changed and was committed. */
  @Output() save = new EventEmitter<unknown>();

  @ViewChild('editor') private editorRef?: ElementRef<
    HTMLInputElement | HTMLSelectElement
  >;

  editing = false;
  draft: unknown;

  get viewText(): string {
    if (this.display != null && this.display !== '') return this.display;
    if (this.value == null || this.value === '') return this.placeholder || '–';
    return String(this.value);
  }

  startEdit(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.draft = this.toInputValue(this.value);
    this.editing = true;
    setTimeout(() => {
      const el = this.editorRef?.nativeElement as
        | (HTMLInputElement & { select?: () => void })
        | undefined;
      if (el) {
        el.focus();
        if (typeof el.select === 'function') el.select();
      }
    });
  }

  commit(): void {
    if (!this.editing) return;
    this.editing = false;
    const newValue = this.fromInputValue(this.draft);
    if (!this.valuesEqual(newValue, this.value)) {
      this.save.emit(newValue);
    }
  }

  cancel(): void {
    this.editing = false;
  }

  private toInputValue(v: unknown): unknown {
    if (this.type === 'date') return this.toDateInput(v);
    if (this.type === 'toggle') return !!v;
    return v ?? '';
  }

  private fromInputValue(d: unknown): unknown {
    if (this.type === 'number') {
      const s = (d ?? '').toString().trim().replace(',', '.');
      if (s === '') return this.nullable ? null : this.value;
      const n = parseFloat(s);
      return isNaN(n) ? this.value : n;
    }
    if (this.type === 'date') return d || this.value;
    if (this.type === 'toggle') return !!d;
    if (this.type === 'select') return d;
    return (d ?? '').toString();
  }

  private valuesEqual(a: unknown, b: unknown): boolean {
    if (this.type === 'date') return this.toDateInput(a) === this.toDateInput(b);
    return a === b;
  }

  private toDateInput(v: unknown): string {
    if (!v) return '';
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
