import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CampaignService,
  CampaignPreview,
  CampaignStatus,
} from '../../services/campaign.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-email-campaign',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-head">
        <h1>E-Mail Kampagne</h1>
        <p class="subtitle">
          Google-Bewertungsanfrage an Ihre Kunden senden. Abgemeldete Adressen
          werden automatisch übersprungen.
        </p>
      </div>

      <!-- ── Empfänger-Übersicht ── -->
      <div class="card stats">
        <div class="stat">
          <span class="stat-num">{{ preview()?.recipientCount ?? '–' }}</span>
          <span class="stat-label">Empfänger</span>
        </div>
        <div class="stat muted">
          <span class="stat-num">{{ preview()?.skippedUnsubscribed ?? '–' }}</span>
          <span class="stat-label">Abgemeldet (übersprungen)</span>
        </div>
        <button class="btn-ghost" (click)="loadPreview()" [disabled]="loading()">
          Aktualisieren
        </button>
      </div>

      <!-- ── Test-Mail ── -->
      <div class="card">
        <h2>1. Test-Mail senden</h2>
        <p class="hint">
          Schicken Sie sich die Mail zuerst selbst, um Aussehen und Links zu
          prüfen.
        </p>
        <div class="row">
          <input
            type="email"
            [(ngModel)]="testEmail"
            placeholder="ihre@email.de"
            class="input"
          />
          <button
            class="btn-secondary"
            (click)="sendTest()"
            [disabled]="testSending() || !testEmail"
          >
            {{ testSending() ? 'Sende…' : 'Test-Mail senden' }}
          </button>
        </div>
      </div>

      <!-- ── Massenversand ── -->
      <div class="card">
        <h2>2. An alle Kunden senden</h2>
        <p class="hint">
          Sendet die Bewertungsanfrage an
          <strong>{{ preview()?.recipientCount ?? 0 }}</strong> Kunden. Jede Mail
          enthält einen funktionierenden Abmelde-Link.
        </p>

        <div class="progress-wrap" *ngIf="isRunning() || isFinished()">
          <div class="progress-bar">
            <div
              class="progress-fill"
              [style.width.%]="progressPercent()"
              [class.failed]="status()?.state === 'failed'"
            ></div>
          </div>
          <div class="progress-text">
            <span *ngIf="isRunning()">Sende… </span>
            <span *ngIf="isFinished()">Fertig. </span>
            {{ status()?.sent ?? 0 }} / {{ status()?.total ?? 0 }} gesendet
            <span class="failed-count" *ngIf="(status()?.failed ?? 0) > 0">
              · {{ status()?.failed }} fehlgeschlagen</span
            >
          </div>
          <p class="err" *ngIf="status()?.lastError">
            {{ status()?.lastError }}
          </p>
        </div>

        <button
          class="btn-primary"
          (click)="startSend()"
          [disabled]="isRunning() || (preview()?.recipientCount ?? 0) === 0"
        >
          {{ isRunning() ? 'Versand läuft…' : 'An alle senden' }}
        </button>
      </div>

      <!-- ── Erinnerungsecke-Einladung ── -->
      <div class="card">
        <h2>3. Erinnerungsecke-Einladung an Miet-Kunden</h2>
        <p class="hint">
          Lädt <strong>{{ memoryPreview()?.recipientCount ?? 0 }}</strong> bisherige
          Miet-Kunden ein, ihre Radtour-Fotos in der Erinnerungsecke zu teilen
          (DE + EN, mit Abmelde-Link). Jede Adresse wird höchstens einmal
          eingeladen. Neue Rückgaben werden automatisch am Folgetag um 08:00 Uhr
          eingeladen.
        </p>

        <button
          class="btn-primary"
          (click)="startMemorySend()"
          [disabled]="isRunning() || (memoryPreview()?.recipientCount ?? 0) === 0"
        >
          {{ isRunning() ? 'Versand läuft…' : 'Einladung an alle Miet-Kunden senden' }}
        </button>
      </div>

      <!-- ── Abgemeldete verwalten ── -->
      <div class="card">
        <h2>Abgemeldete Adressen</h2>
        <p class="hint">
          Diese Adressen erhalten keine Werbe-Mails. Sie können eine Adresse
          manuell hinzufügen oder wieder freigeben.
        </p>
        <div class="row">
          <input
            type="email"
            [(ngModel)]="manualEmail"
            placeholder="adresse@beispiel.de"
            class="input"
          />
          <button
            class="btn-secondary"
            (click)="addUnsubscribe()"
            [disabled]="!manualEmail"
          >
            Abmelden
          </button>
        </div>

        <ul class="unsub-list" *ngIf="unsubscribed().length > 0">
          <li *ngFor="let e of unsubscribed()">
            <span>{{ e }}</span>
            <button class="btn-link" (click)="removeUnsubscribe(e)">
              wieder anmelden
            </button>
          </li>
        </ul>
        <p class="empty" *ngIf="unsubscribed().length === 0">
          Keine abgemeldeten Adressen.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 760px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .page-head h1 {
        margin: 0 0 6px;
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .subtitle {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.92rem;
      }
      .card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-light);
        border-radius: 14px;
        padding: 22px 24px;
      }
      .card h2 {
        margin: 0 0 4px;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .hint {
        margin: 0 0 16px;
        font-size: 0.86rem;
        color: var(--text-muted);
        line-height: 1.5;
      }
      .stats {
        display: flex;
        align-items: center;
        gap: 36px;
      }
      .stat {
        display: flex;
        flex-direction: column;
      }
      .stat-num {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--accent-primary, #6366f1);
        line-height: 1;
      }
      .stat.muted .stat-num {
        color: var(--text-muted);
      }
      .stat-label {
        font-size: 0.78rem;
        color: var(--text-muted);
        margin-top: 4px;
      }
      .row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .input {
        flex: 1;
        min-width: 200px;
        padding: 11px 14px;
        border: 1.5px solid var(--border-color);
        border-radius: 10px;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 0.9rem;
      }
      .input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
      }
      button {
        cursor: pointer;
        font-weight: 600;
        border-radius: 10px;
        font-size: 0.9rem;
        transition: all 0.18s;
      }
      .btn-primary {
        margin-top: 16px;
        padding: 12px 26px;
        background: var(--accent-primary, #6366f1);
        color: #fff;
        border: none;
      }
      .btn-primary:hover:not(:disabled) {
        filter: brightness(1.08);
      }
      .btn-secondary {
        padding: 11px 20px;
        background: transparent;
        color: var(--accent-primary, #6366f1);
        border: 1.5px solid var(--accent-primary, #6366f1);
      }
      .btn-secondary:hover:not(:disabled) {
        background: var(--accent-light, rgba(99, 102, 241, 0.08));
      }
      .btn-ghost {
        margin-left: auto;
        padding: 9px 16px;
        background: transparent;
        color: var(--text-muted);
        border: 1.5px solid var(--border-color);
      }
      .btn-ghost:hover:not(:disabled) {
        color: var(--text-primary);
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-link {
        background: none;
        border: none;
        color: #ef4444;
        font-size: 0.82rem;
        padding: 0;
      }
      .btn-link:hover {
        text-decoration: underline;
      }
      .progress-wrap {
        margin: 8px 0 4px;
      }
      .progress-bar {
        height: 10px;
        background: var(--bg-primary);
        border: 1px solid var(--border-light);
        border-radius: 6px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: var(--accent-primary, #6366f1);
        transition: width 0.4s ease;
      }
      .progress-fill.failed {
        background: #ef4444;
      }
      .progress-text {
        margin-top: 8px;
        font-size: 0.86rem;
        color: var(--text-secondary, var(--text-muted));
      }
      .failed-count {
        color: #ef4444;
      }
      .err {
        margin: 6px 0 0;
        font-size: 0.82rem;
        color: #ef4444;
      }
      .unsub-list {
        list-style: none;
        margin: 16px 0 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .unsub-list li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 12px;
        background: var(--bg-primary);
        border: 1px solid var(--border-light);
        border-radius: 8px;
        font-size: 0.86rem;
        color: var(--text-primary);
      }
      .empty {
        margin: 12px 0 0;
        font-size: 0.85rem;
        color: var(--text-muted);
      }
    `,
  ],
})
export class EmailCampaignComponent implements OnInit, OnDestroy {
  private campaignService = inject(CampaignService);
  private notify = inject(NotificationService);
  private dialog = inject(DialogService);

  preview = signal<CampaignPreview | null>(null);
  memoryPreview = signal<CampaignPreview | null>(null);
  status = signal<CampaignStatus | null>(null);
  unsubscribed = signal<string[]>([]);
  loading = signal(false);
  testSending = signal(false);

  testEmail = '';
  manualEmail = '';

  private pollHandle: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.loadPreview();
    this.loadMemoryPreview();
    this.loadStatus();
    this.loadUnsubscribed();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  isRunning(): boolean {
    return this.status()?.state === 'running';
  }

  isFinished(): boolean {
    const s = this.status()?.state;
    return s === 'completed' || s === 'failed';
  }

  progressPercent(): number {
    const s = this.status();
    if (!s || s.total === 0) return 0;
    return Math.round(((s.sent + s.failed) / s.total) * 100);
  }

  loadPreview(): void {
    this.loading.set(true);
    this.campaignService.preview().subscribe({
      next: (p) => {
        this.preview.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.notify.error('Empfänger konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  loadMemoryPreview(): void {
    this.campaignService.memoryPreview().subscribe({
      next: (p) => this.memoryPreview.set(p),
      error: () => {},
    });
  }

  loadStatus(): void {
    this.campaignService.status().subscribe({
      next: (s) => {
        this.status.set(s);
        if (s.state === 'running') this.startPolling();
      },
      error: () => {},
    });
  }

  loadUnsubscribed(): void {
    this.campaignService.getUnsubscribed().subscribe({
      next: (list) => this.unsubscribed.set(list),
      error: () => {},
    });
  }

  sendTest(): void {
    if (!this.testEmail) return;
    this.testSending.set(true);
    this.campaignService.sendTest(this.testEmail).subscribe({
      next: (r) => {
        this.testSending.set(false);
        this.notify.success(r.message);
      },
      error: (err) => {
        this.testSending.set(false);
        this.notify.error(
          err?.error?.message || 'Test-Mail konnte nicht gesendet werden.',
        );
      },
    });
  }

  async startSend(): Promise<void> {
    const count = this.preview()?.recipientCount ?? 0;
    if (count === 0) return;

    const ok = await this.dialog.confirm({
      title: 'Massenversand bestätigen',
      message: `Die Google-Bewertungsanfrage wird an ${count} Kunden gesendet. Dieser Vorgang kann nicht rückgängig gemacht werden. Fortfahren?`,
      type: 'danger',
      confirmText: `An ${count} senden`,
      cancelText: 'Abbrechen',
    });
    if (!ok) return;

    this.campaignService.send().subscribe({
      next: (r) => {
        this.notify.success(r.message);
        this.startPolling();
      },
      error: (err) => {
        this.notify.error(
          err?.error?.message || 'Versand konnte nicht gestartet werden.',
        );
      },
    });
  }

  async startMemorySend(): Promise<void> {
    const count = this.memoryPreview()?.recipientCount ?? 0;
    if (count === 0) return;

    const ok = await this.dialog.confirm({
      title: 'Einladung senden',
      message: `Die Erinnerungsecke-Einladung wird an ${count} Miet-Kunden gesendet (jede Adresse nur einmal). Fortfahren?`,
      type: 'danger',
      confirmText: `An ${count} senden`,
      cancelText: 'Abbrechen',
    });
    if (!ok) return;

    this.campaignService.memorySend().subscribe({
      next: (r) => {
        this.notify.success(r.message);
        this.startPolling();
        // Nach kurzer Zeit die Vorschau aktualisieren (Eingeladene fallen raus).
        setTimeout(() => this.loadMemoryPreview(), 4000);
      },
      error: (err) => {
        this.notify.error(
          err?.error?.message || 'Versand konnte nicht gestartet werden.',
        );
      },
    });
  }

  addUnsubscribe(): void {
    if (!this.manualEmail) return;
    this.campaignService.addUnsubscribe(this.manualEmail).subscribe({
      next: (r) => {
        this.notify.success(r.message);
        this.manualEmail = '';
        this.loadUnsubscribed();
        this.loadPreview();
      },
      error: (err) =>
        this.notify.error(err?.error?.message || 'Fehlgeschlagen.'),
    });
  }

  removeUnsubscribe(email: string): void {
    this.campaignService.removeUnsubscribe(email).subscribe({
      next: (r) => {
        this.notify.success(r.message);
        this.loadUnsubscribed();
        this.loadPreview();
      },
      error: (err) =>
        this.notify.error(err?.error?.message || 'Fehlgeschlagen.'),
    });
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollHandle = setInterval(() => {
      this.campaignService.status().subscribe({
        next: (s) => {
          this.status.set(s);
          if (s.state !== 'running') {
            this.stopPolling();
            this.loadPreview();
            if (s.state === 'completed') {
              this.notify.success(
                `Versand abgeschlossen: ${s.sent} gesendet, ${s.failed} fehlgeschlagen.`,
              );
            }
          }
        },
        error: () => this.stopPolling(),
      });
    }, 1500);
  }

  private stopPolling(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }
}
