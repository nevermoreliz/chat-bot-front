import { Directive, ElementRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from '../services/modal.service';

/**
 * Directiva que registra automáticamente un <dialog> en el ModalService.
 *
 * Uso:
 *   <dialog appModal="editarPerfil" class="modal">
 *     ...
 *   </dialog>
 *
 * Luego desde cualquier componente:
 *   modalService.abrir('editarPerfil');
 *   modalService.cerrar('editarPerfil');
 */
@Directive({
  selector: '[appModal]',
})
export class ModalDirective implements OnInit, OnDestroy {

  @Input({ required: true }) appModal!: string;

  private modalService = inject(ModalService);
  private elementRef = inject(ElementRef<HTMLDialogElement>);

  ngOnInit(): void {
    this.modalService.registrar(this.appModal, this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.modalService.desregistrar(this.appModal);
  }
}
