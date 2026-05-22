export interface QrResponse {
    status: string;
    connected: boolean;
    qr: string | null;
}