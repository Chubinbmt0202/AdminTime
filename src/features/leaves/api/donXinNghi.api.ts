import { apiClient } from '../../../services/apiClient';
import type { LeaveRequest } from '../types';

export const leaveApi = {
    layTatCa: (): Promise<{ success: boolean; data: LeaveRequest[]; message?: string }> => {
        return apiClient.get('/leave/all');
    },
    capNhatTrangThai: (params: {
        id_don_xin_nghi: string;
        status: 'approved' | 'rejected';
        id_nguoi_duyet: string;
        ghi_chu?: string;
    }): Promise<{ success: boolean; message?: string }> => {
        return apiClient.patch('/leave/update-status', params);
    }
};
