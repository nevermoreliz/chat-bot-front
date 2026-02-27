import { Routes } from '@angular/router';
import { LayoutAdmin } from './layout-admin/layout-admin';
import { Home } from './pages-admin/home/home';

export const adminRoutes: Routes = [
    {
        path: '',
        component: LayoutAdmin,
        children: [
            {
                path: 'home',
                component: Home,
            },
            {
                path: '**',
                redirectTo: 'home'
            }
        ]
    }
];

export default adminRoutes;
