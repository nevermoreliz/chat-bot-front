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
import { CursosService } from '../../services/cursos.service';
import { InformacionCurso } from './components/informacion-curso/informacion-curso';

@Component({
  selector: 'app-cursos-page',
  standalone: true,
  imports: [CommonModule, ResponsiveTableComponent, Pagination, Buscador, FormlularioCursoAgente, InformacionCurso],
  templateUrl: './cursos-page.html',
  styles: ``,
})
export class CursosPage {

  baseUrl = environment.baseUrl;
  router = inject(Router);

  cursoAgentesService = inject(CursosAgentesService);
  cursoService = inject(CursosService);

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

  /** ------- eliminacion y habilitacion ------- */

  async confirmarDeshabilitar(curso: Curso) {
    const confirmacion = await this.confirmService.ask({
      title: 'Confirmar Deshabilitacion',
      text: `¿Estás seguro de que deseas deshabilitar el curso ${curso.nombre_curso}?`,
      confirmButtonText: 'Sí, deshabilitar',
      confirmButtonColor: 'error'
    });

    if (confirmacion && curso.id_curso) {
      this.cursoService.deshabilitarCurso(curso.id_curso).subscribe({
        next: () => {
          this.alertService.success('Curso deshabilitado correctamente');
          this.cursosAgente.reload();
        },
        error: (err) => {
          this.alertService.error(err.error?.message || 'Error al deshabilitar');
        }
      });
    }
  }

  async confirmarHabilitacion(curso: Curso) {
    const confirmacion = await this.confirmService.ask({
      title: 'Confirmar Habilitacion',
      text: `¿Estás seguro de que deseas habilitar el curso ${curso.nombre_curso}?`,
      confirmButtonText: 'Sí, habilitar',
      confirmButtonColor: 'success'
    });

    if (confirmacion && curso.id_curso) {
      this.cursoService.habilitarCurso(curso.id_curso).subscribe({
        next: () => {
          this.alertService.success('Curso habilitado correctamente');
          this.cursosAgente.reload();
        },
        error: (err) => {
          this.alertService.error(err.error?.message || 'Error al habilitar');
        }
      });
    }
  }

  /** ------- end eliminacion y habilitacion ------- */

}
