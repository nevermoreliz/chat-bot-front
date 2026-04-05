import { Component, computed, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../../auth/services/auth-service';
import { PersonaService } from '../../services/persona.service';
import { environment } from '../../../../environments/environment';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../shared/services/theme.service';
import { AvatarPipe } from '../../../shared/pipes/avatar.pipe';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AvatarPipe],
  templateUrl: './navbar.html',
  styles: ``,
})
export class Navbar {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);
  private personaService = inject(PersonaService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  userData = computed(() => this.authService.user());
  persona = this.personaService.persona;  // signal compartido
  urlBaseImg = `${environment.baseUrl}/profile`;

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
