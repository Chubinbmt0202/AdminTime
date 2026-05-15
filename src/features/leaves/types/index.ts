export interface LeaveRequest {
    id_don_xin_nghi: string;
    id_nguoi_dung: string;
    id_loai_phep: string;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
    ly_do: string;
    trang_thai: boolean | null; // true: approved, false: rejected, null: pending
    id_nguoi_duyet: string | null;
    ngay_duyet: string | null;
    ngay_tao: string;
    ghi_chu: string | null;
    url_minh_chung: string | null;
    ten_phep: string;
    ho_ten_nhan_vien: string;
    id_phong_ban: string;
    ten_phong_ban: string;
    ten_nguoi_duyet: string | null;
}

export type LeaveStatus = 'approved' | 'rejected' | 'pending';
