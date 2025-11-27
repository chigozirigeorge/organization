// components/EmailVerification.tsx - Improved version
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Mail, RefreshCw, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const EmailVerification = () => {
  const { user, resendVerification, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    // Redirect if user is already verified
    if (user?.email_verified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resendVerification();
      setCooldown(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Failed to resend verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await refreshUser();
    if (user?.email_verified) {
      navigate('/dashboard');
    } else {
      toast.info('Email not verified yet. Please check your inbox.');
    }
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Auto-refresh user data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              Please check your inbox at <strong>{user?.email}</strong> and click the verification link to activate your account.
            </AlertDescription>
          </Alert>

          {/* Email input for cases where user email might not be in context */}
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleResend} 
              disabled={loading || cooldown > 0}
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              I've Verified My Email
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>

          {/* Help section */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Didn't receive the email?</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes and try again</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};