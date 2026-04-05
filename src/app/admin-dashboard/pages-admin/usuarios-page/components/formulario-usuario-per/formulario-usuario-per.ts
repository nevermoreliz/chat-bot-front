import { Component, effect, inject, input, output } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { ModalService } from '../../../../../shared/services/modal.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../shared/services/alert.service';
import { ModalDirective } from '../../../../../shared/directives/modal.directive';
import { setServerErrors } from '../../../../../shared/utils/form-error.util';
import { RolService } from '../../../../services/rol.service';
import { Rol } from '../../../../interfaces/rol.interface';
import { UsuarioService } from '../../../../services/usuario.service';
import { PersonaService } from '../../../../services/persona.service';
import { ApiResponse } from '../../../../interfaces/api.interface';
import { Persona } from '../../../../interfaces/persona.interface';
import { Usuario } from '../../../../../auth/interfaces/usuario.interface';
import { UsuarioRolService } from '../../../../services/usuario-rol.service';

@Component({
  selector: 'app-formulario-usuario-per',
  imports: [ReactiveFormsModule, ModalDirective],
  templateUrl: './formulario-usuario-per.html',
  styles: ``,
})
export class FormularioUsuarioPer {

  // Evento que avisa al padre que se creó un registro
  created = output<void>();
  edited = output<void>();

  // Input para recibir la persona a editar (null significa modo crear)
  persona = input<Persona | null>(null);

  // servicios Globales
  modalService = inject(ModalService);
  alertService = inject(AlertService);

  // servicios
  rolService = inject(RolService);
  usuarioService = inject(UsuarioService);
  personaService = inject(PersonaService);
  usuarioRolService = inject(UsuarioRolService);

  // form builder
  fb = inject(FormBuilder);

  // asignar roles
  roles: Rol[] = [];

  // formulario
  form: FormGroup = this.fb.group({

    // datos de persona
    Persona: this.fb.group({
      nombre: ['', [Validators.required]],
      materno: ['', [Validators.required]],
      paterno: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      ci: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      fecha_nacimiento: ['', [Validators.required]],
      notificaciones_chatbot: [true, [Validators.required]],
    }),

    // datos de usuario
    Usuario: this.fb.group({
      id_rol: ['', [Validators.required]],
    })

  });

  // effect para cargar datos del usuario
  syncFromEffect = effect(() => {

    const persona = this.persona();

    if (persona) {

      // Obtenemos el id_rol asumiendo que viene en los roles del usuario
      let id_rol = '';
      if (persona.usuario?.roles && persona.usuario.roles.length > 0) {
        const rolObj = persona.usuario.roles[0] as Rol;
        id_rol = String(rolObj?.id_rol ?? (persona.usuario as any).id_rol ?? '');
      }

      // Modo Editar
      this.form.patchValue({
        Persona: {
          nombre: persona.nombre,
          materno: persona.materno,
          paterno: persona.paterno,
          correo: persona.correo,
          ci: persona.ci,
          celular: persona.celular,
          sexo: persona.sexo,
          // Cortar la hora si viene en formato completo
          fecha_nacimiento: persona.fecha_nacimiento?.split('T')[0],
          notificaciones_chatbot: persona.notificaciones_chatbot,
        },
        Usuario: {
          id_rol: id_rol,
        }
      });
    } else {
      // Modo Crear
      this.form.reset({
        Persona: { notificaciones_chatbot: true, sexo: '' },
        Usuario: { id_rol: '' }
      });
    }
  });


  // getter para nombre de usuario generado
  get nombreUsuarioGenerado(): string {
    const nombre = this.form.get('Persona.nombre')?.value || '';
    const ci = this.form.get('Persona.ci')?.value || '';
    if (!nombre && !ci) return '';
    const primerNombre = nombre.trim().split(' ')[0];
    return `${primerNombre.toLowerCase()}-${ci}`;
  }

  // getter para contrasenia generada
  get contraseniaGenerada(): string {
    const fecha = this.form.get('Persona.fecha_nacimiento')?.value || '';
    if (!fecha) return '';
    const [yyyy, mm, dd] = fecha.split('-');
    return `${dd}${mm}${yyyy}#psg`;
  }

