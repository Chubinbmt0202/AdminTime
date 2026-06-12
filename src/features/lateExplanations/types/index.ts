export interface LateExplanation {
    id_giai_trinh: string;
    id_nhan_vien: string;
    ngay_giai_trinh: string;
    gio_vao_tre: string;
    ly_do: string;
    trang_thai: boolean | null; // true: approved, false: rejected, null: pending
    id_nguoi_duyet: string | null;
    ngay_duyet: string | null;
    ngay_tao: string;
    ghi_chu: string | null;
    ho_ten_nhan_vien?: string;
    id_phong_ban?: string;
    ten_phong_ban?: string;
    ten_nguoi_duyet?: string | null;
}

export type LateExplanationStatus = 'approved' | 'rejected' | 'pending';
