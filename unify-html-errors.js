const fs = require('fs');
const filePath = '/home/nevermore/Dev/Proyectos/Chatbot/chat-bot-front/src/app/admin-dashboard/pages-agente/cursos-page/components/formlulario-curso-agente/formlulario-curso-agente.html';
let content = fs.readFileSync(filePath, 'utf8');

// Eliminar el div amarillo temporal que agregamos antes para depurar
content = content.replace(/<div class="text-yellow-500 text-xs">Errores detectados: \{\{ form\.get\('info\.idioma'\)\?\.errors \| json \}\}<\/div>\s*/g, '');

// 1. Reemplazar todos los @if de validación con el nuevo getErrorMessage()
// Patrones típicos de los @if:
// @if (form.get('info.idioma')?.hasError('serverError')) {
// @if (form.get('info.version')?.invalid && form.get('info.version')?.touched) {
// @if (form.get('info.id_categoria')?.invalid && form.get('info.id_categoria')?.touched) {
// Vamos a atrapar todo el bloque @if (...) { ... }
const ifRegex = /@if\s*\(\s*form\.get\('([^']+)'\)\?\.(hasError\('serverError'\)|invalid\s*&&\s*form\.get\('[^']+'\)\?\.touched)\s*\)\s*\{\s*<span[^>]*>.*?<\/span>\s*\}/gs;

content = content.replace(ifRegex, (match, fieldName) => {
    return `@if (getErrorMessage('${fieldName}')) {
                        <span class="text-error text-xs mt-1">{{ getErrorMessage('${fieldName}') }}</span>
                        }`;
});

// 2. Reemplazar las clases de error: [class.input-error], [class.select-error], [class.textarea-error]
// Patrón: [class.input-error]="form.get('info.idioma')?.hasError('serverError')"
// Patrón: [class.input-error]="form.get('info.version')?.invalid && form.get('info.version')?.touched"

const classRegex = /\[class\.(input|select|textarea|toggle)-error\]="form\.get\('([^']+)'\)\?\.(hasError\('serverError'\)|invalid\s*&&\s*form\.get\('[^']+'\)\?\.touched)"/g;

content = content.replace(classRegex, (match, classType, fieldName) => {
    return `[class.${classType}-error]="getErrorMessage('${fieldName}') !== ''"`;
});

// Escribimos de vuelta
fs.writeFileSync(filePath, content);
console.log('Done replacing unified error handling!');
