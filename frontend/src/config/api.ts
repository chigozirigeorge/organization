export const API_BASE_URL = 'https://api.verinest.xyz/api';

interface ApiResponse<T> {
    status: string;
    message?: string;
    data: T;
}