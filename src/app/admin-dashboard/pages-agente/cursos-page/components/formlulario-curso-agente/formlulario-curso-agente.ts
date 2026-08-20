import { Component, inject, input, output, signal, computed, DestroyRef, ViewChild, ElementRef, effect } from '@angular/core';
import { Curso } from '../../../../interfaces/curso.interface';
import { ModalService } from '../../../../../shared/services/modal.service';
import { AlertService } from '../../../../../shared/services/alert.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ModalDirective } from '../../../../../shared/directives/modal.directive';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoriasCursosService } from '../../../../services/categoriascursos.service';
import { CursosService } from '../../../../services/cursos.service';
import { AuthService } from '../../../../../auth/services/auth-service';
import { CursosAgentesService } from '../../../../services/cursos-agentes.service';
import { debounceTime, distinctUntilChanged, filter, switchMap, map, catchError } from 'rxjs/operators';
import { forkJoin, of, Observable } from 'rxjs';
import { clearServerErrors, setServerErrors, getErrorMessage } from '../../../../../shared/utils/form-error.util';
import { QuillModule } from 'ngx-quill';
import { StorageService } from '../../../../services/storage.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-formlulario-curso-agente',
  imports: [ReactiveFormsModule, ModalDirective, QuillModule],
  templateUrl: './formlulario-curso-agente.html',
  styles: ``,
})
export class FormlularioCursoAgente {

  constructor() {
    // Usamos un effect para observar los cambios en el input 'curso'
    effect(() => {
      const curso = this.curso();
      if (curso) {
        // MODO EDICIÓN
        const cursoEdit = { ...curso } as any;

        // Formatear fechas para los input type="date" (requieren YYYY-MM-DD)
        const dateFields = [
          'fecha_inicio_descuento', 'fecha_fin_descuento',
          'fecha_inicio', 'fecha_fin',
          'fecha_limite_inscripcion', 'fecha_inicio_clases'
        ];

        dateFields.forEach(field => {
          if (cursoEdit[field] && typeof cursoEdit[field] === 'string') {
            // Cortamos "2026-07-01T00:00:00.000Z" -> "2026-07-01"
            cursoEdit[field] = cursoEdit[field].split('T')[0];
          }
        });

        // parcheamos los valores del formulario con los del curso
        this.form.patchValue(cursoEdit);

        // También actualizamos la señal de la categoría para que el select se vea bien
        if (curso.id_categoria) {
          this.selectedCategoryId.set(curso.id_categoria);
        }

        // Volvemos al primer paso del formulario
        this.activeTabIndex.set(0);
        
        // Limpiamos los archivos pendientes
        this.pendingAficheFile = null;
        this.pendingPdfFile = null;
        this.localAfichePreview = null;
        this.localPdfPreviewName = null;
      } else {
        // Si no hay curso (es null), estamos en modo creación, limpiamos el form
        this.resetFormulario();
      }
    });
  }

  // Evento que avisa al padre que se creó un registro
  created = output<void>();
  edited = output<void>();

  // Input para recibir el curso a editar (null significa modo crear)
  curso = input<Curso | null>(null);

  // servicios Globales
  modalService = inject(ModalService);
  alertService = inject(AlertService);
  categoriasService = inject(CategoriasCursosService);
  cursosService = inject(CursosService);
  authService = inject(AuthService);
  cursosAgentesService = inject(CursosAgentesService);
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  cdr = inject(ChangeDetectorRef);

  publicUrl = environment.baseUrl.replace('/api', ''); // Ajuste según configuración del backend
  isSubiendoAfiche = signal(false);
  isSubiendoPdf = signal(false);

  pendingAficheFile: File | null = null;
  pendingPdfFile: File | null = null;
  localAfichePreview: string | null = null;
  localPdfPreviewName: string | null = null;

  categoriasResource = rxResource({
    stream: () => this.categoriasService.getCategoriasAll()
  });

  // form builder
  fb = inject(FormBuilder);

