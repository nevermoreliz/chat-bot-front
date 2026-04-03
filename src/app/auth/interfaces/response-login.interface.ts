import { Usuario } from "./usuario.interface";

interface Data {
    token: string;
    user: Usuario;
}

export interface ResponseLogin {
    msg: string;
    data: Data;
    ok?: boolean;
}