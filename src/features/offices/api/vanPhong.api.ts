import { apiClient } from '../../../services/apiClient';
import type { Office, AddOfficeGPSPayload, WifiConfig, AddWifiPayload } from '../types';

export const officeApi = {
    layTatCa: (): Promise<{ success: boolean; data: Office[]; message?: string }> => {
        return apiClient.get('/offices');
    },
    themGPS: (data: AddOfficeGPSPayload): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.post('/offices/gps', data);
    },
    capNhatGPS: (id: string | number, data: AddOfficeGPSPayload): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.put(`/offices/gps/${id}`, data);
    },
    xoaGPS: (id: string | number): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.delete(`/offices/${id}`);
    },
    layTatCaWifi: (): Promise<{ success: boolean; data: WifiConfig[]; message?: string }> => {
        return apiClient.get('/offices/wifi');
    },
    themWifi: (data: AddWifiPayload): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.post('/offices/wifi', data);
    },
    capNhatWifi: (id: string | number, data: AddWifiPayload): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.put(`/offices/wifi/${id}`, data);
    },
    xoaWifi: (wifiAddress: string): Promise<{ success: boolean; message?: string; data: any }> => {
        return apiClient.delete(`/offices/wifi/${wifiAddress}`);
    }
};
