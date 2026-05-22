import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class QrService {


  private http = inject(HttpClient);

  getQrSession() {
    return this.http.get(`${baseUrl}/qr`);
  }

}
