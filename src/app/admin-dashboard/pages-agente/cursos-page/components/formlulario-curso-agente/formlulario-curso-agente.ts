import { Component, inject, input, output, signal, computed, DestroyRef } from '@angular/core';
import { Curso } from '../../../../interfaces/curso.interface';
import { ModalService } from '../../../../../shared/services/modal.service';
import { AlertService } from '../../../../../shared/services/alert.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalDirective } from '../../../../../shared/directives/modal.directive';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoriasCursosService } from '../../../../services/categoriascursos.service';
import { CursosService } from '../../../../services/cursos.service';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-formlulario-curso-agente',
  imports: [ReactiveFormsModule, ModalDirective],
  templateUrl: './formlulario-curso-agente.html',
  styles: ``,
})
export class FormlularioCursoAgente {

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
  destroyRef = inject(DestroyRef);

  categoriasResource = rxResource({
    stream: () => this.categoriasService.getCategoriasAll()
  });

  // form builder
  fb = inject(FormBuilder);

  // Tab activo / Pasos del wizard
  steps = ['info', 'academico', 'precios', 'fechas', 'multimedia'];
  activeTabIndex = signal<number>(0);
  activeTab = computed(() => this.steps[this.activeTabIndex()]);


  // --- Lógica para el Buscador de Categorías (Searchable Select) ---
  isDropdownOpen = signal(false);
  terminoBusqueda = signal('');

  categoriasFiltradas = computed(() => {
    const data = this.categoriasResource.value()?.data || [];
    const termino = this.terminoBusqueda().toLowerCase();
    if (!termino) return data;
    return data.filter((c: any) => c.nombre_categoria.toLowerCase().includes(termino));
  });

  categoriaSeleccionadaNombre = computed(() => {
    const id = this.form.get('id_categoria')?.value;
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
    }
  }

  seleccionarCategoria(cat: any) {
    this.form.patchValue({ id_categoria: cat.id_categoria });
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
    }
  }

  prevStep() {
    if (this.activeTabIndex() > 0) {
      this.activeTabIndex.update(i => i - 1);
    }
  }

  setStep(index: number) {
    this.activeTabIndex.set(index);
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
    idioma: [''],
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
    fecha_inicio_descuento: [null],
    fecha_fin_descuento: [null],
    precio_grupal: [null],
    min_estudiantes_precio_grupal: [null],

    // --- Fechas ---
    fecha_inicio: [null],
    fecha_fin: [null],
    fecha_limite_inscripcion: [null],
    fecha_inicio_clases: [null],

    // --- Configuración y Límites ---
    max_participantes: [null],
    min_participantes: [null],
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
  });


  // --- Lógica Autocompletado Nombre Curso ---
  cursosSugeridos = signal<any[]>([]);
  isCursoDropdownOpen = signal(false);

  // al iniciar el componente
  ngOnInit(): void {
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
          this.cursosSugeridos.set(res.data);
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
    if (cursoSug.version) {
       const vNum = parseFloat(cursoSug.version);
       if (!isNaN(vNum)) {
         this.form.patchValue({ version: (vNum + 1.0).toFixed(1) });
       }
    }
    
    this.isCursoDropdownOpen.set(false);
  }

  cerrarCursoDropdown() {
    setTimeout(() => this.isCursoDropdownOpen.set(false), 200);
  }


  onsubmit() {

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    console.log(this.form.value);

  }

}


