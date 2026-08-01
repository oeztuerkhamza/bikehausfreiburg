import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Kleinanzeigen-Nachrichten als Chat.
 *
 * Die Daten kommen aus dem serverseitig verbundenen Gmail-Postfach: Kleinanzeigen
 * leitet jede Nachricht eines Interessenten von einer eigenen Alias-Adresse weiter,
 * eine Antwort dorthin erscheint beim Interessenten wieder in der Kleinanzeigen-App.
 * Das Backend gruppiert die Mails zu Unterhaltungen (api/kleinanzeigenchat).
 */

export interface KleinanzeigenChatMessage {
  id: string;
  direction: 'in' | 'out';
  body: string;
  translation: string | null;
  ts: number;
  unread: boolean;
}

export interface KleinanzeigenAccount {
  connected: boolean;
  email: string | null;
  /** true = eigenes Konto; false = es läuft über das Konto des Mail-Assistenten. */
  ownAccount: boolean;
}

export interface KleinanzeigenChat {
  id: string;
  alias: string;
  peerName: string;
  adTitle: string;
  adId: string | null;
  threadId: string;
  updatedAt: number;
  unread: number;
  lastMessage: string;
  lastDirection: 'in' | 'out';
  draft: string;
  draftTr: string;
  messages: KleinanzeigenChatMessage[];
}

@Injectable({ providedIn: 'root' })
export class KleinanzeigenChatService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/kleinanzeigenchat`;

  /**
   * 409 = Gmail nicht (mehr) verbunden. Die Meldung des Servers nach vorn holen,
   * damit die Seite den Hinweis zeigt statt eines HTTP-Statuscodes.
   */
  private fail(err: any): never {
    const status = err?.status;
    const message = err?.error?.message || err?.message || 'Unbekannter Fehler';
    const e = new Error(message) as Error & { status?: number };
    e.status = status;
    throw e;
  }

  /** Welches Postfach die Chats gerade benutzen. */
  async account(): Promise<KleinanzeigenAccount> {
    try {
      return await firstValueFrom(this.http.get<KleinanzeigenAccount>(`${this.url}/account`));
    } catch {
      return { connected: false, email: null, ownAccount: false };
    }
  }

  /**
   * Verbindet ein eigenes Google-Konto NUR für die Kleinanzeigen-Chats.
   * Das Konto des Mail-Assistenten bleibt unangetastet — die Anzeigen laufen oft
   * über eine andere Adresse.
   */
  async connectAccount(): Promise<void> {
    const { url } = await firstValueFrom(
      this.http.get<{ url: string }>(`${environment.apiUrl}/gmail/auth-url`, {
        params: { account: 'kleinanzeigen' },
      }),
    );
    const popup = window.open(url, 'gmail_ka_oauth', 'width=520,height=680');
    if (!popup) throw new Error('Popup wurde blockiert.');

    await new Promise<void>((resolve, reject) => {
      let done = false;
      const finish = (fn: () => void) => {
        if (done) return;
        done = true;
        window.removeEventListener('message', onMessage);
        clearInterval(poll);
        fn();
      };
      const onMessage = (ev: MessageEvent) => {
        const d = ev.data;
        if (!d || typeof d !== 'object') return;
        if (d.type === 'gmail-connected') finish(resolve);
        else if (d.type === 'gmail-error') finish(() => reject(new Error(d.error || 'OAUTH_ERROR')));
      };
      window.addEventListener('message', onMessage);
      // Fallback: Fenster geschlossen → Status entscheidet.
      const poll = setInterval(async () => {
        if (popup.closed) {
          const st = await this.account();
          finish(st.ownAccount ? resolve : () => reject(new Error('CANCELLED')));
        }
      }, 800);
    });
  }

  /** Eigenes Kleinanzeigen-Konto abmelden (Mail-Konto bleibt verbunden). */
  async disconnectAccount(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.url}/account/disconnect`, {}));
  }

  async list(): Promise<KleinanzeigenChat[]> {
    try {
      return await firstValueFrom(this.http.get<KleinanzeigenChat[]>(`${this.url}/conversations`));
    } catch (err) {
      return this.fail(err);
    }
  }

  async get(id: string): Promise<KleinanzeigenChat> {
    try {
      return await firstValueFrom(
        this.http.get<KleinanzeigenChat>(`${this.url}/conversations/${encodeURIComponent(id)}`),
      );
    } catch (err) {
      return this.fail(err);
    }
  }

  /** Eingegangene Nachrichten ins Türkische übersetzen (einmalig, zentral gespeichert). */
  async translate(id: string): Promise<KleinanzeigenChat> {
    try {
      return await firstValueFrom(
        this.http.post<KleinanzeigenChat>(
          `${this.url}/conversations/${encodeURIComponent(id)}/translate`, {},
        ),
      );
    } catch (err) {
      return this.fail(err);
    }
  }

  /** Aus der türkischen Anweisung eine kurze Antwort erzeugen (landet als Entwurf). */
  async compose(id: string, instruction: string): Promise<KleinanzeigenChat> {
    try {
      return await firstValueFrom(
        this.http.post<KleinanzeigenChat>(
          `${this.url}/conversations/${encodeURIComponent(id)}/compose`, { instruction },
        ),
      );
    } catch (err) {
      return this.fail(err);
    }
  }

  async saveDraft(id: string, draft: string, draftTr: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put(`${this.url}/conversations/${encodeURIComponent(id)}/draft`, { draft, draftTr }),
      );
    } catch {
      /* Entwürfe sind Beiwerk – Fehler nicht nach vorn tragen. */
    }
  }

  async send(id: string, text: string): Promise<KleinanzeigenChat> {
    try {
      return await firstValueFrom(
        this.http.post<KleinanzeigenChat>(
          `${this.url}/conversations/${encodeURIComponent(id)}/send`, { text },
        ),
      );
    } catch (err) {
      return this.fail(err);
    }
  }

  async markRead(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.url}/conversations/${encodeURIComponent(id)}/read`, {}),
      );
    } catch {
      /* egal */
    }
  }
}
