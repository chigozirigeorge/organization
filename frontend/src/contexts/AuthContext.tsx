// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  email_verified: boolean;
  kyc_verified: 'pending' | 'verified' | 'rejected' | 'unverified'| 'submitted' | 'approved';
  role: 'user' | 'worker' | 'employer' | 'admin' | 'moderator' | 'customer_care' | 'verifier' | 'vendor' |undefined;
  verification_status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  verification_data?: any;
  wallet_created?: boolean;
  // hashed PIN stored on the backend (never expose actual PIN)
  transaction_pin_hash?: string | null;
  // boolean helper for UI to know whether a PIN is set
  transaction_pin_set?: boolean;
  bank_account_linked?: boolean;
  profile_completed?: boolean;
  phone?: number;
  address?: string;

  subscription_tier?: 'free' | 'premium';
  role_change_count?: number;
  role_change_reset_at?: string;
  
  // Helper methods for frontend
  has_premium_subscription?: () => boolean;
  get_monthly_role_changes?: () => number;
  
  // Backend fields
  verified?: boolean;
  document_verified?: boolean;
  trust_score?: number;
  nationality?: string;
  lga?: string;
  dob?: string;
  wallet_address?: string;
  avatar_url?: string;
  referral_code?: string;
  referral_count?: number;
  verification_type?: string;
  nin_number?: string;
  verification_number?: string;
  nearest_landmark?: string;
  google_id: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (emailOrToken: string, type: 'password' | 'oauth', password?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  verifyEmail: (token: string) => Promise<any>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<User | undefined>;
  updateUserRole: (role: 'worker' | 'employer') => Promise<boolean>;
  setUserProfile: (profile: any) => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  // Verification flow methods
  startVerificationFlow: () => void;
  completeVerificationStep: (step: string, data?: any) => void;
  getVerificationProgress: () => VerificationProgress;
  skipVerification: () => void;
  submitKYC: (kycData: KYCData) => Promise<boolean>;
  updateVerificationStatus: (status: User['verification_status']) => void;
  checkVerificationStatus: () => Promise<boolean>;
  getNextRequiredStep: (user: User) => string;
  authInitialized: boolean; 
  loginWithOAuth: (provider: 'google') => void;
}

interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  referral_code?: string;
  role: string;
}

interface VerificationProgress {
  currentStep: string;
  completedSteps: string[];
  data: any;
  startedAt: string;
}

interface KYCData {
  documentType: 'nin' | 'driver_license' | 'passport' | 'voter_id';
  documentId: string;
  documentUrl: string;
  selfieUrl: string;
  nationality: string;
  dob?: string;
  state: string;
  lga: string;
  nearestLandmark?: string;
}

// Verification flow steps
export const VERIFICATION_STEPS = {
  TERMS: 'terms',
  DOCUMENT: 'document',
  FACIAL: 'facial',
  ROLE: 'role',
  WALLET: 'wallet',
  BANK: 'bank',
  PROFILE: 'profile',
  COMPLETE: 'complete'
} as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false); 
  const [verificationProgress, setVerificationProgress] = useState<VerificationProgress | null>(null);
  const navigate = useNavigate();

  // Helper function to safely get boolean values with defaults
  const getSafeBoolean = (value: boolean | undefined | null, defaultValue: boolean = false): boolean => {
    return value !== undefined && value !== null ? value : defaultValue;
  };
  
  // Forgot Password
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset email');
      throw error;
    }
  };
  
  // Reset Password
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post('/auth/reset-password', { token, new_password: newPassword });
      toast.success('Password has been reset!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
      throw error;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedProgress = localStorage.getItem('verificationProgress');
      
      if (storedToken) {
        // Set token in API client
        apiClient.setToken(storedToken);
        setToken(storedToken);

        console.log('🔄 Auth Initialization - Stored token:', storedToken ? 'Yes' : 'No');
    console.log('🔄 Auth Initialization - Stored user:', storedUser ? 'Yes' : 'No');
        
        // Validate token and get fresh user data
        try {
          console.log('🔐 Validating stored token...');
          const userData = await apiClient.get('/users/me');
          console.log('Token validation successful:', userData);
          
          if (userData.data && userData.data.user) {
            const normalizedUser = normalizeUserData(userData.data.user);
            setUser(normalizedUser);
            localStorage.setItem('user', JSON.stringify(normalizedUser));
            
            // Check if user needs to continue verification
            if (storedProgress && !isVerificationComplete(normalizedUser)) {
              try {
                const progress = JSON.parse(storedProgress);
                setVerificationProgress(progress);
              } catch (e) {
                console.warn('Invalid verification progress data');
              }
            }
          } else {
            // Fallback to stored user
            console.log('⚠️ No user data in response, using stored user');
            if (storedUser) {
              try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
              } catch (e) {
                console.error('❌ Invalid stored user data');
                localStorage.removeItem('user');
              }
            }
          }
        } catch (error: any) {
          console.error('Token validation failed:', error);
          // Token is invalid, clear everything
            handleTokenExpiration();
        }
      } else if (storedUser) {
        // No token but user exists
         console.log('⚠️ No token but user exists in storage');
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
      setAuthInitialized(true);
      console.log('✅ Auth initialization complete');
    };

    initializeAuth();
  }, []);


