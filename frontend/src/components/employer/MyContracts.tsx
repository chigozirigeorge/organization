// components/MyContracts.tsx - UPDATED
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getContracts } from '../../services/labour';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Calendar, DollarSign, Clock, User, FileText, PenSquare, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Contract {
  id: string;
  job_id: string;
  employer_id: string;
  worker_id: string;
  agreed_rate: number;
  agreed_timeline: number;
  terms: string;
  signed_by_employer: boolean;
  signed_by_worker: boolean;
  status: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    location_state: string;
    location_city: string;
    estimated_duration_days: number;
    status: string;
  };
  employer: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar_url?: string;
    trust_score: number;
    verified: boolean;
  };
  worker: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar_url?: string;
    trust_score: number;
    verified: boolean;
  };
}

export const MyContracts = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchMyContracts();
  }, [activeFilter]);

  const fetchMyContracts = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching contracts...');
      const data = await getContracts();
      let contractsData = data.data || data || [];

      // Filter contracts based on active filter
      if (activeFilter !== 'all') {
        contractsData = contractsData.filter((contract: Contract) => {
          if (activeFilter === 'pending') {
            // Pending contracts are those not fully signed
            return !contract.signed_by_employer || !contract.signed_by_worker;
          }
          if (activeFilter === 'active') {
            // Active contracts are fully signed and job is in progress
            return contract.signed_by_employer && contract.signed_by_worker && 
                   contract.job.status === 'in_progress';
          }
          if (activeFilter === 'completed') {
            // Completed contracts have completed jobs
            return contract.job.status === 'completed';
          }
          return true;
        });
      }

      setContracts(contractsData);
    } catch (error) {
      console.error('🚨 Failed to fetch contracts:', error);
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

  const getStatusVariant = (contract: Contract) => {
    if (!contract.signed_by_employer || !contract.signed_by_worker) {
      return 'destructive'; // Pending signature
    }
    
    switch (contract.job.status) {
      case 'in_progress': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (contract: Contract) => {
    if (!contract.signed_by_employer || !contract.signed_by_worker) {
      return 'Pending Signature';
    }
    
    switch (contract.job.status) {
      case 'in_progress': return 'Active';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return contract.job.status;
    }
  };

  const handleSignContract = (contractId: string) => {
    navigate(`/dashboard/contracts/${contractId}/sign`);
  };

  const handleUpdateProgress = (jobId: string) => {
    navigate(`/dashboard/jobs/${jobId}/progress`);
  };

  const needsMySignature = (contract: Contract) => {
    if (user?.id === contract.employer_id && !contract.signed_by_employer) {
      return true;
    }
    if (user?.id === contract.worker_id && !contract.signed_by_worker) {
      return true;
    }
    return false;
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
        {(['all', 'pending', 'active', 'completed'] as const).map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter)}
          >
            {filter === 'all' ? 'All Contracts' : 
             filter === 'pending' ? 'Pending Signature' :
             filter === 'active' ? 'Active' : 'Completed'}
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
                  <Link to="/dashboard/jobs">Browse Jobs</Link>
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
                        to={`/dashboard/jobs/${contract.job_id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {contract.job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {contract.job.category} • {contract.job.location_city}, {contract.job.location_state}
                    </CardDescription>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge variant={getStatusVariant(contract)}>
                      {getStatusText(contract)}
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
                      {user?.id === contract.employer_id 
                        ? `Worker: ${contract.worker.name}`
                        : `Employer: ${contract.employer.name}`
                      }
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

                {/* Signing Status */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className={`h-4 w-4 mr-1 ${contract.signed_by_employer ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Employer: {contract.signed_by_employer ? 'Signed' : 'Pending'}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className={`h-4 w-4 mr-1 ${contract.signed_by_worker ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Worker: {contract.signed_by_worker ? 'Signed' : 'Pending'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {contract.job.location_city}, {contract.job.location_state}
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      Job: {contract.job.status.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/jobs/${contract.job_id}`}>
                        View Job
                      </Link>
                    </Button>
                    
                    {/* Sign Contract Button */}
                    {needsMySignature(contract) && (
                      <Button 
                        size="sm"
                        onClick={() => handleSignContract(contract.id)}
                        className="flex items-center gap-1"
                      >
                        <PenSquare className="h-4 w-4" />
                        Sign Contract
                      </Button>
                    )}
                    
                    {/* Update Progress Button */}
                    {contract.signed_by_employer && contract.signed_by_worker && 
                     contract.job.status === 'in_progress' && 
                     user?.id === contract.worker_id && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateProgress(contract.job_id)}
                      >
                        Update Progress
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