  // Tab activo / Pasos del wizard
  steps = ['info', 'academico', 'precios', 'fechas', 'multimedia'];
  activeTabIndex = signal<number>(0);
  activeTab = computed(() => this.steps[this.activeTabIndex()]);

  // Referencia al contenedor con scroll del formulario
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;


  // --- Lógica para el Buscador de Categorías (Searchable Select) ---
  isDropdownOpen = signal(false);
  terminoBusqueda = signal('');
  selectedCategoryId = signal<number | null>(null); // Añadimos una señal para hacer la selección reactiva

  categoriasFiltradas = computed(() => {
    const data = this.categoriasResource.value()?.data || [];
    const termino = this.terminoBusqueda().toLowerCase();
    if (!termino) return data;
    return data.filter((c: any) => c.nombre_categoria.toLowerCase().includes(termino));
  });

  categoriaSeleccionadaNombre = computed(() => {
    const id = this.selectedCategoryId(); // Ahora leemos de la señal, por lo que computed sí se re-evaluará
    const data = this.categoriasResource.value()?.data || [];
    const cat = data.find((c: any) => c.id_categoria == id);
    // Si hay categoría seleccionada la mostramos, sino mostramos el texto de búsqueda actual
    return cat ? cat.nombre_categoria : this.terminoBusqueda();
  });

  buscarCategoria(event: Event) {
    const input = event.target as HTMLInputElement;
    this.terminoBusqueda.set(input.value);

    // Si el usuario escribe algo nuevo, deseleccionamos la categoría actual
    if (this.form.get('id_categoria')?.value) {
      this.form.patchValue({ id_categoria: null });
      this.selectedCategoryId.set(null); // Actualizamos la señal
    }
  }

  seleccionarCategoria(cat: any) {
    this.form.patchValue({ id_categoria: cat.id_categoria });
    this.selectedCategoryId.set(cat.id_categoria); // Dispara la actualización del computed
    this.terminoBusqueda.set(''); // Reseteamos búsqueda al seleccionar
    this.isDropdownOpen.set(false);
  }

  cerrarDropdown() {
    // Pequeño retardo para que el click en el <li> (mousedown/click) se registre antes de cerrar
    setTimeout(() => {
      this.isDropdownOpen.set(false);
      // Si cerró sin seleccionar nada, limpiamos la búsqueda para que no quede basura visual
      if (!this.form.get('id_categoria')?.value) {
        this.terminoBusqueda.set('');
      }
    }, 150);
  }
  // -----------------------------------------------------------------

  nextStep() {
    if (this.activeTabIndex() < this.steps.length - 1) {
      this.activeTabIndex.update(i => i + 1);
      this.scrollToTop();
    }
  }

  prevStep() {
    if (this.activeTabIndex() > 0) {
      this.activeTabIndex.update(i => i - 1);
      this.scrollToTop();
    }
  }

  setStep(index: number) {
    this.activeTabIndex.set(index);
    this.scrollToTop();
  }

