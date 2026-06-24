// Must match backend enum `vai_tro`
export type Role = 'Admin' | 'HR' | 'Director' | 'Employee';

export type AuthUser = {
  username: string;
  id_tai_khoan: string;
  ten_dang_nhap: string;
  ho_va_ten: string;
  ten_vai_tro: Role;
  id_nhan_vien: string;
  is_face_updated?: boolean;
  hinh_anh?: string | null;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  is_face_updated?: boolean;
  data: AuthUser;
};