// In AuthContext.tsx - Update the normalizeUserData function
const normalizeUserData = (userData: any): User => {
  console.log('🔄 Normalizing user data from backend:', userData);
  
  // Determine KYC status based on backend fields
  let kyc_verified: 'pending' | 'verified' | 'rejected' | 'unverified' | 'submitted' = 'unverified';
  
  if (userData.verification_status === 'approved' || userData.document_verified === true) {
    kyc_verified = 'verified';
  } else if (userData.verification_status === 'pending' || userData.verification_status === 'submitted') {
    kyc_verified = 'pending';
  } else if (userData.verification_status === 'rejected') {
    kyc_verified = 'rejected';
  } else {
    kyc_verified = 'unverified';
  }

  console.log('📊 KYC Status Mapping:', {
    backend_verification_status: userData.verification_status,
    backend_document_verified: userData.document_verified,
    mapped_kyc_verified: kyc_verified
  });

  // Create the normalized user object with ALL fields
  const normalizedUser: User = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    username: userData.username,
    
    // Email verification
    email_verified: getSafeBoolean(userData.verified, getSafeBoolean(userData.email_verified)),
    
    // KYC verification status
    kyc_verified: kyc_verified,
    verification_status: userData.verification_status || 'pending',
    
    // Role
    role: userData.role || 'user',
    
    // Wallet and profile status
    wallet_created: !!userData.wallet_address,
    bank_account_linked: getSafeBoolean(userData.bank_account_linked),
    profile_completed: getSafeBoolean(userData.profile_completed),
    
  // Transaction PIN (hashed) presence flag — do NOT store raw PIN in frontend
  transaction_pin_hash: userData.transaction_pin_hash || null,
  transaction_pin_set: !!userData.transaction_pin_hash,
    
    // Backend fields - include ALL fields from backend
    verified: userData.verified,
    document_verified: userData.document_verified,
    trust_score: userData.trust_score || 0,
    nationality: userData.nationality,
    lga: userData.lga,
    dob: userData.dob,
    wallet_address: userData.wallet_address,
    avatar_url: userData.avatar_url,
    referral_code: userData.referral_code,
    referral_count: userData.referral_count || 0,
    verification_type: userData.verification_type,
    nin_number: userData.nin_number,
    verification_number: userData.verification_number,
    nearest_landmark: userData.nearest_landmark,
    
    // Additional fields that might be missing
    verification_data: userData.verification_data,
    google_id: userData.google_id,
    
    // Role and subscription fields
    role_change_count: userData.role_change_count || 0,
    role_change_reset_at: userData.role_change_reset_at,
    subscription_tier: userData.subscription_tier || 'free',
    
    // Helper methods
    has_premium_subscription: () => userData.subscription_tier === 'premium',
    get_monthly_role_changes: () => userData.subscription_tier === 'premium' ? Infinity : 5,
  };

  console.log('✅ Normalized user data:', normalizedUser);
  return normalizedUser;
};

  const updateUser = (userData: Partial<User>) => {
  setUser(prev => prev ? { ...prev, ...userData } : null);
  if (userData) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...userData }));
    }
  };

  const isVerificationComplete = (user: User): boolean => {
    return user.email_verified && 
           user.kyc_verified === 'verified' && 
           user.role !== undefined && 
           user.role !== 'user' &&
           getSafeBoolean(user.wallet_created) && 
           getSafeBoolean(user.bank_account_linked) && 
           getSafeBoolean(user.profile_completed);
  };

  const handleTokenExpiration = () => {
    console.log('🔒 Token expired, clearing auth data');
    apiClient.clearToken();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('verificationProgress');
    setToken(null);
    setUser(null);
    setVerificationProgress(null);
    
    if (!window.location.pathname.includes('/login')) {
      toast.error('Your session has expired. Please log in again.');
      navigate('/login');
    }
  };

  const refreshUser = async (): Promise<User | undefined> => {
  if (!token) return undefined;
  
  try {
    const response = await apiClient.get('/users/me');
    
    // FIX: Use the same pattern as login function
    const userData = response.data?.user || response.data;
    
    if (userData) {
      const normalizedUser = normalizeUserData(userData);
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      // Clear verification progress if user is fully verified
      if (isVerificationComplete(normalizedUser)) {
        localStorage.removeItem('verificationProgress');
        setVerificationProgress(null);
      }
      
      return normalizedUser;
    }
    return undefined;
  } catch (error: any) {
    console.error('Error refreshing user:', error);
    if (error.message === 'Authentication required') {
      handleTokenExpiration();
    }
    throw error;
  }
};

 // In AuthContext.tsx - Replace the loginWithOAuth method
