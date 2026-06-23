import { apiClient } from '../../../services/apiClient';
import type { OvertimeRequest } from '../types';

export const overtimeApi = {
    layTatCa: (): Promise<{ success: boolean; data: OvertimeRequest[]; message?: string }> => {
        return apiClient.get('/ot/all');
    },
    capNhatTrangThai: (params: {
        id_don_ot: string;
        status: 'DA_DUYET' | 'TU_CHOI';
        ghi_chu?: string;
    }): Promise<{ success: boolean; message?: string }> => {
        return apiClient.put('/ot/status', params);
    }
};
