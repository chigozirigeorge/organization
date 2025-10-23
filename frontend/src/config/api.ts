export const API_BASE_URL = 'https://verinest.up.railway.app/api';

interface ApiResponse<T> {
    status: string;
    message?: string;
    data: T;
}