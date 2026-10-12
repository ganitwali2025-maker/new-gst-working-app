import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, ModuleAction, createFullPermissions } from '../types/user';
import { loadUsersFromStorage, saveUsersToStorage, hashPassword, INITIAL_ADMIN_USER } from '../utils/userStorage';
import { uid } from '../utils/storage';

interface AuthContextType {
  token: string | null;
  user: AppUser | null;
  users: AppUser[];
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  // User Management
  createUser: (userData: { username: string; password: string; designation: string; permissions: any }) => Promise<{ success: boolean; message?: string }>;
  updateUser: (userId: string, updates: Partial<AppUser>) => Promise<{ success: boolean; message?: string }>;
  changePassword: (userId: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; message?: string }>;
  toggleUserStatus: (userId: string) => Promise<{ success: boolean; message?: string }>;
  // Permission checks
  hasModuleAccess: (moduleId: string, action?: ModuleAction) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_TOKEN_KEY = 'gst_app_auth_token_v2';
const SESSION_USER_ID_KEY = 'gst_app_auth_userid_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(() => loadUsersFromStorage());
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(SESSION_TOKEN_KEY) : null;
  });
  const [user, setUser] = useState<AppUser | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedUserId = localStorage.getItem(SESSION_USER_ID_KEY);
    if (!storedUserId) return null;
    const all = loadUsersFromStorage();
    const found = all.find(u => u.id === storedUserId && u.status === 'Active');
    return found || null;
  });
  const [loading, setLoading] = useState(false);

  // Sync users state to localStorage whenever it changes
  useEffect(() => {
    saveUsersToStorage(users);
  }, [users]);

  // Sync session whenever user or token changes
  useEffect(() => {
    if (token && user) {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      localStorage.setItem(SESSION_USER_ID_KEY, user.id);
    } else {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(SESSION_USER_ID_KEY);
      // Legacy cleanup
      localStorage.removeItem('token');
    }
  }, [token, user]);

  const isAdmin = user?.role === 'ADMIN';

  // Permission Checker
  const hasModuleAccess = (moduleId: string, action: ModuleAction = 'view'): boolean => {
    if (!user) return false;
    // Admin has unrestricted access to everything
    if (user.role === 'ADMIN') return true;
    if (user.status !== 'Active') return false;

    const modulePerm = user.permissions?.[moduleId];
    if (!modulePerm) return false;

    // Check action
    if (action === 'import') return !!(modulePerm.import || modulePerm.import_export);
    if (action === 'export') return !!(modulePerm.export || modulePerm.import_export);
    if (action === 'import_export') return !!(modulePerm.import || modulePerm.export || modulePerm.import_export);
    return !!modulePerm[action];
  };

  const login = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const cleanUsername = (usernameInput || '').trim().toLowerCase();
      const cleanPassword = (passwordInput || '').trim();

      if (!cleanUsername || !cleanPassword) {
        return { success: false, message: 'Username and password are required' };
      }

      const inputHash = await hashPassword(cleanPassword);
      const currentUsers = loadUsersFromStorage();

      // Find user matching username (case-insensitive) or email
      const matched = currentUsers.find(u => 
        u.username.toLowerCase() === cleanUsername || 
        (u.username.toLowerCase() === 'admin' && (cleanUsername === 'admin@gst.com' || cleanUsername === 'user'))
      );

      if (!matched) {
        // Fallback for demo admin / 1234
        if ((cleanUsername === 'admin' || cleanUsername === 'admin@gst.com') && (cleanPassword === '1234' || cleanPassword === '12345')) {
          const adminUser = INITIAL_ADMIN_USER;
          const newToken = `tok_${uid()}_${Date.now()}`;
          setToken(newToken);
          setUser(adminUser);
          return { success: true };
        }
        return { success: false, message: 'Invalid credentials. User not found.' };
      }

      if (matched.status === 'Inactive') {
        return { success: false, message: 'Account is deactivated. Contact Admin.' };
      }

      // Verify hash or demo fallback
      const isPasswordValid = 
        matched.passwordHash === inputHash || 
        ((cleanUsername === 'admin' || cleanUsername === 'admin@gst.com') && (cleanPassword === '1234' || cleanPassword === '12345'));

      if (!isPasswordValid) {
        return { success: false, message: 'Invalid password. Please check and try again.' };
      }

      const newToken = `tok_${uid()}_${Date.now()}`;
      setToken(newToken);
      setUser(matched);
      return { success: true };
    } catch (_err) {
      return { success: false, message: 'Authentication failed due to an unexpected error.' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Admin User Management Operations
  const createUser = async (userData: { username: string; password: string; designation: string; permissions: any }) => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Only Admin can create users.' };
    }

    const cleanUsername = userData.username.trim();
    if (!cleanUsername) {
      return { success: false, message: 'Username is required.' };
    }
    if (!userData.password || userData.password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const currentUsers = loadUsersFromStorage();
    const alreadyExists = currentUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (alreadyExists) {
      return { success: false, message: `Username "${cleanUsername}" already exists.` };
    }

    const passwordHash = await hashPassword(userData.password);
    const newUser: AppUser = {
      id: `usr_${uid()}`,
      username: cleanUsername,
      passwordHash,
      designation: userData.designation.trim() || 'Accountant',
      role: 'USER',
      status: 'Active',
      permissions: userData.permissions,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...currentUsers, newUser];
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    return { success: true };
  };

  const updateUser = async (userId: string, updates: Partial<AppUser>) => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Only Admin can edit users.' };
    }

    const currentUsers = loadUsersFromStorage();
    const target = currentUsers.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'User not found.' };
    }

    // Do not allow changing username to one that already belongs to another user
    if (updates.username && updates.username.trim().toLowerCase() !== target.username.toLowerCase()) {
      const exists = currentUsers.some(u => u.id !== userId && u.username.toLowerCase() === updates.username?.trim().toLowerCase());
      if (exists) {
        return { success: false, message: 'Username already in use.' };
      }
    }

    const updatedList = currentUsers.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...updates };
        // Admin user role cannot be demoted
        if (u.username.toLowerCase() === 'admin') {
          updated.role = 'ADMIN';
          updated.status = 'Active';
          updated.permissions = createFullPermissions();
        }
        return updated;
      }
      return u;
    });

    setUsers(updatedList);
    saveUsersToStorage(updatedList);

    // If current logged-in user was updated, sync session user
    if (user && user.id === userId) {
      const self = updatedList.find(u => u.id === userId);
      if (self) setUser(self);
    }

    return { success: true };
  };

  const changePassword = async (userId: string, newPassword: string) => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Only Admin can change passwords.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const passwordHash = await hashPassword(newPassword);
    const currentUsers = loadUsersFromStorage();
    const updatedList = currentUsers.map(u => {
      if (u.id === userId) {
        return { ...u, passwordHash };
      }
      return u;
    });

    setUsers(updatedList);
    saveUsersToStorage(updatedList);
    return { success: true };
  };

  const deleteUser = async (userId: string) => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Only Admin can delete users.' };
    }

    const currentUsers = loadUsersFromStorage();
    const target = currentUsers.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'User not found.' };
    }

    if (target.role === 'ADMIN' || target.username.toLowerCase() === 'admin') {
      return { success: false, message: 'Primary Admin user cannot be deleted.' };
    }

    const updatedList = currentUsers.filter(u => u.id !== userId);
    setUsers(updatedList);
    saveUsersToStorage(updatedList);

    return { success: true };
  };

  const toggleUserStatus = async (userId: string) => {
    if (!isAdmin) {
      return { success: false, message: 'Unauthorized. Only Admin can update status.' };
    }

    const currentUsers = loadUsersFromStorage();
    const target = currentUsers.find(u => u.id === userId);
    if (!target) return { success: false, message: 'User not found.' };

    if (target.role === 'ADMIN') {
      return { success: false, message: 'Admin account cannot be deactivated.' };
    }

    const updatedStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    return updateUser(userId, { status: updatedStatus });
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      users,
      isAdmin,
      loading,
      login,
      logout,
      createUser,
      updateUser,
      changePassword,
      deleteUser,
      toggleUserStatus,
      hasModuleAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
