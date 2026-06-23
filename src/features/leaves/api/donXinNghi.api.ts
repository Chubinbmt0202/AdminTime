import { apiClient } from '../../../services/api.client';
import type { LeaveRequest } from '../types';

export const leaveApi = {
    getAll: (): Promise<{ success: boolean; data: LeaveRequest[]; message?: string }> => {
        return apiClient.get('/leave/all');
    },
    updateStatus: (params: {
        id_don_xin_nghi: string;
        status: 'approved' | 'rejected';
        id_nguoi_duyet: string;
        ghi_chu?: string;
    }): Promise<{ success: boolean; message?: string }> => {
        return apiClient.patch('/leave/update-status', params);
    }
};
