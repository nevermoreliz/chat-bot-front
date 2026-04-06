import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../interfaces/api.interface';
import { Persona } from '../interfaces/persona.interface';
import { ParametrosPaginacion } from '../interfaces/parametros-paginacion.interface';


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class PersonaService {

  private http = inject(HttpClient);
  private personasConUsuarioCache = new Map<string, ApiResponse<Persona[]>>();

  // Estado compartido de la persona autenticada
  private _persona = signal<Persona | null>(null);
  readonly persona = this._persona.asReadonly();

  /** Carga la persona y la almacena en el signal compartido */
  cargarPersona(id_usuario: number): Observable<ApiResponse<Persona>> {
    return this.getPersona(id_usuario).pipe(
      tap(({ data }) => this._persona.set(data))
    );
  }

  /** Actualiza manualmente el signal (después de editar perfil o foto) */
  setPersona(persona: Persona): void {
    this._persona.set(persona);
  }

  getPersona(id_usuario: number): Observable<ApiResponse<Persona>> {
    return this.http.get<ApiResponse<Persona>>(`${baseUrl}/personas/${id_usuario}`);
  }

  createPersona(persona: Persona): Observable<ApiResponse<Persona>> {
    return this.http.post<ApiResponse<Persona>>(`${baseUrl}/personas`, persona);
  }

  updatePersona(id_persona: number, body: Persona): Observable<ApiResponse<Persona>> {
    return this.http.put<ApiResponse<Persona>>(`${baseUrl}/personas/${id_persona}`, body);
  }

  updateFotoPerfil(id_persona: number, foto: File): Observable<ApiResponse<Persona>> {
    const formData = new FormData();
    formData.append('img', foto);
    return this.http.put<ApiResponse<Persona>>(`${baseUrl}/personas/${id_persona}`, formData);
  }

  deletePersona(id_persona: number): Observable<ApiResponse<Persona>> {
    return this.http.delete<ApiResponse<Persona>>(`${baseUrl}/personas/${id_persona}`);
  }

  getPersonasConUsuario(parametrosPaginacion?: ParametrosPaginacion): Observable<ApiResponse<Persona[]>> {
    const { page = 1, limit = 10, search = '', sortBy = '', sortOrder = 'desc' } = parametrosPaginacion ?? {};

    // guardar en cache
    // const cacheKey = `${page}-${limit}-${search}-${sortBy}-${sortOrder}`;
    // if (this.personasConUsuarioCache.has(cacheKey)) {
    //   return of(this.personasConUsuarioCache.get(cacheKey)!);
    // }


    return this.http.get<ApiResponse<Persona[]>>(`${baseUrl}/personas/usuarios`, {
      params: { page, limit, search, sortBy, sortOrder }
    }).pipe(
      tap(response => response),
      // tap(response => console.log(response)),
      // tap(response => this.personasConUsuarioCache.set(cacheKey, response))
    );
  }

}

