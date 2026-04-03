import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../interfaces/api.interface';
import { Rol } from '../interfaces/rol.interface';


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class RolService {

  private http = inject(HttpClient);

  getRoles(): Observable<ApiResponse<Rol[]>> {
    return this.http.get<ApiResponse<Rol[]>>(`${baseUrl}/roles`);
  }

}

