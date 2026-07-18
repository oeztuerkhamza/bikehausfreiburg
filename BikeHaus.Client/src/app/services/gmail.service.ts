import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Gmail-Anbindung für den KI-E-Mail-Assistenten.
 *
 * Login läuft über Google Identity Services (GIS) im Browser (OAuth2 Token-Flow).
 * Der Gmail-Zugriff (Lesen/Senden) erfolgt direkt per fetch gegen die Gmail-REST-API
 * mit dem OAuth-Access-Token – bewusst NICHT über Angular HttpClient, damit der
 * BikeHaus-JWT (Auth-Interceptor) nicht an Google gesendet wird.
 *
 * Voraussetzung: eine Google-OAuth-2.0-Web-Client-ID mit den Gmail-Scopes.
 * Diese kann per environment.googleClientId gesetzt oder in der App eingegeben
 * (localStorage) werden.
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

const SCOPES = [
  // modify enthält Lesezugriff + Labels ändern (gelesen/ungelesen) + Papierkorb.
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
].join(' ');

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';
const CLIENT_ID_KEY = 'bh_gmail_client_id';
const TOKEN_KEY = 'bh_gmail_token';
const TOKEN_EXP_KEY = 'bh_gmail_token_exp';
const EMAIL_KEY = 'bh_gmail_email';
const SESSION_KEY = 'bh_gmail_session';

@Injectable({ providedIn: 'root' })
export class GmailService {
  readonly connected = signal(false);
  readonly connecting = signal(false);
  readonly userEmail = signal<string>('');

  private accessToken: string | null = null;
  private tokenExpiry = 0;
  private tokenClient: any = null;
  private gisLoading: Promise<void> | null = null;

