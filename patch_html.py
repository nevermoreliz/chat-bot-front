import re

with open('src/app/admin-dashboard/pages-agente/cursos-page/components/formlulario-curso-agente/formlulario-curso-agente.html', 'r') as f:
    content = f.read()

afiche_start = content.find('<!-- Afiche -->')
video_start = content.find('<!-- Video -->')

if afiche_start != -1 and video_start != -1:
    old_section = content[afiche_start:video_start]
    
    new_section = """<!-- Afiche -->
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend text-primary font-semibold">Afiche (Imagen)</legend>
                            <div class="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl border-base-300 hover:border-primary bg-base-200 transition-colors overflow-hidden group">
                                <input type="file" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    accept="image/jpeg,image/png,image/jpg" (change)="onAficheSelected($event)"
                                    [disabled]="isSubiendoAfiche()" title="Haz clic para subir un afiche" />

                                @if (localAfichePreview || (form.get('url_afiche')?.value && form.get('url_afiche')?.value !== 'pending')) {
                                    <img [src]="localAfichePreview ? localAfichePreview : (publicUrl + '/storage/curso/img/' + form.get('url_afiche')?.value)"
                                         alt="Afiche" class="object-contain w-full h-full absolute inset-0 z-10 bg-base-100" />
                                    
                                    <div class="absolute inset-0 bg-base-content/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-base-100 backdrop-blur-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        <span class="font-medium text-sm">Cambiar imagen</span>
                                    </div>
                                    
                                    @if (form.get('url_afiche')?.value && form.get('url_afiche')?.value !== 'pending' && !localAfichePreview) {
                                        <a [href]="publicUrl + '/storage/curso/img/' + form.get('url_afiche')?.value"
                                           target="_blank"
                                           class="absolute top-2 right-2 btn btn-circle btn-sm btn-ghost bg-base-100/70 hover:bg-base-100 text-base-content z-30 tooltip tooltip-left shadow-sm"
                                           data-tip="Ver original"
                                           (click)="$event.stopPropagation()">
                                           <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                           </svg>
                                        </a>
                                    }
                                } @else {
                                    <div class="flex flex-col items-center justify-center text-base-content/60 pointer-events-none p-4 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p class="font-semibold text-sm">Haz clic o arrastra una imagen aquí</p>
                                        <p class="text-xs mt-1">JPG, PNG hasta 5MB</p>
                                    </div>
                                }
                                
                                @if (isSubiendoAfiche()) {
                                    <div class="absolute inset-0 bg-base-100/80 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
                                        <span class="loading loading-spinner loading-md text-primary"></span>
                                        <span class="text-xs font-medium mt-2">Subiendo...</span>
                                    </div>
                                }
                            </div>
                            <div [style.display]="getErrorMessage('url_afiche') ? 'block' : 'none'" class="text-error text-xs mt-1 font-medium">
                                {{ getErrorMessage('url_afiche') }}
                            </div>
                        </fieldset>

                        <!-- PDF -->
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend text-primary font-semibold">Contenido (PDF)</legend>
                            <div class="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl border-base-300 hover:border-primary bg-base-200 transition-colors overflow-hidden group">
                                
                                <input type="file" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    accept="application/pdf" (change)="onPdfSelected($event)"
                                    [disabled]="isSubiendoPdf()" title="Haz clic para subir un PDF" />

                                @if (localPdfPreviewName || (form.get('url_contenidos_pdf')?.value && form.get('url_contenidos_pdf')?.value !== 'pending')) {
                                    
                                    <div class="flex items-center gap-4 p-4 z-10 w-full h-full bg-base-100">
                                        <div class="bg-error/10 text-error p-3 rounded-lg shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-semibold truncate text-base-content">
                                                {{ localPdfPreviewName ? localPdfPreviewName : 'Documento PDF del curso' }}
                                            </p>
                                            <p class="text-xs text-base-content/60 mt-1">
                                                {{ localPdfPreviewName ? 'Pendiente de guardar' : 'Archivo actual' }}
                                            </p>
                                        </div>
                                        
                                        @if (form.get('url_contenidos_pdf')?.value && form.get('url_contenidos_pdf')?.value !== 'pending' && !localPdfPreviewName) {
                                            <a [href]="publicUrl + '/storage/curso/pdf/' + form.get('url_contenidos_pdf')?.value"
                                               target="_blank" 
                                               class="btn btn-circle btn-ghost hover:bg-base-200 text-primary z-30 shrink-0 tooltip tooltip-left"
                                               data-tip="Ver PDF"
                                               (click)="$event.stopPropagation()">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                        }
                                    </div>
                                    
                                    <div class="absolute inset-0 bg-base-content/5 flex flex-col items-center justify-end pb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                        <span class="text-xs font-semibold text-primary bg-base-100 px-2 py-1 rounded-md shadow-sm border border-base-200">Reemplazar archivo</span>
                                    </div>

                                } @else {
                                    <div class="flex flex-col items-center justify-center text-base-content/60 pointer-events-none p-4 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="size-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p class="font-semibold text-sm">Haz clic o arrastra el documento aquí</p>
                                        <p class="text-xs mt-1">Solo formato PDF hasta 5MB</p>
                                    </div>
                                }

                                @if (isSubiendoPdf()) {
                                    <div class="absolute inset-0 bg-base-100/80 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
                                        <span class="loading loading-spinner loading-md text-primary"></span>
                                        <span class="text-xs font-medium mt-2">Subiendo...</span>
                                    </div>
                                }
                            </div>
                            <div [style.display]="getErrorMessage('url_contenidos_pdf') ? 'block' : 'none'" class="text-error text-xs mt-1 font-medium">
                                {{ getErrorMessage('url_contenidos_pdf') }}
                            </div>
                        </fieldset>

                        """
    content = content.replace(old_section, new_section)
    
    with open('src/app/admin-dashboard/pages-agente/cursos-page/components/formlulario-curso-agente/formlulario-curso-agente.html', 'w') as f:
        f.write(content)
        print("Success")
else:
    print("Tags not found")

