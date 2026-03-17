import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Navbar } from "../components/navbar/navbar";
import { Header } from "../components/header/header";
import { Footer } from "../components/footer/footer";
import { LayoutService } from '../services/layout.service';
import { Sidebar } from "../components/sidebar/sidebar";

@Component({
  selector: 'app-layout-admin',
  imports: [RouterOutlet, Navbar, Header, Footer, Sidebar],
  templateUrl: './layout-admin.html',
  styles: ``,
})
export class LayoutAdmin {

  layoutService = inject(LayoutService);
  private router = inject(Router);

  cargandoRuta = signal(false);

  constructor() {
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