  /** Hace scroll al inicio del contenedor del formulario */
  private scrollToTop() {
    this.scrollContainer?.nativeElement?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // formulario
  form: FormGroup = this.fb.group({
    // --- Identificadores y Relaciones ---
    id_curso: [null], // Generado por el backend
    id_categoria: [null, [Validators.required]],

    // --- Información Principal ---
    nombre_curso: ['', [Validators.required]],
    descripcion: [''],
    descripcion_corta: [''],
    dirigido_a: [''],

    // --- Detalles Académicos ---
    version: ['', [Validators.required]],
    anio: [new Date().getFullYear(), [Validators.required]],
    modalidad: [null],
    nivel: [null],
    idioma: ['es'],
    horario: [''],
    duracion_semanas: [null],
    carga_horaria: [null],
    certificado_incluido: [false],
    requisitos: [''],
    beneficios: [''],
    incluye: [''],

    // --- Precios y Promociones ---
    precio: [0, [Validators.required]],
    precio_promocional: [null],
    descuento: [null],
    fecha_inicio_descuento: [new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0')],
    fecha_fin_descuento: [(() => {
      const d = new Date(); d.setDate(d.getDate() + 7);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    })()],
    precio_grupal: [null],
    min_estudiantes_precio_grupal: [10],

    // --- Fechas ---
    fecha_inicio: [new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0')],
    fecha_fin: [null],
    fecha_limite_inscripcion: [null],
    fecha_inicio_clases: [null],

    // --- Configuración y Límites ---
    max_participantes: [99],
    min_participantes: [20],
    activo: [true],
    destacado: [false],

    // --- Multimedia ---
    url_afiche: [''],
    url_contenidos_pdf: [''],
    url_video_promocional: [''],

    // --- SEO y Divulgación ---
    palabras_clave: [''],
    pregunta_frecuente: [[]], // Se puede manejar como un array simple o usar FormArray si es muy dinámico
    mensaje_bienvenida: [''],
  }, {
    validators: (control: AbstractControl): ValidationErrors | null => {
      const finDesc = control.get('fecha_fin_descuento')?.value;
      const inicioClases = control.get('fecha_inicio_clases')?.value;

      if (finDesc && inicioClases) {
        // Al usar YYYY-MM-DD podemos comparar directamente los strings alfabéticamente
        if (inicioClases < finDesc) {
          return { fechasInvalidas: true };
        }
      }
      return null;
    }
  });


  // --- Lógica Autocompletado Nombre Curso ---
  cursosSugeridos = signal<any[]>([]);
  isCursoDropdownOpen = signal(false);

  // al iniciar el componente
  ngOnInit(): void {

    // Lógica para calcular Precio Promocional
    const recalcularPrecioPromocional = () => {
      const precio = this.form.get('precio')?.value || 0;
      const descuento = this.form.get('descuento')?.value || 0;

      if (precio > 0 && descuento > 0) {
        const montoDescuento = (precio * descuento) / 100;
        const precioFinal = precio - montoDescuento;
        this.form.patchValue({ precio_promocional: parseFloat(precioFinal.toFixed(2)) }, { emitEvent: false });
      } else {
        this.form.patchValue({ precio_promocional: null }, { emitEvent: false });
      }
    };

    this.form.get('precio')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(precio => {
      recalcularPrecioPromocional();

      // Calcular precio grupal inicial (20% de descuento por defecto)
      const p = precio || 0;
      if (p > 0) {
        const grupal = p * 0.8; // 20% menos = 80% del precio
        this.form.patchValue({ precio_grupal: parseFloat(grupal.toFixed(2)) }, { emitEvent: false });
      } else {
        this.form.patchValue({ precio_grupal: null }, { emitEvent: false });
      }
    });

    this.form.get('descuento')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(recalcularPrecioPromocional);

    // Lógica para actualizar fecha_fin_descuento (7 días después de fecha_inicio_descuento)
    // y sincronizar con fecha_inicio y fecha_fin del curso
    this.form.get('fecha_inicio_descuento')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fechaInicio => {
      if (fechaInicio) {
        // Al parsear 'YYYY-MM-DD', JS lo toma como UTC, por lo que usamos getUTC/setUTC para evitar saltos de zona horaria
        const date = new Date(fechaInicio);
        date.setUTCDate(date.getUTCDate() + 7);
        const nuevaFechaFin = date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0') + '-' + String(date.getUTCDate()).padStart(2, '0');
        
        this.form.patchValue({ 
          fecha_fin_descuento: nuevaFechaFin,
          fecha_inicio: fechaInicio,
          fecha_fin: nuevaFechaFin
        }, { emitEvent: false });
      } else {
        this.form.patchValue({ 
          fecha_fin_descuento: null,
          fecha_inicio: null,
          fecha_fin: null
        }, { emitEvent: false });
      }
    });

    // Sincronizar también cuando se cambie la fecha de fin de descuento manualmente
    this.form.get('fecha_fin_descuento')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fechaFinDesc => {
      this.form.patchValue({ fecha_fin: fechaFinDesc }, { emitEvent: false });
    });

    // Lógica para que la fecha límite de inscripción sea igual a la fecha de inicio de clases
    this.form.get('fecha_inicio_clases')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(fechaClases => {
      this.form.patchValue({ fecha_limite_inscripcion: fechaClases || null }, { emitEvent: false });
    });

    // Escuchar los cambios de texto en el input nombre_curso
    this.form.get('nombre_curso')?.valueChanges.pipe(
      debounceTime(400), // Espera 400ms después de que el usuario deje de teclear
      distinctUntilChanged(), // Solo busca si el texto realmente cambió
      filter(val => val && val.trim().length >= 2), // Solo busca si hay 2 o más letras
      switchMap(val => this.cursosService.buscarCursos(val)), // Cancela peticiones anteriores si llegan nuevas
      takeUntilDestroyed(this.destroyRef) // Se destruye automáticamente al cerrar el componente
    ).subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          // Agrupar por nombre_curso y quedarse con la versión más alta
          const cursosMap = new Map<string, any>();

          res.data.forEach((curso: any) => {
            const nombre = curso.nombre_curso ? curso.nombre_curso.trim().toLowerCase() : '';
            const versionActual = parseFloat(curso.version) || 0;

            if (cursosMap.has(nombre)) {
              const cursoGuardado = cursosMap.get(nombre);
              const versionGuardada = parseFloat(cursoGuardado.version) || 0;

              if (versionActual > versionGuardada) {
                cursosMap.set(nombre, curso);
              }
            } else {
              cursosMap.set(nombre, curso);
            }
          });

          this.cursosSugeridos.set(Array.from(cursosMap.values()));
          this.isCursoDropdownOpen.set(true); // Abrir sugerencias
        } else {
          this.cursosSugeridos.set([]);
          this.isCursoDropdownOpen.set(false);
        }
      },
      error: () => {
        this.cursosSugeridos.set([]);
        this.isCursoDropdownOpen.set(false);
      }
    });
  }

  seleccionarNombreCurso(cursoSug: any) {
    this.form.patchValue({ nombre_curso: cursoSug.nombre_curso });

    // Sugerir la siguiente versión automáticamente (ej: 1.0 -> 2.0)
    // SOLO si estamos en modo creación (this.curso() es null)
    if (!this.curso()) {
      if (cursoSug.version) {
        const vNum = parseFloat(cursoSug.version);
        if (!isNaN(vNum)) {
          this.form.patchValue({ version: (vNum + 1) });
        }
      }
    }

    this.isCursoDropdownOpen.set(false);
  }

  cerrarCursoDropdown() {
    setTimeout(() => this.isCursoDropdownOpen.set(false), 200);
  }


  enfocarPrimerError(serverErrors?: Record<string, any>) {
    // Mapeo de controles según la pestaña en la que se encuentran
    const tabsControls = [
      ['id_categoria', 'nombre_curso', 'descripcion_corta', 'descripcion', 'dirigido_a', 'idioma', 'version', 'anio'], // 0: info
      ['modalidad', 'nivel', 'horario', 'duracion_semanas', 'carga_horaria', 'certificado_incluido', 'requisitos', 'beneficios', 'incluye'], // 1: academico
      ['precio', 'precio_promocional', 'descuento', 'fecha_inicio_descuento', 'fecha_fin_descuento', 'precio_grupal', 'min_estudiantes_precio_grupal'], // 2: precios
      ['fecha_inicio', 'fecha_fin', 'fecha_limite_inscripcion', 'fecha_inicio_clases', 'max_participantes', 'min_participantes'], // 3: fechas
      ['url_afiche', 'url_contenidos_pdf', 'url_video_promocional', 'palabras_clave', 'mensaje_bienvenida'] // 4: multimedia
    ];

    // Extraer los paths de los errores del servidor (si los hay)
    const serverPaths: string[] = [];
    if (serverErrors) {
      for (const key in serverErrors) {
        const err = serverErrors[key];
        const path = (typeof err === 'object' && err !== null)
          ? (err.path || err.param || err.field || key)
          : key;
        serverPaths.push(path);
      }
    }

    for (let i = 0; i < tabsControls.length; i++) {
      const controlsInTab = tabsControls[i];
      // Verificar errores de Angular (required, pattern, etc.)
      const hasAngularError = controlsInTab.some(ctrlName => this.form.get(ctrlName)?.invalid);
      // Verificar errores del servidor por path directo
      const hasServerError = serverPaths.some(path => controlsInTab.includes(path));

      if (hasAngularError || hasServerError || (i === 3 && this.form.hasError('fechasInvalidas'))) {
        this.activeTabIndex.set(i);
        this.scrollToTop();
        break;
      }
    }
  }

  resetFormulario() {
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 7);
    const futureStr = futureDate.getFullYear() + '-' + String(futureDate.getMonth() + 1).padStart(2, '0') + '-' + String(futureDate.getDate()).padStart(2, '0');

    this.form.reset({
      anio: today.getFullYear(),
      certificado_incluido: false,
      precio: 0,
      min_estudiantes_precio_grupal: 10,
      max_participantes: 99,
      min_participantes: 20,
      activo: true,
      destacado: false,
      idioma: 'es',
      pregunta_frecuente: [],
      fecha_inicio_descuento: todayStr,
      fecha_fin_descuento: futureStr,
      fecha_inicio: todayStr,
      fecha_fin: futureStr
    });
    this.activeTabIndex.set(0);
    this.terminoBusqueda.set('');
    this.selectedCategoryId.set(null);
    this.isDropdownOpen.set(false);
    this.cursosSugeridos.set([]);
    this.isCursoDropdownOpen.set(false);
    this.pendingAficheFile = null;
    this.pendingPdfFile = null;
    this.localAfichePreview = null;
    this.localPdfPreviewName = null;
    this.scrollToTop();
  }

  onSubmit() {
    clearServerErrors(this.form);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.alertService.error('Por favor, revisa los campos requeridos marcados en rojo.');
      this.enfocarPrimerError();
      return;
    }

    const formData = this.form.getRawValue();
    const cursoSeleccionado = this.curso();

    if (this.pendingAficheFile || this.pendingPdfFile) {
      // Subir archivos pendientes antes de guardar el curso
      this.uploadPendingFiles().subscribe({
        next: (filenames: any) => {
          if (filenames.afiche) {
            this.isSubiendoAfiche.set(false);
            formData.url_afiche = filenames.afiche;
            this.form.patchValue({url_afiche: filenames.afiche}, {emitEvent: false});
            this.pendingAficheFile = null;
            this.localAfichePreview = null;
          }
          if (filenames.pdf) {
            this.isSubiendoPdf.set(false);
            formData.url_contenidos_pdf = filenames.pdf;
            this.form.patchValue({url_contenidos_pdf: filenames.pdf}, {emitEvent: false});
            this.pendingPdfFile = null;
            this.localPdfPreviewName = null;
          }
          this.guardarCurso(formData, cursoSeleccionado);
        },
        error: (err) => {
          this.alertService.error(err.error?.message || 'Error al subir los archivos');
        }
      });
    } else {
      // Si el campo estaba 'pending' pero fue limpiado, o no hay cambios, nos aseguramos que no se mande 'pending'
      if (formData.url_afiche === 'pending') formData.url_afiche = '';
      if (formData.url_contenidos_pdf === 'pending') formData.url_contenidos_pdf = '';
      
      this.guardarCurso(formData, cursoSeleccionado);
    }
  }

  guardarCurso(formData: any, cursoSeleccionado: any) {
    if (cursoSeleccionado && cursoSeleccionado.id_curso) {
      // === MODO EDITAR ===
      this.cursosService.updateCurso(cursoSeleccionado.id_curso, formData).subscribe({
        next: (response) => {
          if (response && (response as any).ok === false && (response as any).errors) {
            this.alertService.error((response as any).message || 'Error de validación');
            setServerErrors(this.form, (response as any).errors);
            this.enfocarPrimerError((response as any).errors);
            this.cdr.detectChanges();
            return;
          }

          this.alertService.success('Curso actualizado exitosamente');
          this.resetFormulario();
          this.modalService.cerrar('formCursoAgente');
          this.edited.emit();
        },
        error: (err) => {
          console.error("Error al actualizar el curso", err);
          this.alertService.error(err.error?.message || 'Error al actualizar el curso');
        }
      });

    } else {
      // === MODO CREAR ===
      this.cursosService.createCurso(formData).subscribe({
        next: (response) => {
          if (response && (response as any).ok === false && (response as any).errors) {
            this.alertService.error((response as any).message || 'Error de validación');
            setServerErrors(this.form, (response as any).errors);
            this.enfocarPrimerError((response as any).errors);
            this.cdr.detectChanges();
            return;
          }

          const idCurso = (response as any).data?.id_curso;
          const idUsuario = this.authService.user()?.id_usuario;

          if (idCurso && idUsuario) {
            const asignacion = {
              id_usuario: idUsuario,
              id_curso: idCurso,
              fecha_asignacion: new Date().toISOString().split('T')[0]
            };

            this.cursosAgentesService.createAsignacion(asignacion).subscribe({
              next: () => {
                this.alertService.success('Curso creado y asignado exitosamente');
                this.resetFormulario();
                this.modalService.cerrar('formCursoAgente');
                this.created.emit();
              },
              error: (err) => {
                console.error("Error al asignar el curso", err);
                this.alertService.error(err.error?.message || 'Curso creado, pero hubo un error al asignarlo');
                this.resetFormulario();
                this.modalService.cerrar('formCursoAgente');
                this.created.emit();
              }
            });
          } else {
            this.alertService.success('Curso creado exitosamente');
            this.resetFormulario();
            this.modalService.cerrar('formCursoAgente');
            this.created.emit();
          }
        },
        error: (err) => {
          console.error("Error al intentar crear el curso", err);
          this.alertService.error(err.error?.message || 'Error al crear el curso');
          if (err.error?.errors) {
            setServerErrors(this.form, err.error.errors);
            this.enfocarPrimerError(err.error.errors);
            this.cdr.detectChanges();
          }
        }
      });
    }
  }

  // --- Utilidad para unificar y mostrar errores (Frontend y Backend) ---
  getErrorMessage(controlName: string): string {
    return getErrorMessage(this.form, controlName);
  }

  // --- Manejo de archivos (Afiche y PDF) ---
  onAficheSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.pendingAficheFile = file;
      this.form.patchValue({ url_afiche: 'pending' });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.localAfichePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onPdfSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.pendingPdfFile = file;
      this.localPdfPreviewName = file.name;
      this.form.patchValue({ url_contenidos_pdf: 'pending' });
    }
  }

  uploadPendingFiles(): Observable<{afiche: string | null, pdf: string | null}> {
    const uploads: any = {};
    
    if (this.pendingAficheFile) {
      this.isSubiendoAfiche.set(true);
      uploads.afiche = this.storageService.subirArchivo(this.pendingAficheFile, 'storage/curso/img').pipe(
        map((res: any) => res.data?.filename),
        catchError(err => {
          this.isSubiendoAfiche.set(false);
          throw err;
        })
      );
    } else {
      uploads.afiche = of(null);
    }

    if (this.pendingPdfFile) {
      this.isSubiendoPdf.set(true);
      uploads.pdf = this.storageService.subirArchivo(this.pendingPdfFile, 'storage/curso/pdf').pipe(
        map((res: any) => res.data?.filename),
        catchError(err => {
          this.isSubiendoPdf.set(false);
          throw err;
        })
      );
    } else {
      uploads.pdf = of(null);
    }

    return forkJoin(uploads) as Observable<{ afiche: string | null; pdf: string | null; }>;
  }

}
