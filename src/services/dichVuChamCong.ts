import { apiClient } from './api.client';

export interface AttendanceRecord {
    employee_id: number;
    full_name: string;
    username: string;
    log_date: string | null;
    check_in_time: string | null;
    check_out_time: string | null;
    status: 'present' | 'late' | 'half_day' | null;
    has_ot?: boolean;
    ot_start_time?: string | null;
    ot_expected_end_time?: string | null;
    ot_reason?: string | null;
    ot_status?: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI' | null;
    ot_check_in_time?: string | null;
    ot_check_out_time?: string | null;
    url_anh_vao?: string | null;
    url_anh_ra?: string | null;
    explanation?: any | null;
}

export interface AttendanceListResponse {
    success: boolean;
    message: string;
    total: number;
    data: AttendanceRecord[];
}

export interface EmployeeHistoryResponse {
    success: boolean;
    message: string;
    total: number;
    data: AttendanceRecord[];
}

export const attendanceService = {
    getDailyAttendance: async (date?: string): Promise<AttendanceListResponse> => {
        const endpoint = date ? `/attendance/list/daily?date=${date}` : '/attendance/list/daily';
        return apiClient.get(endpoint);
    },

    getEmployeeHistory: async (employeeId: string): Promise<EmployeeHistoryResponse> => {
        return apiClient.get(`/attendance/history/${employeeId}`);
    },

    getAttendanceTrend: async (days: number = 7): Promise<any> => {
        return apiClient.get(`/attendance/summary/trend?days=${days}`);
    }
};
