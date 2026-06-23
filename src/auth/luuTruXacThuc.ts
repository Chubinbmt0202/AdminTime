const USER_KEY = 'adminTime.user';

type StorageKind = 'local' | 'session';

function docKieuBoNho(): StorageKind {
  const localUser = localStorage.getItem(USER_KEY);
  const sessionUser = sessionStorage.getItem(USER_KEY);
  // Prefer session if it exists
  return sessionUser ? 'session' : localUser ? 'local' : 'local';
}

function layBoNho(kind: StorageKind) {
  return kind === 'session' ? sessionStorage : localStorage;
}

export const boNhoXacThuc = {
  layDuLieuNguoiDungTho(): string | null {
    const kind = docKieuBoNho();
    return layBoNho(kind).getItem(USER_KEY);
  },
  datDuLieuNguoiDungTho(userJson: string, remember: boolean) {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    layBoNho(remember ? 'local' : 'session').setItem(USER_KEY, userJson);
  },
  xoaDuLieuNguoiDungTho() {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
  xoaTatCa() {
    boNhoXacThuc.xoaDuLieuNguoiDungTho();
  },
};

