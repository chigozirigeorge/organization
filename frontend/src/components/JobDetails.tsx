// components/JobDetails.tsx - UPDATED VERSION
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  MapPin, Calendar, DollarSign, Clock, User, Briefcase,
  MessageCircle, CheckCircle, Star, ExternalLink, Users,
  ArrowLeft, Loader2, AlertCircle, FileText, PenSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';

// Enhanced interfaces
interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location_state: string;
  location_city: string;
  estimated_duration_days: number;
  status: string;
  employer_id: string;
  assigned_worker_id?: string;
  created_at: string;
}

interface JobContract {
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
}

interface JobDetailsProps {
  jobId: string;
}

export const JobDetails = ({ jobId }: JobDetailsProps) => {
  const navigate = useNavigate();
  const { token, user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [contract, setContract] = useState<JobContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractLoading, setContractLoading] = useState(false);

  useEffect(() => {
    if (jobId && token) {
      console.log('🔄 Starting to fetch job details for:', jobId);
      fetchJobDetails();
    } else {
      console.log('❌ Cannot fetch - missing:', { jobId, token: !!token });
      setError(!jobId ? 'No job ID provided' : 'Authentication required');
      setLoading(false);
    }
  }, [jobId, token]);

  const fetchJobDetails = async () => {
    if (!jobId || !token) {
      console.error('Missing requirements:', { jobId, token: !!token });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Making API request to:', `https://verinest.up.railway.app/api/labour/jobs/${jobId}`);
      
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📨 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Job data received:', data);
        
        const jobData = data.data || data;
        if (jobData && jobData.id) {
          setJob(jobData);
          
          // Fetch contract if job is assigned
          if (jobData.assigned_worker_id || jobData.status === 'assigned') {
            fetchJobContract();
          }
        } else {
          throw new Error('Invalid job data structure');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API error:', errorText);
        setError(`Failed to load job: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('🚨 Fetch error:', error);
      setError(error.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobContract = async () => {
    if (!jobId || !token) return;
    
    try {
      setContractLoading(true);
      console.log('📋 Fetching contract for job:', jobId);
      
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${jobId}/contract`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Contract data received:', data);
        
        if (data.data) {
          setContract(data.data);
        } else if (data.status === 'success' && data.data) {
          setContract(data.data);
        }
      } else if (response.status === 404) {
        console.log('📋 No contract found for this job');
        setContract(null);
      } else {
        console.error('❌ Failed to fetch contract:', response.status);
      }
    } catch (error: any) {
      console.error('🚨 Contract fetch error:', error);
      // Don't set error state for contract fetch failures
    } finally {
      setContractLoading(false);
    }
  };

  const handleSignContract = () => {
    if (!contract) return;
    
    console.log('📝 Navigating to sign contract:', contract.id);
    navigate(`/dashboard/contracts/${contract.id}/sign`);
  };

  const handleRetry = () => {
    console.log('🔄 Retrying fetch...');
    fetchJobDetails();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Determine contract signing status
  const getContractStatus = () => {
    if (!contract) return null;

    const isEmployer = user?.id === contract.employer_id;
    const isWorker = user?.id === contract.worker_id;
    
    if (isEmployer && !contract.signed_by_employer) {
      return { 
        needsSignature: true, 
        role: 'employer',
        message: 'You need to sign the contract'
      };
    }
    
    if (isWorker && !contract.signed_by_worker) {
      return { 
        needsSignature: true, 
        role: 'worker',
        message: 'You need to sign the contract'
      };
    }
    
    if (contract.signed_by_employer && contract.signed_by_worker) {
      return { 
        needsSignature: false,
        message: 'Contract fully signed'
      };
    }
    
    return { 
      needsSignature: false,
      message: 'Waiting for other party to sign'
    };
  };

  const contractStatus = getContractStatus();

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <p className="font-medium">Loading job details...</p>
          <p className="text-sm text-muted-foreground">Job ID: {jobId}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
            <div className="mt-2 text-sm">
              <p>Job ID: {jobId || 'Not provided'}</p>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Token: {token ? 'Present' : 'Missing'}</p>
            </div>
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={handleRetry}>
            <Loader2 className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard/jobs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  // Show job not found
  if (!job) {
    return (
      <div className="text-center py-8 space-y-4">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <p className="text-muted-foreground">The job you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/dashboard/jobs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  // Show job details
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard/jobs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground">Job ID: {job.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={
            job.status === 'Open' ? 'default' :
            job.status === 'InProgress' ? 'secondary' : 'outline'
          }>
            {job.status}
          </Badge>
          
          {/* Contract Status Badge */}
          {contract && (
            <Badge variant={
              contractStatus?.needsSignature ? 'destructive' : 
              contract.signed_by_employer && contract.signed_by_worker ? 'default' : 'secondary'
            }>
              {contractStatus?.message}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Category</span>
                  <Badge variant="outline">{job.category}</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Location</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location_city}, {job.location_state}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium">Duration</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{job.estimated_duration_days} days</span>
                  </div>
                </div>
                {contract && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">Contract Status</span>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{contractStatus?.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(job.budget)}
              </p>
              {contract && (
                <p className="text-sm text-muted-foreground mt-2">
                  Agreed rate: {formatCurrency(contract.agreed_rate)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Show Sign Contract button if contract exists and needs signature */}
              {contract && contractStatus?.needsSignature && (
                <Button 
                  className="w-full justify-start gap-2"
                  onClick={handleSignContract}
                >
                  <PenSquare className="h-4 w-4" />
                  Sign Contract
                </Button>
              )}
              
              {/* Show View Contract button if contract exists and is signed */}
              {contract && !contractStatus?.needsSignature && (
                <Button 
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => navigate(`/dashboard/contracts/${contract.id}`)}
                >
                  <FileText className="h-4 w-4" />
                  View Contract
                </Button>
              )}
              
              {/* Show Message button for communication */}
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => navigate('/dashboard/chat')}
              >
                <MessageCircle className="h-4 w-4" />
                {user?.id === job.employer_id ? 'Message Worker' : 'Message Employer'}
              </Button>
              
              {/* Show Apply button for workers on open jobs */}
              {user?.role === 'worker' && job.status === 'Open' && !contract && (
                <Button 
                  className="w-full justify-start gap-2"
                  onClick={() => navigate(`/dashboard/jobs/${jobId}/apply`)}
                >
                  <Briefcase className="h-4 w-4" />
                  Apply for Job
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contract Details Card */}
          {contract && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contract Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Agreed Rate:</span>
                  <span className="font-medium">{formatCurrency(contract.agreed_rate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timeline:</span>
                  <span className="font-medium">{contract.agreed_timeline} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Employer Signed:</span>
                  <Badge variant={contract.signed_by_employer ? "default" : "outline"}>
                    {contract.signed_by_employer ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Worker Signed:</span>
                  <Badge variant={contract.signed_by_worker ? "default" : "outline"}>
                    {contract.signed_by_worker ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};