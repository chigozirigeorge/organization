// pages/OAuthCallback.tsx - UPDATED
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    console.log('🔄 OAuth Callback - Processing response:', { 
      token: token ? `${token.substring(0, 20)}...` : 'none',
      error 
    });

    if (token) {
      console.log('✅ OAuth successful, processing token');
      
      // Always handle token directly
      console.log('🔄 Redirecting to token handler');
      window.location.href = `/auth/token?token=${encodeURIComponent(token)}`;
      
    } else if (error) {
      console.error('❌ OAuth failed:', error);
      
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { 
            type: 'OAUTH_ERROR', 
            error: error 
          },
          window.location.origin
        );
      }
      
      setTimeout(() => {
        window.close();
      }, 1000);
      
    } else {
      console.log('⚠️ No token or error in OAuth callback');
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: 'OAUTH_CLOSE' },
          window.location.origin
        );
      }
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg font-semibold mb-2">Completing authentication</p>
        <p className="text-sm text-muted-foreground">
          You will be redirected automatically
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;