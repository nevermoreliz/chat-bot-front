import { Component, computed, inject, signal } from '@angular/core';
import { PersonaService } from '../../services/persona.service';
import { AuthService } from '../../../auth/services/auth-service';
import { Persona } from '../../interfaces/persona.interface';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../shared/services/alert.service';
import { ModalService } from '../../../shared/services/modal.service';
import { ModalDirective } from '../../../shared/directives/modal.directive';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-perfil-page',
  imports: [UpperCasePipe, DatePipe, ReactiveFormsModule, ModalDirective],
  templateUrl: './perfil-page.html',
  styles: ``,
})
export class PerfilPage {

  private personaService = inject(PersonaService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private alertService = inject(AlertService);
  protected modalService = inject(ModalService);
  urlBaseImg = `${environment.baseUrl}/profile`;

  usuario = this.authService.user;
  persona = this.personaService.persona;  // signal compartido del servicio

  nombreCompleto = computed(() => {
    const p = this.persona();
    if (!p) return '';
    return `${p.nombre} ${p.paterno} ${p.materno}`;
  });

  cargando = signal<boolean>(false);
  error = signal<string | null>(null);
  exitoso = signal<boolean>(false);
  guardando = signal<boolean>(false);

  // Foto de perfil
  previewFoto = signal<string | null>(null);
  archivoSeleccionado = signal<File | null>(null);
  subiendoFoto = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    celular: ['', Validators.required],
    sexo: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
  });


  ngOnInit(): void {
    this.cargarPerfil();
  }

  // --- Formulario de perfil ---
  cargarPerfil() {

    this.cargando.set(true);

    // verificar si trae datos del usuario
    // console.log('⭕⭕⭕ ID USUARIO', this.authService.user());

    this.personaService.cargarPersona(this.authService.user()!.id_usuario).subscribe({
      next: ({ data }) => {
        this.llenarFormulario(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.cargando.set(false);
      }
    })
  }

  llenarFormulario(datoPersona: Persona): void {
    this.form.patchValue({
      correo: datoPersona.correo,
      celular: datoPersona.celular,
      sexo: datoPersona.sexo,
      fecha_nacimiento: datoPersona.fecha_nacimiento,
    });
  }

  guardarCambios(): void {
    if (this.form.invalid) return;

    const id = this.authService.user()!.id_persona;
    if (!id) return;

    this.guardando.set(true);
    this.exitoso.set(false);

    const body: Persona = this.form.value;

    this.personaService.updatePersona(id, body).subscribe({
      next: ({ data }) => {
        // actualiza el signal compartido
        this.personaService.setPersona(data);
        this.guardando.set(false);
        this.modalService.cerrar('editarPerfil');
        this.alertService.success('Perfil actualizado correctamente');
      },
      error: () => {
        this.guardando.set(false);
        this.alertService.error('Error al guardar los cambios');
      }
    });
  }
  // --- End Formulario de perfil ---

  // ── Foto de perfil ──

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this._procesarArchivo(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent): void {
    const file = event.dataTransfer?.files[0];
    if (file) {
      this._procesarArchivo(file);
    }
  }

  limpiarFoto(): void {
    this.previewFoto.set(null);
    this.archivoSeleccionado.set(null);
  }

  subirFoto(): void {
    const archivo = this.archivoSeleccionado();
    if (!archivo) return;

    this.subiendoFoto.set(true);

    const id = this.authService.user()!.id_persona;
    if (!id) return;

    this.personaService.updateFotoPerfil(id, archivo).subscribe({
      next: ({ data }) => {
        this.personaService.setPersona(data);
        this.subiendoFoto.set(false);
        this.modalService.cerrar('cambioFotoPerfil');
        this.alertService.success('Foto de perfil actualizada');
        this.limpiarFoto();
      },
      error: () => {
        this.subiendoFoto.set(false);
        this.alertService.error('Error al actualizar la foto de perfil');
      }
    });

  }

  private _procesarArchivo(file: File): void {
    // Validar tipo
    const tiposPermitidos = ['image/png', 'image/jpeg', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      this.alertService.warning('Solo se permiten imágenes PNG, JPG o WEBP');
      return;
    }

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.alertService.warning('La imagen no debe superar los 2MB');
      return;
    }

    this.archivoSeleccionado.set(file);

    // Generar preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewFoto.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
}
