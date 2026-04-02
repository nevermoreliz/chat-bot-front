import { Component, inject } from '@angular/core';
import { ModalService } from '../../../../../shared/services/modal.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../shared/services/alert.service';
import { ModalDirective } from '../../../../../shared/directives/modal.directive';

@Component({
  selector: 'app-formulario-usuario-per',
  imports: [ReactiveFormsModule, ModalDirective],
  templateUrl: './formulario-usuario-per.html',
  styles: ``,
})
export class FormularioUsuarioPer {

  protected modalService = inject(ModalService);
  private alertService = inject(AlertService);
  private fb = inject(FormBuilder);


  form: FormGroup = this.fb.group({

    Persona: this.fb.group({
      nombre: ['', [Validators.required]],
      materno: ['', [Validators.required]],
      paterno: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      ci: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      img: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      fecha_nacimiento: ['', [Validators.required]],
      notificaciones_chatbot: [false, [Validators.required]],
    }),

    Usuario: this.fb.group({
      id_persona: ['', [Validators.required]],
      nombre_usuario: ['', [Validators.required]],
      contrasenia_hash: ['', [Validators.required]],
      id_rol: ['', [Validators.required]],
    })

  });

}
