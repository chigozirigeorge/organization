// components/ProtectedRoute.tsx - IMPROVED VERSION
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireKYC?: boolean;
}

export const ProtectedRoute = ({ children, requireKYC = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user, authInitialized } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Brief delay to allow auth state to sync after login
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 200); // Increased delay to ensure user data is loaded

    return () => clearTimeout(timer);
  }, []);

  // Show loading during initial app load or brief sync period
  if (!authInitialized || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('🔐 ProtectedRoute Check:', {
    isAuthenticated,
    user: user?.email,
    pathname: location.pathname,
    requireKYC,
    userKYC: user?.kyc_verified
  });

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: Not authenticated, redirecting to login');
    
    // Check if we have a token in localStorage but state hasn't updated yet
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      console.log('🔄 Token exists in storage but state not updated');
      
      // If we have both token and user in storage, trust it temporarily
      if (storedUser) {
        console.log('📦 User data also in storage, allowing access');
        // Continue rendering children while state syncs in background
        return <>{children}</>;
      }
      
      // Return loading to give auth context time to sync
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Completing login...</span>
        </div>
      );
    }
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check KYC requirement if needed
  if (requireKYC && user?.kyc_verified !== 'verified') {
    console.log('🚫 ProtectedRoute: KYC required but not verified');
    
    // Show appropriate message based on KYC status
    if (user?.kyc_verified === 'pending') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">KYC Under Review</h2>
            <p className="text-muted-foreground mb-4">
              Your KYC verification is currently under review. Please check back later.
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-primary text-white px-4 py-2 rounded"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    
    return <Navigate to="/verify/kyc" replace />;
  }

  console.log('✅ ProtectedRoute: Access granted');
  return <>{children}</>;
};