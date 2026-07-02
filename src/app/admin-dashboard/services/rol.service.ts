import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../interfaces/api.interface';
import { Rol } from '../interfaces/rol.interface';
import { ParametrosPaginacion } from '../interfaces/parametros-paginacion.interface';


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class RolService {

  private http = inject(HttpClient);

  getRoles(parametrosPaginacion?: ParametrosPaginacion): Observable<ApiResponse<Rol[]>> {

    const { page = 1, limit = 10, search = '', sortBy = '', sortOrder = 'desc' } = parametrosPaginacion ?? {};

    return this.http.get<ApiResponse<Rol[]>>(`${baseUrl}/roles`,
      {
        params: { page, limit, search, sortBy, sortOrder }
      }).pipe(
        tap(response => response)
        // tap(response => console.log(response)),
      );
  }

}

