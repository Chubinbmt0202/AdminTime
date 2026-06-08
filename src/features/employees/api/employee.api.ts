import { apiClient } from '../../../services/api.client';
import type { Employee, EmployeeFormData } from '../types';

export const employeeApi = {
    getAll: (): Promise<{ success: boolean; data: Employee[]; message?: string }> => {
        return apiClient.get('/employees/getAll');
    },
    add: (data: EmployeeFormData): Promise<{ success: boolean; message?: string }> => {
        return apiClient.post('/employees/add', data);
    },
    delete: (id: string): Promise<{ success: boolean; message?: string }> => {
        return apiClient.delete(`/employees/delete/${id}`);
    },
    update: (id: string, data: any): Promise<{ success: boolean; message?: string }> => {
        return apiClient.put(`/employees/update/${id}`, data);
    },
    getByID: (id: string): Promise<{ success: boolean; data: Employee; message?: string }> => {
        return apiClient.get(`/employees/getByID/${id}`);
    },
    getByDepartment: (id: number): Promise<{ success: boolean; data: Employee[]; message?: string }> => {
        return apiClient.get(`/employees/by-department/${id}`);
    },
    requestFaceUpdate: (id: string): Promise<{ success: boolean; message?: string }> => {
        return apiClient.put(`/employees/request-face-update/${id}`, {});
    },
    requestProfileUpdate: (id: string): Promise<{ success: boolean; message?: string }> => {
        return apiClient.put(`/employees/request-profile-update/${id}`, {});
    }
};