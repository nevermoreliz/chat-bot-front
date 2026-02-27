import { Routes } from '@angular/router';
import { LayoutAuth } from './layout-auth/layout-auth';
import { Login } from './pages-auth/login/login';

export const authRoutes: Routes = [

    {
        path: '',
        component: LayoutAuth,
        children: [
            {
                path: 'login',
                component: Login,
            },
            {
                path: '**',
                redirectTo: 'login'
            }
        ]
    }

];

export default authRoutes;
