import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AccessDeadlineService } from '../services/access-deadline.service';
import { ACCESS_LOCKED_PATH } from './access-deadline.guard';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const accessDeadline = inject(AccessDeadlineService);
  const router = inject(Router);

  // Die Frist steht vor der Anmeldung: nach Ablauf führt jede geschützte
  // Route auf die Sperrseite, auch mit gültigem Token.
  if (accessDeadline.expired()) {
    router.navigate(['/' + ACCESS_LOCKED_PATH]);
    return false;
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
