import { apiClient } from '../../../services/api.client';
import type { DepartmentApiResponse } from '../../../types/department.types';

export const departmentApi = {
    getAll: (): Promise<DepartmentApiResponse> => {
        return apiClient.get('/departments/');
    },
    create: (data: { mo_ta: string }): Promise<{success: boolean; message?: string; data?: any}> => {
        return apiClient.post('/departments/add', data);
    }
};
