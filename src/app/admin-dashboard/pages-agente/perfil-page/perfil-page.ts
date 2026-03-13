import { Component, computed, inject, signal } from '@angular/core';
import { PersonaService } from '../../services/persona.service';
import { AuthService } from '../../../auth/services/auth-service';
import { Persona } from '../../interfaces/persona.interface';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { User } from '../../../auth/interfaces/user.interface';

@Component({
  selector: 'app-perfil-page',
  imports: [UpperCasePipe, DatePipe],
  templateUrl: './perfil-page.html',
  styles: ``,
})
export class PerfilPage {

  private personaService = inject(PersonaService);
  private authService = inject(AuthService);

  usuario = this.authService.user;
  persona = signal<Persona | null>(null);

  nombreCompleto = computed(() => {
    const persona = this.persona();
    if (!persona) return '';
    return `${persona.nombre} ${persona.paterno} ${persona.materno}`;
  });

  cargando = signal<boolean>(false);
  error = signal<string | null>(null);


  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil() {

    this.cargando.set(true);

    // verificar si trae datos del usuario
    // console.log('⭕⭕⭕ ID USUARIO', this.authService.user());

    this.personaService.getPersona(this.authService.user()!.id_usuario).subscribe({
      next: ({ data }) => {
        console.log('⭕⭕⭕ RESPUESTA', data);
        this.persona.set(data);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(error.message);
        this.cargando.set(false);
      }
    })
  }

}
