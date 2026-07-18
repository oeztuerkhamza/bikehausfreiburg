import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GmailService, GmailListItem, GmailMessage } from '../../services/gmail.service';
import { AiEmailService } from '../../services/ai-email.service';
import { NotificationService } from '../../services/notification.service';

/** Gruppierung des Posteingangs: alle Nachrichten desselben Absenders zusammen. */
interface EmailGroup {
  fromName: string;
  fromEmail: string;
  items: GmailListItem[];
  unreadCount: number;
}

/**
 * KI-E-Mail-Assistent.
 *
 * Ablauf:
 *  1. Mit Gmail anmelden (Google-Login im Browser).
 *  2. Eingehende E-Mail aus dem Posteingang öffnen.
 *  3. Auf Türkisch diktieren oder tippen, was inhaltlich geantwortet werden soll.
 *  4. Die KI formuliert eine professionelle Antwort in der Sprache des Kunden.
 *  5. Antwort prüfen/bearbeiten und per Gmail im selben Thread senden.
 */
@Component({
  selector: 'app-ai-email-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-email">
      <div class="page-header">
        <div>
          <h1>KI E-Mail Assistent</h1>
          <p class="page-subtitle">
            Gmail-Posteingang mit KI-gestützten Antworten in der Sprache des Kunden.
          </p>
        </div>
        <div class="header-actions" *ngIf="gmail.connected()">
          <span class="account-chip" title="Angemeldetes Gmail-Konto">
            <span class="dot"></span>{{ gmail.userEmail() || 'Gmail' }}
          </span>
          <button class="btn btn-ghost" (click)="disconnect()">Abmelden</button>
        </div>
      </div>

      <!-- ══ Wiederverbinden nach Reload ══ -->
      <div class="connect-card" *ngIf="!gmail.connected() && restoring()">
        <div class="connect-inner">
          <div class="gmail-badge">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </div>
          <h2>Verbinde mit Gmail…</h2>
          <p>Sitzung wird wiederhergestellt.</p>
        </div>
      </div>

      <!-- ══ Nicht verbunden ══ -->
      <div class="connect-card" *ngIf="!gmail.connected() && !restoring()">
        <div class="connect-inner">
          <div class="gmail-badge">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"
                stroke="currentColor" stroke-width="1.6"/>
              <path d="m3 7 9 6 9-6" stroke="currentColor" stroke-width="1.6"/>
            </svg>
          </div>
          <h2>Mit Gmail verbinden</h2>
          <p>
            Melde dich mit deinem Gmail-Konto an, um eingehende Kunden-E-Mails zu lesen und
            KI-gestützte Antworten direkt aus deinem Postfach zu versenden.
          </p>

          <div class="client-id-box" *ngIf="!hasClientId() || showClientIdEdit()">
            <label>Google OAuth Client-ID</label>
            <input
              type="text"
              [(ngModel)]="clientIdInput"
              placeholder="xxxxxxxx.apps.googleusercontent.com"
              autocomplete="off"
            />
            <small>
              Einmalig nötig: eine Google-OAuth-2.0-Web-Client-ID (Gmail-API aktiviert,
              autorisierte JavaScript-Herkunft = diese Admin-URL). Wird nur lokal gespeichert.
            </small>
            <button class="btn btn-secondary" (click)="saveClientId()">Client-ID speichern</button>
          </div>

          <button
            class="btn btn-primary btn-connect"
            *ngIf="hasClientId() && !showClientIdEdit()"
            [disabled]="gmail.connecting()"
            (click)="connect()"
          >
            <span *ngIf="!gmail.connecting()">Mit Google anmelden</span>
            <span *ngIf="gmail.connecting()">Verbinde…</span>
          </button>
          <button
            class="btn btn-link"
            *ngIf="hasClientId() && !showClientIdEdit()"
            (click)="showClientIdEdit.set(true); clientIdInput = gmail.getClientId()"
          >
            Client-ID ändern
          </button>
        </div>
      </div>

      <!-- ══ Verbunden ══ -->
      <div class="workspace" *ngIf="gmail.connected()">
        <!-- Inbox -->
        <aside class="inbox">
          <div class="inbox-toolbar">
            <input
              class="search"
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadInbox()"
              placeholder="Posteingang durchsuchen…"
            />
            <button class="btn-icon" (click)="loadInbox()" [disabled]="loadingList()" title="Aktualisieren">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                [class.spin]="loadingList()">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
          </div>

          <div class="inbox-list" *ngIf="!loadingList(); else listSkeleton">
            <div class="empty" *ngIf="emails().length === 0">Keine E-Mails gefunden.</div>
            <div class="group" *ngFor="let g of groupedEmails()">
              <div class="group-head" [class.has-unread]="g.unreadCount > 0">
                <div class="avatar-sm">{{ initials(g.fromName) }}</div>
                <span class="g-name" [title]="g.fromEmail">{{ g.fromName }}</span>
                <span class="unread-dot" *ngIf="g.unreadCount > 0" title="Ungelesen"></span>
                <span class="g-count" *ngIf="g.items.length > 1" title="Nachrichten">{{ g.items.length }}</span>
              </div>
              <button
                *ngFor="let m of g.items"
                class="inbox-item"
                [class.active]="selected()?.id === m.id"
                [class.unread]="m.unread"
                (click)="openEmail(m)"
              >
                <span class="unread-indicator" *ngIf="m.unread" aria-label="Ungelesen"></span>
                <div class="row1">
                  <span class="subject">{{ m.subject }}</span>
                  <span class="date">{{ formatDate(m.date) }}</span>
                </div>
                <div class="snippet">{{ m.snippet }}</div>
              </button>
            </div>
          </div>
          <ng-template #listSkeleton>
            <div class="inbox-list">
              <div class="sk-item" *ngFor="let _ of [1,2,3,4,5]"></div>
            </div>
          </ng-template>
        </aside>

        <!-- Detail + Composer -->
        <section class="detail">
          <div class="placeholder" *ngIf="!selected() && !loadingDetail()">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <p>Wähle links eine E-Mail aus, um zu antworten.</p>
          </div>

          <div class="loading-detail" *ngIf="loadingDetail()">E-Mail wird geladen…</div>

          <ng-container *ngIf="selected() as msg">
            <!-- Eingehende E-Mail -->
            <div class="mail-card">
              <div class="mail-head">
                <div class="avatar">{{ initials(msg.fromName || msg.fromEmail) }}</div>
                <div class="mail-meta">
                  <div class="mail-from">{{ msg.fromName || msg.fromEmail }}</div>
                  <div class="mail-email">{{ msg.fromEmail }}</div>
                </div>
                <div class="mail-date">{{ formatDate(msg.date) }}</div>
              </div>
              <div class="mail-subject">{{ msg.subject }}</div>
              <div class="mail-body">{{ msg.body }}</div>
            </div>

            <!-- Composer -->
            <div class="composer">
              <div class="composer-head">
                <h3>Antwort mit KI erstellen</h3>
                <div class="tone-toggle">
                  <button [class.active]="tone() === 'formal'" (click)="tone.set('formal')">Förmlich</button>
                  <button [class.active]="tone() === 'friendly'" (click)="tone.set('friendly')">Freundlich</button>
                </div>
              </div>

              <label class="field-label">
                Notiz auf Türkisch — was soll geantwortet werden?
                <span class="hint">(Diktieren oder tippen)</span>
              </label>
              <div class="instruction-wrap">
                <textarea
                  [(ngModel)]="instruction"
                  rows="3"
                  placeholder="Örn: Müşteriye bisikletin stokta olduğunu, fiyatının 450 € olduğunu ve mağazaya gelip deneyebileceğini söyle."
                ></textarea>
                <button
                  class="mic-btn"
                  [class.recording]="recording()"
                  (click)="toggleRecording()"
                  [disabled]="!speechSupported"
                  [title]="speechSupported ? 'Türkçe sesli yazdır' : 'Tarayıcı desteklemiyor'"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                  </svg>
                </button>
              </div>
              <div class="rec-hint" *ngIf="recording()">🔴 Dinleniyor… (Türkçe konuşun)</div>

              <button class="btn btn-primary btn-generate" (click)="generate()" [disabled]="generating()">
                <span *ngIf="!generating()">✨ Antwort generieren</span>
                <span *ngIf="generating()">Generiere…</span>
              </button>

              <!-- Ergebnis -->
              <div class="reply-result" *ngIf="replyBody()">
                <div class="reply-lang" *ngIf="detectedLanguageName()">
                  Erkannte Sprache: <strong>{{ detectedLanguageName() }}</strong>
                </div>
                <label class="field-label">Betreff</label>
                <input class="reply-subject" type="text" [(ngModel)]="replySubjectModel" />
                <label class="field-label">Antworttext</label>
                <textarea class="reply-body" [(ngModel)]="replyBodyModel" rows="12"></textarea>

                <div class="composer-actions">
                  <button class="btn btn-secondary" (click)="generate()" [disabled]="generating()">
                    Neu generieren
                  </button>
                  <button class="btn btn-primary" (click)="send()" [disabled]="sending()">
                    <span *ngIf="!sending()">An {{ msg.fromEmail }} senden</span>
                    <span *ngIf="sending()">Sende…</span>
                  </button>
                </div>
              </div>
            </div>
          </ng-container>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .page-header {
        display: flex; justify-content: space-between; align-items: flex-start;
        gap: 16px; margin-bottom: 22px; flex-wrap: wrap;
      }
      .page-header h1 { margin: 0; font-size: 1.6rem; font-weight: 800; color: var(--text-primary); }
      .page-subtitle { margin: 4px 0 0; color: var(--text-muted); font-size: 0.9rem; }
      .header-actions { display: flex; align-items: center; gap: 10px; }
      .account-chip {
        display: inline-flex; align-items: center; gap: 8px; font-size: 0.82rem;
        font-weight: 600; color: var(--text-secondary); background: var(--bg-secondary);
        border: 1px solid var(--border-light); padding: 6px 12px; border-radius: 999px;
      }
      .account-chip .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }

      /* Buttons */
      .btn {
        border: none; border-radius: 10px; padding: 10px 16px; font-size: 0.88rem;
        font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit;
      }
      .btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .btn-primary { background: var(--accent-primary, #6366f1); color: #fff; }
      .btn-primary:hover:not(:disabled) { background: var(--accent-primary-hover, #4f46e5); }
      .btn-secondary {
        background: var(--bg-secondary); color: var(--text-primary);
        border: 1px solid var(--border-light);
      }
      .btn-ghost {
        background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color);
      }
      .btn-ghost:hover { color: var(--accent-danger, #ef4444); border-color: var(--accent-danger, #ef4444); }
      .btn-link { background: none; color: var(--accent-primary, #6366f1); padding: 6px; }

      /* Connect card */
      .connect-card {
        display: flex; justify-content: center; padding: 40px 20px;
      }
      .connect-inner {
        max-width: 460px; width: 100%; text-align: center;
        background: var(--bg-secondary); border: 1px solid var(--border-light);
        border-radius: 16px; padding: 36px 30px;
        box-shadow: var(--shadow-sm, 0 2px 12px rgba(0,0,0,0.05));
      }
      .gmail-badge {
        width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 18px;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.08));
        color: var(--accent-primary, #6366f1);
      }
      .connect-inner h2 { margin: 0 0 8px; font-size: 1.25rem; color: var(--text-primary); }
      .connect-inner p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin: 0 0 20px; }
      .btn-connect { width: 100%; padding: 12px; font-size: 0.95rem; }
      .client-id-box {
        text-align: left; background: var(--bg-primary); border: 1px solid var(--border-light);
        border-radius: 12px; padding: 16px; margin-bottom: 18px;
      }
      .client-id-box label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; color: var(--text-secondary); }
      .client-id-box input {
        width: 100%; padding: 10px 12px; border: 1px solid var(--border-color);
        border-radius: 8px; font-size: 0.85rem; background: var(--bg-secondary);
        color: var(--text-primary); box-sizing: border-box;
      }
      .client-id-box small { display: block; color: var(--text-muted); font-size: 0.74rem; margin: 8px 0 12px; line-height: 1.4; }

      /* Workspace */
      .workspace {
        display: grid; grid-template-columns: 340px 1fr; gap: 18px;
        align-items: start;
      }
      @media (max-width: 900px) { .workspace { grid-template-columns: 1fr; } }

      .inbox {
        background: var(--bg-secondary); border: 1px solid var(--border-light);
        border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;
        max-height: calc(100vh - 200px);
      }
      .inbox-toolbar { display: flex; gap: 8px; padding: 12px; border-bottom: 1px solid var(--border-light); }
      .search {
        flex: 1; padding: 9px 12px; border: 1px solid var(--border-color); border-radius: 8px;
        background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem;
      }
      .btn-icon {
        width: 38px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary);
        color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center;
      }
      .btn-icon:hover { color: var(--accent-primary, #6366f1); }
      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }

      .inbox-list { overflow-y: auto; flex: 1; }
      .empty { padding: 30px 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem; }
      /* Gruppe = ein Absender */
      .group { border-bottom: 1px solid var(--border-light); }
      .group-head { display: flex; align-items: center; gap: 8px; padding: 10px 14px 4px; }
      .avatar-sm {
        width: 24px; height: 24px; border-radius: 7px; flex-shrink: 0;
        background: linear-gradient(135deg, var(--accent-primary, #6366f1), var(--accent-primary-hover, #4f46e5));
        color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.64rem; font-weight: 700;
      }
      .g-name {
        flex: 1; min-width: 0; font-size: 0.83rem; font-weight: 700; color: var(--text-primary);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .g-count {
        font-size: 0.68rem; font-weight: 700; color: var(--text-muted);
        background: var(--bg-hover, rgba(0,0,0,0.06)); border-radius: 999px; padding: 1px 7px; flex-shrink: 0;
      }
      .unread-dot {
        width: 9px; height: 9px; border-radius: 50%; background: #ef4444; flex-shrink: 0;
        animation: blink 1s ease-in-out infinite;
      }

      .inbox-item {
        position: relative; display: block; width: 100%; text-align: left;
        padding: 7px 14px 9px 30px; border: none; background: transparent; cursor: pointer;
        transition: background 0.12s;
      }
      .inbox-item:hover { background: var(--bg-hover, rgba(0,0,0,0.03)); }
      .inbox-item.active { background: var(--accent-primary-light, rgba(99,102,241,0.1)); }
      .inbox-item.unread .subject { font-weight: 700; color: var(--text-primary); }
      .inbox-item.unread { animation: rowpulse 1.6s ease-in-out infinite; }
      .unread-indicator {
        position: absolute; left: 13px; top: 13px; width: 8px; height: 8px; border-radius: 50%;
        background: #ef4444; animation: blink 1s ease-in-out infinite;
      }
      .row1 { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
      .date { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; flex-shrink: 0; }
      .subject { flex: 1; min-width: 0; font-size: 0.82rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .snippet { font-size: 0.76rem; color: var(--text-muted); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.12; } }
      @keyframes rowpulse {
        0%, 100% { background: rgba(239, 68, 68, 0.03); }
        50% { background: rgba(239, 68, 68, 0.11); }
      }
      @media (prefers-reduced-motion: reduce) {
        .unread-dot, .unread-indicator, .inbox-item.unread { animation: none; }
        .inbox-item.unread { background: rgba(239, 68, 68, 0.07); }
      }
      .sk-item { height: 62px; margin: 10px 12px; border-radius: 8px; background: var(--bg-hover, rgba(0,0,0,0.05)); animation: pulse 1.4s ease-in-out infinite; }
      @keyframes pulse { 50% { opacity: 0.5; } }

      /* Detail */
      .detail {
        background: var(--bg-secondary); border: 1px solid var(--border-light);
        border-radius: 14px; padding: 20px; min-height: 300px;
      }
      .placeholder, .loading-detail {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 12px; color: var(--text-muted); padding: 60px 20px; text-align: center;
      }
      .mail-card { border-bottom: 1px solid var(--border-light); padding-bottom: 18px; margin-bottom: 18px; }
      .mail-head { display: flex; align-items: center; gap: 12px; }
      .avatar {
        width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
        background: linear-gradient(135deg, var(--accent-primary, #6366f1), var(--accent-primary-hover, #4f46e5));
        color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;
      }
      .mail-meta { flex: 1; min-width: 0; }
      .mail-from { font-weight: 700; color: var(--text-primary); }
      .mail-email { font-size: 0.8rem; color: var(--text-muted); }
      .mail-date { font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; }
      .mail-subject { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 14px 0 8px; }
      .mail-body { white-space: pre-wrap; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; max-height: 320px; overflow-y: auto; }

      /* Composer */
      .composer-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
      .composer-head h3 { margin: 0; font-size: 1.05rem; color: var(--text-primary); }
      .tone-toggle { display: inline-flex; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
      .tone-toggle button {
        border: none; background: var(--bg-primary); color: var(--text-secondary);
        padding: 7px 14px; font-size: 0.8rem; font-weight: 600; cursor: pointer;
      }
      .tone-toggle button.active { background: var(--accent-primary, #6366f1); color: #fff; }
      .field-label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin: 14px 0 6px; }
      .field-label .hint { font-weight: 400; color: var(--text-muted); }
      .instruction-wrap { position: relative; }
      textarea, .reply-subject {
        width: 100%; box-sizing: border-box; border: 1px solid var(--border-color); border-radius: 10px;
        padding: 12px; font-size: 0.9rem; font-family: inherit; background: var(--bg-primary);
        color: var(--text-primary); resize: vertical; line-height: 1.5;
      }
      textarea:focus, .reply-subject:focus { outline: none; border-color: var(--accent-primary, #6366f1); }
      .mic-btn {
        position: absolute; right: 10px; bottom: 10px; width: 38px; height: 38px; border-radius: 50%;
        border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-secondary);
        cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
      }
      .mic-btn:hover:not(:disabled) { color: var(--accent-primary, #6366f1); border-color: var(--accent-primary, #6366f1); }
      .mic-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .mic-btn.recording { background: #ef4444; color: #fff; border-color: #ef4444; animation: pulse-rec 1.2s infinite; }
      @keyframes pulse-rec { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); } 50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); } }
      .rec-hint { font-size: 0.8rem; color: #ef4444; margin-top: 6px; font-weight: 600; }
      .btn-generate { width: 100%; margin-top: 14px; padding: 12px; }

      .reply-result { margin-top: 20px; border-top: 1px dashed var(--border-color); padding-top: 18px; }
      .reply-lang {
        font-size: 0.82rem; color: var(--text-secondary); background: var(--accent-primary-light, rgba(99,102,241,0.1));
        display: inline-block; padding: 5px 12px; border-radius: 8px; margin-bottom: 6px;
      }
      .reply-body { min-height: 220px; }
      .composer-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
    `,
  ],
})
export class AiEmailAssistantComponent implements OnInit, OnDestroy {
  readonly gmail = inject(GmailService);
  private ai = inject(AiEmailService);
  private notify = inject(NotificationService);

  // Wird beim Laden versucht: stille Wiederverbindung nach Seiten-Reload.
  restoring = signal(false);

  // Client-ID
  clientIdInput = '';
  showClientIdEdit = signal(false);

  // Inbox
  searchQuery = '';
  loadingList = signal(false);
  emails = signal<GmailListItem[]>([]);

  /** Nachrichten nach Absender gruppiert (gleiche Person = eine Gruppe). */
  groupedEmails = computed<EmailGroup[]>(() => {
    const map = new Map<string, EmailGroup>();
    for (const m of this.emails()) {
      const key = (m.fromEmail || m.fromName || m.id).toLowerCase();
      let g = map.get(key);
      if (!g) {
        g = { fromName: m.fromName || m.fromEmail || '(Unbekannt)', fromEmail: m.fromEmail, items: [], unreadCount: 0 };
        map.set(key, g);
      }
      g.items.push(m);
      if (m.unread) g.unreadCount++;
    }
    // Gmail liefert bereits nach Datum absteigend → Reihenfolge (erste Erwähnung) beibehalten.
    return Array.from(map.values());
  });

  // Detail
  selected = signal<GmailMessage | null>(null);
  loadingDetail = signal(false);

  // Composer
  instruction = '';
  tone = signal<'formal' | 'friendly'>('formal');
  generating = signal(false);
  detectedLanguageName = signal('');
  replySubject = signal('');
  replyBody = signal('');
  sending = signal(false);

  // Speech
  recording = signal(false);
  speechSupported = false;
  private recognition: any = null;

  constructor() {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    this.speechSupported = !!SR;
  }

  async ngOnInit(): Promise<void> {
    if (this.gmail.connected()) {
      this.loadInbox();
      return;
    }
    this.restoring.set(true);
    try {
      const ok = await this.gmail.tryRestore();
      if (ok) this.loadInbox();
    } finally {
      this.restoring.set(false);
    }
  }

  ngOnDestroy(): void {
    this.stopRecording();
  }

  // Bindungen zwischen Signal und ngModel
  get replySubjectModel() { return this.replySubject(); }
  set replySubjectModel(v: string) { this.replySubject.set(v); }
  get replyBodyModel() { return this.replyBody(); }
  set replyBodyModel(v: string) { this.replyBody.set(v); }

  hasClientId(): boolean { return !!this.gmail.getClientId(); }

  saveClientId(): void {
    if (!this.clientIdInput.trim()) {
      this.notify.warning('Bitte eine Client-ID eingeben.');
      return;
    }
    this.gmail.setClientId(this.clientIdInput);
    this.showClientIdEdit.set(false);
    this.notify.success('Client-ID gespeichert.');
  }

  async connect(): Promise<void> {
    try {
      await this.gmail.connect();
      this.notify.success('Mit Gmail verbunden.');
      this.loadInbox();
    } catch (e: any) {
      if (e?.message === 'NO_CLIENT_ID') {
        this.showClientIdEdit.set(true);
        this.notify.warning('Bitte zuerst die Google Client-ID eingeben.');
      } else if (e?.message === 'GIS_LOAD_FAILED') {
        this.notify.error('Google-Login konnte nicht geladen werden (Netzwerk/Blocker?).');
      } else {
        this.notify.error('Anmeldung fehlgeschlagen: ' + (e?.message || 'Unbekannter Fehler'));
      }
    }
  }

  disconnect(): void {
    this.gmail.disconnect();
    this.emails.set([]);
    this.selected.set(null);
    this.resetComposer();
  }

  async loadInbox(): Promise<void> {
    this.loadingList.set(true);
    try {
      const items = await this.gmail.listInbox(this.searchQuery.trim(), 20);
      this.emails.set(items);
    } catch (e: any) {
      this.notify.error('Posteingang konnte nicht geladen werden: ' + (e?.message || ''));
    } finally {
      this.loadingList.set(false);
    }
  }

  async openEmail(item: GmailListItem): Promise<void> {
    this.resetComposer();
    this.loadingDetail.set(true);
    this.selected.set(null);
    try {
      const msg = await this.gmail.getMessage(item.id);
      this.selected.set(msg);
    } catch (e: any) {
      this.notify.error('E-Mail konnte nicht geladen werden: ' + (e?.message || ''));
    } finally {
      this.loadingDetail.set(false);
    }
  }

  generate(): void {
    const msg = this.selected();
    if (!msg) return;
    if (!this.instruction.trim()) {
      this.notify.warning('Bitte eine Notiz eingeben oder diktieren.');
      return;
    }
    this.generating.set(true);
    this.ai
      .generateReply({
        body: msg.body,
        instruction: this.instruction.trim(),
        fromName: msg.fromName,
        fromEmail: msg.fromEmail,
        subject: msg.subject,
        tone: this.tone(),
      })
      .subscribe({
        next: (res) => {
          this.detectedLanguageName.set(res.detectedLanguageName);
          this.replySubject.set(res.replySubject);
          this.replyBody.set(res.replyBody);
          this.generating.set(false);
        },
        error: (err) => {
          this.generating.set(false);
          const m = err?.error?.message || err?.message || 'Fehler bei der KI-Generierung.';
          this.notify.error(m);
        },
      });
  }

  async send(): Promise<void> {
    const msg = this.selected();
    if (!msg) return;
    if (!this.replyBody().trim()) {
      this.notify.warning('Die Antwort ist leer.');
      return;
    }
    if (!msg.fromEmail) {
      this.notify.error('Keine Empfängeradresse gefunden.');
      return;
    }
    this.sending.set(true);
    try {
      await this.gmail.sendReply({
        to: msg.fromEmail,
        subject: this.replySubject() || `Re: ${msg.subject}`,
        body: this.replyBody(),
        threadId: msg.threadId,
        inReplyTo: msg.messageIdHeader,
        references: msg.references,
      });
      this.notify.success('Antwort gesendet an ' + msg.fromEmail);
      this.resetComposer();
    } catch (e: any) {
      this.notify.error('Senden fehlgeschlagen: ' + (e?.message || ''));
    } finally {
      this.sending.set(false);
    }
  }

  // ── Sprache-zu-Text (Türkisch) ─────────────────────────────────────────
  toggleRecording(): void {
    if (this.recording()) {
      this.stopRecording();
      return;
    }
    if (!this.speechSupported) return;
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const rec = new SR();
    rec.lang = 'tr-TR';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (event: any) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
      }
      if (finalText) {
        this.instruction = (this.instruction ? this.instruction + ' ' : '') + finalText.trim();
      }
    };
    rec.onerror = (e: any) => {
      this.recording.set(false);
      if (e?.error === 'not-allowed') {
        this.notify.error('Mikrofonzugriff verweigert.');
      }
    };
    rec.onend = () => this.recording.set(false);
    this.recognition = rec;
    try {
      rec.start();
      this.recording.set(true);
    } catch {
      this.recording.set(false);
    }
  }

  private stopRecording(): void {
    if (this.recognition) {
      try { this.recognition.stop(); } catch { /* ignore */ }
      this.recognition = null;
    }
    this.recording.set(false);
  }

  // ── Helfer ─────────────────────────────────────────────────────────────
  private resetComposer(): void {
    this.stopRecording();
    this.instruction = '';
    this.detectedLanguageName.set('');
    this.replySubject.set('');
    this.replyBody.set('');
    this.generating.set(false);
    this.sending.set(false);
  }

  initials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  }

  formatDate(raw: string): string {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay
      ? d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
}
