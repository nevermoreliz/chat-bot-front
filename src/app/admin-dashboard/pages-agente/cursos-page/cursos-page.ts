import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponsiveTableComponent, TableColumn } from '../../../shared/components/responsive-table/responsive-table';
import { PaginacionService } from '../../services/paginacion.service';
import { ModalService } from '../../../shared/services/modal.service';
import { AlertService } from '../../../shared/services/alert.service';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CursosAgentesService } from '../../services/cursos-agentes.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../auth/services/auth-service';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Buscador } from '../../../shared/components/buscador/buscador';
import { Curso } from '../../interfaces/curso.interface';
import { FormlularioCursoAgente } from './components/formlulario-curso-agente/formlulario-curso-agente';

@Component({
  selector: 'app-cursos-page',
  standalone: true,
  imports: [CommonModule, ResponsiveTableComponent, Pagination, Buscador, FormlularioCursoAgente],
  templateUrl: './cursos-page.html',
  styles: ``,
})
export class CursosPage {

  baseUrl = environment.baseUrl;
  router = inject(Router);

  cursoAgentesService = inject(CursosAgentesService);

  authService = inject(AuthService);

  // servicios
  paginacionService = inject(PaginacionService);
  modalService = inject(ModalService);
  alertService = inject(AlertService);
  confirmService = inject(ConfirmService);

  // Registro seleccionado para editar o eliminar
  cursoSeleccionado = signal<Curso | null>(null);
  cursoAEliminar = signal<Curso | null>(null);

  // computed agrupa los signals que vienen de la URL
  parametrosPaginacion = computed(() => ({
    page: this.paginacionService.currentPage() ?? 1,
    limit: this.paginacionService.currentLimit() ?? 10,
    search: this.paginacionService.currentSearch() ?? '',
  }));

  /** Actualiza el query param ?limit= en la URL (y resetea a page 1) */
  cambiarLimit(nuevoLimit: number): void {
    this.router.navigate([], {
      queryParams: { limit: nuevoLimit, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  // params detecta cambios → stream hace la petición
  cursosAgente = rxResource({
    params: () => ({
      ...this.parametrosPaginacion(),
      idUsuario: this.authService.user()?.id_usuario
    }),
    stream: ({ params }) => {
      const { idUsuario, ...paginacionParams } = params;
      return this.cursoAgentesService.getCursosAgente(idUsuario as number, paginacionParams);
    }
  });


  tableColumns: TableColumn[] = [
    { key: 'index', label: '#', cssClass: 'w-10' },
    { key: 'curso', label: 'Curso' },
    { key: 'modalidad', label: 'Modalidad', hideOn: 'sm' },
    { key: 'nivel', label: 'Nivel', hideOn: 'sm' },
    { key: 'precio', label: 'Precio' },
    { key: 'estado', label: 'Estado' },
    { key: 'fecha_inicio', label: 'Fecha Inicio', hideOn: 'sm' },
    { key: 'acciones', label: '' }
  ];

  /** ------- modales ------- */

  /** Abre el modal de formulario para crear un nuevo curso */
  abrirModalCrear() {
    this.cursoSeleccionado.set(null);
    this.modalService.abrir('formCursoAgente');
  }

  /** Abre el modal de formulario para editar un curso */
  abrirModalEditar(curso: Curso) {
    this.cursoSeleccionado.set(curso);
    this.modalService.abrir('formCursoAgente');
  }

  /** Abre el modal de información del curso */
  abrirModalInformacion(curso: Curso) {
    this.cursoSeleccionado.set(curso);
    this.modalService.abrir('informacionCursoAgente');
  }

  /** ------- end modales ------- */


}
