import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RolService } from '../../services/rol.service';
import { Rol } from '../../interfaces/rol.interface';

@Component({
  selector: 'app-page-roles',
  imports: [],
  templateUrl: './page-roles.html',
  styles: ``,
})
export class PageRoles {

  rolService = inject(RolService);

  // Obtiene todos los roles (sin paginación, ya que son limitados)
  roles = rxResource({
    stream: () => this.rolService.getRoles()
  });

}
