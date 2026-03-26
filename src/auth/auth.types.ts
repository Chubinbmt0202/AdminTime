// Must match backend enum `vai_tro`
export type Role = 'Admin' | 'HR' | 'Director' | 'Employee';

export type AuthUser = {
  id: string;
  username: string;
  full_name: string;
  ten_vai_tro: Role;
  nhan_vien_id?: string;
  is_face_updated?: boolean;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  is_face_updated?: boolean;
  data: AuthUser;
};

