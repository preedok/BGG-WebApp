import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, UserRole } from '../types';

// ============================================
// MOCK USERS DATABASE
// ============================================

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@bintangglobal.com',
    role: 'super_admin',
    phone: '+62 21 8094 5678',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-02-14T08:00:00Z'
  },
  {
    id: '2',
    name: 'Admin Pusat Jakarta',
    email: 'adminpusat@bintangglobal.com',
    role: 'admin_pusat',
    phone: '+62 21 8094 5679',
    branch_id: 'branch-1',
    branch_name: 'Kantor Pusat Jakarta',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Admin Cabang Surabaya',
    email: 'admincabang.surabaya@bintangglobal.com',
    role: 'admin_cabang',
    phone: '+62 31 5687 4321',
    branch_id: 'branch-2',
    branch_name: 'Cabang Surabaya',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Role Invoice Staff',
    email: 'invoice@bintangglobal.com',
    role: 'role_invoice',
    phone: '+62 21 8094 5680',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Role Handling Staff',
    email: 'handling@bintangglobal.com',
    role: 'role_handling',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Role Visa Staff',
    email: 'visa@bintangglobal.com',
    role: 'role_visa',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '10',
    name: 'Travel Owner Demo',
    email: 'owner@example.com',
    role: 'owner',
    phone: '+62 812 3456 7890',
    company_name: 'Al-Hijrah Travel & Tours',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z'
  }
];

export const DEFAULT_PASSWORD = 'password123';

// ============================================
// AUTH CONTEXT TYPE
// ============================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// ============================================
// CREATE CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// AUTH PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem('bintang_global_user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const foundUser = MOCK_USERS.find(u => u.email === credentials.email);

      if (!foundUser) {
        setIsLoading(false);
        return { success: false, message: 'Email tidak ditemukan' };
      }

      if (credentials.password !== DEFAULT_PASSWORD) {
        setIsLoading(false);
        return { success: false, message: 'Password salah' };
      }

      if (!foundUser.is_active) {
        setIsLoading(false);
        return { success: false, message: 'Akun tidak aktif' };
      }

      // Store in localStorage
      localStorage.setItem('bintang_global_user', JSON.stringify(foundUser));
      localStorage.setItem('bintang_global_token', 'mock-token-' + foundUser.id);

      setUser(foundUser);
      setIsLoading(false);
      return { success: true, message: 'Login berhasil' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'Terjadi kesalahan' };
    }
  };

  const logout = () => {
    localStorage.removeItem('bintang_global_user');
    localStorage.removeItem('bintang_global_token');
    setUser(null);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================
// CUSTOM HOOK
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};