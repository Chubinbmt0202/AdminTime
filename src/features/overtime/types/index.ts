export interface OvertimeRequest {
    id_don_ot: string;
    id_nhan_vien: string;
    ho_va_ten: string;
    id_phong_ban: string;
    ten_phong_ban: string;
    ngay_dang_ky_ot: string;
    gio_bat_dau: string;
    gio_ket_thuc_du_kien: string;
    ly_do: string;
    trang_thai: 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI';
    ngay_tao: string;
}
