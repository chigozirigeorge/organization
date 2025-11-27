// components/PaymentVerification.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentVerification = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [loading, setLoading] = useState(false);

  const trxref = searchParams.get('trxref');
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (trxref || reference) {
      verifyPayment();
    } else {
      setVerificationStatus('error');
      setMessage('No payment reference found in URL');
    }
  }, [trxref, reference]);

  const verifyPayment = async () => {
    if (!token) {
      setVerificationStatus('error');
      setMessage('Please log in to verify your payment');
      return;
    }

    try {
      const verifyResponse = await fetch('https://verinest.up.railway.app/api/wallet/deposit/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trxref: trxref || reference,
          reference: reference || trxref
        }),
      });

      const verifyData = await verifyResponse.json();
      console.log('Verification response:', verifyData);

      if (verifyResponse.ok && verifyData.status === 'success') {
        setVerificationStatus('success');
        setMessage('Payment verified successfully! Your wallet has been credited.');
        toast.success('Deposit completed successfully!');
      } else {
        setVerificationStatus('error');
        setMessage(verifyData.message || 'Payment verification failed');
        toast.error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setMessage(error.message || 'Payment verification failed');
      toast.error('Payment verification failed');
    }
  };

  const retryVerification = async () => {
    setLoading(true);
    await verifyPayment();
    setLoading(false);
  };

  const handleBackToWallet = () => {
    navigate('/dashboard?tab=wallet');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          {verificationStatus === 'success' ? (
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          ) : verificationStatus === 'error' ? (
            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          ) : (
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}
          
          <CardTitle className="text-2xl">
            {verificationStatus === 'success' 
              ? 'Payment Successful!' 
              : verificationStatus === 'error'
              ? 'Payment Verification Failed'
              : 'Verifying Payment'
            }
          </CardTitle>
          
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {(trxref || reference) && (
            <Alert className="bg-muted">
              <AlertDescription className="font-mono text-sm">
                Reference: {trxref || reference}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {verificationStatus === 'success' && (
              <Button onClick={handleBackToWallet} className="w-full">
                Back to Wallet
              </Button>
            )}

            {verificationStatus === 'error' && (
              <>
                <Button 
                  onClick={retryVerification} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Retry Verification
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleBackToWallet}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Wallet
                </Button>
              </>
            )}

            {verificationStatus === 'verifying' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Please wait while we verify your payment...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};