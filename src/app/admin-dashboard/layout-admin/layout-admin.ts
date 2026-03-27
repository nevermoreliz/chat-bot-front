import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Navbar } from "../components/navbar/navbar";
import { Header } from "../components/header/header";
import { Footer } from "../components/footer/footer";
import { LayoutService } from '../services/layout.service';
import { Sidebar } from "../components/sidebar/sidebar";
import { PersonaService } from '../services/persona.service';
import { AuthService } from '../../auth/services/auth-service';

@Component({
  selector: 'app-layout-admin',
  imports: [RouterOutlet, Navbar, Header, Footer, Sidebar],
  templateUrl: './layout-admin.html',
  styles: ``,
})
export class LayoutAdmin {

  layoutService = inject(LayoutService);
  private router = inject(Router);
  private personaService = inject(PersonaService);
  private authService = inject(AuthService);

  cargandoRuta = signal(false);

  constructor() {
    // Cargar persona del usuario autenticado para que la foto de perfil
    // persista en el navbar sin importar la ruta activa
    const userId = this.authService.user()?.id_usuario;
    if (userId) {
      this.personaService.cargarPersona(userId).subscribe();
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.cargandoRuta.set(true);
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.cargandoRuta.set(false);
      }
    });
  }
}
