const fs = require('fs');
const filePath = 'src/app/admin-dashboard/pages-agente/cursos-page/components/formlulario-curso-agente/formlulario-curso-agente.html';
let content = fs.readFileSync(filePath, 'utf8');

// The regex to match the @if / @else if blocks. We capture the field name.
const regex = /@if\s*\(\s*form\.get\('([^']+)'\)\?\.hasError\('serverError'\)\s*\)\s*\{[\s\S]*?\}\s*@else\s*if\s*\(\s*form\.get\('\1'\)\?\.invalid\s*&&\s*form\.get\('\1'\)\?\.touched\s*\)\s*\{[\s\S]*?\}/g;

const newContent = content.replace(regex, (match, fieldName) => {
    return `<div [style.display]="getErrorMessage('${fieldName}') ? 'block' : 'none'" class="text-error text-xs mt-1 font-medium">\n                            {{ getErrorMessage('${fieldName}') }}\n                        </div>`;
});

// also fix words that might have custom fallbacks
// "Valor inválido" was replaced automatically.

fs.writeFileSync(filePath, newContent);
console.log("HTML replaced.");
