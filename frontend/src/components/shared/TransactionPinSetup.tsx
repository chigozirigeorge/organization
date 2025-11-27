// components/TransactionPinSetup.tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Shield, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionPinSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

export const TransactionPinSetup: React.FC<TransactionPinSetupProps> = ({
  isOpen,
  onClose,
  onSetupComplete
}) => {
  const { user, token } = useAuth();
  const [step, setStep] = useState<'password' | 'pin' | 'confirm'>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    newPin: '',
    confirmPin: ''
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch('https://verinest.up.railway.app/api/users/verify-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: formData.password
        }),
      });
  
      console.log('🔐 Password verification response status:', response.status);
      
      let responseData;
      try {
        const responseText = await response.text();
        console.log('🔐 Password verification response body:', responseText);
        
        // Try to parse as JSON, but handle cases where it might not be JSON
        if (responseText) {
          responseData = JSON.parse(responseText);
        } else {
          responseData = { message: 'Empty response' };
        }
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        responseData = { message: 'Invalid response format' };
      }
  
      if (response.ok) {
        // Check both possible response structures
        if (responseData.verified === true || responseData.status === 'success') {
          setStep('pin');
        } else {
          setError(responseData.message || 'Password verification failed');
        }
      } else {
        // Handle different error status codes
        if (response.status === 500) {
          setError('Server error. Please try again later.');
        } else if (response.status === 401) {
          setError('Invalid password. Please try again.');
        } else {
          setError(responseData.message || `Error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('❌ Password verification failed:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // In TransactionPinSetup.tsx - Update the handlePinSetup function
const handlePinSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    if (formData.newPin !== formData.confirmPin) {
      setError('PINs do not match');
      setLoading(false);
      return;
    }
  
    if (formData.newPin.length !== 6) {
      setError('PIN must be exactly 6 digits');
      setLoading(false);
      return;
    }
  
    try {
      console.log('🔐 Setting up transaction PIN...');
      console.log('🔐 Request body:', {
        password: formData.password ? '***' : 'missing',
        new_pin: formData.newPin
      });
  
      const response = await fetch('https://verinest.up.railway.app/api/users/transaction-pin', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: formData.password,
          new_pin: formData.newPin
        }),
      });
  
      console.log('🔐 Set PIN response status:', response.status);
      
      // Get the response text first to see what the actual error is
      const responseText = await response.text();
      console.log('🔐 Set PIN response body:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse PIN setup response:', parseError);
        // If it's not JSON, create a meaningful error
        responseData = { 
          message: responseText.includes('Validation error') 
            ? 'Invalid request format' 
            : 'Server error occurred'
        };
      }
  
      if (response.ok) {
        toast.success('Transaction PIN set successfully!');
        onSetupComplete();
        onClose();
        
        // Reset form
        setFormData({ password: '', newPin: '', confirmPin: '' });
        setStep('password');
      } else {
        // Handle specific HTTP status codes
        switch (response.status) {
          case 400:
            if (responseData.message?.includes('password')) {
              setError('Invalid password. Please try again.');
            } else if (responseData.message?.includes('6 digits')) {
              setError('PIN must be exactly 6 digits');
            } else if (responseData.message?.includes('Validation error')) {
              setError('Invalid request format. Please check your input.');
            } else {
              setError(responseData.message || 'Bad request. Please check your input.');
            }
            break;
          
          case 401:
            setError('Invalid password. Please try again.');
            break;
          
          case 422:
            setError('Validation failed. Please check your input.');
            break;
          
          default:
            setError(responseData.message || `Error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('❌ PIN setup failed:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'password':
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Enter Your Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your account password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We need to verify your identity before setting up a PIN
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Continue'}
            </Button>
          </form>
        );

      case 'pin':
        return (
          <form onSubmit={(e) => { e.preventDefault(); setStep('confirm'); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPin" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Set Your 6-Digit Transaction PIN
              </Label>
              <Input
                id="newPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={formData.newPin}
                onChange={(e) => setFormData({ ...formData, newPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="000000"
                className="text-center text-lg font-mono tracking-widest"
                required
              />
              <p className="text-xs text-muted-foreground text-center">
                Create a 6-digit PIN for authorizing transactions
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={formData.newPin.length !== 6}>
              Continue
            </Button>
          </form>
        );

      case 'confirm':
        return (
          <form onSubmit={handlePinSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm Your PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={formData.confirmPin}
                onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="000000"
                className="text-center text-lg font-mono tracking-widest"
                required
              />
              <p className="text-xs text-muted-foreground text-center">
                Re-enter your 6-digit PIN to confirm
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep('pin')}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || formData.confirmPin.length !== 6}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Set Up Transaction PIN
          </DialogTitle>
          <DialogDescription>
            Secure your transactions with a 6-digit PIN
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderStep()}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Your PIN is required for all financial transactions</p>
          <p>• Keep your PIN secure and don't share it with anyone</p>
          <p>• You can reset your PIN if forgotten</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};