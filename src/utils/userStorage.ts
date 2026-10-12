import { AppUser, createFullPermissions } from '../types/user';

const USERS_STORAGE_KEY = 'gst_app_users_v1';

// SHA-256 password hashing using Web Crypto API
export async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Built-in initial admin user
export const INITIAL_ADMIN_USER: AppUser = {
  id: 'usr_admin_default',
  username: 'admin',
  // SHA-256 of '1234' is 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
  passwordHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  designation: 'System Administrator',
  role: 'ADMIN',
  status: 'Active',
  permissions: createFullPermissions(),
  createdAt: '2026-01-01T00:00:00.000Z',
};

export function loadUsersFromStorage(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      saveUsersToStorage([INITIAL_ADMIN_USER]);
      return [INITIAL_ADMIN_USER];
    }
    const parsed: AppUser[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveUsersToStorage([INITIAL_ADMIN_USER]);
      return [INITIAL_ADMIN_USER];
    }
    // Ensure admin user always exists and has full permissions
    const hasAdmin = parsed.some(u => u.username.toLowerCase() === 'admin');
    if (!hasAdmin) {
      const updated = [INITIAL_ADMIN_USER, ...parsed];
      saveUsersToStorage(updated);
      return updated;
    }
    return parsed;
  } catch (_e) {
    return [INITIAL_ADMIN_USER];
  }
}

export function saveUsersToStorage(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (_e) {
    console.error('Failed to save users to localStorage', _e);
  }
}
