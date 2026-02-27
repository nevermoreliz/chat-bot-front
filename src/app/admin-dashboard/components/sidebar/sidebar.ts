import { Component, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styles: ``,
})
export class Sidebar {

  layoutService = inject(LayoutService)
}
