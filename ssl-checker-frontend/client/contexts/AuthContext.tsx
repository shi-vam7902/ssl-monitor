import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { User, ROLES, PermissionType } from '@/types/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: PermissionType) => boolean;
  hasAnyPermission: (permissions: PermissionType[]) => boolean;
  hasRole: (role: ROLES) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    const isDemoMode = window.location.search.includes('demo=true');

    if (isDemoMode) {
      // Enable demo mode with mock user data
      const mockUser: User = {
        id: 'demo',
        name: 'Demo User',
        email: 'demo@sslmonitor.com',
        role: {
          id: 'demo-role',
          name: ROLES.SUPER_ADMIN,
          permissions: Object.values(PermissionType),
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      authService.setToken('demo-token');
      setUser(mockUser);
      setIsLoading(false);
    } else if (token) {
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Token validation error:', error);
      authService.removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const authResponse = await authService.login({ email, password });
      authService.setToken(authResponse.token);
      setUser(authResponse.user);
      toast({ 
        title: 'Logged in', 
        description: `Welcome back, ${authResponse.user.name}!` 
      });
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast({ 
        title: 'Login failed', 
        description: message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast({ 
        title: 'Logged out', 
        description: 'You have been signed out.' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still log out locally even if server request fails
      authService.removeToken();
      setUser(null);
    }
  };

  const hasPermission = (permission: PermissionType): boolean => {
    if (!user || !user.role) return false;
    return user.role.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: PermissionType[]): boolean => {
    if (!user || !user.role) return false;
    return permissions.some(permission => user.role.permissions.includes(permission));
  };

  const hasRole = (role: ROLES): boolean => {
    if (!user || !user.role) return false;
    return user.role.name === role;
  };

  const isAuthenticated = !!user && !!authService.getToken();

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
