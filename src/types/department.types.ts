export interface Department {
    ten_phong_ban: string;
    id_phong_ban: number;
    mo_ta: string | null;
    ngay_tao: string;
    id_nguoi_dung: number | null;
}

export interface DepartmentApiResponse {
    success: boolean;
    data: Department[];
    message?: string;
}
