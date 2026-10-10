import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessDeadlineService } from '../../services/access-deadline.service';
import { TranslationService } from '../../services/translation.service';

/**
 * Countdown bis zum Ablauf des Admin-Zugangs (ACCESS_DEADLINE).
 *
 * Steht im Dashboard bewusst ausserhalb von `*ngIf="!loading && data"`:
 * die Frist soll auch dann zu sehen sein, wenn die API gerade nicht
 * antwortet und das Dashboard sonst leer bleibt.
 */
@Component({
  selector: 'app-access-countdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="access-countdown"
      [class.urgent]="deadline.urgent()"
      [class.expired]="deadline.expired()"
      role="status"
    >
      <div class="ac-head">
        <div class="ac-icon" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div class="ac-labels">
          <span class="ac-title">{{ t.accessCountdownTitle }}</span>
          <span class="ac-hint">{{ t.accessCountdownHint }}</span>
        </div>
        <span class="ac-deadline">
          {{ t.accessCountdownDeadline }}:
          <strong>{{ deadline.deadline | date: 'dd.MM.yyyy' }}</strong>
        </span>
      </div>

      <div class="ac-units" *ngIf="!deadline.expired(); else expiredBlock">
        <div class="ac-unit" *ngFor="let unit of units">
          <span class="ac-value">{{ unit.value }}</span>
          <span class="ac-unit-label">{{ unit.label }}</span>
        </div>
      </div>

      <ng-template #expiredBlock>
        <div class="ac-expired-badge">{{ t.accessCountdownExpired }}</div>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .access-countdown {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 18px;
        padding: 16px 20px;
        margin-bottom: 24px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-left: 4px solid var(--accent-primary);
        border-radius: var(--radius-lg, 14px);
        box-shadow: var(--shadow-sm);
      }
      .access-countdown.urgent {
        border-left-color: var(--accent-warning);
        background: var(--accent-warning-light);
      }
      .access-countdown.expired {
        border-left-color: var(--accent-danger);
        background: var(--accent-danger-light);
      }

      .ac-head {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .ac-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        flex-shrink: 0;
        border-radius: var(--radius-md, 10px);
        background: var(--accent-primary-light);
        color: var(--accent-primary);
      }
      .urgent .ac-icon {
        background: rgba(245, 158, 11, 0.16);
        color: var(--accent-warning);
      }
      .expired .ac-icon {
        background: rgba(239, 68, 68, 0.16);
        color: var(--accent-danger);
      }

      .ac-labels {
        display: flex;
        flex-direction: column;
      }
      .ac-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-heading);
      }
      .ac-hint {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .ac-deadline {
        font-size: 0.8rem;
        color: var(--text-secondary);
        padding-left: 12px;
        border-left: 1px solid var(--border-color);
      }

      .ac-units {
        display: flex;
        gap: 10px;
      }
      .ac-unit {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 56px;
        padding: 8px 10px;
        border-radius: var(--radius-md, 10px);
        background: var(--bg-primary);
        border: 1px solid var(--border-light);
      }
      .ac-value {
        font-size: 1.3rem;
        font-weight: 800;
        line-height: 1.1;
        color: var(--text-heading);
        font-variant-numeric: tabular-nums;
      }
      .urgent .ac-value {
        color: var(--accent-warning);
      }
      .ac-unit-label {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
        margin-top: 2px;
      }

      .ac-expired-badge {
        padding: 8px 14px;
        border-radius: var(--radius-md, 10px);
        background: var(--accent-danger);
        color: #fff;
        font-size: 0.85rem;
        font-weight: 700;
      }

      @media (max-width: 720px) {
        .access-countdown {
          flex-direction: column;
          align-items: flex-start;
        }
        .ac-deadline {
          padding-left: 0;
          border-left: none;
        }
        .ac-units {
          width: 100%;
        }
        .ac-unit {
          flex: 1;
        }
      }
    `,
  ],
})
export class AccessCountdownComponent {
  private translationService = inject(TranslationService);
  deadline = inject(AccessDeadlineService);

  get t() {
    return this.translationService.translations();
  }

  /** Tage werden nicht aufgefüllt, Stunden/Minuten/Sekunden zweistellig. */
  get units() {
    const remaining = this.deadline.remaining();
    return [
      { value: String(remaining.days), label: this.t.accessUnitDays },
      { value: this.pad(remaining.hours), label: this.t.accessUnitHours },
      { value: this.pad(remaining.minutes), label: this.t.accessUnitMinutes },
      { value: this.pad(remaining.seconds), label: this.t.accessUnitSeconds },
    ];
  }

  private pad(value: number): string {
    return String(value).padStart(2, '0');
  }
}
