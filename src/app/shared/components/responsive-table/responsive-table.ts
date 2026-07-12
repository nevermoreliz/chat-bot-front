import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  hideOn?: 'sm' | 'md' | 'lg' | 'xl';
  cssClass?: string;
}

@Component({
  selector: 'app-responsive-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './responsive-table.html',
  styleUrls: ['./responsive-table.css']
})
export class ResponsiveTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() cellTemplate!: TemplateRef<any>;

  expandedRows = new Set<number>();

  toggleRow(index: number) {
    if (this.expandedRows.has(index)) {
      this.expandedRows.delete(index);
    } else {
      this.expandedRows.add(index);
    }
  }

  getHiddenClass(hideOn?: string): string {
    if (!hideOn) return '';
    return `hidden ${hideOn}:table-cell`;
  }

  getVisibleClass(hideOn?: string): string {
    if (!hideOn) return 'hidden';
    return `${hideOn}:hidden`;
  }

  get hasExpandableColumns(): boolean {
    return this.columns.some(c => !!c.hideOn);
  }

  get expandButtonHiddenClass(): string {
    const breakpoints: Record<string, number> = { sm: 1, md: 2, lg: 3, xl: 4 };
    let maxBp = 0;
    let maxBpKey = '';
    
    for (const col of this.columns) {
      if (col.hideOn) {
        if (breakpoints[col.hideOn] > maxBp) {
          maxBp = breakpoints[col.hideOn];
          maxBpKey = col.hideOn;
        }
      }
    }
    return maxBpKey ? `${maxBpKey}:hidden` : 'hidden';
  }
}