const loginWithOAuth = (provider: 'google') => {
  console.log('🔄 Starting OAuth login flow...');
  const oauthUrl = `${import.meta.env.VITE_API_URL || 'https://verinest.up.railway.app'}/api/oauth/${provider}`;
  
  // Redirect directly to OAuth URL
  window.location.href = oauthUrl;
  console.log('🌐 Redirecting to OAuth provider:', oauthUrl);
};

  const startVerificationFlow = () => {
    const progress: VerificationProgress = {
      currentStep: VERIFICATION_STEPS.TERMS,
      completedSteps: [],
      data: {},
      startedAt: new Date().toISOString()
    };
    
    setVerificationProgress(progress);
    localStorage.setItem('verificationProgress', JSON.stringify(progress));
    navigate('/verify/kyc');
  };

  const completeVerificationStep = (step: string, data?: any) => {
    if (!verificationProgress) return;

    const updatedProgress: VerificationProgress = {
      ...verificationProgress,
      currentStep: getNextStep(step),
      completedSteps: [...new Set([...verificationProgress.completedSteps, step])],
      data: { ...verificationProgress.data, ...data }
    };

    setVerificationProgress(updatedProgress);
    localStorage.setItem('verificationProgress', JSON.stringify(updatedProgress));

    // Auto-navigate to next step
    if (updatedProgress.currentStep !== VERIFICATION_STEPS.COMPLETE) {
      navigate('/verification');
    }
  };

  const getNextStep = (currentStep: string): string => {
    const steps = Object.values(VERIFICATION_STEPS);
    const currentIndex = steps.indexOf(currentStep as any);
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : VERIFICATION_STEPS.COMPLETE;
  };

  const getVerificationProgress = (): VerificationProgress => {
    return verificationProgress || {
      currentStep: VERIFICATION_STEPS.TERMS,
      completedSteps: [],
      data: {},
      startedAt: new Date().toISOString()
    };
  };

  const skipVerification = () => {
    localStorage.removeItem('verificationProgress');
    setVerificationProgress(null);
    navigate('/dashboard');
    toast.info('You can complete verification later from your dashboard');
  };

  const submitKYC = async (kycData: KYCData): Promise<boolean> => {
    try {
      let endpoint = '';
      let payload = {};

      if (kycData.documentType === 'nin') {
        endpoint = '/verification/nin';
        payload = {
          nin_number: kycData.documentId,
          document_url: kycData.documentUrl,
          selfie_url: kycData.selfieUrl,
          nationality: kycData.nationality,
          dob: kycData.dob,
          lga: kycData.lga,
          nearest_landmark: kycData.nearestLandmark
        };
      } else {
        endpoint = '/verification/document';
        payload = {
          verification_type: kycData.documentType,
          document_id: kycData.documentId,
          document_url: kycData.documentUrl,
          selfie_url: kycData.selfieUrl,
          nationality: kycData.nationality,
          dob: kycData.dob,
          lga: kycData.lga,
          nearest_landmark: kycData.nearestLandmark
        };
      }

      const response = await apiClient.post(endpoint, payload);
      
      if (response.status === 'success') {
        // Update user verification status
        await refreshUser();
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('KYC submission failed:', error);
      toast.error(error.message || 'KYC verification failed');
      return false;
    }
  };

  const checkVerificationStatus = async (): Promise<boolean> => {
    try {
      await refreshUser();
      return user?.kyc_verified === 'verified';
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  };


// contexts/AuthContext.tsx (Enhanced getNextRequiredStep)
const getNextRequiredStep = (user: User): string => {
  console.log('🔍 Determining next step for user:', {
      email_verified: user.email_verified,
      kyc_verified: user.kyc_verified,
      role: user.role,
      profile_completed: user.profile_completed
    });

  if (!user) return 'login';
  
  if (!user.email_verified) {
    console.log('📧 Email not verified');
    return 'verify-email';
  }
  
  if (user.kyc_verified === 'unverified') {
    console.log('🆔 KYC not verified:', user.kyc_verified);
    return 'kyc';
  }
  
  if (user.kyc_verified === 'pending' || user.kyc_verified === 'submitted') {
    console.log('⏳ KYC pending review - directing to dashboard');
    return 'dashboard'; // Go to dashboard if KYC is pending or submitted
  }
  
  // Only check role selection if KYC is fully verified
  if (user.kyc_verified === 'verified') {
    if (!user.role || user.role === 'user') {
      console.log('🎭 KYC verified - now can select role');
      return 'select-role';
    }
    
    if (user.role === 'worker' && !user.profile_completed) {
      console.log('👷 Worker profile not completed');
      return 'worker-profile-setup';
    }
  }
  
  console.log('✅ All steps completed, going to dashboard');
  return 'dashboard';
};


  const updateVerificationStatus = (status: User['verification_status']) => {
    setUser(prev => prev ? { ...prev, verification_status: status } : null);
  };

 //fixed
const login = async (emailOrToken: string, type: 'password' | 'oauth' = 'password', password?: string) => {
  try {
    let token: string;

    if (type === 'oauth') {
      // For OAuth login, emailOrToken is the actual token from Google OAuth
      console.log('🔐 Processing OAuth login with token');
      token = emailOrToken;
      
      // Validate the token format
      if (!token || token.split('.').length !== 3) {
        throw new Error('Invalid OAuth token format received');
      }
      
      console.log('✅ OAuth token validated, length:', token.length);
    } else {
      // For password login, make the API call
      console.log('🔐 Processing password login');
      const data = await apiClient.post('/auth/login', { 
        email: emailOrToken, 
        password: password 
      });
      
      console.log('📨 Login API response:', data);
      token = data?.token ?? data?.data?.token;

      if (!token) {
        throw new Error('Login succeeded but no token returned');
      }
    }

    // Set token in API client FIRST to ensure /users/me call works
    console.log('✅ Setting token in API client');
    apiClient.setToken(token);

    // Then fetch user data before storing the token
    console.log('👤 Fetching user data...');
    const userResponse = await apiClient.get('/users/me');
    
    // FIX: Check both possible locations for user data
    const userData = userResponse.user || userResponse;
    
    if (!userData) {
      throw new Error('No user data received after authentication');
    }

    // Store token and user data
    console.log('✅ Storing auth data');
    localStorage.setItem('token', token);
    setToken(token);

    const normalizedUser = normalizeUserData(userData);
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));

    console.log('✅ Auth state updated with user:', normalizedUser.email);

    // Determine next step and navigate
    const nextStep = getNextRequiredStep(normalizedUser);
    console.log('📍 Next step determined:', nextStep);
    
    setTimeout(() => {
      navigateToNextStep(nextStep);
    }, 100);

    // Show a welcome notification for PWAs / installed apps (best-effort)
    try {
      // Dynamically import to avoid heavy modules when not needed
      const notif = await import('../utils/notifications');
      // Only show for dashboard/home landing
      if (nextStep === 'dashboard' || nextStep === 'home' || nextStep === 'feed') {
        notif.ensureAndNotify(`Welcome back, ${normalizedUser.name || 'User'}!`, {
          body: 'Your personalized feed is ready.',
          icon: '/icons/icon-192x192.png',
        });
      }
    } catch (e) {
      console.warn('Notification helper failed:', e);
    }

  } catch (error: any) {
    console.error('❌ Login failed:', error);
    toast.error(error.message || 'Login failed');
    throw error;
  }
};

