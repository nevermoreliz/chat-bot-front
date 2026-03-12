export interface ApiResponse<T> {
    ok: boolean;
    msg: string;
    data: T;
}

export interface ApiError {
    ok: boolean;
    error: string;
    msg?: Record<string, string[]>;
}

// formas de uso
// type PersonaResponse = ApiResponse<Persona>;
// type PersonaListResponse = ApiResponse<Persona[]>;