// components/TokenHandler.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export const TokenHandler = () => {
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 TokenHandler mounted - Checking for token...');
    
    const handleToken = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      
      console.log('📋 TokenHandler - URL parameters:', {
        token: token ? `${token.substring(0, 20)}...` : 'none',
        error,
        fullURL: window.location.href
      });

      // If already authenticated, redirect to dashboard
      if (isAuthenticated) {
        console.log('✅ User already authenticated, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }

      if (token) {
        try {
          console.log('🔑 Token found, attempting OAuth login...');
          console.log('📝 Token details:', {
            length: token.length,
            parts: token.split('.').length,
            header: JSON.parse(atob(token.split('.')[0]))
          });
          
          await login(token, 'oauth');
          console.log('✅ OAuth login successful from TokenHandler');
          
          // Clear the token from URL
          window.history.replaceState({}, '', '/dashboard');
          
        } catch (error: any) {
          console.error('❌ OAuth login failed in TokenHandler:', error);
          console.error('❌ Error details:', error.message);
          
          toast.error('Authentication failed. Please try again.');
          navigate('/login', { replace: true });
        }
      } else if (error) {
        console.error('❌ OAuth error in callback:', error);
        toast.error(`OAuth failed: ${error}`);
        navigate('/login', { replace: true });
      } else {
        console.log('⚠️ No token or error in TokenHandler, redirecting to login');
        navigate('/login', { replace: true });
      }
    };

    handleToken();
  }, [searchParams, login, navigate, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg font-semibold mb-2">Completing OAuth authentication</p>
        <p className="text-sm text-muted-foreground">
          Please wait while we log you in...
        </p>
        <div className="mt-4 text-xs text-muted-foreground">
          Processing OAuth callback
        </div>
      </div>
    </div>
  );
};