import { apiClient } from '../../../services/apiClient';

export interface LeaveType {
    id_loai_phep: string;
    ten_phep: string;
    so_ngay_toi_da: number;
    so_ngay_toi_da_1_thang: number;
    co_luong: boolean;
    mo_ta: string;
}

export const leaveTypeApi = {
    layTatCa: (): Promise<{ success: boolean; data: LeaveType[]; message?: string }> => {
        return apiClient.get('/leave/types');
    },
    capNhat: (id: string, params: Omit<LeaveType, 'id_loai_phep'>): Promise<{ success: boolean; data: LeaveType; message?: string }> => {
        return apiClient.put(`/leave/types/${id}`, params);
    }
};
