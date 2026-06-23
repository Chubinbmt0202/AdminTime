import { apiClient } from '../../../services/apiClient';
import type { LateExplanation } from '../types';

export const lateExplanationApi = {
    layTatCa: (): Promise<{ success: boolean; data: LateExplanation[]; message?: string }> => {
        return apiClient.get('/attendance/late-explanations/all');
    },
    capNhatTrangThai: (params: {
        id_giai_trinh: string;
        status: 'approved' | 'rejected';
        id_nguoi_duyet: string;
        ghi_chu?: string;
    }): Promise<{ success: boolean; message?: string }> => {
        return apiClient.patch('/attendance/late-explanations/update-status', params);
    }
};
