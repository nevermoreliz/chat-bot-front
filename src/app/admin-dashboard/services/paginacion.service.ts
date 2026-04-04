import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaginacionService {

  private activateRoute = inject(ActivatedRoute);

  // pagina seleccionada por el usuario
  currentPage = toSignal(this.activateRoute.queryParamMap
    .pipe(
      map(params => (params.get('page') ? +params.get('page')! : 1)),
      map(page => (isNaN(page) ? 1 : page))
    ),
    { initialValue: 1 }
  );

  // limite de registros por pagina (persiste en la URL)
  currentLimit = toSignal(this.activateRoute.queryParamMap
    .pipe(
      map(params => (params.get('limit') ? +params.get('limit')! : 10)),
      map(limit => (isNaN(limit) || limit < 1 ? 10 : limit))
    ),
    { initialValue: 10 }
  );

  // termino de busqueda global (persiste en la URL)
  currentSearch = toSignal(this.activateRoute.queryParamMap
    .pipe(
      map(params => params.get('search') || '')
    ),
    { initialValue: '' }
  );

}
