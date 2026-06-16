import { apiClient } from '../../../services/api.client';
import type { DepartmentApiResponse } from '../../../types/department.types';

export const departmentApi = {
    getAll: (): Promise<DepartmentApiResponse> => {
        return apiClient.get('/departments/');
    },
    create: (data: { ten_phong_ban?: string; mo_ta?: string; mo_ta_chuc_nang?: string }): Promise<{success: boolean; message?: string; data?: any}> => {
        return apiClient.post('/departments/add', data);
    },
    update: (id: string, data: { ten_phong_ban?: string; mo_ta?: string }): Promise<{success: boolean; message?: string; data?: any}> => {
        return apiClient.put(`/departments/${id}`, data);
    },
    delete: (id: string): Promise<{success: boolean; message?: string}> => {
        return apiClient.delete(`/departments/${id}`);
    }
};
