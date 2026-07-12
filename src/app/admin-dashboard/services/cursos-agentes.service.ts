import { inject, Injectable } from '@angular/core';
import { Curso } from '../interfaces/curso.interface';
import { ApiResponse } from '../interfaces/api.interface';
import { Observable, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ParametrosPaginacion } from '../interfaces/parametros-paginacion.interface';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class CursosAgentesService {

  private http = inject(HttpClient);

  getCursosAgente(id_usuario: number, parametrosPaginacion?: ParametrosPaginacion): Observable<ApiResponse<Curso[]>> {
    let params = new HttpParams();
    if (parametrosPaginacion) {
      Object.entries(parametrosPaginacion).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<ApiResponse<Curso[]>>(`${baseUrl}/cursos-agentes/${id_usuario}`, { params })
      .pipe(
        tap(response => response),
        // tap(response => console.log(response)),
        // tap(response => this.personasConUsuarioCache.set(cacheKey, response))
      );
  }

}
