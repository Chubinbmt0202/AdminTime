import { apiClient } from '../../../services/api.client';
import type { Employee, EmployeeFormData } from '../types';

export const employeeApi = {
    getAll: (): Promise<{ success: boolean; data: Employee[]; message?: string }> => {
        return apiClient.get('/employees/getAll');
    },
    add: (data: EmployeeFormData): Promise<{ success: boolean; message?: string }> => {
        return apiClient.post('/employees/add', data);
    },
    delete: (id: number): Promise<{ success: boolean; message?: string }> => {
        return apiClient.delete(`/employees/delete/${id}`);
    }
};