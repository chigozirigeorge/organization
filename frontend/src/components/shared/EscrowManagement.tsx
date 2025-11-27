// components/EscrowManagement.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Escrow, Contract } from '../../types/labour';

export const EscrowManagement = () => {
  const { token } = useAuth();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEscrows();
    fetchContracts();
  }, []);

  const fetchEscrows = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/labour/escrows', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEscrows(data.escrows || data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/labour/contracts?status=active', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts || data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    }
  };

  const releaseEscrow = async (jobId: string, percentage: number) => {
    try {
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${jobId}/escrow/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          release_percentage: percentage,
        }),
      });

      if (response.ok) {
        toast.success('Escrow payment released successfully!');
        fetchEscrows();
      } else {
        throw new Error('Failed to release escrow');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to release escrow');
    }
  };

  const getEscrowStatusVariant = (status: string) => {
    switch (status) {
      case 'funded': return 'default';
      case 'partial_released': return 'secondary';
      case 'fully_released': return 'outline';
      case 'refunded': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Escrow Management</h1>
        <p className="text-muted-foreground">Manage escrow payments for your jobs</p>
      </div>

      {/* Escrow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total in Escrow</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(escrows.reduce((sum, escrow) => sum + (escrow.amount - escrow.released_amount), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Funds currently held
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Escrows</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {escrows.filter(e => e.status === 'funded' || e.status === 'partial_released').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ongoing job escrows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Released Funds</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(escrows.reduce((sum, escrow) => sum + escrow.released_amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Total payments made
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Escrows */}
      <Card>
        <CardHeader>
          <CardTitle>Active Escrows</CardTitle>
          <CardDescription>
            Job escrows awaiting completion or payment release
          </CardDescription>
        </CardHeader>
        <CardContent>
          {escrows.filter(e => e.status === 'funded' || e.status === 'partial_released').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active escrows</p>
              <p className="text-sm">Escrows will appear here when you fund job contracts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {escrows
                .filter(e => e.status === 'funded' || e.status === 'partial_released')
                .map((escrow) => {
                  const contract = contracts.find(c => c.job_id === escrow.job_id);
                  return (
                    <div key={escrow.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">
                            {contract?.job.title || 'Job Contract'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Worker: {contract?.worker.user.name || 'Unknown'}
                          </p>
                        </div>
                        <Badge variant={getEscrowStatusVariant(escrow.status)}>
                          {escrow.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <p className="font-medium">Total Amount</p>
                          <p className="text-muted-foreground">{formatCurrency(escrow.amount)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Released</p>
                          <p className="text-muted-foreground">{formatCurrency(escrow.released_amount)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Remaining</p>
                          <p className="text-muted-foreground">
                            {formatCurrency(escrow.amount - escrow.released_amount)}
                          </p>
                        </div>
                      </div>

                      {contract && escrow.status === 'funded' && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Ready to release payment to {contract.worker.user.name}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2 mt-3">
                        {contract && escrow.status === 'funded' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => releaseEscrow(escrow.job_id, 100)}
                            >
                              Release Full Payment
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => releaseEscrow(escrow.job_id, 50)}
                            >
                              Release 50%
                            </Button>
                          </>
                        )}
                        {contract && (
                          <Button variant="outline" size="sm">
                            View Job Details
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Escrows */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Escrows</CardTitle>
          <CardDescription>
            Successfully completed job payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {escrows.filter(e => e.status === 'fully_released').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No completed escrows</p>
              <p className="text-sm">Completed payments will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {escrows
                .filter(e => e.status === 'fully_released')
                .map((escrow) => {
                  const contract = contracts.find(c => c.job_id === escrow.job_id);
                  return (
                    <div key={escrow.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {contract?.job.title || 'Completed Job'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(escrow.amount)} • {new Date(escrow.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};