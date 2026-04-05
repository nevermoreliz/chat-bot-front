import { Component, input, inject } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalDirective } from '../../../../../shared/directives/modal.directive';
import { Persona } from '../../../../interfaces/persona.interface';
import { ModalService } from '../../../../../shared/services/modal.service';

import { Rol } from '../../../../interfaces/rol.interface';
import { AvatarPipe } from '../../../../../shared/pipes/avatar.pipe';

@Component({
  selector: 'app-informacion-usuario',
  imports: [DatePipe, ReactiveFormsModule, ModalDirective, AvatarPipe],
  templateUrl: './informacion-usuario.html',
  styles: ``,
})
export class InformacionUsuario {

  urlBaseImg = `${environment.baseUrl}/profile`;

  // Input para recibir la persona a editar (null significa modo crear)
  persona = input<Persona | null>(null);

  modalService = inject(ModalService);

  /**
   * Normaliza el array de roles que puede venir como números, strings u objetos desde el backend.
   * Garantiza que la vista reciba de forma segura un arreglo estructurado de interfaces Rol[].
   */
  get rolesNormalizados(): Rol[] {
    const rolesData = this.persona()?.usuario?.roles;
    if (!Array.isArray(rolesData)) return [];

    return rolesData.map((r, index) => {
      if (typeof r === 'number') {
        return { id_rol: r, nombre_rol: `Rol ID: ${r}` } as Rol;
      }
      if (typeof r === 'string') {
        // En caso de que se pase el nombre directamente, usamos el index como track key alternativo.
        return { id_rol: index, nombre_rol: r } as Rol;
      }
      // Si ya es un objeto Rol, lo devolvemos tal cual.
      return r as Rol;
    });
  }

}
