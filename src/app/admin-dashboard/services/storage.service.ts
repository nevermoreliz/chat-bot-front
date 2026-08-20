import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../interfaces/api.interface';
import { Observable } from 'rxjs';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  private http = inject(HttpClient);

  subirArchivo(archivo: File, carpeta: string): Observable<ApiResponse<Storage>> {
    const formData = new FormData();
    formData.append('miArchivo', archivo);
    return this.http.post<ApiResponse<Storage>>(`${baseUrl}/${carpeta}`, formData);
  }

}
