import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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

  layoutService = inject(LayoutService)
}
