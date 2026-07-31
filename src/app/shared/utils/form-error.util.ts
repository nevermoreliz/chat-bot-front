import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { Subscription, take } from 'rxjs';

/**
 * Tipo esperado de cada error del backend (express-validator)
 */
interface ServerFieldError {
  msg: string;
  path: string;
  type?: string;
  value?: any;
  location?: string;
}

/**
 * Asigna errores de validación del backend a los FormControls de un formulario Angular.
 *
 * Usa `addValidators()` internamente en vez de `setErrors()` para que los errores
 * sobrevivan cuando bloques `@if` / `@switch` re-crean los elementos del formulario
 * (Angular llama `updateValueAndValidity()` al re-crear `formControlName`, lo cual
 * borra errores manuales puestos con `setErrors()`).
 *
 * Los errores se auto-limpian cuando el usuario modifica el valor del campo.
 *
 * Funciona con:
 * - Formularios planos:    form = fb.group({ nombre: '', correo: '' })
 * - Formularios agrupados: form = fb.group({ Persona: fb.group({ nombre: '' }), Usuario: fb.group({ id_rol: '' }) })
 *
 * @param form   - El FormGroup del componente
 * @param errors - Objeto de errores del backend: { campo: { msg: '...', path: '...' } }
 *
 * @example
 * // En el bloque error del subscribe:
 * error: (err) => {
 *   if (err.error?.errors) {
 *     setServerErrors(this.form, err.error.errors);
 *   }
 * }
 */
export function setServerErrors(
  form: FormGroup,
  errors: Record<string, ServerFieldError>
): void {

  for (const campo in errors) {
    const error = errors[campo] as any;

    // El backend podría mandar el nombre del campo en 'path', 'param', 'field' o usar la llave del objeto (campo)
    // Si es un string (ej. errors = { nombre: "Error" }), 'error' será el string.
    let fieldName = campo;
    let mensajeError = 'Valor inválido';

    if (typeof error === 'string') {
      mensajeError = error;
    } else if (typeof error === 'object' && error !== null) {
      fieldName = error.path || error.param || error.field || campo;
      mensajeError = error.msg || error.message || error.error || 'Valor inválido';
    }

    // 1. Buscar directamente (formulario plano)
    let control = form.get(fieldName);

    // 2. Si no existe, buscar dentro de cada subgrupo (formulario agrupado)
    if (!control) {
      for (const groupKey of Object.keys(form.controls)) {
        const group = form.get(groupKey);
        if (group instanceof FormGroup) {
          control = group.get(fieldName);
          if (control) break;
        }
      }
    }

    if (control) {
      // Limpiar validador previo del servidor si existe
      _removeServerValidator(control);

      // Crear un validador persistente que retorna el error del servidor
      // A diferencia de setErrors(), addValidators() sobrevive a updateValueAndValidity()
      const serverValidator: ValidatorFn = () => ({ serverError: mensajeError });
      (control as any).__serverValidator = serverValidator;

      // Agregar el validador y actualizar el estado del control
      control.addValidators(serverValidator);
      control.updateValueAndValidity({ emitEvent: false });
      control.markAsTouched();

      // Auto-limpiar cuando el usuario modifique el valor del campo
      // Esto mejora la UX: una vez que el usuario corrige el campo, el error desaparece
      const sub = control.valueChanges.pipe(take(1)).subscribe(() => {
        _removeServerValidator(control!);
        control!.updateValueAndValidity({ emitEvent: false });
      });
      (control as any).__serverErrorSub = sub;

    } else {
      console.warn(`❌ ALERTA: No se encontró ningún input en el formulario para el campo del backend: '${fieldName}'. El error no se pudo mostrar. Datos recibidos:`, error);
    }
  }
}

/**
 * Limpia el validador de servidor y la suscripción de auto-limpieza de un control individual.
 */
function _removeServerValidator(control: AbstractControl): void {
  if ((control as any).__serverValidator) {
    control.removeValidators((control as any).__serverValidator);
    delete (control as any).__serverValidator;
  }
  if ((control as any).__serverErrorSub) {
    ((control as any).__serverErrorSub as Subscription).unsubscribe();
    delete (control as any).__serverErrorSub;
  }
}

/**
 * Limpia todos los errores de tipo 'serverError' de los controles del formulario.
 *
 * Importante: NO borra errores de Angular (required, min, max, etc.).
 * Solo quita el validador que setServerErrors() asignó previamente.
 *
 * Úsala al inicio de onSubmit() para que un nuevo envío no arrastre
 * errores del backend de un intento anterior.
 *
 * @param form - El FormGroup del componente
 */
export function clearServerErrors(form: FormGroup): void {
  const clearControl = (control: AbstractControl) => {
    _removeServerValidator(control);
    // También limpiar cualquier serverError residual del objeto de errores
    if (control?.hasError('serverError')) {
      const { serverError, ...otrosErrores } = control.errors!;
      control.setErrors(Object.keys(otrosErrores).length ? otrosErrores : null);
    }
    control.updateValueAndValidity({ emitEvent: false });
  };

  for (const groupKey of Object.keys(form.controls)) {
    const group = form.get(groupKey);

    if (group instanceof FormGroup) {
      // Formulario agrupado: recorremos cada control del subgrupo
      for (const controlKey of Object.keys(group.controls)) {
        clearControl(group.get(controlKey)!);
      }
    } else if (group) {
      // Formulario plano: el control está directamente en la raíz
      clearControl(group);
    }
  }
}

/**
 * Utilidad global para unificar y mostrar errores (Frontend y Backend).
 * Retorna el mensaje de error apropiado para un control específico.
 *
 * @param form - El FormGroup que contiene el control
 * @param controlName - El nombre del control a verificar
 * @returns El mensaje de error o una cadena vacía si es válido
 */
export function getErrorMessage(form: FormGroup, controlName: string): string {
  const control = form.get(controlName);

  // Si el control es válido o no ha sido tocado, no mostramos error
  if (!control || !control.errors || !control.touched) {
    return '';
  }

  // 1. Prioridad: Errores del Servidor (Backend)
  if (control.hasError('serverError')) {
    return control.getError('serverError');
  }

  // 2. Errores de validación de Angular (Frontend)
  if (control.hasError('required')) {
    return 'Este campo es obligatorio.';
  }
  if (control.hasError('maxlength')) {
    const max = control.getError('maxlength').requiredLength;
    return `No puede exceder los ${max} caracteres.`;
  }
  if (control.hasError('minlength')) {
    const min = control.getError('minlength').requiredLength;
    return `Debe tener al menos ${min} caracteres.`;
  }
  if (control.hasError('pattern')) {
    return 'El formato ingresado no es válido.';
  }
  if (control.hasError('min')) {
    return `El valor mínimo es ${control.getError('min').min}.`;
  }
  if (control.hasError('max')) {
    return `El valor máximo es ${control.getError('max').max}.`;
  }

  // Errores personalizados
  if (control.hasError('fechasInvalidas')) {
    return 'La fecha de inicio no puede ser menor a la de fin.';
  }

  return 'Valor inválido.';
}
