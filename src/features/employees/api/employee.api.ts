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
    },
    getByID: (id: number): Promise<{ success: boolean; data: Employee; message?: string }> => {
        return apiClient.get(`/employees/getByID/${id}`);
    },
    getByDepartment: (id: number): Promise<{ success: boolean; data: Employee[]; message?: string }> => {
        return apiClient.get(`/employees/by-department/${id}`);
    },
    requestFaceUpdate: (id: number): Promise<{ success: boolean; message?: string }> => {
        return apiClient.put(`/employees/request-face-update/${id}`, {});
    }
};