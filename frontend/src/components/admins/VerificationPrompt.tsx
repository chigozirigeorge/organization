// components/VerificationPrompt.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Shield, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const VerificationPrompt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartVerification = () => {
    navigate('/verify/kyc');
  };

  const handleSkipForNow = () => {
    // User can access basic features but with limitations
    navigate('/dashboard');
  };

  const getVerificationStatus = () => {
    if (!user) return 'not_started';
    
    if (user.kyc_verified === 'verified') return 'verified';
    if (user.kyc_verified === 'pending') return 'pending';
    if (user.kyc_verified === 'rejected') return 'rejected';
    
    return 'not_started';
  };

  const status = getVerificationStatus();

  if (status === 'verified') {
    return null; // Don't show if already verified
  }

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Identity Verification Required
        </CardTitle>
        <CardDescription>
          Complete verification to access all platform features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status-specific messages */}
        {status === 'pending' && (
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Your verification is under review</span>
          </div>
        )}
        
        {status === 'rejected' && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Verification failed. Please try again.</span>
          </div>
        )}

        {/* Benefits list */}
        <div className="space-y-2 text-sm">
          <p className="font-medium">Complete verification to:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Apply for jobs as a worker</li>
            <li>Post jobs as an employer</li>
            <li>Withdraw funds from your wallet</li>
            <li>Build trust with other users</li>
            <li>Access premium features</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button onClick={handleStartVerification} className="flex-1">
            {status === 'rejected' ? 'Retry Verification' : 'Start Verification'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          {status === 'not_started' && (
            <Button variant="outline" onClick={handleSkipForNow}>
              Skip for Now
            </Button>
          )}
        </div>

        {status === 'not_started' && (
          <p className="text-xs text-muted-foreground">
            You can complete verification later from your dashboard
          </p>
        )}
      </CardContent>
    </Card>
  );
};