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
    },
    layCauHinh: (): Promise<{ success: boolean; data: { id_cau_hinh: string; thoi_gian_check_in_truoc: number; thoi_gian_ot_toi_thieu: number; ngay_cap_nhat: string } }> => {
        return apiClient.get('/ot/config');
    },
    capNhatCauHinh: (params: {
        thoi_gian_check_in_truoc: number;
        thoi_gian_ot_toi_thieu: number;
    }): Promise<{ success: boolean; message?: string; data?: any }> => {
        return apiClient.put('/ot/config', params);
    }
};
