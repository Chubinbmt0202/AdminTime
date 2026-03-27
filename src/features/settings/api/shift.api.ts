import { apiClient } from '../../../services/api.client';

export const shiftApi = {
    getAllShifts: (): Promise<any> => {
        return apiClient.get('/shifts/getAllShifts');
    }
};
