import { Component, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../../auth/services/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styles: ``,
})
export class Navbar {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);

}
