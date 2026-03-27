import { apiClient } from '../../../services/api.client';
import type { Office, AddOfficeGPSPayload } from '../types';

export const officeApi = {
    getAll: (): Promise<{ success: boolean; data: Office[]; message?: string }> => {
        return apiClient.get('/offices');
    },
    addGPS: (data: AddOfficeGPSPayload): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.post('/offices/gps', data);
    }
};