const navigateToNextStep = (nextStep: string) => {
  switch (nextStep) {
    case 'verify-email':
      toast.success('Login successful! Please verify your email.');
      navigate('/verify-email', { replace: true });
      break;
    
    case 'kyc':
      toast.success('Login successful! Starting verification process...');
      startVerificationFlow();
      break;
    
    case 'select-role':
      toast.success('Login successful! Please select your role.');
      navigate('/select-role', { replace: true });
      break;
    
    case 'worker-profile-setup':
      toast.success('Login successful! Complete your worker profile.');
      navigate('/dashboard/worker/profile-setup', { replace: true });
      break;
    
    case 'employer-dashboard':
      toast.success('Login successful! Welcome back.');
      navigate('/dashboard/employer/dashboard', { replace: true });
      break;
    
    default:
      toast.success('Login successful!');
      navigate('/dashboard', { replace: true });
  }
};

  const register = async (data: RegisterData) => {
    try {
      const requestData = {
        ...data,
        referral_code: data.referral_code?.trim() !== '' ? data.referral_code : undefined
      };

      try {
        const responseData = await apiClient.post('/auth/register', requestData);

        // Auto-login if token is returned
        if (responseData.token && responseData.user) {
          apiClient.setToken(responseData.token);
          setToken(responseData.token);
          localStorage.setItem('token', responseData.token);
          
          const normalizedUser = normalizeUserData(responseData.user);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          setUser(normalizedUser);
          
          // Check for intended action after registration
          const intendedAction = localStorage.getItem('intended_action');
          if (intendedAction) {
            try {
              const action = JSON.parse(intendedAction);
              localStorage.removeItem('intended_action'); // Clear after use
              
              // Handle different action types
              if (action.type === 'contact_worker' && action.username) {
                toast.success('Registration successful! Redirecting to contact worker...');
                setTimeout(() => {
                  navigate(`/@${action.username}`);
                }, 1000);
                return;
              } else if (action.type === 'assign_worker' && action.username) {
                toast.success('Registration successful! Redirecting to assign worker...');
                setTimeout(() => {
                  navigate('/dashboard/employer/post-job', { 
                    state: { preselectedWorker: { username: action.username } } 
                  });
                }, 1000);
                return;
              }
            } catch (e) {
              console.warn('Failed to parse intended action:', e);
            }
          }
          
          // Start verification flow for new users
          if (getSafeBoolean(normalizedUser.email_verified)) {
            toast.success('Registration successful! Starting verification...');
            startVerificationFlow();
          } else {
            toast.success('Registration successful! Please verify your email first.');
            navigate('/verify-email');
          }
        } else {
          // Manual login required
          toast.success('Registration successful! Please login.');
          navigate('/login');
        }
      } catch (apiError: any) {
        // Check if this is a duplicate email error (400 status)
        if (apiError?.response?.status === 400 && 
            apiError.message?.toLowerCase().includes('email already registered')) {
          // Re-throw with specific message to be handled by Register component
          throw new Error('Email already registered');
        }
        // For other API errors
        throw new Error(apiError.message || 'Registration failed');
      }
    } catch (error: any) {
      // Re-throw the error to be handled by the component
      throw error;
    }
  };

  const verifyEmail = async (verificationToken: string): Promise<any> => {
    try {
      const data = await apiClient.get(`/auth/verify?token=${verificationToken}`);
      
      // Update auth state if token is returned
      if (data.token) {
        apiClient.setToken(data.token);
        setToken(data.token);
        localStorage.setItem('token', data.token);
      }
      
      // Update user data
      if (data.user) {
        const normalizedUser = normalizeUserData(data.user);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        
        // Start verification flow after email verification
        toast.success('Email verified! Starting verification process...');
        startVerificationFlow();
      } else {
        await refreshUser();
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  };

  const resendVerification = async () => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await apiClient.post('/auth/resend-verification', { email: user.email });
      toast.success('Verification email sent!');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  };

  const updateUserRole = async (role: 'worker' | 'employer') => {
    try {
      const data = await apiClient.put('/users/role', { role });
      
      if (data.user) {
        const normalizedUser = normalizeUserData(data.user);
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        
        // Mark role step as complete in verification progress
        if (verificationProgress) {
          completeVerificationStep(VERIFICATION_STEPS.ROLE, { role });
        }
        
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Failed to update role:', error);
      if (error.message === 'Authentication required') {
        handleTokenExpiration();
      }
      return false;
    }
  };

  const setUserProfile = (profile: any) => {
    setUser(prev => prev ? { ...prev, ...profile } : null);
  };

  const logout = () => {
    apiClient.clearToken();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('verificationProgress');
    setToken(null);
    setUser(null);
    setVerificationProgress(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    verifyEmail,
    resendVerification,
    refreshUser,
    updateUserRole,
    setUserProfile,
    loading,
    updateUser,
    // Verification flow methods
    startVerificationFlow,
    completeVerificationStep,
    getVerificationProgress,
    skipVerification,
    submitKYC,
    updateVerificationStatus,
    checkVerificationStatus,
    getNextRequiredStep,
    loginWithOAuth,
    authInitialized,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
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
