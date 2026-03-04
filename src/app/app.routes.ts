import { Routes } from '@angular/router';
import { notAuthenticatedGuard } from './auth/guards/not-authenticated-guard';

export const routes: Routes = [
    // {
    //     path: 'auth',
    //     loadChildren: () => import('./auth/auth.routes')
    // },
    {
        path: 'admin',
        loadChildren: () => import('./admin-dashboard/admin.routes')
    },
    {
        path: '',
        loadChildren: () => import('./auth/auth.routes'),
        canMatch: [notAuthenticatedGuard]
    },

];
