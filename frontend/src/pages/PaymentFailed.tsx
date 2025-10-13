// pages/PaymentFailed.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            We couldn't process your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {reference && (
            <p className="text-sm text-muted-foreground">
              Reference: {reference}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600">
              Error: {error}
            </p>
          )}
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/dashboard?tab=wallet')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wallet
            </Button>
            <Button 
              onClick={() => navigate('/dashboard?tab=wallet')}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};