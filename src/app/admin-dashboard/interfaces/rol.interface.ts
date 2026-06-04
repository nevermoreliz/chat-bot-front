import { UsuarioRol } from "./usuario-roles.interface";

export interface Rol {
    nombre_rol: string;
    descripcion?: string | null;
    created_at?: string;
    updated_at?: string;
    id_rol?: number;
    usuarios_roles?: UsuarioRol;
}