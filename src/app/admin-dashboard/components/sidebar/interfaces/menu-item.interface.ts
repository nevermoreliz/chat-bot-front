export interface MenuItem {
    title: string;
    icon?: string;
    route?: string;
    submenu?: MenuItem[];
    heading?: boolean;
    roles?: string[];
    active?: boolean;
}