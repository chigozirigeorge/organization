// components/ChangeTransactionPin.tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Key } from 'lucide-react';
import { toast } from 'sonner';

interface ChangeTransactionPinProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangeTransactionPin: React.FC<ChangeTransactionPinProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
  
  const [formData, setFormData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });

  const handleCurrentPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://verinest.up.railway.app/api/users/transaction-pin/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_pin: formData.currentPin
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.verified) {
        setStep('new');
      } else {
        setError(responseData.message || 'Invalid current PIN. Please try again.');
      }
    } catch (error) {
      console.error('PIN verification failed:', error);
      setError('Failed to verify PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPin !== formData.confirmPin) {
      setError('New PINs do not match');
      setLoading(false);
      return;
    }

    if (formData.newPin.length !== 6) {
      setError('PIN must be exactly 6 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://verinest.up.railway.app/api/users/transaction-pin', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_pin: formData.currentPin,
          new_pin: formData.newPin
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(responseData.message || 'Failed to change PIN. Please try again.');
      }
    } catch (error) {
      console.error('PIN change failed:', error);
      setError('Failed to change PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'current':
        return (
          <form onSubmit={handleCurrentPinSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPin">Enter Current PIN</Label>
              <Input
                id="currentPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={formData.currentPin}
                onChange={(e) => setFormData({ ...formData, currentPin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="000000"
                className="text-center text-lg font-mono tracking-widest"
                required
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter your current 6-digit PIN
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={formData.currentPin.length !== 6 || loading}>
              {loading ? 'Verifying...' : 'Continue'}
            </Button>
          </form>
        );

      case 'new':
        return (
          <form onSubmit={(e) => { e.preventDefault(); setStep('confirm'); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPin">Set New PIN</Label>
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
                Create a new 6-digit PIN
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={formData.newPin.length !== 6}>
              Continue
            </Button>
          </form>
        );

      case 'confirm':
        return (
          <form onSubmit={handlePinChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm New PIN</Label>
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
                Re-enter your new 6-digit PIN
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
                onClick={() => setStep('new')}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || formData.confirmPin.length !== 6}
              >
                {loading ? 'Changing...' : 'Change PIN'}
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
            <Key className="h-5 w-5" />
            Change Transaction PIN
          </DialogTitle>
          <DialogDescription>
            Update your 6-digit transaction security PIN
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};