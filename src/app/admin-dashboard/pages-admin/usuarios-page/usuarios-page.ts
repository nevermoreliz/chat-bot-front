import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PersonaService } from '../../services/persona.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { Pagination } from "../../../shared/components/pagination/pagination";
import { Buscador } from "../../../shared/components/buscador/buscador";
import { Router } from '@angular/router';
import { PaginacionService } from '../../services/paginacion.service';
import { FormularioUsuarioPer } from "./components/formulario-usuario-per/formulario-usuario-per";
import { ModalService } from '../../../shared/services/modal.service';
import { Persona } from '../../interfaces/persona.interface';
import { AlertService } from '../../../shared/services/alert.service';
import { ModalDirective } from '../../../shared/directives/modal.directive';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuarios-page',
  imports: [DatePipe, Pagination, FormularioUsuarioPer, Buscador],
  templateUrl: './usuarios-page.html',
  styles: ``,
})
export class UsuariosPage {

  baseUrl = environment.baseUrl;
  router = inject(Router);
  usuarioService = inject(UsuarioService);
  personaService = inject(PersonaService);


  // servicios
  paginacionService = inject(PaginacionService);
  modalService = inject(ModalService);
  alertService = inject(AlertService);
  confirmService = inject(ConfirmService);

  // Registro seleccionado para editar o eliminar
  personaSeleccionada = signal<Persona | null>(null);
  personaAEliminar = signal<Persona | null>(null);

  // computed agrupa los signals que vienen de la URL
  parametrosPaginacion = computed(() => ({
    page: this.paginacionService.currentPage() ?? 1,
    limit: this.paginacionService.currentLimit() ?? 10,
    search: this.paginacionService.currentSearch() ?? '',
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

  abrirModalCrear() {
    this.personaSeleccionada.set(null);
    this.modalService.abrir('formUsuarioPersona');
  }

  abrirModalEditar(persona: Persona) {
    this.personaSeleccionada.set(persona);
    this.modalService.abrir('formUsuarioPersona');
  }

  async confirmarEliminacion(persona: Persona) {

    const confirmacion = await this.confirmService.ask({
      title: 'Confirmar Eliminación',
      text: `¿Estás seguro de que deseas deshabilitar permanentemente a ${persona.nombre} ${persona.paterno}? Esta acción no se puede deshacer.`,
      confirmButtonText: 'Sí, deshabilitar',
      confirmButtonColor: 'error'
    });


    if (confirmacion) {
      this.usuarioService.deleteUsuario(persona.usuario!.id_usuario).subscribe({
        next: () => {
          this.alertService.success('Usuario deshabilitado correctamente');
          this.personasConUsuario.reload();
        },
        error: (err) => {
          this.alertService.error(err.error?.message || 'Error al deshabilitar');
        }
      });
    }
  }

  async confirmarHabilitacion(persona: Persona) {
    const confirmacion = await this.confirmService.ask({
      title: 'Confirmar Habilitación',
      text: `¿Estás seguro de que deseas volver a habilitar a ${persona.nombre} ${persona.paterno}?`,
      confirmButtonText: 'Sí, habilitar',
      confirmButtonColor: 'success'
    });

    if (confirmacion && persona.usuario?.id_usuario) {
      this.usuarioService.habilitarUsuario(persona.usuario.id_usuario).subscribe({
        next: () => {
          this.alertService.success('Usuario habilitado correctamente');
          this.personasConUsuario.reload();
        },
        error: (err) => {
          this.alertService.error(err.error?.message || 'Error al habilitar');
        }
      });
    }
  }

}
