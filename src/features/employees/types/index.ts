export interface Employee {
    id: number;
    username: string;
    full_name: string;
    role: string;
    is_face_updated: boolean;
    created_at: string;
}

export interface EmployeeFormData {
    full_name: string;
    username: string;
    password?: string;
    role: string;
}