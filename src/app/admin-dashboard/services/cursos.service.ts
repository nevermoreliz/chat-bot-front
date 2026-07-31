import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ApiResponse } from '../interfaces/api.interface';
import { Curso } from '../interfaces/curso.interface';

const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class CursosService {

  private http = inject(HttpClient);

  buscarCursos(buscar?: string): Observable<ApiResponse<Curso[]>> {
    return this.http.get<ApiResponse<Curso[]>>(`${baseUrl}/cursos/buscar?search=${buscar || ''}`)
      .pipe(
        tap(response => {
          // tap: Es ideal para efectos secundarios con la respuesta exitosa
          // ej: guardar en caché o un console.log
        }),
        catchError((error: HttpErrorResponse) => {
          // catchError: Captura errores HTTP (404, 500, problemas de red, etc)
          let errorMessage = 'Ocurrió un error inesperado al obtener categorías';

          if (error.error instanceof ErrorEvent) {
            // Error de red o del lado del cliente
            errorMessage = `Error de cliente: ${error.error.message}`;
          } else {
            // Error devuelto por el backend (Ej: 404 CATEGORIAS_NO_ENCONTRADAS)
            errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
          }

          console.error('Error en CategoriasCursosService:', errorMessage, error);

          // Lanza el error para que el componente que se suscribió (ej: el .ts de la página) lo capture y pueda mostrar una alerta
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  createCurso(curso: Curso): Observable<ApiResponse<Curso>> {
    return this.http.post<ApiResponse<Curso>>(`${baseUrl}/cursos`, curso);
  }

}
