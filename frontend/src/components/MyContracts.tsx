// components/MyContracts.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Calendar, DollarSign, Clock, User, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Contract } from '../types/labour';

export const MyContracts = () => {
  const { token } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchMyContracts();
  }, [activeFilter]);

  const fetchMyContracts = async () => {
    try {
      setLoading(true);
      // You might need to create this endpoint
      const response = await fetch('https://verinest.up.railway.app/api/labour/contracts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let contractsData = data.contracts || data.data || [];
        
        // Filter contracts based on active filter
        if (activeFilter !== 'all') {
          contractsData = contractsData.filter((contract: Contract) => {
            if (activeFilter === 'active') {
              return contract.status === 'active' || contract.status === 'signed';
            }
            if (activeFilter === 'pending') {
              return contract.status === 'pending' || contract.status === 'draft';
            }
            if (activeFilter === 'completed') {
              return contract.status === 'completed';
            }
            return true;
          });
        }
        
        setContracts(contractsData);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'outline';
      case 'pending': return 'secondary';
      case 'signed': return 'default';
      case 'active': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleSignContract = async (contractId: string) => {
    try {
      const response = await fetch(`https://verinest.up.railway.app/api/labour/contracts/${contractId}/sign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          signer_role: 'worker' // This should be dynamic based on user role
        }),
      });

      if (response.ok) {
        // Refresh contracts
        fetchMyContracts();
      } else {
        throw new Error('Failed to sign contract');
      }
    } catch (error) {
      console.error('Failed to sign contract:', error);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Contracts</h1>
          <p className="text-muted-foreground">Manage your job contracts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'pending', 'completed'] as const).map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter)}
          >
            {filter === 'all' ? 'All Contracts' : 
             filter === 'active' ? 'Active' :
             filter === 'pending' ? 'Pending' : 'Completed'}
          </Button>
        ))}
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">No contracts found</h3>
                <p className="mb-4">
                  {activeFilter === 'all' 
                    ? "You don't have any contracts yet."
                    : `No ${activeFilter} contracts found.`
                  }
                </p>
                <Button asChild>
                  <Link to="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">
                      <Link 
                        to={`/jobs/${contract.job_id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {contract.job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      Contract for {contract.job.category} work
                    </CardDescription>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant={getStatusVariant(contract.status)}>
                      {contract.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(contract.agreed_rate)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>
                      {contract.worker.user.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{contract.agreed_timeline} days</span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Created {formatDate(contract.created_at)}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="font-medium mb-1">Contract Terms:</p>
                  <p className="text-muted-foreground line-clamp-2">
                    {contract.terms}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {contract.job.location_city}, {contract.job.location_state}
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {contract.employer_signed && contract.worker_signed 
                        ? 'Fully signed' 
                        : `${contract.employer_signed ? 'Employer' : ''}${contract.employer_signed && contract.worker_signed ? ' and ' : ''}${contract.worker_signed ? 'Worker' : ''} signed`
                      }
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/jobs/${contract.job_id}`}>
                        View Job
                      </Link>
                    </Button>
                    
                    {contract.status === 'pending' && !contract.worker_signed && (
                      <Button 
                        size="sm"
                        onClick={() => handleSignContract(contract.id)}
                      >
                        Sign Contract
                      </Button>
                    )}
                    
                    {contract.status === 'active' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/jobs/${contract.job_id}/progress`}>
                          Update Progress
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};