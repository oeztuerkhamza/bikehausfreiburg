import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  KleinanzeigenAccount,
  KleinanzeigenChat,
  KleinanzeigenChatService,
} from '../../services/kleinanzeigen-chat.service';
import { AiEmailService } from '../../services/ai-email.service';
import { NotificationService } from '../../services/notification.service';
import { GmailService } from '../../services/gmail.service';
import { firstValueFrom } from 'rxjs';

/**
 * Kleinanzeigen-Nachrichten als Chat — dieselbe Arbeitsweise wie beim
 * WhatsApp- und Mail-Assistenten:
 *   1. Unterhaltung öffnen (eingehende Nachrichten stehen mit türkischer
 *      Übersetzung unter der Blase).
 *   2. Auf Türkisch tippen, was geantwortet werden soll.
 *   3. Die KI schreibt eine KURZE Antwort in der Sprache des Interessenten,
 *      dazu die türkische Rückübersetzung zur Kontrolle.
 *   4. Senden — die Mail geht an die Kleinanzeigen-Alias-Adresse und erscheint
 *      beim Interessenten in der Kleinanzeigen-App.
 */
@Component({
  selector: 'app-kleinanzeigen-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ka-page">
      <div class="page-header">
        <div>
          <h1><span class="ka-badge">K</span> Kleinanzeigen Nachrichten</h1>
          <p class="page-subtitle">
            Anfragen zu deinen Anzeigen als Chat — mit KI-Antwort in der Sprache des Interessenten.
          </p>
        </div>
        <div class="header-actions">
          <span class="account-chip" *ngIf="account()?.connected" [title]="account()?.ownAccount
              ? 'Eigenes Kleinanzeigen-Postfach' : 'Postfach des KI-E-Mail-Assistenten'">
            <span class="dot" [class.shared]="!account()?.ownAccount"></span>
            {{ account()?.email }}
            <em *ngIf="!account()?.ownAccount">(Mail-Konto)</em>
          </span>
          <button class="btn btn-secondary" (click)="connectAccount()" [disabled]="connecting()">
            {{ connecting() ? 'Öffnet…' : (account()?.ownAccount ? 'Konto wechseln' : 'Eigenes Konto verbinden') }}
          </button>
          <button class="btn btn-ghost" *ngIf="account()?.ownAccount" (click)="disconnectAccount()">
            Abmelden
          </button>
          <button class="btn btn-secondary" (click)="reload()" [disabled]="loadingList()">
            {{ loadingList() ? 'Lädt…' : 'Aktualisieren' }}
          </button>
        </div>
      </div>

      <!-- Gmail nicht verbunden -->
      <div class="connect-card" *ngIf="disconnected()">
        <div class="connect-inner">
          <h2>Kein Postfach verbunden</h2>
          <p>
            Die Kleinanzeigen-Nachrichten kommen aus einem Gmail-Postfach. Verbinde hier das
            Konto, auf dem deine Anzeigen laufen — es kann ein anderes sein als das des
            KI-E-Mail-Assistenten.
          </p>
          <button class="btn btn-primary" (click)="connectAccount()" [disabled]="connecting()">
            {{ connecting() ? 'Öffnet…' : 'Mit Google verbinden' }}
          </button>
        </div>
      </div>

      <div class="workspace" [class.detail-open]="selected()" *ngIf="!disconnected()">
        <!-- ══ Liste ══ -->
        <aside class="chats">
          <div class="chats-head">
            <span>Unterhaltungen</span>
            <span class="count" *ngIf="chats().length">{{ chats().length }}</span>
          </div>
          <div class="chats-list">
            <div class="empty" *ngIf="!chats().length && !loadingList()">
              Noch keine Nachrichten. Anfragen zu deinen Anzeigen erscheinen hier.
            </div>
            <div class="empty" *ngIf="!chats().length && loadingList()">Lädt…</div>

            <button
              *ngFor="let c of chats()"
              class="chat-item"
              [class.active]="selected()?.id === c.id"
              (click)="open(c)"
            >
              <span class="avatar">{{ initials(c.peerName) }}</span>
              <span class="ci-body">
                <span class="ci-top">
                  <span class="ci-name" [class.unread]="c.unread > 0">{{ c.peerName }}</span>
                  <span class="ci-time">{{ shortTime(c.updatedAt) }}</span>
                </span>
                <span class="ci-ad">{{ c.adTitle }}</span>
                <span class="ci-bottom">
                  <span class="ci-preview">
                    <ng-container *ngIf="c.lastDirection === 'out'">Wir: </ng-container>{{ c.lastMessage }}
                  </span>
                  <span class="ci-badge" *ngIf="c.unread > 0">{{ c.unread }}</span>
                </span>
              </span>
            </button>
          </div>
        </aside>

        <!-- ══ Verlauf ══ -->
        <section class="thread">
          <button class="mobile-back" *ngIf="selected()" (click)="closeDetail()">‹ Zurück zur Liste</button>

          <div class="thread-empty" *ngIf="!selected()">
            <p>Wähle links eine Unterhaltung.</p>
          </div>

          <ng-container *ngIf="selected() as c">
            <header class="thread-head">
              <span class="avatar">{{ initials(c.peerName) }}</span>
              <div class="th-meta">
                <div class="th-name">{{ c.peerName }}</div>
                <div class="th-ad">
                  {{ c.adTitle }}
                  <span class="th-adid" *ngIf="c.adId">· Nr. {{ c.adId }}</span>
                </div>
              </div>
            </header>

            <div class="messages" #messageBox>
              <div
                *ngFor="let m of c.messages"
                class="msg"
                [class.in]="m.direction === 'in'"
                [class.out]="m.direction === 'out'"
              >
                <div class="msg-body">{{ m.body }}</div>
                <div class="msg-tr" *ngIf="m.direction === 'in' && m.translation">
                  🇹🇷 {{ m.translation }}
                </div>
                <div class="msg-time">{{ time(m.ts) }}</div>
              </div>

              <div class="thinking" *ngIf="generating()">
                <span class="spin-dot"></span> KI-Antwort wird erstellt…
              </div>
            </div>

            <!-- ══ Antwort ══ -->
            <div class="composer">
              <div class="draft-panel" *ngIf="draft()">
                <div class="cp-row">
                  <label>Antwort an {{ c.peerName }} (wird so gesendet)</label>
                  <span class="lang-badge" *ngIf="langBadge()">{{ langBadge() }}</span>
                </div>
                <textarea
                  rows="4"
                  [ngModel]="draft()"
                  (ngModelChange)="draft.set($event)"
                  (blur)="persistDraft()"
                ></textarea>

                <div class="cp-row">
                  <label>🇹🇷 Türkçe kontrol</label>
                  <button class="btn-link" (click)="regenerate()" [disabled]="generating()">
                    ↻ Türkçeden yeniden oluştur
                  </button>
                </div>
                <textarea
                  class="tr"
                  rows="4"
                  [ngModel]="draftTr()"
                  (ngModelChange)="draftTr.set($event)"
                ></textarea>

                <div class="cp-actions">
                  <button class="btn btn-secondary" (click)="discardDraft()" [disabled]="sending()">
                    Verwerfen
                  </button>
                  <button class="btn btn-primary" (click)="send()" [disabled]="sending() || !draft().trim()">
                    {{ sending() ? 'Sendet…' : 'Senden ➤' }}
                  </button>
                </div>
              </div>

              <div class="instruction-bar">
                <textarea
                  rows="1"
                  placeholder="Türkçe yaz: müşteriye ne diyeyim?"
                  [ngModel]="instruction()"
                  (ngModelChange)="instruction.set($event)"
                  (keydown.control.enter)="generate()"
                ></textarea>
                <button
                  class="btn btn-primary btn-generate"
                  (click)="generate()"
                  [disabled]="generating() || !instruction().trim()"
                >
                  ✨ Cevap oluştur
                </button>
              </div>
            </div>
          </ng-container>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .ka-page { display: block; }
      .page-header {
        display: flex; justify-content: space-between; align-items: flex-start;
        gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
      }
      .page-header h1 {
        margin: 0 0 4px; font-size: 1.5rem; color: var(--text-primary);
        display: flex; align-items: center; gap: 10px;
      }
      .ka-badge {
        display: inline-flex; align-items: center; justify-content: center;
        width: 30px; height: 30px; border-radius: 9px;
        background: #9ceb00; color: #10240a; font-weight: 800; font-size: 1rem;
      }
      .page-subtitle { margin: 0; color: var(--text-muted); font-size: 0.9rem; }

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
      .btn-link {
        background: none; border: none; padding: 2px 6px; cursor: pointer;
        color: var(--accent-primary, #6366f1); font-size: 0.78rem; font-weight: 600;
      }

      .account-chip {
        display: inline-flex; align-items: center; gap: 7px; font-size: 0.8rem; font-weight: 600;
        color: var(--text-secondary); background: var(--bg-secondary);
        border: 1px solid var(--border-light); padding: 6px 12px; border-radius: 999px;
        max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .account-chip .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
      .account-chip .dot.shared { background: #f59e0b; }
      .account-chip em { font-style: normal; color: var(--text-muted); font-weight: 500; }
      .header-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      .btn-ghost {
        background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color);
      }
      .btn-ghost:hover { color: var(--accent-danger, #ef4444); border-color: var(--accent-danger, #ef4444); }

      .connect-card { display: flex; justify-content: center; padding: 40px 20px; }
      .connect-inner {
        max-width: 460px; text-align: center; background: var(--bg-secondary);
        border: 1px solid var(--border-light); border-radius: 16px; padding: 32px 28px;
      }
      .connect-inner h2 { margin: 0 0 8px; font-size: 1.2rem; color: var(--text-primary); }
      .connect-inner p { margin: 0 0 18px; color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; }

      .workspace { display: grid; grid-template-columns: 340px 1fr; gap: 18px; align-items: start; }

      /* ── Liste ── */
      .chats {
        background: var(--bg-secondary); border: 1px solid var(--border-light);
        border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;
        max-height: calc(100vh - 220px); min-width: 0;
      }
      .chats-head {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 14px; border-bottom: 1px solid var(--border-light);
        font-size: 0.82rem; font-weight: 700; color: var(--text-secondary);
      }
      .chats-head .count {
        font-size: 0.7rem; background: var(--bg-hover, rgba(0,0,0,0.06));
        border-radius: 999px; padding: 1px 8px; color: var(--text-muted);
      }
      .chats-list { overflow-y: auto; flex: 1; }
      .empty { padding: 26px 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem; }

      .chat-item {
        display: flex; gap: 10px; width: 100%; text-align: left; padding: 11px 12px;
        border: none; border-bottom: 1px solid var(--border-light);
        background: transparent; cursor: pointer; transition: background 0.12s;
      }
      .chat-item:hover { background: var(--bg-hover, rgba(0,0,0,0.04)); }
      .chat-item.active { background: var(--bg-hover, rgba(99,102,241,0.08)); }
      .avatar {
        width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
        background: linear-gradient(135deg, #9ceb00, #6bbf00);
        color: #10240a; display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; font-weight: 800; text-transform: uppercase;
      }
      .ci-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
      .ci-top { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
      .ci-name {
        font-size: 0.9rem; font-weight: 600; color: var(--text-primary);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ci-name.unread { font-weight: 800; }
      .ci-time { font-size: 0.7rem; color: var(--text-muted); flex-shrink: 0; }
      .ci-ad {
        font-size: 0.74rem; color: #6bbf00; font-weight: 600;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ci-bottom { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
      .ci-preview {
        font-size: 0.8rem; color: var(--text-muted); flex: 1; min-width: 0;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ci-badge {
        background: #ef4444; color: #fff; font-size: 0.68rem; font-weight: 700;
        border-radius: 999px; padding: 1px 7px; flex-shrink: 0;
      }

      /* ── Verlauf ── */
      .thread {
        background: var(--bg-secondary); border: 1px solid var(--border-light);
        border-radius: 14px; display: flex; flex-direction: column;
        min-height: calc(100vh - 220px); max-height: calc(100vh - 220px); min-width: 0;
      }
      .thread-empty {
        flex: 1; display: flex; align-items: center; justify-content: center;
        color: var(--text-muted); font-size: 0.9rem;
      }
      .thread-head {
        display: flex; align-items: center; gap: 10px; padding: 12px 16px;
        border-bottom: 1px solid var(--border-light);
      }
      .th-meta { min-width: 0; }
      .th-name { font-size: 0.98rem; font-weight: 700; color: var(--text-primary); }
      .th-ad {
        font-size: 0.78rem; color: var(--text-muted);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .th-adid { color: var(--text-muted); }

      .messages {
        flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 8px;
        background: var(--bg-primary);
      }
      .msg {
        max-width: 78%; padding: 8px 12px; border-radius: 12px; font-size: 0.88rem;
        white-space: pre-wrap; word-wrap: break-word; line-height: 1.45;
      }
      .msg.in {
        align-self: flex-start; background: var(--bg-secondary);
        border: 1px solid var(--border-light); border-top-left-radius: 4px;
      }
      .msg.out {
        align-self: flex-end; background: rgba(156, 235, 0, 0.16);
        border: 1px solid rgba(156, 235, 0, 0.4); border-top-right-radius: 4px;
      }
      .msg-tr {
        margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border-color);
        font-size: 0.8rem; font-style: italic; color: var(--text-muted);
      }
      .msg-time { font-size: 0.65rem; color: var(--text-muted); text-align: right; margin-top: 4px; }
      .thinking {
        align-self: center; display: flex; align-items: center; gap: 8px;
        color: var(--text-muted); font-size: 0.82rem; padding: 6px 0;
      }
      .spin-dot {
        width: 12px; height: 12px; border-radius: 50%;
        border: 2px solid var(--border-color); border-top-color: var(--accent-primary, #6366f1);
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* ── Antwort ── */
      .composer { border-top: 1px solid var(--border-light); padding: 12px 14px; }
      .draft-panel {
        background: var(--bg-primary); border: 1px solid var(--border-light);
        border-radius: 12px; padding: 12px; margin-bottom: 10px;
      }
      .cp-row {
        display: flex; justify-content: space-between; align-items: center;
        margin: 8px 0 4px; gap: 8px;
      }
      .cp-row:first-child { margin-top: 0; }
      .cp-row label { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); }
      .lang-badge {
        font-size: 0.68rem; font-weight: 700; color: #6bbf00;
        background: rgba(156, 235, 0, 0.15); border-radius: 999px; padding: 2px 8px;
      }
      .composer textarea, .draft-panel textarea {
        width: 100%; border: 1px solid var(--border-color); border-radius: 9px;
        background: var(--bg-secondary); color: var(--text-primary);
        padding: 9px 11px; font-size: 0.88rem; font-family: inherit; resize: vertical;
      }
      .draft-panel textarea.tr { color: #b58900; }
      .cp-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
      .instruction-bar { display: flex; gap: 8px; align-items: flex-end; }
      .instruction-bar textarea { flex: 1; min-height: 42px; }
      .btn-generate { white-space: nowrap; }

      .mobile-back {
        display: none; width: 100%; margin-bottom: 10px; padding: 10px 14px; cursor: pointer;
        background: var(--bg-primary); border: 1px solid var(--border-light);
        border-radius: 10px; font-size: 0.88rem; font-weight: 700; color: var(--text-primary);
      }

      @media (max-width: 900px) {
        .workspace { grid-template-columns: 1fr; gap: 0; }
        .chats { max-height: none; }
        .workspace.detail-open .chats { display: none; }
        .workspace:not(.detail-open) .thread { display: none; }
        .thread { min-height: calc(100vh - 180px); max-height: calc(100vh - 180px); }
        .mobile-back { display: block; }
        .instruction-bar { flex-direction: column; align-items: stretch; }
        .btn-generate { width: 100%; }
      }
    `,
  ],
})
export class KleinanzeigenChatComponent implements OnInit, OnDestroy {
  private api = inject(KleinanzeigenChatService);
  private aiEmail = inject(AiEmailService);
  private gmail = inject(GmailService);
  private notify = inject(NotificationService);

  readonly chats = signal<KleinanzeigenChat[]>([]);
  readonly selected = signal<KleinanzeigenChat | null>(null);
  readonly loadingList = signal(false);
  readonly generating = signal(false);
  readonly sending = signal(false);
  readonly disconnected = signal(false);
  readonly account = signal<KleinanzeigenAccount | null>(null);
  readonly connecting = signal(false);

  readonly instruction = signal('');
  readonly draft = signal('');
  readonly draftTr = signal('');
  readonly langBadge = signal('');

  /** Neue Nachrichten nachladen, solange die Seite offen ist. */
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.refreshAccount();
    this.reload();
    this.timer = setInterval(() => this.reload(true), 45_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async refreshAccount(): Promise<void> {
    this.account.set(await this.api.account());
  }

  /** Eigenes Google-Konto für die Kleinanzeigen-Chats verbinden. */
  async connectAccount(): Promise<void> {
    this.connecting.set(true);
    try {
      await this.api.connectAccount();
      await this.refreshAccount();
      this.notify.success('Konto verbunden ✓');
      await this.reload();
    } catch (e: any) {
      if (e?.message !== 'CANCELLED') this.notify.error('Verbindung fehlgeschlagen: ' + (e?.message || ''));
    } finally {
      this.connecting.set(false);
    }
  }

  async disconnectAccount(): Promise<void> {
    if (!confirm('Kleinanzeigen-Postfach abmelden? Die Chats sind dann erst nach erneutem Verbinden sichtbar.'))
      return;
    try {
      await this.api.disconnectAccount();
      await this.refreshAccount();
      this.chats.set([]);
      this.selected.set(null);
      await this.reload();
      this.notify.success('Abgemeldet');
    } catch (e: any) {
      this.notify.error('Abmelden fehlgeschlagen: ' + (e?.message || ''));
    }
  }

  async reload(silent = false): Promise<void> {
    if (!silent) this.loadingList.set(true);
    try {
      const list = await this.api.list();
      this.chats.set(list);
      this.disconnected.set(false);
      if (!silent) this.refreshAccount();

      // Offene Unterhaltung mitziehen, wenn neue Nachrichten da sind.
      const open = this.selected();
      if (open) {
        const fresh = list.find((c) => c.id === open.id);
        if (fresh && fresh.messages.length !== open.messages.length) {
          this.selected.set(fresh);
          this.translateIncoming(fresh.id);
        }
      }
    } catch (e: any) {
      if (e?.status === 409) {
        this.disconnected.set(true);
        this.account.set({ connected: false, email: null, ownAccount: false });
      } else if (!silent) {
        this.notify.error('Nachrichten konnten nicht geladen werden: ' + (e?.message || ''));
      }
    } finally {
      this.loadingList.set(false);
    }
  }

  async open(c: KleinanzeigenChat): Promise<void> {
    this.resetComposer();
    this.selected.set(c);
    try {
      const full = await this.api.get(c.id);
      this.selected.set(full);
      this.draft.set(full.draft || '');
      this.draftTr.set(full.draftTr || '');
      this.api.markRead(full.id);
      this.markReadLocally(full.id);
      this.translateIncoming(full.id);
    } catch (e: any) {
      this.notify.error('Unterhaltung konnte nicht geöffnet werden: ' + (e?.message || ''));
    }
  }

  closeDetail(): void {
    this.selected.set(null);
    this.resetComposer();
  }

  /** Eingegangene Nachrichten übersetzen lassen (Ergebnis wird serverseitig gespeichert). */
  private async translateIncoming(id: string): Promise<void> {
    const c = this.selected();
    if (!c || c.id !== id) return;
    if (!c.messages.some((m) => m.direction === 'in' && !m.translation && m.body)) return;

    try {
      const updated = await this.api.translate(id);
      if (this.selected()?.id === id) this.selected.set(updated);
      this.replaceInList(updated);
    } catch {
      /* KI aus/kein Schlüssel – Verlauf bleibt ohne Übersetzung nutzbar. */
    }
  }

  async generate(): Promise<void> {
    const c = this.selected();
    const text = this.instruction().trim();
    if (!c || !text || this.generating()) return;
    await this.generateFrom(c.id, text);
  }

  /** Türkisch korrigierten Text als neue Grundlage nehmen. */
  async regenerate(): Promise<void> {
    const c = this.selected();
    const tr = this.draftTr().trim();
    if (!c || !tr || this.generating()) return;
    await this.generateFrom(c.id, tr);
  }

  private async generateFrom(id: string, instruction: string): Promise<void> {
    this.generating.set(true);
    try {
      const updated = await this.api.compose(id, instruction);
      if (this.selected()?.id === id) this.selected.set(updated);
      this.replaceInList(updated);
      this.draft.set(updated.draft || '');
      this.draftTr.set(updated.draftTr || '');
      this.langBadge.set('KI ✨');
      if (!updated.draftTr) await this.backTranslate();
    } catch (e: any) {
      this.notify.error('Antwort konnte nicht erstellt werden: ' + (e?.message || ''));
    } finally {
      this.generating.set(false);
    }
  }

  /** Fallback, falls die Rückübersetzung serverseitig nicht mitkam. */
  private async backTranslate(): Promise<void> {
    const text = this.draft().trim();
    if (!text) return;
    try {
      const r = await firstValueFrom(this.aiEmail.translate(text));
      this.draftTr.set(r.translation || '');
    } catch {
      /* egal */
    }
  }

  persistDraft(): void {
    const c = this.selected();
    if (!c) return;
    this.api.saveDraft(c.id, this.draft(), this.draftTr());
  }

  discardDraft(): void {
    const c = this.selected();
    this.draft.set('');
    this.draftTr.set('');
    this.langBadge.set('');
    if (c) this.api.saveDraft(c.id, '', '');
  }

  async send(): Promise<void> {
    const c = this.selected();
    const text = this.draft().trim();
    if (!c || !text || this.sending()) return;

    this.sending.set(true);
    try {
      const updated = await this.api.send(c.id, text);
      this.selected.set(updated);
      this.replaceInList(updated);
      this.resetComposer();
      this.notify.success('Nachricht gesendet ✓');
    } catch (e: any) {
      this.notify.error('Nachricht konnte nicht gesendet werden: ' + (e?.message || ''));
    } finally {
      this.sending.set(false);
    }
  }

  // ── Hilfsmittel ───────────────────────────────────────────────────────────
  private resetComposer(): void {
    this.instruction.set('');
    this.draft.set('');
    this.draftTr.set('');
    this.langBadge.set('');
  }

  private replaceInList(updated: KleinanzeigenChat): void {
    this.chats.update((list) => list.map((c) => (c.id === updated.id ? updated : c)));
  }

  private markReadLocally(id: string): void {
    this.chats.update((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }

  initials(name: string): string {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '·';
    if (parts.length === 1) return parts[0].slice(0, 2);
    return parts[0][0] + parts[parts.length - 1][0];
  }

  time(ts: number): string {
    return new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  shortTime(ts: number): string {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }
}
