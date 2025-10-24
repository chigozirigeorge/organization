// pages/OAuthRedirect.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    console.log('🔄 OAuth Redirect - Processing:', { token, error });

    const processOAuth = async () => {
      if (token) {
        try {
          console.log('✅ Processing OAuth token directly');
          await login(token, 'oauth');
          // Navigation is handled by the login function
        } catch (error) {
          console.error('❌ OAuth login failed:', error);
          navigate('/login?error=oauth_failed');
        }
      } else if (error) {
        console.error('❌ OAuth error:', error);
        navigate('/login?error=' + encodeURIComponent(error));
      } else {
        console.log('⚠️ No token or error in OAuth redirect');
        navigate('/login');
      }
    };

    processOAuth();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Completing authentication...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Redirecting to your dashboard
        </p>
      </div>
    </div>
  );
};

export default OAuthRedirect;