  // getter para contrasenia enmascarada
  get contraseniaMasked(): string {
    return '•'.repeat(this.contraseniaGenerada.length);
  }

  // saber si tiene rol previo
  get tieneRolAsignado(): boolean {
    const persona = this.persona();
    return !!(persona && persona.usuario?.roles && persona.usuario.roles.length > 0);
  }

  get nombreRolActual(): string {
    const persona = this.persona();
    if (this.tieneRolAsignado) {
      const rolObj = persona!.usuario!.roles![0] as Rol;
      return rolObj.nombre_rol || 'Rol Desconocido';
    }
    return '';
  }


  // al iniciar el componente
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
    const persona = this.persona();

    if (persona && persona.id_persona) {
      // ==== MODO EDITAR ====
      this.personaService.updatePersona(persona.id_persona, formData.Persona)
        .pipe(
          switchMap(() => {
            // si existe usuario verificar si tiene rol asignado para actualizar, si no, lo asignamos
            const idUsuario = persona.usuario?.id_usuario;

            if (idUsuario) {
              if (!persona.usuario?.roles || persona.usuario.roles.length === 0) {
                // No tenía rol asignado, se lo creamos/asignamos
                return this.usuarioRolService.createUsuarioRol({
                  id_usuario: idUsuario,
                  id_rol: formData.Usuario.id_rol
                });
              }

              // Ya tiene rol, según el requerimiento NO se actualiza
              return of(null);

            }
            // --
            else {
              // si no tiene usuario, lo creamos
              const usuario = {
                id_persona: persona.id_persona,
                nombre_usuario: this.nombreUsuarioGenerado,
                contrasenia_hash: this.contraseniaGenerada,
              };
              return this.usuarioService.createUsuario(usuario)
                .pipe(
                  switchMap((usuarioResponse: ApiResponse<Usuario>) => {
                    const usuario_rol = {
                      id_usuario: usuarioResponse.data.id_usuario!,
                      id_rol: formData.Usuario.id_rol,
                    };
                    return this.usuarioRolService.createUsuarioRol(usuario_rol);
                  })
                );
            }
          })
        ).subscribe({
          next: () => {
            this.alertService.success('Registro actualizado correctamente');
            this.form.reset();
            this.modalService.cerrar('formUsuarioPersona');
            this.edited.emit();
          },
          error: (err) => {
            this.alertService.error(err.error?.message || 'Error al actualizar');
            console.log('❌ Error al actualizar: ', err);
            if (err.error?.errors) setServerErrors(this.form, err.error.errors);
          }
        });

    } else {
      // ==== MODO CREAR ====
      // 1. Crear persona → 2. Con el id_persona crear usuario
      this.personaService.createPersona(formData.Persona)
        .pipe(
          switchMap((personaResponse: ApiResponse<Persona>) => {
            const usuario = {
              id_persona: personaResponse.data.id_persona,
              nombre_usuario: this.nombreUsuarioGenerado,
              contrasenia_hash: this.contraseniaGenerada
            };
            return this.usuarioService.createUsuario(usuario);
          }),
          switchMap((usuarioResponse: ApiResponse<Usuario>) => {
            const usuario_rol = {
              id_usuario: usuarioResponse.data.id_usuario!,
              id_rol: formData.Usuario.id_rol,
            };
            // console.log('👀 usuario_rol: ', usuarioResponse);
            return this.usuarioRolService.createUsuarioRol(usuario_rol);
          })
        ).subscribe({
          next: () => {
            this.alertService.success('Persona, usuario y rol creados correctamente');
            this.form.reset();
            this.modalService.cerrar('formUsuarioPersona');
            this.created.emit();
          },
          error: (err) => {
            this.alertService.error(err.error?.message || 'Error al crear');
            // console.log('❌ Error al crear: ', err);

            // Si el backend devuelve errores de validación, asignarlos a cada control
            if (err.error?.errors) {
              setServerErrors(this.form, err.error.errors);
            }
          }
        });
    }
  }

}
