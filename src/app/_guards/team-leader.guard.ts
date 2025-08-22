import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const teamLeaderGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (user?.NetID) {
    return true; 
  }

  router.navigate(['/login']);
  return false;
};
