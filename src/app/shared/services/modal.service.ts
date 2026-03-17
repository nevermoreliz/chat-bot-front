import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {

  /**
   * Registra los modales automáticamente desde la directiva o componente,
   * almacenados por un ID único (string).
   */
  private modales = new Map<string, HTMLDialogElement>();

  /** Registra un modal por su ID */
  registrar(id: string, elemento: HTMLDialogElement): void {
    this.modales.set(id, elemento);
  }

  /** Elimina un modal del registro (cuando el componente se destruye) */
  desregistrar(id: string): void {
    this.modales.delete(id);
  }

  /** Abre el modal con el ID dado */
  abrir(id: string): void {
    const modal = this.modales.get(id);
    if (modal) {
      modal.showModal();
    } else {
      console.warn(`[ModalService] No se encontró modal con id: "${id}"`);
    }
  }

  /** Cierra el modal con el ID dado */
  cerrar(id: string): void {
    const modal = this.modales.get(id);
    if (modal) {
      modal.close();
    }
  }
}
