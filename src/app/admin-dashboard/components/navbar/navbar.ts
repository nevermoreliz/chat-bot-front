import { Component, computed, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../../auth/services/auth-service';
import { PersonaService } from '../../services/persona.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styles: ``,
})
export class Navbar {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);
  private personaService = inject(PersonaService);

  userData = computed(() => this.authService.user());
  persona = this.personaService.persona;  // signal compartido
  urlBaseImg = `${environment.baseUrl}/profile`;
}
