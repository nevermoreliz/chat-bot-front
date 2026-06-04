import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { MenuItem } from './interfaces/menu-item.interface';
import { AuthService } from '../../../auth/services/auth-service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Rol } from '../../interfaces/rol.interface';
import { DomSanitizer } from '@angular/platform-browser';

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
  private sanitizer = inject(DomSanitizer);

  menuItems: MenuItem[] = []
  userRoles: (string | number | Rol)[] = []
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
        svgIcon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1em" viewBox="0 0 640 512">
    		  <path d="M0 0h640v512H0z" fill="none" />
		      <path fill="currentColor" d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64m448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64m32 32h-64c-17.6 0-33.5 7.1-45.1 18.6c40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64m-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32S208 82.1 208 144s50.1 112 112 112m76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2m-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4" />
        </svg>
        `,
        tooltip: 'Gestion de Usuarios',
        route: '/admin/usuarios-listar',
        roles: ['administrador']
      },

      {
        title: 'Roles',
        svgIcon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
        	<path d="M0 0h32v32H0z" fill="none" />
        	<path fill="currentColor" d="M19.307 3.21a2.91 2.91 0 1 0-.223 1.94a11.64 11.64 0 0 1 8.232 7.049l1.775-.698a13.58 13.58 0 0 0-9.784-8.291m-2.822 1.638a.97.97 0 1 1 0-1.939a.97.97 0 0 1 0 1.94m-4.267.805l-.717-1.774a13.58 13.58 0 0 0-8.291 9.784a2.91 2.91 0 1 0 1.94.223a11.64 11.64 0 0 1 7.068-8.233m-8.34 11.802a.97.97 0 1 1 0-1.94a.97.97 0 0 1 0 1.94m12.607 8.727a2.91 2.91 0 0 0-2.599 1.62a11.64 11.64 0 0 1-8.233-7.05l-1.774.717a13.58 13.58 0 0 0 9.813 8.291a2.91 2.91 0 1 0 2.793-3.578m0 3.879a.97.97 0 1 1 0-1.94a.97.97 0 0 1 0 1.94M32 16.485a2.91 2.91 0 1 0-4.199 2.599a11.64 11.64 0 0 1-7.05 8.232l.718 1.775a13.58 13.58 0 0 0 8.291-9.813A2.91 2.91 0 0 0 32 16.485m-2.91.97a.97.97 0 1 1 0-1.94a.97.97 0 0 1 0 1.94" />
        	<path fill="currentColor" d="M19.19 16.35a3.879 3.879 0 1 0-5.42 0a4.85 4.85 0 0 0-2.134 4.014v1.939h9.697v-1.94a4.85 4.85 0 0 0-2.143-4.014m-4.645-2.774a1.94 1.94 0 1 1 3.88 0a1.94 1.94 0 0 1-3.88 0m-.97 6.788a2.91 2.91 0 1 1 5.819 0z" class="ouiIcon__fillSecondary" />
        </svg>
        `,
        tooltip: 'Confogiracion de Roles',
        route: '/admin/roles',
        roles: ['administrador']
      },

      {
        title: 'Configuracion de Whatsapp',
        svgIcon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" class="w-5 h-5">
	        <path d="M0 0h48v48H0z" fill="none" />
	        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M40.47 14.14v-3.21H10.75a3.23 3.23 0 0 0-3.22 3.21h0v18H4v4.94h23.51v-4.95H10.75v-18Z" />
	        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M32.14 17.36A1.61 1.61 0 0 0 30.53 19v16.5a1.61 1.61 0 0 0 1.61 1.6h10.25A1.61 1.61 0 0 0 44 35.49V19a1.61 1.61 0 0 0-1.61-1.61h0Zm8.64 14.77h-7V20.58h7Z" />
        </svg>`,
        tooltip: 'Configuracion de Whatsapp',
        route: '/admin/config-whatsapp',
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
        title: 'Configuracion Perfil de Usuario',
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

    // preprocesar SVGs en crudo para renderizarlos de forma segura
    this.preprocesarSvg(this.menuItems);

    // actualziar el estado activo inicial
    this.actualizarEstadoActivo();

  }

  preprocesarSvg(items: MenuItem[]): void {
    items.forEach(item => {
      // Si el svgIcon es código HTML (empieza con <svg), lo confiamos con DomSanitizer
      if (item.svgIcon && item.svgIcon.trim().startsWith('<svg')) {
        item.safeSvg = this.sanitizer.bypassSecurityTrustHtml(item.svgIcon);
      }
      if (item.submenu) {
        this.preprocesarSvg(item.submenu);
      }
    });
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




