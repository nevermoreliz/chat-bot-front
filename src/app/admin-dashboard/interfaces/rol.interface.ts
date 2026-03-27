import { UsuarioRol } from "./usuario-roles.interface";

export interface Rol {
    nombre_rol: string;
    created_at?: string;
    updated_at?: string;
    id_rol?: number;
    descripcion?: string | null;
    usuarios_roles?: UsuarioRol;
}