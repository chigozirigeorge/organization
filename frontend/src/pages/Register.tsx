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
import { CheckCircle, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { PrivacyPolicy } from '../components/PrivacyPolicy';
import { TermsAndConditions } from '../components/TermsAndConditions';

const Register = () => {
  const { register } = useAuth();
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
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!acceptedTerms) {
      toast.error('Please accept the Terms and Conditions and Privacy Policy');
      return;
    }
    
    setLoading(true);
    try {
      const cleanData = {
        ...formData,
        referral_code: formData.referral_code.trim() !== '' ? formData.referral_code : undefined
      };
      
      await register(cleanData);
      setRegistered(true);
    } catch (error) {
      console.error('Registration error:', error);
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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <img src={logo} alt="VeriNest" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Join VeriNest to start your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Terms and Conditions Checkbox */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{' '}
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
                
                {/* Quick Links to Legal Documents */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="flex items-center hover:text-primary transition-colors"
                  >
                    Read Terms <ExternalLink className="h-3 w-3 ml-1" />
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !acceptedTerms}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Register;