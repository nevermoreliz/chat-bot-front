import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PersonaService } from '../../services/persona.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { Pagination } from "../../../shared/components/pagination/pagination";
import { Router } from '@angular/router';
import { PaginacionService } from '../../services/paginacion.service';
import { FormularioUsuarioPer } from "./components/formulario-usuario-per/formulario-usuario-per";
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-usuarios-page',
  imports: [DatePipe, Pagination, FormularioUsuarioPer],
  templateUrl: './usuarios-page.html',
  styles: ``,
})
export class UsuariosPage {

  baseUrl = environment.baseUrl;
  personaService = inject(PersonaService);
  paginacionService = inject(PaginacionService);
  private router = inject(Router);

  // servicio de modales
  protected modalService = inject(ModalService);

  // computed agrupa los signals que vienen de la URL
  private parametrosPaginacion = computed(() => ({
    page: this.paginacionService.currentPage() ?? 1,
    limit: this.paginacionService.currentLimit() ?? 10,
  }));

  // params detecta cambios → stream hace la petición
  personasConUsuario = rxResource({
    params: () => this.parametrosPaginacion(),
    stream: ({ params }) => this.personaService.getPersonasConUsuario(params)
  });

  /** Actualiza el query param ?limit= en la URL (y resetea a page 1) */
  cambiarLimit(nuevoLimit: number): void {
    this.router.navigate([], {
      queryParams: { limit: nuevoLimit, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

}
