import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../interfaces/api.interface';
import { Rol } from '../interfaces/rol.interface';
import { Usuario } from '../../auth/interfaces/user.interface';


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private http = inject(HttpClient);

  createUsuario(usuario: Usuario): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${baseUrl}/usuarios`, usuario);
  }

}

