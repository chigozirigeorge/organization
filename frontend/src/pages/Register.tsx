import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import logo from '../assets/verinest.png';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
