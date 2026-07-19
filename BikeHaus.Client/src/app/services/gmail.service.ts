import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Gmail-Anbindung über das BikeHaus-Backend.
 *
 * Die eigentliche Verbindung (OAuth-Refresh-Token) liegt zentral auf dem Server –
 * einmal verbinden, danach von jedem Rechner und Browser aus (mit Admin-Login) nutzbar,
 * ohne erneute Google-Anmeldung. Alle Gmail-Operationen laufen über die eigene API,
 * daher wird hier bewusst der Angular HttpClient (mit JWT-Interceptor) genutzt.
 */

export interface GmailListItem {
  id: string;
  threadId: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  messageIdHeader: string;
  references: string;
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  date: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class GmailService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/gmail`;

  readonly connected = signal(false);
  readonly connecting = signal(false);
  readonly userEmail = signal<string>('');

  // ── Status / Verbindung ─────────────────────────────────────────────────
  async refreshStatus(): Promise<boolean> {
    try {
      const s = await firstValueFrom(
        this.http.get<{ connected: boolean; email: string | null }>(`${this.url}/status`),
      );
      this.connected.set(!!s.connected);
      this.userEmail.set(s.email || '');
      return !!s.connected;
    } catch {
      this.connected.set(false);
      return false;
    }
  }

  /** Alias – beim Laden der Seite prüfen, ob die (server-seitige) Verbindung besteht. */
  tryRestore(): Promise<boolean> {
    return this.refreshStatus();
  }

  /** Öffnet das Google-Login in einem Popup und wartet auf den Abschluss. */
  async connect(): Promise<void> {
    this.connecting.set(true);
    try {
      const { url } = await firstValueFrom(
        this.http.get<{ url: string }>(`${this.url}/auth-url`),
      );
      const popup = window.open(url, 'gmail_oauth', 'width=520,height=680');
      if (!popup) throw new Error('POPUP_BLOCKED');

      await this.waitForConnection(popup);
      await this.refreshStatus();
      if (!this.connected()) throw new Error('NOT_CONNECTED');
    } finally {
      this.connecting.set(false);
    }
  }

  private waitForConnection(popup: Window): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let done = false;
      const finish = (fn: () => void) => {
        if (done) return;
        done = true;
        window.removeEventListener('message', onMessage);
        clearInterval(poll);
        fn();
      };

      const onMessage = (ev: MessageEvent) => {
        const data = ev.data;
        if (!data || typeof data !== 'object') return;
        if (data.type === 'gmail-connected') finish(resolve);
        else if (data.type === 'gmail-error') finish(() => reject(new Error(data.error || 'OAUTH_ERROR')));
      };
      window.addEventListener('message', onMessage);

      // Fallback: Popup geschlossen oder Nachricht verpasst → Status pollen.
      const poll = setInterval(async () => {
        if (popup.closed) {
          const ok = await this.refreshStatus();
          finish(ok ? resolve : () => reject(new Error('CANCELLED')));
        }
      }, 800);
    });
  }

  async disconnect(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.url}/disconnect`, {}));
    } catch {
      /* ignore */
    }
    this.connected.set(false);
    this.userEmail.set('');
  }

  // ── Gmail-Operationen ───────────────────────────────────────────────────
  listInbox(query = '', maxResults = 20): Promise<GmailListItem[]> {
    const params: Record<string, string> = { max: String(maxResults) };
    if (query) params['q'] = query;
    return firstValueFrom(
      this.http.get<GmailListItem[]>(`${this.url}/messages`, { params }),
    );
  }

  getMessage(id: string): Promise<GmailMessage> {
    return firstValueFrom(this.http.get<GmailMessage>(`${this.url}/messages/${id}`));
  }

  async markAsRead(id: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.url}/messages/${id}/read`, {}));
  }

  async trashMessage(id: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.url}/messages/${id}/trash`, {}));
  }

  async sendReply(opts: {
    to: string;
    subject: string;
    body: string;
    threadId: string;
    inReplyTo: string;
    references: string;
  }): Promise<void> {
    await firstValueFrom(this.http.post(`${this.url}/send`, opts));
  }
}
