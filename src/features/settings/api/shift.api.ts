import { apiClient } from '../../../services/api.client';

export const shiftApi = {
    getAllShifts: (): Promise<any> => {
        return apiClient.get('/shifts/getAllShifts');
    },
    addShift: (data: any): Promise<any> => {
        return apiClient.post('/shifts/addShift', data);
    },
    updateShift: (id: number | string, data: any): Promise<any> => {
        return apiClient.put(`/shifts/updateShift/${id}`, data);
    },
    deleteShift: (id: number | string): Promise<any> => {
        return apiClient.delete(`/shifts/deleteShift/${id}`);
    }
};
