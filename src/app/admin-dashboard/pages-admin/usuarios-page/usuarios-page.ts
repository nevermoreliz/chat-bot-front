import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PersonaService } from '../../services/persona.service';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-usuarios-page',
  imports: [DatePipe],
  templateUrl: './usuarios-page.html',
  styles: ``,
})
export class UsuariosPage {

  baseUrl = environment.baseUrl;
  private personaService = inject(PersonaService);

  personasConUsuario = rxResource({
    stream: () => this.personaService.getPersonasConUsuario().pipe(
      map(response => response.data)
    )
  });

}
