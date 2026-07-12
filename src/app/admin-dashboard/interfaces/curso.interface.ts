
// Interfaces de apoyo para los campos JSONB y restricciones (CHECK)
export interface PreguntaFrecuente {
    q: string; // Pregunta
    a: string; // Respuesta
}

export type ModalidadCurso = 'Presencial' | 'Virtual' | 'Hibrido';
export type NivelCurso = 'Basico' | 'Intermedio' | 'Avanzado';

export interface Curso {
    id_curso?: number; // Opcional porque al crear un curso nuevo, el backend lo genera (SERIAL)
    id_categoria: number;
    nombre_curso: string;
    descripcion?: string;
    descripcion_corta?: string;
    dirigido_a?: string;
    version: string;
    anio: number;
    horario?: string;
    duracion_semanas?: number;
    carga_horaria?: number;
    precio: number;
    precio_promocional?: number;
    descuento?: number;

    // Las fechas suelen llegar como strings (ISO 8601) desde la API REST
    fecha_inicio_descuento?: string;
    fecha_fin_descuento?: string;

    precio_grupal?: number;
    min_estudiantes_precio_grupal?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    fecha_limite_inscripcion?: string;
    fecha_inicio_clases?: string;

    max_participantes?: number;
    min_participantes?: number;
    modalidad?: ModalidadCurso;
    nivel?: NivelCurso;
    idioma?: string;
    certificado_incluido?: boolean;
    requisitos?: string;
    beneficios?: string;
    incluye?: string;
    activo?: boolean;
    destacado?: boolean;

    url_afiche?: string;
    url_contenidos_pdf?: string;
    url_video_promocional?: string;

    // Campos de divulgación y SEO
    palabras_clave?: string;
    pregunta_frecuente?: PreguntaFrecuente[]; // Mapeado del JSONB
    mensaje_bienvenida?: string;

    created_at?: string;
    updated_at?: string;
}