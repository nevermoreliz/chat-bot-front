import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private platformId = inject(PLATFORM_ID);
  
  // Aquí puedes configurar los nombres de tu tema claro y oscuro de DaisyUI
  public readonly lightTheme = 'fantasy';
  public readonly darkTheme = 'abyss';

  public currentTheme = signal<string>(this.lightTheme);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
    }

    // Este efecto reacciona automáticamente a los cambios de "currentTheme"
    // para actualizar el DOM y persistir la preferencia en localStorage.
    effect(() => {
      const theme = this.currentTheme();
      if (isPlatformBrowser(this.platformId)) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.THEME_KEY, theme);
      }
    });
  }

  private initTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    } else {
      // Intenta usar la preferencia del sistema operativo del usuario si no hay guardado
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(prefersDark ? this.darkTheme : this.lightTheme);
    }
  }

  toggleTheme() {
    this.currentTheme.update(theme => theme === this.lightTheme ? this.darkTheme : this.lightTheme);
  }
}
