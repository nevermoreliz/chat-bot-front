import { Routes } from '@angular/router';
import { LayoutAdmin } from './layout-admin/layout-admin';
import { Home } from './pages-admin/home/home';
import { isAdminGuard } from '../auth/guards/is-admin-guard';
import { PerfilPage } from './pages-agente/perfil-page/perfil-page';
import { UsuariosPage } from './pages-admin/usuarios-page/usuarios-page';

export const adminRoutes: Routes = [
    {
        path: '',
        component: LayoutAdmin,
        canMatch: [isAdminGuard],
        children: [
            {
                path: 'home',
                component: Home,
            },
            {
                path: 'perfil',
                component: PerfilPage,
            },
            {
                path: 'usuarios-listar',
                component: UsuariosPage,
            },
            {
                path: '**',
                redirectTo: 'home'
            }
        ]
    }
];

export default adminRoutes;
