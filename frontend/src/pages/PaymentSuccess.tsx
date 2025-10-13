// pages/PaymentSuccess.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');

  useEffect(() => {
    // You could verify the payment here as well for double confirmation
    if (reference) {
      console.log('Payment successful for reference:', reference);
    }
  }, [reference]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your deposit has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {reference && (
            <p className="text-sm text-muted-foreground">
              Reference: {reference}
            </p>
          )}
          <Button 
            onClick={() => navigate('/dashboard?tab=wallet')}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};