import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../interfaces/api.interface';
import { UsuarioRol } from '../interfaces/usuario-rol.interface';


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class UsuarioRolService {

  private http = inject(HttpClient);

  createUsuarioRol(usuario_rol: UsuarioRol): Observable<ApiResponse<UsuarioRol>> {
    return this.http.post<ApiResponse<UsuarioRol>>(`${baseUrl}/usuarios-roles/asignar`, usuario_rol);
  }

  updateUsuarioRol(id_usuario: number, id_rol: number): Observable<ApiResponse<UsuarioRol>> {
    return this.http.put<ApiResponse<UsuarioRol>>(`${baseUrl}/usuarios-roles/actualizar${id_usuario}`, { id_rol });
  }

}

