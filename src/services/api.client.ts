import { ENV } from '../config/env';

export const apiClient = {
    get: async (endpoint: string) => {
        const res = await fetch(`${ENV.API_URL}${endpoint}`);
        return res.json();
    },
    post: async (endpoint: string, body: any) => {
        const res = await fetch(`${ENV.API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return res.json();
    },
    delete: async (endpoint: string) => {
        const res = await fetch(`${ENV.API_URL}${endpoint}`, {
            method: 'DELETE',
        });
        return res.json();
    },
    put: async (endpoint: string, body: any) => {
        const res = await fetch(`${ENV.API_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return res.json();
    }
};