import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessDeadlineService } from '../../services/access-deadline.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

/**
 * Sperrseite nach Ablauf der Zugangsfrist (ACCESS_DEADLINE).
 *
 * Erreichbar nur über den accessLockedPageGuard, also erst nach Ablauf —
 * vorher leitet der Guard auf das Dashboard zurück. Umgekehrt führt nach
 * Ablauf jede andere Route hierher (authGuard + accessDeadlineGuard).
 *
 * Wichtig: das ist eine Sperre im Browser, keine im Backend. Die API prüft
 * die Frist nicht und antwortet mit einem gültigen Token weiterhin.
 */
@Component({
  selector: 'app-access-locked',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="locked-screen" role="main">
      <div class="locked-card">
        <div class="locked-icon" aria-hidden="true">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1>{{ t.accessLockedTitle }}</h1>
        <p class="locked-message">{{ t.accessLockedMessage }}</p>

        <div class="locked-meta">
          <span class="locked-meta-label">{{ t.accessCountdownDeadline }}</span>
          <span class="locked-meta-value">{{
            deadline.deadline | date: 'dd.MM.yyyy'
          }}</span>
        </div>

        <p class="locked-contact">{{ t.accessLockedContact }}</p>

        <button type="button" class="locked-logout" (click)="logout()">
          {{ t.accessLockedLogout }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .locked-screen {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: var(--bg-primary);
      }

      .locked-card {
        width: 100%;
        max-width: 460px;
        padding: 36px 32px;
        text-align: center;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl, 20px);
        box-shadow: var(--shadow-lg);
      }

      .locked-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 62px;
        height: 62px;
        margin-bottom: 20px;
        border-radius: 50%;
        background: var(--accent-danger-light);
        color: var(--accent-danger);
      }

      .locked-card h1 {
        margin: 0 0 10px;
        font-size: 1.4rem;
        font-weight: 800;
        letter-spacing: -0.01em;
        color: var(--text-heading);
      }

      .locked-message {
        margin: 0;
        font-size: 0.92rem;
        line-height: 1.55;
        color: var(--text-secondary);
      }

      .locked-meta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin: 22px 0 18px;
        padding: 11px 14px;
        border-radius: var(--radius-md, 10px);
        background: var(--bg-primary);
        border: 1px solid var(--border-light);
      }
      .locked-meta-label {
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
      }
      .locked-meta-value {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-heading);
        font-variant-numeric: tabular-nums;
      }

      .locked-contact {
        margin: 0 0 22px;
        font-size: 0.86rem;
        color: var(--text-secondary);
      }

      .locked-logout {
        padding: 9px 20px;
        border-radius: var(--radius-md, 10px);
        border: 1px solid var(--border-color);
        background: var(--bg-card);
        color: var(--text-secondary);
        font-size: 0.86rem;
        font-weight: 600;
        cursor: pointer;
        transition: background var(--transition-fast, 0.15s ease);
      }
      .locked-logout:hover {
        background: var(--bg-primary);
        color: var(--text-primary);
      }
    `,
  ],
})
export class AccessLockedComponent {
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  deadline = inject(AccessDeadlineService);

  get t() {
    return this.translationService.translations();
  }

  /**
   * Meldet nur das Token ab. Ein Weg zurück in den Adminbereich entsteht
   * dadurch nicht — nach Ablauf führen Login und jede andere Route wieder
   * hierher.
   */
  logout(): void {
    this.authService.logout();
  }
}
