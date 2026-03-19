import { ENV } from '../config/env';

export const apiClient = {
    get: async <T = unknown>(endpoint: string): Promise<T> => {
        const res = await fetch(`${ENV.API_URL}${endpoint}`);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `Request failed (${res.status})`);
        }
        return res.json() as Promise<T>;
    },
    post: async <T = unknown>(endpoint: string, body: unknown): Promise<T> => {
        const res = await fetch(`${ENV.API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `Request failed (${res.status})`);
        }
        return res.json() as Promise<T>;
    },
    delete: async <T = unknown>(endpoint: string): Promise<T> => {
        const res = await fetch(`${ENV.API_URL}${endpoint}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `Request failed (${res.status})`);
        }
        return res.json() as Promise<T>;
    },
    put: async <T = unknown>(endpoint: string, body: unknown): Promise<T> => {
        const res = await fetch(`${ENV.API_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `Request failed (${res.status})`);
        }
        return res.json() as Promise<T>;
    }
};