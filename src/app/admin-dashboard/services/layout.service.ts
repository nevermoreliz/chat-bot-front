import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  // State for Mobile Drawer (Overlay)
  mobileOpen = signal(false);

  // State for Desktop Sidebar (Mini/Expanded)
  // Default true (Expanded)
  desktopExpanded = signal(true);

  toggleSidebar() {
    // Check breakpoint: xl is 1280px in Tailwind default, but we should match the class used in HTML.
    // If I change HTML to xl:drawer-open, then logic splits at 1280.
    if (window.innerWidth >= 1280) {
      this.desktopExpanded.update(v => !v);
    } else {
      this.mobileOpen.update(v => !v);
    }
  }

  setMobileOpen(value: boolean) {
    this.mobileOpen.set(value);
  }

  setDesktopExpanded(value: boolean) {
    this.desktopExpanded.set(value);
  }
}
