import { apiClient } from '../../../services/api.client';
import type { Office, AddOfficeGPSPayload, WifiConfig, AddWifiPayload } from '../types';

export const officeApi = {
    getAll: (): Promise<{ success: boolean; data: Office[]; message?: string }> => {
        return apiClient.get('/offices');
    },
    addGPS: (data: AddOfficeGPSPayload): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.post('/offices/gps', data);
    },
    updateGPS: (id: string | number, data: AddOfficeGPSPayload): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.put(`/offices/gps/${id}`, data);
    },
    deleteGPS: (id: string | number): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.delete(`/offices/${id}`);
    },
    getAllWifi: (): Promise<{ success: boolean; data: WifiConfig[]; message?: string }> => {
        return apiClient.get('/offices/wifi');
    },
    addWifi: (data: AddWifiPayload): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.post('/offices/wifi', data);
    },
    updateWifi: (id: string | number, data: AddWifiPayload): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.put(`/offices/wifi/${id}`, data);
    },
    deleteWifi: (wifiAddress: string): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.delete(`/offices/wifi/${wifiAddress}`);
    }
};
