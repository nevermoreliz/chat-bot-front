import { Usuario } from "../../auth/interfaces/user.interface";

export interface Persona {
    id_persona: number;
    nombre: string;
    materno: string;
    paterno: string;
    correo: string;
    ci: string;
    celular: string;
    img: (null | string);
    sexo: string;
    fecha_nacimiento: string;
    notificaciones_chatbot: boolean;
    activo: boolean;
    created_at?: string;
    updated_at?: string;
    usuario?: Usuario;
}