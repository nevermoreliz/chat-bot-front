const fs = require('fs');
const filePath = '/home/nevermore/Dev/Proyectos/Chatbot/chat-bot-front/src/app/admin-dashboard/pages-agente/cursos-page/components/formlulario-curso-agente/formlulario-curso-agente.html';
let content = fs.readFileSync(filePath, 'utf8');

// Modificamos el span de idioma para que sea gigantesco y no se pueda perder
content = content.replace(
    /<span class="text-error text-xs mt-1">\{\{ getErrorMessage\('info\.idioma'\) \}\}<\/span>/,
    `<span style="display: block; background: yellow; color: red; font-size: 16px; padding: 4px; border: 2px solid red; z-index: 9999;">ERROR AQUÍ: {{ getErrorMessage('info.idioma') }}</span>`
);

fs.writeFileSync(filePath, content);
console.log('Modified idioma span for debugging');
