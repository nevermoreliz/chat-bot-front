import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { MenuItem } from './interfaces/menu-item.interface';
import { AuthService } from '../../../auth/services/auth-service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [NgTemplateOutlet, RouterLink],
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

    // inicializar con la url actual *
    this.currentUrl = this.router.url;

    this.loadMenuItems();
  }


  loadMenuItems() {

    this.menuItems = [
      {
        title: 'Dashboard',
        svgIcon: 'M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z',
        tooltip: 'Overview',
        route: '/admin/home',
        roles: ['administrador', 'agente']
      },
      {
        title: 'Menu Administrador',
        heading: true,
        roles: ['administrador']
      },

      {
        title: 'Gestion de Usuarios',
        svgIcon: 'M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19h12.32a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z',
        tooltip: 'Gestion de Usuarios',
        roles: ['administrador'],
        submenu: [
          { title: 'Listar Usuarios', route: '/admin/gestion-usuarios/listar' },
          { title: 'Crear Usuario', route: '/admin/gestion-usuarios/crear' },
        ]
      },

      {
        title: 'Roles',
        svgIcon: 'M10 2a3.5 3.5 0 0 0-3.5 3.5V7A3 3 0 0 0 3.5 10v7A3 3 0 0 0 6.5 20h7a3 3 0 0 0 3-3v-7A3 3 0 0 0 13.5 7v-1.5A3.5 3.5 0 0 0 10 2Zm1 5V5.5a1.5 1.5 0 1 0-3 0V7h3Z',
        tooltip: 'Roles',
        route: '/admin/roles',
        roles: ['administrador']
      },



      {
        title: 'Menu Agente',
        heading: true,
        roles: ['administrador', 'agente']
      },
      {
        title: 'Project Planning',
        svgIcon: 'M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z',
        tooltip: 'Project Planning',
        route: '/admin/project-planning',
        roles: ['administrador']
      },

      {
        title: 'Configuracion Perfil',
        heading: true,
        roles: ['administrador', 'agente']
      },
      {
        title: 'Configuracion Perfil',
        svgIcon: 'M10 2a3.5 3.5 0 0 0-3.5 3.5V7A3 3 0 0 0 3.5 10v7A3 3 0 0 0 6.5 20h7a3 3 0 0 0 3-3v-7A3 3 0 0 0 13.5 7v-1.5A3.5 3.5 0 0 0 10 2Zm1 5V5.5a1.5 1.5 0 1 0-3 0V7h3Z',
        tooltip: 'Configuracion Perfil',
        roles: ['administrador', 'agente'],
        submenu: [
          { title: 'Perfil', route: '/admin/perfil' },
          { title: 'Cambiar Contraseña', route: '/admin/perfil/cambiar-contrasena' },
        ]
      },

      // Ejemplo estructura para menus y submenus

      // {
      //   title: 'Usuarios',
      //   svgIcon: 'M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.047 7.047 0 0 1 0-2.228l-1.267-1.113a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.993 6.993 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
      //   tooltip: 'Usuarios',
      //   roles: ['administrador'],
      //   submenu: [
      //     {
      //       title: 'Account Home',
      //       submenu: [
      //         { title: 'Get Started', route: '/admin/account/home/get-started' },
      //         { title: 'User Profile', route: '/admin/account/home/user-profile' },
      //         { title: 'Company Profile', route: '/admin/account/home/company-profile' },
      //       ]
      //     },
      //     { title: 'Billing', route: '/admin/account/billing/basic' },
      //   ]
      // }

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