  constructor() {
    // Gespeicherte Sitzung wiederherstellen, damit ein Seiten-Reload nicht
    // sofort abmeldet. Ein noch gültiges Token wird direkt weiterverwendet;
    // andernfalls versucht tryRestore() ein stilles Erneuern.
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      const exp = Number(localStorage.getItem(TOKEN_EXP_KEY) || 0);
      const email = localStorage.getItem(EMAIL_KEY) || '';
      if (email) this.userEmail.set(email);
      if (t && Date.now() < exp - 60_000) {
        this.accessToken = t;
        this.tokenExpiry = exp;
        this.connected.set(true);
      }
    } catch {
      /* localStorage nicht verfügbar */
    }
  }

  // ── Client-ID Verwaltung ───────────────────────────────────────────────
  getClientId(): string {
    return localStorage.getItem(CLIENT_ID_KEY) || environment.googleClientId || '';
  }

  setClientId(id: string): void {
    const trimmed = (id || '').trim();
    if (trimmed) localStorage.setItem(CLIENT_ID_KEY, trimmed);
    else localStorage.removeItem(CLIENT_ID_KEY);
    // Token-Client bei Änderung neu aufbauen
    this.tokenClient = null;
  }

  // ── Login / Logout ─────────────────────────────────────────────────────
  async connect(): Promise<void> {
    const clientId = this.getClientId();
    if (!clientId) throw new Error('NO_CLIENT_ID');

    this.connecting.set(true);
    try {
      await this.loadGis();
      await this.requestToken(clientId);
      await this.loadProfile();
      localStorage.setItem(SESSION_KEY, '1');
      this.connected.set(true);
    } finally {
      this.connecting.set(false);
    }
  }

  /**
   * Stellt nach einem Seiten-Reload die Verbindung wieder her – ohne erneutes
   * Anklicken/Zustimmen, solange der Nutzer im Browser bei Google angemeldet ist
   * und die Berechtigung schon einmal erteilt wurde.
   */
  async tryRestore(): Promise<boolean> {
    // Noch gültiges Token im Speicher? Dann sind wir bereits verbunden.
    if (this.accessToken && Date.now() < this.tokenExpiry - 60_000) {
      this.connected.set(true);
      if (!this.userEmail()) {
        try { await this.loadProfile(); } catch { /* ignore */ }
      }
      return true;
    }

    const hadSession = localStorage.getItem(SESSION_KEY) === '1';
    const clientId = this.getClientId();
    if (!hadSession || !clientId) return false;

    try {
      await this.loadGis();
      await this.requestToken(clientId, true); // silent
      await this.loadProfile();
      this.connected.set(true);
      return true;
    } catch {
      // Stilles Erneuern fehlgeschlagen → Nutzer muss einmal neu verbinden.
      this.connected.set(false);
      return false;
    }
  }

  disconnect(): void {
    const token = this.accessToken;
    if (token && (window as any).google?.accounts?.oauth2) {
      try {
        (window as any).google.accounts.oauth2.revoke(token, () => {});
      } catch {
        /* ignore */
      }
    }
    this.accessToken = null;
    this.tokenExpiry = 0;
    this.connected.set(false);
    this.userEmail.set('');
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXP_KEY);
      localStorage.removeItem(EMAIL_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }

  private persistToken(): void {
    try {
      if (this.accessToken) {
        localStorage.setItem(TOKEN_KEY, this.accessToken);
        localStorage.setItem(TOKEN_EXP_KEY, String(this.tokenExpiry));
        localStorage.setItem(SESSION_KEY, '1');
      }
    } catch {
      /* ignore */
    }
  }

  // ── Gmail-Operationen ──────────────────────────────────────────────────
  async listInbox(query = '', maxResults = 20): Promise<GmailListItem[]> {
    const params = new URLSearchParams({
      maxResults: String(maxResults),
      labelIds: 'INBOX',
    });
    if (query) params.set('q', query);

    const list = await this.api<{ messages?: { id: string; threadId: string }[] }>(
      `/messages?${params.toString()}`,
    );
    const ids = list.messages ?? [];
    const items = await Promise.all(ids.map((m) => this.getListItem(m.id)));
    return items.filter((x): x is GmailListItem => x !== null);
  }

  async getMessage(id: string): Promise<GmailMessage> {
    const msg = await this.api<any>(`/messages/${id}?format=full`);
    const headers: { name: string; value: string }[] = msg.payload?.headers ?? [];
    const h = (name: string) =>
      headers.find((x) => x.name.toLowerCase() === name.toLowerCase())?.value ?? '';
    const from = this.parseAddress(h('From'));
    return {
      id: msg.id,
      threadId: msg.threadId,
      messageIdHeader: h('Message-ID') || h('Message-Id'),
      references: h('References'),
      fromName: from.name,
      fromEmail: from.email,
      to: h('To'),
      subject: h('Subject'),
      date: h('Date'),
      body: this.extractBody(msg.payload),
    };
  }

  /**
   * Sendet eine Antwort im gleichen Thread (In-Reply-To / References gesetzt),
   * damit sie beim Kunden als Antwort erscheint.
   */
  async sendReply(opts: {
    to: string;
    subject: string;
    body: string;
    threadId: string;
    inReplyTo: string;
    references: string;
  }): Promise<void> {
    const raw = this.buildRawMessage(opts);
    await this.api(`/messages/send`, {
      method: 'POST',
      body: JSON.stringify({ raw, threadId: opts.threadId }),
    });
  }

  /** Markiert eine Nachricht als gelesen (entfernt das UNREAD-Label). */
  async markAsRead(id: string): Promise<void> {
    await this.api(`/messages/${id}/modify`, {
      method: 'POST',
      body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
    });
  }

  /** Verschiebt eine Nachricht in den Papierkorb (wiederherstellbar in Gmail). */
  async trashMessage(id: string): Promise<void> {
    await this.api(`/messages/${id}/trash`, { method: 'POST' });
  }

  // ── intern: GIS + Token ────────────────────────────────────────────────
  private loadGis(): Promise<void> {
    if ((window as any).google?.accounts?.oauth2) return Promise.resolve();
    if (this.gisLoading) return this.gisLoading;
    this.gisLoading = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('GIS_LOAD_FAILED')));
        return;
      }
      const script = document.createElement('script');
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('GIS_LOAD_FAILED'));
      document.head.appendChild(script);
    });
    return this.gisLoading;
  }

  private requestToken(clientId: string, silent = false): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const google = (window as any).google;
      const onResp = (resp: any) => {
        if (resp.error) {
          reject(new Error(resp.error));
          return;
        }
        this.accessToken = resp.access_token;
        this.tokenExpiry = Date.now() + (Number(resp.expires_in) || 3600) * 1000;
        this.persistToken();
        resolve();
      };
      const onErr = (err: any) => reject(new Error(err?.type || 'OAUTH_ERROR'));

      if (!this.tokenClient) {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPES,
          callback: onResp,
          error_callback: onErr,
        });
      } else {
        this.tokenClient.callback = onResp;
        this.tokenClient.error_callback = onErr;
      }
      // silent = kein UI (nur wenn Session + Zustimmung schon vorhanden);
      // sonst nur bei fehlendem Token einmal Zustimmung anfordern.
      const prompt = silent ? '' : this.accessToken ? '' : 'consent';
      this.tokenClient.requestAccessToken({ prompt });
    });
  }

  private async ensureToken(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry - 60_000) return;
    const clientId = this.getClientId();
    if (!clientId) throw new Error('NO_CLIENT_ID');
    await this.loadGis();
    // Beim Ablauf mitten in der Sitzung still erneuern (Nutzer hat schon zugestimmt).
    await this.requestToken(clientId, true);
  }

  private async loadProfile(): Promise<void> {
    try {
      const p = await this.api<{ emailAddress?: string }>('/profile');
      if (p.emailAddress) {
        this.userEmail.set(p.emailAddress);
        try { localStorage.setItem(EMAIL_KEY, p.emailAddress); } catch { /* ignore */ }
      }
    } catch {
      /* ignore */
    }
  }

  private async api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
    await this.ensureToken();
    const res = await fetch(`${GMAIL_API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
    if (res.status === 401) {
      // Token abgelaufen/ungültig → einmal erneuern und wiederholen
      this.accessToken = null;
      await this.ensureToken();
      const retry = await fetch(`${GMAIL_API}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...(init.headers || {}),
        },
      });
      if (!retry.ok) throw new Error(`Gmail API ${retry.status}`);
      return retry.status === 204 ? (undefined as T) : ((await retry.json()) as T);
    }
    if (!res.ok) throw new Error(`Gmail API ${res.status}`);
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }

  private async getListItem(id: string): Promise<GmailListItem | null> {
    try {
      const msg = await this.api<any>(
        `/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
      );
      const headers: { name: string; value: string }[] = msg.payload?.headers ?? [];
      const h = (name: string) =>
        headers.find((x) => x.name.toLowerCase() === name.toLowerCase())?.value ?? '';
      const from = this.parseAddress(h('From'));
      return {
        id: msg.id,
        threadId: msg.threadId,
        fromName: from.name,
        fromEmail: from.email,
        subject: h('Subject') || '(kein Betreff)',
        snippet: this.decodeEntities(msg.snippet ?? ''),
        date: h('Date'),
        unread: (msg.labelIds ?? []).includes('UNREAD'),
      };
    } catch {
      return null;
    }
  }

  // ── Parsing / Encoding Helfer ──────────────────────────────────────────
  private parseAddress(raw: string): { name: string; email: string } {
    if (!raw) return { name: '', email: '' };
    const match = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
    if (match) return { name: match[1].trim(), email: match[2].trim() };
    return { name: '', email: raw.trim() };
  }

  private extractBody(payload: any): string {
    if (!payload) return '';
    const plain = this.findPart(payload, 'text/plain');
    if (plain) return this.decodeB64Url(plain);
    const html = this.findPart(payload, 'text/html');
    if (html) return this.htmlToText(this.decodeB64Url(html));
    if (payload.body?.data) return this.decodeB64Url(payload.body.data);
    return '';
  }

  private findPart(part: any, mime: string): string | null {
    if (part.mimeType === mime && part.body?.data) return part.body.data;
    if (part.parts) {
      for (const p of part.parts) {
        const found = this.findPart(p, mime);
        if (found) return found;
      }
    }
    return null;
  }

  private decodeB64Url(data: string): string {
    try {
      const b64 = data.replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch {
      return '';
    }
  }

  private htmlToText(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html
      .replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<\/\s*p\s*>/gi, '\n\n')
      .replace(/<\/\s*div\s*>/gi, '\n');
    return (div.textContent || div.innerText || '').replace(/\n{3,}/g, '\n\n').trim();
  }

  private decodeEntities(text: string): string {
    const el = document.createElement('textarea');
    el.innerHTML = text;
    return el.value;
  }

  private buildRawMessage(opts: {
    to: string;
    subject: string;
    body: string;
    inReplyTo: string;
    references: string;
  }): string {
    const from = this.userEmail() || 'me';
    const subject = `=?UTF-8?B?${this.utf8ToB64(opts.subject)}?=`;
    const refs = [opts.references, opts.inReplyTo].filter(Boolean).join(' ');
    const headers = [
      `From: ${from}`,
      `To: ${opts.to}`,
      `Subject: ${subject}`,
      opts.inReplyTo ? `In-Reply-To: ${opts.inReplyTo}` : '',
      refs ? `References: ${refs}` : '',
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
    ].filter(Boolean);
    const bodyB64 = this.utf8ToB64(opts.body).replace(/(.{76})/g, '$1\r\n');
    const mime = `${headers.join('\r\n')}\r\n\r\n${bodyB64}`;
    return this.b64Url(mime);
  }

  private utf8ToB64(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }

  private b64Url(str: string): string {
    // str kann bereits Nicht-ASCII enthalten (MIME-Header). Über UTF-8 kodieren.
    return this.utf8ToB64(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
