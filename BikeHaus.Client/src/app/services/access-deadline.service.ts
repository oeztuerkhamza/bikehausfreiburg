import { Injectable, computed, signal } from '@angular/core';

/**
 * Feste Frist für den Zugang zum Admin-Bereich.
 *
 * Bewusst ein fest im Code hinterlegtes Datum und kein Wert aus den
 * Einstellungen oder dem localStorage: ein Wert aus den Einstellungen liesse
 * sich im Adminbereich selbst verschieben, ein localStorage-Wert wäre mit
 * einem anderen Browser oder geleertem Speicher zurückgesetzt. So sehen alle
 * Benutzer denselben Countdown, und das Verschieben der Frist ist ein
 * bewusster Schritt im Code.
 *
 * Der Monat ist nullbasiert: 9 = Oktober. Absichtlich der Konstruktor und
 * kein `new Date('2026-10-25')` — ein reiner Datums-String wird nach
 * ECMAScript als UTC gelesen, der Konstruktor nimmt die lokale Zeit.
 */
export const ACCESS_DEADLINE = new Date(2026, 9, 25, 0, 0, 0);

/** Verbleibende Zeit bis {@link ACCESS_DEADLINE}, auf Null begrenzt. */
export interface AccessRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Injectable({ providedIn: 'root' })
export class AccessDeadlineService {
  readonly deadline = ACCESS_DEADLINE;

  private readonly now = signal(Date.now());

  constructor() {
    // Sekundentakt, damit der Countdown wirklich läuft und nicht erst beim
    // nächsten Seitenwechsel springt.
    setInterval(() => this.now.set(Date.now()), 1000);
  }

  readonly remaining = computed<AccessRemaining>(() => {
    const totalMs = Math.max(0, this.deadline.getTime() - this.now());
    const totalSeconds = Math.floor(totalMs / 1000);
    return {
      totalMs,
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  });

  /** Frist abgelaufen — ab hier ist der Adminbereich gesperrt. */
  readonly expired = computed(() => this.remaining().totalMs <= 0);

  /** Letzte drei Tage: der Countdown wird rot. */
  readonly urgent = computed(() => !this.expired() && this.remaining().days < 3);
}
