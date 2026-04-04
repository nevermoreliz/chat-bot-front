import { Component, inject, input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-buscador',
  imports: [ReactiveFormsModule],
  templateUrl: './buscador.html',
  styles: ``,
})
export class Buscador implements OnInit {
  // Opcional: Permite personalizar el placeholder
  placeholder = input<string>('Buscar...');

  searchControl = new FormControl('');

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    // Sincronizar el input con la URL si recargan la página
    const currentSearch = this.activatedRoute.snapshot.queryParamMap.get('search') || '';
    if (currentSearch) {
      this.searchControl.setValue(currentSearch, { emitEvent: false });
    }

    // Escuchar cambios en el input de texto
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((term) => {
      // Cuando escriben, navegamos a ?search=xyz&page=1
      // Usamos queryParamsHandling='merge' para no perder limit u otros parámetros
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { search: term || null, page: 1 },
        queryParamsHandling: 'merge',
      });
    });
  }
}
