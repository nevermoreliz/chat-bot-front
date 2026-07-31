const fs = require('fs');
const filePath = '/home/nevermore/Dev/Proyectos/Chatbot/chat-bot-front/src/app/admin-dashboard/pages-agente/cursos-page/components/formlulario-curso-agente/formlulario-curso-agente.html';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Añadir formGroupName a los divs principales de cada pestaña
const tabs = ['info', 'academico', 'precios', 'fechas', 'multimedia'];
for (const tab of tabs) {
    const regex = new RegExp(`(@if \\(activeTab\\(\\)\\s*===\\s*'${tab}'\\)\\s*\\{[\\s\\n]*)<div\\s+class="([^"]+)"\\s*>`, 'g');
    content = content.replace(regex, `$1<div class="$2" formGroupName="${tab}">`);
}

// 2. Actualizar form.get('X') a form.get('group.X')
const getMappings = {
  // Info
  'id_categoria': 'info.id_categoria',
  'nombre_curso': 'info.nombre_curso',
  'descripcion_corta': 'info.descripcion_corta',
  'descripcion': 'info.descripcion',
  'dirigido_a': 'info.dirigido_a',
  'idioma': 'info.idioma',
  'version': 'info.version',
  'anio': 'info.anio',
  'activo': 'info.activo',
  'destacado': 'info.destacado',
  
  // Académico
  'modalidad': 'academico.modalidad',
  'nivel': 'academico.nivel',
  'horario': 'academico.horario',
  'duracion_semanas': 'academico.duracion_semanas',
  'carga_horaria': 'academico.carga_horaria',
  'certificado_incluido': 'academico.certificado_incluido',
  'requisitos': 'academico.requisitos',
  'beneficios': 'academico.beneficios',
  'incluye': 'academico.incluye',

  // Precios
  'precio': 'precios.precio',
  'precio_promocional': 'precios.precio_promocional',
  'descuento': 'precios.descuento',
  'precio_grupal': 'precios.precio_grupal',
  'min_estudiantes_precio_grupal': 'precios.min_estudiantes_precio_grupal',

  // Fechas
  'fecha_inicio_descuento': 'fechas.fecha_inicio_descuento',
  'fecha_fin_descuento': 'fechas.fecha_fin_descuento',
  'fecha_inicio': 'fechas.fecha_inicio',
  'fecha_fin': 'fechas.fecha_fin',
  'fecha_inicio_clases': 'fechas.fecha_inicio_clases',
  'fecha_limite_inscripcion': 'fechas.fecha_limite_inscripcion',
  'min_participantes': 'fechas.min_participantes',
  'max_participantes': 'fechas.max_participantes',

  // Multimedia
  'url_afiche': 'multimedia.url_afiche',
  'url_contenidos_pdf': 'multimedia.url_contenidos_pdf',
  'url_video_promocional': 'multimedia.url_video_promocional',
  'palabras_clave': 'multimedia.palabras_clave',
  'mensaje_bienvenida': 'multimedia.mensaje_bienvenida'
};

for (const [oldField, newField] of Object.entries(getMappings)) {
  content = content.replace(new RegExp(`form\\.get\\('${oldField}'\\)`, 'g'), `form.get('${newField}')`);
}

fs.writeFileSync(filePath, content);
console.log('HTML File Updated!');
