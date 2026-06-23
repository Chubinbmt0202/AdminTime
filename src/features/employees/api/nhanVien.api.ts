import { apiClient } from '../../../services/apiClient';
import type { Employee, EmployeeFormData } from '../types';

export const employeeApi = {
    layTatCa: (): Promise<{ success: boolean; data: Employee[]; message?: string }> => {
        return apiClient.get('/employees/getAll');
    },
    taoMoi: (data: EmployeeFormData): Promise<{ success: boolean; message?: string }> => {
        return apiClient.post('/employees/add', data);
    },
    xoa: (id: string): Promise<{ success: boolean; message?: string }> => {
        return apiClient.delete(`/employees/delete/${id}`);
    },
    capNhat: (id: string, data: any): Promise<{ success: boolean; message?: string }> => {
        return apiClient.put(`/employees/update/${id}`, data);
    },
    layTheoId: (id: string): Promise<{ success: boolean; data: Employee; message?: string }> => {
        return apiClient.get(`/employees/getByID/${id}`);
    },
    layTheoPhongBan: (id: number): Promise<{ success: boolean; data: Employee[]; message?: string }> => {
        return apiClient.get(`/employees/by-department/${id}`);
    },
    yeuCauCapNhatGuongMat: (id: string): Promise<{ success: boolean; message?: string }> => {
        return apiClient.put(`/employees/request-face-update/${id}`, {});
    },
    yeuCauCapNhatThongTin: (id: string): Promise<{ success: boolean; message?: string }> => {
        return apiClient.put(`/employees/request-profile-update/${id}`, {});
    }
};