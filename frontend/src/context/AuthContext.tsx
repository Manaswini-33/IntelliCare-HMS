import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { authService } from '../services/hospitalService';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  login: (username: string, password: string, role?: Role) => Promise<boolean>;
  loginWithData: (authData: any) => void;
  demoLogin: (role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken'));
  const [role, setRole] = useState<Role | null>((localStorage.getItem('userRole') as Role) || null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token && role) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    setIsLoading(false);
  }, [token, role]);

  const loginWithData = (data: any) => {
    const receivedToken = data.token;
    const receivedRole = (data.role || 'PATIENT') as Role;
    const userData: User = {
      userId: data.userId || 1,
      username: data.username || data.phone || 'patient',
      name: data.name || data.username,
      doctorName: data.name,
      specialization: data.specialization,
      department: data.department,
      roomNumber: data.roomNumber,
      role: receivedRole,
      token: receivedToken,
      patientId: data.patientId,
      doctorId: data.doctorId,
    };

    localStorage.setItem('jwtToken', receivedToken);
    localStorage.setItem('userRole', receivedRole);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(receivedToken);
    setRole(receivedRole);
    setUser(userData);
  };

  const login = async (username: string, password: string, selectedRole?: Role): Promise<boolean> => {
    try {
      const res = await authService.login(username, password, selectedRole);
      if (res && res.data && res.data.token) {
        loginWithData(res.data);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Login error:', err?.response?.data?.message || err.message);
      return false;
    }
  };

  const demoLogin = (targetRole: Role) => {
    const defaultCredentials: Record<Role, { username: string }> = {
      PATIENT: { username: 'patient' },
      DOCTOR: { username: '2001' },
      RECEPTIONIST: { username: '3001' },
      LAB_TECHNICIAN: { username: '4001' },
      PHARMACIST: { username: '5001' },
      ADMIN: { username: '6001' },
    };

    const creds = defaultCredentials[targetRole];
    login(creds.username, 'password123', targetRole);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, loginWithData, demoLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
