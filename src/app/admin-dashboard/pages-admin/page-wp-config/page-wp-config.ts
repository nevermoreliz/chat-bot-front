import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrService } from '../../services/qr.service';
import { Subscription } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-page-wp-config',
  imports: [CommonModule],
  templateUrl: './page-wp-config.html',
  styles: ``,
})
export class PageWpConfig implements OnInit, OnDestroy {
  private qrService = inject(QrService);
  private cdr = inject(ChangeDetectorRef);

  qrStatus: 'initializing' | 'qrcode' | 'connected' | 'error' = 'initializing';
  qrImage: string | null = null;
  message: string = 'Iniciando conexión con WhatsApp...';
  connected: boolean = false;
  phone: string | null = null;
  name: string | null = null;
  loading: boolean = true;
  refreshing: boolean = false;
  lastUpdated: Date = new Date();
  countdown: number = 5;

  private timerIntervalId: any = null;
  private qrSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.loadQrSession();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
    if (this.qrSubscription) {
      this.qrSubscription.unsubscribe();
    }
  }

  loadQrSession(isManual: boolean = false): void {
    // If a request is already in progress
    if (this.qrSubscription) {
      if (isManual) {
        // If it's a manual refresh, cancel the active subscription to start a fresh manual one
        this.qrSubscription.unsubscribe();
        this.qrSubscription = null;
        this.refreshing = false;
      } else {
        // If it's an automatic poll, do not interrupt the active request.
        // Just let it finish and skip this poll tick.
        return;
      }
    }

    if (isManual) {
      this.refreshing = true;
    } else if (!this.qrImage) {
      this.loading = true;
    }
    this.cdr.detectChanges();

    this.qrSubscription = this.qrService.getQrSession()
      .pipe(timeout(6000)) // Force timeout after 6 seconds if server is stuck
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.refreshing = false;
          this.lastUpdated = new Date();
          this.qrSubscription = null;

          if (res && res.data) {
            const data = res.data;
            this.qrStatus = data.status || 'initializing';
            this.connected = !!data.connected;
            this.message = res.msg || 'Estado de WhatsApp actualizado.';

            if (this.connected) {
              this.phone = data.phone || null;
              this.name = data.name || null;
              this.qrImage = null;
              // Stop fast polling if connected to avoid server load
              this.stopPolling();
            } else {
              this.qrImage = data.qr || null;
              this.phone = null;
              this.name = null;
              // Ensure polling is running if not connected
              if (!this.timerIntervalId) {
                this.startPolling();
              }
            }
          } else {
            this.qrStatus = 'error';
            this.message = 'No se recibió una respuesta válida del servidor.';
          }
          this.cdr.detectChanges(); // Force UI update when request completes
        },
        error: (err) => {
          this.loading = false;
          this.refreshing = false;
          this.qrStatus = 'error';
          this.qrSubscription = null;
          this.message = 'Ocurrió un error o se agotó el tiempo al comunicarse con el servidor.';
          console.error('Error fetching QR session:', err);
          this.cdr.detectChanges(); // Force UI update when request errors
        }
      });
  }

  startPolling(): void {
    this.stopPolling(); // Clear any existing interval
    this.countdown = 5;
    this.timerIntervalId = setInterval(() => {
      this.countdown--;
      this.cdr.detectChanges(); // Force UI update on every tick

      if (this.countdown <= 0) {
        this.loadQrSession();
        this.countdown = 5;
      }
    }, 1000); // Check and tick down every 1 second
  }

  stopPolling(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  manualRefresh(): void {
    this.loadQrSession(true);
    this.startPolling(); // Reset the countdown and restart the interval timer cleanly
  }
}

