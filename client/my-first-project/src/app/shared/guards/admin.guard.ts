import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const r = inject(Router);
  return inject(AuthService).checkAdmin().pipe(map(isAuthenticated => {
    if (!isAuthenticated) {
      // navigation
      r.navigateByUrl('/timeline');
      return false;
    } else {
      return true;
    }
  }), catchError(error => {
    console.log(error);
    r.navigateByUrl('/timeline');
    return of(false);
  }));
};
