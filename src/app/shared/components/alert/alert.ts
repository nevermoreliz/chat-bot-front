import { Component, inject } from '@angular/core';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.html',
  styles: `
    .alert-enter {
      animation: slideDown 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes slideDown {
      0% {
        opacity: 0;
        transform: translateY(-100%) scale(0.9);
      }
      60% {
        opacity: 1;
        transform: translateY(6px) scale(1.02);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .alert-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      border-radius: 0 0 0.5rem 0.5rem;
      background: currentColor;
      opacity: 0.3;
      animation: shrink 4s linear forwards;
    }

    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
  `,
})
export class AlertComponent {
  alertService = inject(AlertService);
}
