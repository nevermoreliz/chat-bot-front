import re

with open('src/app/admin-dashboard/pages-agente/cursos-page/components/formlulario-curso-agente/formlulario-curso-agente.ts', 'r') as f:
    content = f.read()

# 1. Add RxJS imports
content = content.replace("import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';", "import { debounceTime, distinctUntilChanged, filter, switchMap, map, catchError } from 'rxjs/operators';\nimport { forkJoin, of, Observable } from 'rxjs';")

# 2. Add class properties
properties = """  publicUrl = environment.baseUrl.replace('/api', ''); // Ajuste según configuración del backend
  isSubiendoAfiche = signal(false);
  isSubiendoPdf = signal(false);

  pendingAficheFile: File | null = null;
  pendingPdfFile: File | null = null;
  localAfichePreview: string | null = null;
  localPdfPreviewName: string | null = null;"""
content = content.replace("  publicUrl = environment.baseUrl.replace('/api', ''); // Ajuste según configuración del backend\n  isSubiendoAfiche = signal(false);\n  isSubiendoPdf = signal(false);", properties)

# 3. Add to effect for edit mode
effect_reset = """        // Volvemos al primer paso del formulario
        this.activeTabIndex.set(0);
        
        // Limpiamos los archivos pendientes
        this.pendingAficheFile = null;
        this.pendingPdfFile = null;
        this.localAfichePreview = null;
        this.localPdfPreviewName = null;"""
content = content.replace("        // Volvemos al primer paso del formulario\n        this.activeTabIndex.set(0);", effect_reset)

# 4. Add to resetFormulario
reset_add = """    this.isDropdownOpen.set(false);
    this.cursosSugeridos.set([]);
    this.isCursoDropdownOpen.set(false);
    this.pendingAficheFile = null;
    this.pendingPdfFile = null;
    this.localAfichePreview = null;
    this.localPdfPreviewName = null;
    this.scrollToTop();"""
content = content.replace("    this.isDropdownOpen.set(false);\n    this.cursosSugeridos.set([]);\n    this.isCursoDropdownOpen.set(false);\n    this.scrollToTop();", reset_add)

# 5. Modify onAficheSelected and onPdfSelected
file_handlers = """  // --- Manejo de archivos (Afiche y PDF) ---
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

    return forkJoin(uploads);
  }"""
old_handlers = """  // --- Manejo de archivos (Afiche y PDF) ---
  onAficheSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isSubiendoAfiche.set(true);
      this.storageService.subirArchivo(file, 'storage/curso/img').subscribe({
        next: (res: any) => {
          this.isSubiendoAfiche.set(false);
          if (res.data?.filename) {
            this.form.patchValue({ url_afiche: res.data.filename });
            this.alertService.success('Afiche subido correctamente');
          }
        },
        error: (err) => {
          this.isSubiendoAfiche.set(false);
          console.error('Error al subir afiche', err);
          this.alertService.error(err.error?.message || 'Error al subir afiche');
        }
      });
    }
  }

  onPdfSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isSubiendoPdf.set(true);
      this.storageService.subirArchivo(file, 'storage/curso/pdf').subscribe({
        next: (res: any) => {
          this.isSubiendoPdf.set(false);
          if (res.data?.filename) {
            this.form.patchValue({ url_contenidos_pdf: res.data.filename });
            this.alertService.success('PDF subido correctamente');
          }
        },
        error: (err) => {
          this.isSubiendoPdf.set(false);
          console.error('Error al subir PDF', err);
          this.alertService.error(err.error?.message || 'Error al subir PDF');
        }
      });
    }
  }"""
content = content.replace(old_handlers, file_handlers)

# 6. Modify onSubmit and extract guardarCurso
old_submit = """  onSubmit() {
    clearServerErrors(this.form);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.alertService.error('Por favor, revisa los campos requeridos marcados en rojo.');
      this.enfocarPrimerError();
      return;
    }

    const formData = this.form.getRawValue();
    const cursoSeleccionado = this.curso();

    if (cursoSeleccionado && cursoSeleccionado.id_curso) {
      // === MODO EDITAR ===
      // TODO: implementar updateCurso

      this.cursosService.updateCurso(cursoSeleccionado.id_curso, formData).subscribe({
        next: (response) => {
          // Si el backend retorna 200 con ok: false, los errores llegan AQUÍ, no en error:
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
          // Si el backend retorna 200 con ok: false, los errores llegan AQUÍ, no en error:
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
  }"""

new_submit = """  onSubmit() {
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
  }"""
content = content.replace(old_submit, new_submit)

with open('src/app/admin-dashboard/pages-agente/cursos-page/components/formlulario-curso-agente/formlulario-curso-agente.ts', 'w') as f:
    f.write(content)
