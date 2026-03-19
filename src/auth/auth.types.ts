// Must match backend enum `vai_tro`
export type Role = 'giam_doc' | 'can_bo_nhan_su' | 'quan_tri_vien' | 'nhan_vien';

export type AuthUser = {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  nhan_vien_id?: string;
  is_face_updated?: boolean;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  is_face_updated?: boolean;
  data: AuthUser;
};

