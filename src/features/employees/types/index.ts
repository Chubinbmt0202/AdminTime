export interface Employee {
    email: string;
    id_nhan_vien: number;
    full_name: string;
    date_of_birth: string | null;
    phone_number: string | null;
    address: string | null;
    department_id: number | null;
    department_name: string | null;
    id_tai_khoan: number | null;
    username: string;
    id_vai_tro: number | null;
    role_name: string | null;
    trang_thai: boolean;
    created_at: string;
}

export interface EmployeeFormData {
    full_name: string;
    username: string;
    password?: string;
    role_id: number;
    phone_number?: string;
    date_of_birth?: string;
    address?: string;
    department_id?: number;
}