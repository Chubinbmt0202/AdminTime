import { apiClient } from '../../../services/apiClient';

export interface Role {
    id_vai_tro: string;
    ten_vai_tro: string;
    mo_ta: string | null;
}

export interface RoleApiResponse {
    success: boolean;
    data: Role[];
    message?: string;
}

export const vaiTroApi = {
    layTatCa: (): Promise<RoleApiResponse> => {
        return apiClient.get('/roles/');
    },
    taoMoi: (data: { ten_vai_tro: string; mo_ta?: string }): Promise<{success: boolean; message?: string; data?: Role}> => {
        return apiClient.post('/roles/add', data);
    },
    capNhat: (id: string, data: { ten_vai_tro: string; mo_ta?: string }): Promise<{success: boolean; message?: string; data?: Role}> => {
        return apiClient.put(`/roles/update/${id}`, data);
    },
    xoa: (id: string): Promise<{success: boolean; message?: string}> => {
        return apiClient.delete(`/roles/delete/${id}`);
    }
};
