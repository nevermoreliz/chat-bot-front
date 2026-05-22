import { SafeHtml } from '@angular/platform-browser';

export interface MenuItem {
    title: string;
    icon?: string;
    svgIcon?: string;
    safeSvg?: SafeHtml;
    route?: string;
    submenu?: MenuItem[];
    heading?: boolean;
    roles?: string[];
    active?: boolean;
    tooltip?: string;
}