import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [NgClass],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialogComponent {
  
  public confirmService = inject(ConfirmService);

  get btnClass() {
    const color = this.confirmService.options()?.confirmButtonColor;
    switch (color) {
      case 'error': return 'btn-error';
      case 'success': return 'btn-success';
      case 'warning': return 'btn-warning';
      case 'info': return 'btn-info';
      default: return 'btn-primary';
    }
  }

  get textClass() {
    const color = this.confirmService.options()?.confirmButtonColor;
    switch (color) {
      case 'error': return 'text-error';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'info': return 'text-info';
      default: return 'text-primary';
    }
  }

  responder(valor: boolean) {
    this.confirmService.respond(valor);
  }

}
