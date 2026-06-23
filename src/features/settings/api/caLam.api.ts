import { apiClient } from '../../../services/apiClient';

export const shiftApi = {
    layTatCaCaLam: (): Promise<any> => {
        return apiClient.get('/shifts/getAllShifts');
    },
    themCaLam: (data: any): Promise<any> => {
        return apiClient.post('/shifts/addShift', data);
    },
    capNhatCaLam: (id: number | string, data: any): Promise<any> => {
        return apiClient.put(`/shifts/updateShift/${id}`, data);
    },
    xoaCaLam: (id: number | string): Promise<any> => {
        return apiClient.delete(`/shifts/deleteShift/${id}`);
    }
};
