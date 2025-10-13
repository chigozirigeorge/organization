// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  email_verified: boolean;
  role: 'user' | 'worker' | 'employer' | 'admin' | 'moderator' | 'verifier' | undefined;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserRole: (role: 'worker' | 'employer') => Promise<boolean>;
  setUserProfile: (profile: any) => void;
}

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  referral_code?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const refreshUser = async () => {
  if (!token) return;
  
  try {
    const response = await fetch('https://verinest.up.railway.app/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      } as HeadersInit,
    });
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('Full API response:', responseData);
      
      // Handle the actual response structure: { status: "success", data: { user: {...} } }
      let userData;
      if (responseData.data && responseData.data.user) {
        userData = responseData.data.user;
      } else {
        userData = responseData;
      }
      
      console.log('Extracted user data:', userData);
      
      // Normalize the field names - map 'verified' to 'email_verified'
      const normalizedUser = {
        ...userData,
        email_verified: userData.verified || userData.email_verified || false
      };
      
      console.log('Normalized user data:', normalizedUser);
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      return normalizedUser;
    }
  } catch (error) {
    console.error('Error refreshing user:', error);
  }
};

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        console.warn('Invalid user in localStorage, clearing it');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Login response is not valid JSON', err);
      }

      const token = data?.token ?? data?.data?.token;
      const userObj = data?.user ?? data?.data?.user;

      if (!response.ok) {
        const errMsg = data?.message || data?.error || `Login failed (${response.status})`;
        throw new Error(errMsg);
      }

      if (!token) {
        throw new Error('Login succeeded but no token returned: ' + JSON.stringify(data));
      }

      localStorage.setItem('token', token);
      if (userObj) {
        localStorage.setItem('user', JSON.stringify(userObj));
        setUser(userObj);
      }
      setToken(token);
      
      // Check if email is verified
      if (!userObj?.email_verified) {
        toast.warning('Please verify your email to access all features');
        navigate('/verify-email');
      } else {
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

 const register = async (data: RegisterData) => {
  try {
    const requestData = {
      ...data,
      referral_code: data.referral_code?.trim() !== '' ? data.referral_code : undefined
    };

    const response = await fetch('https://verinest.up.railway.app/api/auth/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      } as HeadersInit,
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Registration failed');
    }

    // If backend returns token and user, auto-login
    if (responseData.token && responseData.user) {
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
      setToken(responseData.token);
      setUser(responseData.user);
      
      // Check if email is verified
      if (responseData.user.email_verified) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        toast.success('Registration successful! Please verify your email.');
        navigate('/verify-email');
      }
    } else {
      // If no token returned, go to login
      toast.success('Registration successful! Please login.');
      navigate('/login');
    }
  } catch (error: any) {
    toast.error(error.message || 'Registration failed');
    throw error;
  }
};

 const verifyEmail = async (verificationToken: string) => {
  try {
    const response = await fetch(`https://verinest.up.railway.app/api/auth/verify?token=${verificationToken}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Email verification failed');
    }

    const data = await response.json();
    
    // If we have a token in response, update the auth state
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }
    
    // If we have user data, update it
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } else {
      // Refresh user data to get updated verification status
      await refreshUser();
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Email verification failed');
  }
};

// Add the resendVerification function if not already there
const resendVerification = async () => {
  if (!user) throw new Error('No user logged in');
  
  try {
    const response = await fetch('https://verinest.up.railway.app/api/auth/resend-verification', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      } as HeadersInit,
      body: JSON.stringify({ email: user.email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to resend verification email');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to resend verification');
  }
};

const updateUserRole = async (role: 'worker' | 'employer') => {
  try {
    const response = await fetch('https://verinest.up.railway.app/api/users/role', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update role:', error);
    return false;
  }
};

const setUserProfile = (profile: any) => {
  setUser(prev => prev ? { ...prev, profile } : null);
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        verifyEmail,
        resendVerification,
        refreshUser,
        updateUserRole,
        setUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};