import { apiClient } from './api.client';

export interface AttendanceRecord {
    employee_id: number;
    full_name: string;
    username: string;
    log_date: string | null;
    check_in_time: string | null;
    check_out_time: string | null;
    status: 'present' | 'late' | 'half_day' | null;
}

export interface AttendanceListResponse {
    success: boolean;
    message: string;
    total: number;
    data: AttendanceRecord[];
}

export const attendanceService = {
    getDailyAttendance: async (date?: string): Promise<AttendanceListResponse> => {
        const endpoint = date ? `/attendance/list/daily?date=${date}` : '/attendance/list/daily';
        return apiClient.get(endpoint);
    }
};
