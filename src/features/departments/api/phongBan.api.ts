import { apiClient } from '../../../services/apiClient';
import type { DepartmentApiResponse } from '../../../types/kieuPhongBan';

export const departmentApi = {
    layTatCa: (): Promise<DepartmentApiResponse> => {
        return apiClient.get('/departments/');
    },
    taoMoi: (data: { ten_phong_ban?: string; mo_ta?: string; mo_ta_chuc_nang?: string }): Promise<{success: boolean; message?: string; data?: any}> => {
        return apiClient.post('/departments/add', data);
    },
    capNhat: (id: string, data: { ten_phong_ban?: string; mo_ta?: string }): Promise<{success: boolean; message?: string; data?: any}> => {
        return apiClient.put(`/departments/${id}`, data);
    },
    xoa: (id: string): Promise<{success: boolean; message?: string}> => {
        return apiClient.delete(`/departments/${id}`);
    }
};
