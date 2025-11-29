// components/TransactionPinModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, Key, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface TransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => void;
  transactionType: 'transfer' | 'withdrawal' | 'payment' | 'contract_sign' | 'role_upgrade';
  transactionData?: any;
  amount: number;
}

export const TransactionPinModal: React.FC<TransactionPinModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  transactionType,
  transactionData,
  amount
}) => {
  const { user, token } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpOption, setShowOtpOption] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setOtp('');
      setOtpSent(false);
      setShowOtpOption(false);
    }
  }, [isOpen]);

  const handlePinChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPin(numericValue);
    setError('');
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      setError('Please enter a 6-digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify the PIN with the backend
      const response = await fetch('https://verinest.up.railway.app/api/users/transaction-pin/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_pin: pin
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.verified) {
        toast.success('PIN verified successfully');
        onVerify(pin);
        onClose();
      } else {
        setError(responseData.message || 'Invalid PIN. Please try again.');
        
        // Show OTP option after 2 failed attempts or if user doesn't remember PIN
        if (!showOtpOption) {
          setShowOtpOption(true);
        }
      }
    } catch (error) {
      console.error('PIN verification failed:', error);
      setError('Failed to verify PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://verinest.up.railway.app/api/auth/send-transaction-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_type: transactionType,
          amount: amount,
          ...transactionData
        }),
      });

      if (response.ok) {
        setOtpSent(true);
        toast.success('OTP sent to your email');
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP send failed:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://verinest.up.railway.app/api/auth/verify-transaction-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp: otp,
          transaction_type: transactionType,
          amount: amount,
          ...transactionData
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.verified) {
        toast.success('OTP verified successfully');
        onVerify('otp_verified'); // Special value to indicate OTP verification
        onClose();
      } else {
        setError(responseData.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionDescription = () => {
    switch (transactionType) {
      case 'transfer':
        return `Transfer ₦${amount.toLocaleString()} to ${transactionData?.recipient_identifier || 'recipient'}`;
      case 'withdrawal':
        return `Withdraw ₦${amount.toLocaleString()} to your bank account`;
      case 'payment':
        return `Payment of ₦${amount.toLocaleString()}`;
      case 'contract_sign':
        return `Signing contract worth ₦${amount.toLocaleString()}`;
      default:
        return `Transaction of ₦${amount.toLocaleString()}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Verification
          </DialogTitle>
          <DialogDescription>
            {getTransactionDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!showOtpOption ? (
            // PIN Entry Section
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Enter your 6-digit Transaction PIN
                </Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="000000"
                  className="text-center text-lg font-mono tracking-widest"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter your 6-digit security PIN
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                variant="link"
                className="w-full text-sm"
                onClick={() => setShowOtpOption(true)}
                disabled={loading}
              >
                Forgot PIN? Use Email OTP instead
              </Button>
            </div>
          ) : (
            // OTP Entry Section
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {otpSent ? 'Enter OTP sent to your email' : 'Get Email OTP'}
                </Label>
                
                {otpSent ? (
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="text-center text-lg font-mono tracking-widest"
                  />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      We'll send a one-time password to your registered email
                    </p>
                    <Button onClick={handleSendOtp} disabled={loading}>
                      Send OTP to Email
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                variant="link"
                className="w-full text-sm"
                onClick={() => setShowOtpOption(false)}
                disabled={loading}
              >
                ← Back to PIN verification
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col space-y-2">
          {!showOtpOption ? (
            <Button 
              onClick={handleVerifyPin} 
              disabled={pin.length !== 6 || loading}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify PIN'}
            </Button>
          ) : otpSent ? (
            <Button 
              onClick={handleVerifyOtp} 
              disabled={otp.length !== 6 || loading}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          ) : null}
          
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};