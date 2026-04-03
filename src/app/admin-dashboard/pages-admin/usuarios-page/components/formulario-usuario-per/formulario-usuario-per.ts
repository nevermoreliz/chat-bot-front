import { Component, inject, output } from '@angular/core';
import { switchMap } from 'rxjs';
import { ModalService } from '../../../../../shared/services/modal.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../shared/services/alert.service';
import { ModalDirective } from '../../../../../shared/directives/modal.directive';
import { RolService } from '../../../../services/rol.service';
import { Rol } from '../../../../interfaces/rol.interface';
import { UsuarioService } from '../../../../services/usuario.service';
import { PersonaService } from '../../../../services/persona.service';
import { ApiResponse } from '../../../../interfaces/api.interface';
import { Persona } from '../../../../interfaces/persona.interface';

@Component({
  selector: 'app-formulario-usuario-per',
  imports: [ReactiveFormsModule, ModalDirective],
  templateUrl: './formulario-usuario-per.html',
  styles: ``,
})
export class FormularioUsuarioPer {

  // Evento que avisa al padre que se creó un registro
  created = output<void>();

  protected modalService = inject(ModalService);
  alertService = inject(AlertService);

  rolService = inject(RolService);
  usuarioService = inject(UsuarioService);
  personaService = inject(PersonaService);

  fb = inject(FormBuilder);

  // asignar roles
  roles: Rol[] = [];

  form: FormGroup = this.fb.group({

    Persona: this.fb.group({
      nombre: ['', [Validators.required]],
      materno: ['', [Validators.required]],
      paterno: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      ci: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      fecha_nacimiento: ['', [Validators.required]],
      notificaciones_chatbot: [false, [Validators.required]],
    }),

    Usuario: this.fb.group({
      id_rol: ['', [Validators.required]],
    })

  });

  // Getters para mostrar en el HTML
  get nombreUsuarioGenerado(): string {
    const nombre = this.form.get('Persona.nombre')?.value || '';
    const ci = this.form.get('Persona.ci')?.value || '';
    if (!nombre && !ci) return '';
    const primerNombre = nombre.trim().split(' ')[0];
    return `${primerNombre.toLowerCase()}-${ci}`;
  }

  get contraseniaGenerada(): string {
    const fecha = this.form.get('Persona.fecha_nacimiento')?.value || '';
    if (!fecha) return '';
    const [yyyy, mm, dd] = fecha.split('-');
    return `${dd}${mm}${yyyy}#psg`;
  }

  get contraseniaMasked(): string {
    return '•'.repeat(this.contraseniaGenerada.length);
  }


  ngOnInit(): void {
    this.rolService.getRoles().subscribe((response) => {
      this.roles = response.data;
    });
  }

  // metodo de guardar
  onSubmit() {
    if (this.form.invalid) {
      this.alertService.error('Formulario inválido');
      return;
    }

    // llenar los datos del formulario a formData
    const formData = this.form.value;

    // 1. Crear persona → 2. Con el id_persona crear usuario
    this.personaService.createPersona(formData.Persona)
      .pipe(
        switchMap((personaResponse: ApiResponse<Persona>) => {
          const usuario = {
            id_persona: personaResponse.data.id_persona,
            nombre_usuario: this.nombreUsuarioGenerado,
            contrasenia_hash: this.contraseniaGenerada,
            id_rol: formData.Usuario.id_rol,
          };
          return this.usuarioService.createUsuario(usuario);
        })
      ).subscribe({
        next: () => {
          this.alertService.success('Persona y usuario creados correctamente');
          this.form.reset();
          this.modalService.cerrar('formUsuarioPersona');
          this.created.emit();
        },
        error: (err) => {
          this.alertService.error(err.error?.message || 'Error al crear');
          console.log('❌ Error al crear: ', err);

          // Si el backend devuelve errores de validación, asignarlos a cada control
          if (err.error?.errors) {
            this.setServerErrors(err.error.errors);
          }
        }
      });
  }

  /**
   * Recorre los errores del backend y los asigna a los FormControls correspondientes.
   * Formato esperado: { campo: { msg: '...', path: '...' } }
   */
  private setServerErrors(errors: Record<string, { msg: string; path: string }>) {
    for (const campo in errors) {
      const error = errors[campo];
      // Buscar el control en el grupo Persona primero, luego en Usuario
      const control =
        this.form.get(`Persona.${campo}`) ??
        this.form.get(`Usuario.${campo}`);

      if (control) {
        control.setErrors({ serverError: error.msg });
        control.markAsTouched(); // Para que el HTML muestre el error inmediatamente
      }
    }
  }
}
