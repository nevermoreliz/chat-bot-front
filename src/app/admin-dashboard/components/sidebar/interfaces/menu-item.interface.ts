export interface MenuItem {
    title: string;
    icon?: string;
    svgIcon?: string;
    route?: string;
    submenu?: MenuItem[];
    heading?: boolean;
    roles?: string[];
    active?: boolean;
    tooltip?: string;
}