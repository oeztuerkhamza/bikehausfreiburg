import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AccessDeadlineService } from '../services/access-deadline.service';

/** Pfad der Sperrseite — an einer Stelle, damit Guards und Routen übereinstimmen. */
export const ACCESS_LOCKED_PATH = 'zugang-gesperrt';

/**
 * Sperrt eine Route, sobald die Frist abgelaufen ist. Der authGuard trägt
 * dieselbe Prüfung, deshalb hängt dieser Guard nur an den Routen ohne
 * Anmeldepflicht (dem Login) — sonst käme man nach Ablauf noch an das
 * Anmeldeformular und erst nach dem Anmelden an die Sperrseite.
 */
export const accessDeadlineGuard: CanActivateFn = () => {
  const deadline = inject(AccessDeadlineService);
  const router = inject(Router);

  if (deadline.expired()) {
    router.navigate(['/' + ACCESS_LOCKED_PATH]);
    return false;
  }

  return true;
};

/** Umgekehrt: die Sperrseite selbst ist nur nach Ablauf der Frist erreichbar. */
export const accessLockedPageGuard: CanActivateFn = () => {
  const deadline = inject(AccessDeadlineService);
  const router = inject(Router);

  if (deadline.expired()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
