import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { firstValueFrom } from 'rxjs';

export const isAdminGuard: CanMatchFn = async (route, segments) => {

  const authService = inject(AuthService);

  // verificar si es admin valor
  // console.log('isAdminGuard ⭕⭕⭕', authService.isAdmin());


  const router = inject(Router);

  await firstValueFrom(authService.checkStatus());

  if (authService.isAdmin()) {
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};
