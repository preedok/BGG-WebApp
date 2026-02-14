import { User, UserRole, LoginCredentials, LoginResponse } from '../types';

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
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-02-14T07:30:00Z'
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
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-02-13T16:00:00Z'
  },
  {
    id: '4',
    name: 'Role Invoice Staff',
    email: 'invoice@bintangglobal.com',
    role: 'role_invoice',
    phone: '+62 21 8094 5680',
    branch_id: 'branch-1',
    branch_name: 'Kantor Pusat Jakarta',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-02-14T09:00:00Z'
  },
  {
    id: '5',
    name: 'Role Handling Staff',
    email: 'handling@bintangglobal.com',
    role: 'role_handling',
    phone: '+62 21 8094 5681',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-02-14T08:30:00Z'
  },
  {
    id: '6',
    name: 'Role Visa Staff',
    email: 'visa@bintangglobal.com',
    role: 'role_visa',
    phone: '+62 21 8094 5682',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-02-14T08:15:00Z'
  },
  {
    id: '7',
    name: 'Role Bus Staff',
    email: 'bus@bintangglobal.com',
    role: 'role_bus',
    phone: '+62 21 8094 5683',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-02-13T17:00:00Z'
  },
  {
    id: '8',
    name: 'Role Ticket Staff',
    email: 'ticket@bintangglobal.com',
    role: 'role_ticket',
    phone: '+62 21 8094 5684',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-02-14T07:45:00Z'
  },
  {
    id: '9',
    name: 'Role Accounting Staff',
    email: 'accounting@bintangglobal.com',
    role: 'role_accounting',
    phone: '+62 21 8094 5685',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-02-14T09:15:00Z'
  },
  {
    id: '10',
    name: 'Travel Owner Demo',
    email: 'owner@example.com',
    role: 'owner',
    phone: '+62 812 3456 7890',
    company_name: 'Al-Hijrah Travel & Tours',
    branch_id: 'branch-1',
    branch_name: 'Kantor Pusat Jakarta',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    last_login: '2024-02-14T10:00:00Z'
  }
];

// Default password for all users (in real app, this would be hashed)
const DEFAULT_PASSWORD = 'password123';

// ============================================
// AUTH SERVICE
// ============================================

class AuthService {
  private readonly TOKEN_KEY = 'bintang_global_token';
  private readonly USER_KEY = 'bintang_global_user';

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulate API delay
    await this.delay(800);

    // Find user by email
    const user = MOCK_USERS.find(u => u.email === credentials.email);

    if (!user) {
      return {
        success: false,
        message: 'Email tidak ditemukan'
      };
    }

    // Check password (in real app, this would be hashed comparison)
    if (credentials.password !== DEFAULT_PASSWORD) {
      return {
        success: false,
        message: 'Password salah'
      };
    }

    // Check if user is active
    if (!user.is_active) {
      return {
        success: false,
        message: 'Akun Anda tidak aktif. Hubungi administrator.'
      };
    }

    // Generate mock token
    const token = this.generateToken(user);

    // Update last login
    user.last_login = new Date().toISOString();

    // Store in localStorage
    this.setToken(token);
    this.setUser(user);

    return {
      success: true,
      message: 'Login berhasil',
      data: {
        user,
        token
      }
    };
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get current token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole | UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  }

  /**
   * Store token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Store user in localStorage
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Generate mock JWT token
   */
  private generateToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: user.id, 
      email: user.email, 
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Simulate API delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get all users (for admin purposes)
   */
  getAllUsers(): User[] {
    return MOCK_USERS;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | undefined {
    return MOCK_USERS.find(u => u.email === email);
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: UserRole): User[] {
    return MOCK_USERS.filter(u => u.role === role);
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export default password for reference
export { DEFAULT_PASSWORD };