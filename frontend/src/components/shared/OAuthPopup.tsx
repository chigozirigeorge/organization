// components/OAuthPopup.tsx - UPDATED
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface OAuthPopupProps {
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const OAuthPopup: React.FC<OAuthPopupProps> = ({ onClose, onSuccess, onError }) => {
  const { login } = useAuth();
  const popupRef = useRef<Window | null>(null);
  const [status, setStatus] = useState<'waiting' | 'processing' | 'success' | 'error'>('waiting');

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Check origin for security
      if (event.origin !== window.location.origin) {
        console.log('🚫 Message from different origin:', event.origin);
        return;
      }

      console.log('📨 Received message in OAuthPopup:', event.data);

      if (event.data.type === 'OAUTH_SUCCESS') {
        const { token } = event.data;
        console.log('✅ OAuth token received, processing login...');
        setStatus('processing');
        
        try {
          // Use the OAuth login flow
          await login(token, 'oauth');
          console.log('✅ OAuth login successful');
          setStatus('success');
          
          // Small delay to show success state
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
          
        } catch (error) {
          console.error('❌ OAuth login failed:', error);
          setStatus('error');
          onError(error instanceof Error ? error.message : 'OAuth login failed');
        }
      } else if (event.data.type === 'OAUTH_ERROR') {
        console.error('❌ OAuth error:', event.data.error);
        setStatus('error');
        onError(event.data.error || 'OAuth authentication failed');
      } else if (event.data.type === 'OAUTH_CLOSE') {
        console.log('🔒 OAuth popup closed by user');
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose, onSuccess, onError, login]);

  const getStatusMessage = () => {
    switch (status) {
      case 'waiting':
        return 'Waiting for authentication...';
      case 'processing':
        return 'Processing login...';
      case 'success':
        return 'Login successful! Redirecting...';
      case 'error':
        return 'Authentication failed';
      default:
        return 'Connecting...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          {status !== 'success' && status !== 'error' && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          )}
          {status === 'success' && (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-lg">✓</span>
            </div>
          )}
          {status === 'error' && (
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-lg">✗</span>
            </div>
          )}
          
          <h3 className="text-lg font-semibold mb-2">
            {status === 'waiting' && 'Connecting to Google'}
            {status === 'processing' && 'Processing'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Error'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {getStatusMessage()}
          </p>
          
          {status === 'waiting' && (
            <p className="text-xs text-muted-foreground mb-4">
              Complete authentication in the popup window
            </p>
          )}
          
          <button
            onClick={onClose}
            className="text-sm text-primary hover:underline"
            disabled={status === 'processing'}
          >
            {status === 'processing' ? 'Processing...' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};