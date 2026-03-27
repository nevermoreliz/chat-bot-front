import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../interfaces/api.interface';
import { Persona } from '../interfaces/persona.interface';


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class PersonaService {

  private http = inject(HttpClient);

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

  updatePersona(id_persona: number, body: Persona): Observable<ApiResponse<Persona>> {
    return this.http.put<ApiResponse<Persona>>(`${baseUrl}/personas/${id_persona}`, body);
  }

  updateFotoPerfil(id_persona: number, foto: File): Observable<ApiResponse<Persona>> {
    const formData = new FormData();
    formData.append('img', foto);
    return this.http.put<ApiResponse<Persona>>(`${baseUrl}/personas/${id_persona}`, formData);
  }

  getPersonasConUsuario(): Observable<ApiResponse<Persona[]>> {
    return this.http.get<ApiResponse<Persona[]>>(`${baseUrl}/personas/usuarios`)
      .pipe(
        tap(({ data }) => console.log(data))
      );
  }

}

