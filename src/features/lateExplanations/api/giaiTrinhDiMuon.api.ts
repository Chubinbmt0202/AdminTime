import { apiClient } from '../../../services/api.client';
import type { LateExplanation } from '../types';

export const lateExplanationApi = {
    getAll: (): Promise<{ success: boolean; data: LateExplanation[]; message?: string }> => {
        return apiClient.get('/attendance/late-explanations/all');
    },
    updateStatus: (params: {
        id_giai_trinh: string;
        status: 'approved' | 'rejected';
        id_nguoi_duyet: string;
        ghi_chu?: string;
    }): Promise<{ success: boolean; message?: string }> => {
        return apiClient.patch('/attendance/late-explanations/update-status', params);
    }
};
