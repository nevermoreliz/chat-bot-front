import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../interfaces/api.interface';
import { Usuario } from '../../auth/interfaces/usuario.interface';


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private http = inject(HttpClient);

  createUsuario(usuario: Usuario): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${baseUrl}/usuarios`, usuario);
  }

  updateUsuario(id_usuario: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${baseUrl}/usuarios/${id_usuario}`, usuario);
  }

  deleteUsuario(id_usuario: Usuario['id_usuario']): Observable<ApiResponse<Usuario>> {
    return this.http.delete<ApiResponse<Usuario>>(`${baseUrl}/usuarios/${id_usuario}`);
  }

  habilitarUsuario(id_usuario: Usuario['id_usuario']): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${baseUrl}/usuarios/${id_usuario}/habilitar`, {});
  }

}

