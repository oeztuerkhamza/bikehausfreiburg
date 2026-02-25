import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  // Login disabled - always allow access
  return true;
};
