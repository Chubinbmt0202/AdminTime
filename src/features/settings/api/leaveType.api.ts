import { apiClient } from '../../../services/api.client';

export interface LeaveType {
    id_loai_phep: string;
    ten_phep: string;
    so_ngay_toi_da: number;
    co_luong: boolean;
    mo_ta: string;
}

export const leaveTypeApi = {
    getAll: (): Promise<{ success: boolean; data: LeaveType[]; message?: string }> => {
        return apiClient.get('/leave/types');
    },
    update: (id: string, params: Omit<LeaveType, 'id_loai_phep'>): Promise<{ success: boolean; data: LeaveType; message?: string }> => {
        return apiClient.put(`/leave/types/${id}`, params);
    }
};
