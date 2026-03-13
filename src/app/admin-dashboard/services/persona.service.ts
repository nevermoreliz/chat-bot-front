import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api.interface';
import { Persona } from '../interfaces/persona.interface';


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class PersonaService {

  private http = inject(HttpClient);

  getPersona(id_usuario: number): Observable<ApiResponse<Persona>> {
    return this.http.get<ApiResponse<Persona>>(`${baseUrl}/personas/${id_usuario}`);
  }

}
