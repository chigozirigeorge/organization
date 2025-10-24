import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import logo from '../assets/verinest.png';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { PrivacyPolicy } from '../components/PrivacyPolicy';
import { TermsAndConditions } from '../components/TermsAndConditions';
import { OAuthPopup } from '../components/OAuthPopup';

const Register = () => {
  const { register, loginWithOAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    referral_code: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  const [showOAuthPopup, setShowOAuthPopup] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showTermsFirst, setShowTermsFirst] = useState(true); // New state to show terms first
  const navigate = useNavigate();

  const handleOAuthLogin = (provider: 'google') => {
    setOauthError(null);
    setShowOAuthPopup(true);
    loginWithOAuth(provider);
  };

  const handleOAuthSuccess = () => {
    setShowOAuthPopup(false);
    // Navigation is handled by the AuthContext
  };

  const handleOAuthError = (error: string) => {
    setOauthError(error);
    setShowOAuthPopup(false);
    setTimeout(() => setOauthError(null), 5000);
  };

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setShowTermsFirst(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const cleanData = {
        ...formData,
        referral_code: formData.referral_code.trim() !== '' ? formData.referral_code : undefined
      };
      
      try {
        await register(cleanData);
        setRegistered(true);
      } catch (error: any) {
        console.error('Registration error:', error);
        
        // Check if this is a duplicate email error
        if (error.message?.toLowerCase().includes('email already registered')) {
          // Treat this as a successful registration since the user exists
          toast.info('Account already exists! Please check your email for verification link.');
          setRegistered(true);
          return;
        }
        
        // For other errors, show the error message
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            <CardDescription>
              Please verify your email to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                We've sent a verification link to <strong>{formData.email}</strong>. 
                Check your inbox and click the link to verify your account.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = 'https://mail.google.com'} 
                className="w-full"
                variant="outline"
              >
                Open Gmail
              </Button>
              <Button 
                onClick={() => window.location.href = 'https://outlook.live.com'} 
                className="w-full"
                variant="outline"
              >
                Open Outlook
              </Button>
              <Button 
                onClick={() => navigate('/verify-email')}
                className="w-full"
              >
                Go to Verification Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Terms First Screen
  if (showTermsFirst) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="VeriNest" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl text-center">Welcome to VeriNest</CardTitle>
            <CardDescription className="text-center">
              Please review and accept our terms to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Terms Summary */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Before you continue...</h3>
                <p className="text-blue-800 text-sm">
                  To create your VeriNest account, you need to agree to our Terms and Conditions and Privacy Policy. 
                  These documents explain how we handle your data and what you can expect from our platform.
                </p>
              </div>

              {/* Quick Terms Highlights */}
              <div className="grid gap-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>We protect your personal information</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Your data is encrypted and secure</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Transparent about how we use your information</span>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="initial-terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="initial-terms" className="text-sm leading-relaxed">
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="text-primary hover:underline font-medium"
                  >
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </button>
                </Label>
              </div>

              {/* Quick Links */}
              <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="flex items-center hover:text-primary transition-colors"
                >
                  Read Full Terms <ExternalLink className="h-3 w-3 ml-1" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="flex items-center hover:text-primary transition-colors"
                >
                  Privacy Policy <ExternalLink className="h-3 w-3 ml-1" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleAcceptTerms}
                disabled={!acceptedTerms}
              >
                Accept & Continue
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                By continuing, you agree to create a VeriNest account
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Legal Modals */}
        <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions'}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[70vh]">
              {activeModal === 'privacy' ? <PrivacyPolicy /> : <TermsAndConditions />}
            </div>
            <DialogFooter>
              <Button onClick={() => setActiveModal(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main Registration Screen (after accepting terms)
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTermsFirst(true)}
                className="p-0 h-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex justify-center flex-1">
                <img src={logo} alt="VeriNest" className="h-12 w-auto" />
              </div>
              <div className="w-10"></div> {/* Spacer for balance */}
            </div>
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign up method
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* OAuth Section - Primary Registration Method */}
            {!showEmailForm && (
              <div className="space-y-4">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
                
                {oauthError && (
                  <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
                    {oauthError}
                  </div>
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                {/* Email Registration Option */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowEmailForm(true)}
                >
                  Sign up with Email
                </Button>

                {/* Terms Reminder */}
                <div className="text-center text-xs text-muted-foreground pt-2">
                  By continuing, you agree to our{' '}
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="text-primary hover:underline"
                  >
                    Terms
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </button>
                </div>
              </div>
            )}

            {/* Email Registration Form - Secondary Option */}
            {showEmailForm && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Create Account with Email</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmailForm(false)}
                  >
                    ← Back
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Choose a username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a strong password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Confirm Password</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    required
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    placeholder="Confirm your password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referral_code">Referral Code (Optional)</Label>
                  <Input
                    id="referral_code"
                    type="text"
                    value={formData.referral_code}
                    onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                    placeholder="Enter referral code if you have one"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                {/* Terms Reminder for Email Form */}
                <div className="text-center text-xs text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="text-primary hover:underline"
                  >
                    Terms
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Modals */}
      <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            {activeModal === 'privacy' ? <PrivacyPolicy /> : <TermsAndConditions />}
          </div>
          <DialogFooter>
            <Button onClick={() => setActiveModal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OAuth Popup */}
      {showOAuthPopup && (
        <OAuthPopup
          onClose={() => setShowOAuthPopup(false)}
          onSuccess={handleOAuthSuccess}
          onError={handleOAuthError}
        />
      )}
    </>
  );
};

export default Register;