const fs = require('fs');
const filePath = '/home/nevermore/Dev/Proyectos/Chatbot/chat-bot-front/src/app/admin-dashboard/pages-agente/cursos-page/components/formlulario-curso-agente/formlulario-curso-agente.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replacements for get()
const getMappings = {
  'id_categoria': 'info.id_categoria',
  'nombre_curso': 'info.nombre_curso',
  'precio': 'precios.precio',
  'descuento': 'precios.descuento',
  'fecha_inicio_descuento': 'fechas.fecha_inicio_descuento',
  'fecha_inicio_clases': 'fechas.fecha_inicio_clases'
};

for (const [oldField, newField] of Object.entries(getMappings)) {
  content = content.replace(new RegExp(`\\.get\\('${oldField}'\\)`, 'g'), `.get('${newField}')`);
}

// Replacements for patchValue
// 1. id_categoria
content = content.replace(/this\.form\.patchValue\(\{\s*id_categoria:\s*null\s*\}\);/g, "this.form.get('info')?.patchValue({ id_categoria: null });");
content = content.replace(/this\.form\.patchValue\(\{\s*id_categoria:\s*cat\.id_categoria\s*\}\);/g, "this.form.get('info')?.patchValue({ id_categoria: cat.id_categoria });");

// 2. precios
content = content.replace(/this\.form\.patchValue\(\{[\s\n]*precio_promocional:\s*precioPromoRedondeado,[\s\n]*precio_grupal:\s*precioGrupalRedondeado[\s\n]*\},/g, "this.form.get('precios')?.patchValue({ precio_promocional: precioPromoRedondeado, precio_grupal: precioGrupalRedondeado },");

// 3. fechas fin descuento y fecha inicio
content = content.replace(/this\.form\.patchValue\(\{[\s\n]*fecha_fin_descuento:\s*nuevaFechaFin\.toISOString\(\)\.split\('T'\)\[0\],[\s\n]*fecha_inicio:\s*fechaInicio[\s\n]*\/\/[^\n]*\n[\s]*\},/g, "this.form.get('fechas')?.patchValue({ fecha_fin_descuento: nuevaFechaFin.toISOString().split('T')[0], fecha_inicio: fechaInicio },");

content = content.replace(/this\.form\.patchValue\(\{[\s\n]*fecha_fin_descuento:\s*null,[\s\n]*fecha_inicio:\s*null[\s\n]*\},/g, "this.form.get('fechas')?.patchValue({ fecha_fin_descuento: null, fecha_inicio: null },");

// 4. limite inscripcion
content = content.replace(/this\.form\.patchValue\(\{\s*fecha_limite_inscripcion:\s*fechaInicioClases\s*\},/g, "this.form.get('fechas')?.patchValue({ fecha_limite_inscripcion: fechaInicioClases },");
content = content.replace(/this\.form\.patchValue\(\{\s*fecha_limite_inscripcion:\s*null\s*\},/g, "this.form.get('fechas')?.patchValue({ fecha_limite_inscripcion: null },");

// 5. nombre_curso
content = content.replace(/this\.form\.patchValue\(\{\s*nombre_curso:\s*cursoSug\.nombre_curso\s*\},/g, "this.form.get('info')?.patchValue({ nombre_curso: cursoSug.nombre_curso },");

// 6. version
content = content.replace(/this\.form\.patchValue\(\{\s*version:\s*\(vNum \+ 1\.0\)\.toFixed\(1\)\s*\}\);/g, "this.form.get('info')?.patchValue({ version: (vNum + 1.0).toFixed(1) });");

fs.writeFileSync(filePath, content);
console.log('TS File Updated!');
