import { Rol } from "../../admin-dashboard/interfaces/rol.interface";

export interface Usuario {
    id_usuario?: number;
    id_persona: number;
    nombre_usuario: string;
    activo?: boolean;
    created_at?: string;
    updated_at?: string;
    roles?: (string | number | Rol)[];
}