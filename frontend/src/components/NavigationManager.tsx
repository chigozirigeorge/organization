import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Manage last non-sensitive path and intercept back navigation for sensitive pages
export const NavigationManager = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Define sensitive paths where "back" should route to home instead of previous
  const sensitivePatterns = [
    '/payment/verify',
    '/oauth-callback',
    '/oauth-redirect',
    '/auth/callback',
    '/verify/kyc',
  ];

  useEffect(() => {
    // Store last non-sensitive path in session storage
    const path = location.pathname + location.search;
    const isSensitive = sensitivePatterns.some(p => path.startsWith(p));
    if (!isSensitive) {
      try {
        sessionStorage.setItem('lastNonSensitivePath', path);
      } catch (e) {
        // ignore
      }
    }
  }, [location]);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname + window.location.search;
      const isSensitive = sensitivePatterns.some(p => path.startsWith(p));
      if (isSensitive) {
        const last = sessionStorage.getItem('lastNonSensitivePath') || '/';
        // small delay to allow popstate to settle
        setTimeout(() => navigate(last, { replace: true }), 0);
      }
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [navigate]);

  return null;
};

export default NavigationManager;
