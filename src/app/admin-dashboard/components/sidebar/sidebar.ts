import { Component, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { MenuItem } from './interfaces/menu-item.interface';
import { AuthService } from '../../../auth/services/auth-service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styles: ``,
})
export class Sidebar {

  layoutService = inject(LayoutService);
  authService = inject(AuthService);
  private router = inject(Router);

  menuItems: MenuItem[] = []
  userRoles: (string | number)[] = []
  currentUrl: string = ''

  ngOnInit(): void {

    // obtener roles del authService
    this.userRoles = this.authService.user()?.roles ?? [];
    // console.log('roles 🆘🆘🆘', this.userRoles);

    // suscribirse a los eventos de navegacion para acutalizar el estado activo
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentUrl = this.router.url;
      this.actualizarEstadoActivo();
    });

    // inicializar con la url actual
    this.currentUrl = this.router.url;

    this.loadMenuItems();
  }


  loadMenuItems() {

    this.menuItems = [
      {
        title: 'Dashboard',
        icon: 'pi pi-home',
        route: '/admin/home',
        roles: ['administrador']
      },
      {
        title: 'Menu',
        heading: true,
        roles: ['administrador']
      },
      {
        title: 'Roles',
        icon: 'pi pi-shield',
        route: '/admin/roles',
        roles: ['administrador']
      },
      {
        title: 'Usuarios',
        icon: 'pi pi-users',
        roles: ['administrador'],
        submenu: [
          {
            title: 'Lista de Usuarios',
            route: './usuario',
            roles: ['administrador']
          },
          {
            title: 'Proyectos',
            route: '/pages/user-profile/projects',
            roles: ['administrador']
          },
          {
            title: 'Campañas',
            route: '/pages/user-profile/campaigns',
            roles: ['administrador']
          },
          {
            title: 'Documentos',
            route: '/pages/user-profile/documents',
            roles: ['administrador']
          },
          {
            title: 'Seguidores',
            route: '/pages/user-profile/followers',
            roles: ['administrador']
          },
          {
            title: 'Actividad',
            route: '/pages/user-profile/activity',
            roles: ['administrador']
          }
        ]
      }
    ];

    // filtrar elementos del menu segun los roles del usuario
    this.menuItems = this.filtrarElementosPorRoles(this.menuItems);

    // actualziar el estado activo inicial
    this.actualizarEstadoActivo();

  }


  actualizarEstadoActivo(): void {
    this.recorrerYactualizarEstado(this.menuItems);
  }



  filtrarElementosPorRoles(items: MenuItem[]): MenuItem[] {

    return items.filter((item) => {
      // si no tiene roles definidos, mostrar todos
      if (!item.roles) return true

      // verificar si algun rol del usuario coincide con los roles permitidos para ese elemento
      const hasPermission = item.roles.some((role) => this.userRoles.includes(role));

      if (hasPermission && item.submenu) {
        item.submenu = this.filtrarElementosPorRoles(item.submenu);
        // si el submenu esta vacio despues de filtrar no mostrar el elemento padre
        return item.submenu.length > 0;
      }

      return hasPermission;

    })

  }




  recorrerYactualizarEstado(items: MenuItem[]): boolean {
    let hayElementoActivo = false;

    items.forEach(item => {

      // omitir encabezados
      if (item.heading) return;

      // resetear el estado acticvo
      item.active = false;

      // verificar si este elemento tiene una ruta y coincide con la URL actual
      if (item.route) {
        // para la ruta raiz verificar exactamente
        if (item.route === '/' && this.currentUrl === '/') {
          item.active = true;
          hayElementoActivo = true;
        }

        // para otras RouterState, verificar si la url actual comienza con la ruta del elemento usamos normalizacion de rutas para mejorar './' y rutas relativas
        else if (item.route !== '/') {
          const normalizeRoute = item.route.startsWith('./') ? item.route.substring(1) : item.route;

          if (this.currentUrl.startsWith(normalizeRoute)) {
            item.active = true;
            hayElementoActivo = true;
          }
        }
      }

      // si tiene submenu verificar recursivamente
      if (item.submenu) {
        const submenuActivo = this.recorrerYactualizarEstado(item.submenu);

        // si hay un elemento activo en el submenu, marcar el padre como activo y expandido
        if (submenuActivo) {
          item.active = true;
          hayElementoActivo = true;
        }
      }

    });

    return hayElementoActivo;
  }



}




