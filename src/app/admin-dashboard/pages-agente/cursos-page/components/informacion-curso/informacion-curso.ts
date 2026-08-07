import { Component, inject, input } from '@angular/core';
import { Curso } from '../../../../interfaces/curso.interface';
import { ModalService } from '../../../../../shared/services/modal.service';
import { CommonModule } from '@angular/common';
import { ModalDirective } from '../../../../../shared/directives/modal.directive';

@Component({
  selector: 'app-informacion-curso',
  imports: [CommonModule, ModalDirective],
  templateUrl: './informacion-curso.html',
  styles: ``,
})
export class InformacionCurso {

  // Input para recibir el curso
  curso = input<Curso | null>(null);

  modalService = inject(ModalService);

}
