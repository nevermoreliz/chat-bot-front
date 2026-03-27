export interface ApiResponse<T> {
    msg: string;
    data: T;
    pagination?: Paginacion;
    ok?: boolean;
}

export interface ApiError {
    error: string;
    msg?: Record<string, string[]>;
    ok?: boolean;
}

interface Paginacion {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// formas de uso
// type PersonaResponse = ApiResponse<Persona>;
// type PersonaListResponse = ApiResponse<Persona[]>;