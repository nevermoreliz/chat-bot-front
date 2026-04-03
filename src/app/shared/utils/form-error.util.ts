import { FormGroup } from '@angular/forms';

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
    const error = errors[campo];
    // 1. Buscar directamente (formulario plano)
    let control = form.get(campo);

    // 2. Si no existe, buscar dentro de cada subgrupo (formulario agrupado)
    if (!control) {
      for (const groupKey of Object.keys(form.controls)) {
        const group = form.get(groupKey);
        if (group instanceof FormGroup) {
          control = group.get(campo);
          if (control) break;
        }
      }
    }

    if (control) {
      control.setErrors({ serverError: error.msg });
      control.markAsTouched();
    }
  }
}
