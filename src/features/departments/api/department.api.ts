import { apiClient } from '../../../services/api.client';
import type { DepartmentApiResponse } from '../../../types/department.types';

export const departmentApi = {
    getAll: (): Promise<DepartmentApiResponse> => {
        return apiClient.get('/departments/');
    }
};
