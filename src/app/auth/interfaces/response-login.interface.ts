import { User } from "./user.interface";

interface Data {
    token: string;
    user: User;
}

export interface ResponseLogin {
    ok: boolean;
    msg: string;
    data: Data;
}