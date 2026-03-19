const USER_KEY = 'adminTime.user';

type StorageKind = 'local' | 'session';

function readStorageKind(): StorageKind {
  const localUser = localStorage.getItem(USER_KEY);
  const sessionUser = sessionStorage.getItem(USER_KEY);
  // Prefer session if it exists
  return sessionUser ? 'session' : localUser ? 'local' : 'local';
}

function getStorage(kind: StorageKind) {
  return kind === 'session' ? sessionStorage : localStorage;
}

export const authStorage = {
  getUserRaw(): string | null {
    const kind = readStorageKind();
    return getStorage(kind).getItem(USER_KEY);
  },
  setUserRaw(userJson: string, remember: boolean) {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    getStorage(remember ? 'local' : 'session').setItem(USER_KEY, userJson);
  },
  clearUserRaw() {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
  clearAll() {
    authStorage.clearUserRaw();
  },
};

