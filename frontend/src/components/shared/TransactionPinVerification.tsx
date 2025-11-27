import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../utils/api';

interface TransactionPinVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentReference?: string | null;
}

export const TransactionPinVerification = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  paymentReference 
}: TransactionPinVerificationProps) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 6) {
      toast.error("Transaction PIN must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      // Verify the transaction PIN
      const response = await apiClient.post('/users/transaction-pin/verify', {
        transaction_pin: pin
      });

      console.log('🔐 PIN verification response:', response.data);

      // Check the actual response structure
      const isVerified = response.data.verified === true || response.data.status === 'success';
      
      if (isVerified) {
        console.log('✅ PIN verified successfully');
        
        // Check if this is a premium upgrade
        if (paymentReference === 'premium-upgrade') {
          console.log('🚀 This is a premium upgrade - completing payment...');
          
          try {
            // Initiate the premium payment now that PIN is verified
            const paymentRes = await apiClient.post('/users/subscription/premium/initiate');
            console.log('💳 Premium payment initiated:', paymentRes.data);
            
            toast.success("Premium subscription activated successfully!");
          } catch (paymentErr: any) {
            console.error('❌ Failed to complete premium payment:', paymentErr);
            toast.error(paymentErr.response?.data?.message || "Failed to complete premium payment");
            return;
          }
        } else if (paymentReference) {
          // Regular payment completion
          await apiClient.post('/users/subscription/premium', {
            payment_reference: paymentReference
          });
        }
        
        toast.success("Transaction PIN verified successfully!");
        onSuccess();
      } else {
        toast.error("Invalid transaction PIN");
      }
    } catch (error: any) {
      console.error("PIN verification error:", error);
      const errorMessage = error.response?.data?.message || error.message || "PIN verification failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow digits
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 6) {
      setPin(numericValue);
    }
  };

  const handleClose = () => {
    setPin('');
    setShowPin(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Verify Transaction PIN
          </DialogTitle>
          <DialogDescription>
            Enter your 6-digit transaction PIN to authorize this payment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pin">Transaction PIN</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="Enter 6-digit PIN"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit PIN you set for secure transactions
            </p>
          </div>

          {paymentReference === 'premium-upgrade' ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Premium Subscription Upgrade:</strong><br />
                Amount: ₦9,000.00<br />
                Duration: 1 Year<br />
                Benefits: Unlimited role changes and premium features
              </AlertDescription>
            </Alert>
          ) : paymentReference ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Payment Details:</strong><br />
                Reference: {paymentReference}<br />
                Amount: ₦9,000.00<br />
                Description: Premium Subscription (1 Year)
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || pin.length !== 6}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {paymentReference === 'premium-upgrade' ? "Upgrade to Premium" : "Verify & Pay"}
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => window.open('/dashboard/settings?tab=transaction-pin', '_blank')}
              className="text-xs"
            >
              Forgot PIN? Reset it here
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
