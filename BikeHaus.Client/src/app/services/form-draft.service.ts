import { Injectable } from '@angular/core';

interface StoredDraft<T> {
  version: number;
  savedAt: number;
  data: T;
}

/**
 * Gemeinsamer Mechanismus, damit Eingaben in "Neu"-Formularen ein Neuladen
 * der Seite, die Zurück-Taste oder einen App-Wechsel überleben (Ladentisch-
 * Problem: der Inhaber tippt etwas, das Handy wirft die Seite weg, alles
 * weg). Bewusst sessionStorage (Inhaber-Entscheidung) — beim Schließen des
 * Tabs ist der Entwurf weg, damit auf einem Ladengerät keine Kundenadresse
 * dauerhaft liegen bleibt.
 *
 * Dieser Service kennt nur Speichern/Lesen/Löschen unter einem Schlüssel.
 * Was tatsächlich in einen Entwurf darf, entscheidet jede Formular-
 * Komponente selbst — Feld für Feld, nie per Spread über den ganzen
 * Komponenten-Zustand (siehe rental-booking-steps.component.ts in der
 * Homepage: ein Spread hat dort einmal einen Kontext-Wert, der nie
 * Nutzereingabe war, unbeabsichtigt mit reingezogen).
 */
@Injectable({ providedIn: 'root' })
export class FormDraftService {
  private isAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && !!window.sessionStorage;
    } catch {
      return false;
    }
  }

  /**
   * Schreibt den Entwurf. Ein voller/gesperrter Storage darf nie eine Eingabe
   * zum Absturz machen.
   *
   * Ein Formular, in dem noch nichts steht, wird **nicht** gespeichert (der
   * Eintrag wird stattdessen weggeräumt). Die Formulare speichern im Takt, also
   * auch direkt nach dem Öffnen: ohne diese Prüfung läge nach dem ersten
   * Intervall ein leerer Entwurf im Storage, und ein Neuladen begrüßte den
   * Inhaber mit "Entwurf wiederhergestellt" über einem leeren Formular. Ein
   * Hinweis, der auch dann erscheint, wenn es nichts zu berichten gibt, wird
   * genau so schnell zum Hinweis, den niemand mehr liest.
   */
  save<T>(key: string, data: T, version = 1): void {
    if (!this.isAvailable()) return;
    if (!FormDraftService.hasContent(data)) {
      this.clear(key);
      return;
    }
    try {
      const entry: StoredDraft<T> = { version, savedAt: Date.now(), data };
      window.sessionStorage.setItem(key, JSON.stringify(entry));
    } catch {
      // sessionStorage voll/deaktiviert — ein verlorener Autosave ist kein Fehlerfall.
    }
  }

  /**
   * Steckt irgendwo eine echte Eingabe drin? Leere Zeichenketten, 0, false,
   * null und leere Listen/Objekte zählen nicht — das sind die Werte, mit denen
   * ein Formular aufgeht. Absichtlich konservativ: schlägt die Prüfung fehl,
   * geht nur ein Autosave verloren, nichts Gespeichertes.
   */
  private static hasContent(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return Number.isFinite(value) && value !== 0;
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.some((v) => this.hasContent(v));
    if (typeof value === 'object') {
      return Object.values(value as Record<string, unknown>).some((v) =>
        this.hasContent(v),
      );
    }
    return false;
  }

  /**
   * Liefert die Nutzdaten, wenn ein Entwurf existiert, die erwartete Version
   * trägt und nicht älter als maxAgeMs ist. Jede Abweichung — kaputtes JSON,
   * falsche Version, fremde/fehlende Struktur, zu alt — räumt den Eintrag
   * weg und liefert null statt einer Ausnahme, die das Formular unbenutzbar
   * macht.
   */
  load<T>(key: string, maxAgeMs: number, version = 1): T | null {
    if (!this.isAvailable()) return null;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<StoredDraft<T>> | null;
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        parsed.version !== version ||
        typeof parsed.savedAt !== 'number' ||
        parsed.data === undefined ||
        parsed.data === null
      ) {
        this.clear(key);
        return null;
      }
      if (Date.now() - parsed.savedAt > maxAgeMs) {
        this.clear(key);
        return null;
      }
      return parsed.data as T;
    } catch {
      this.clear(key);
      return null;
    }
  }

  clear(key: string): void {
    if (!this.isAvailable()) return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
