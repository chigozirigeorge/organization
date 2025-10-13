// components/JobDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Calendar, DollarSign, Clock, User, ArrowLeft, Building, Phone, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location_state: string;
  location_city: string;
  location_address: string;
  estimated_duration_days: number;
  created_at: string;
  status: string;
  employer_id: string;
  employer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    trust_score: number;
    verified: boolean;
  };
  partial_payment_allowed: boolean;
  partial_payment_percentage?: number;
  deadline?: string;
}

export const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch job details: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response structures
      const jobData = data.data || data.job || data;
      setJob(jobData);

    } catch (error) {
      console.error('Failed to fetch job details:', error);
      toast.error('Failed to load job details. Please try again.');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user || !token) {
      toast.info('Please log in to apply for this job');
      navigate('/login', { 
        state: { 
          returnTo: `/jobs/${id}`,
          message: 'Log in to apply for this job'
        } 
      });
      return;
    }

    if (!user.email_verified) {
      toast.error('Please verify your email before applying to jobs');
      navigate('/verify-email');
      return;
    }

    try {
      setApplying(true);
      
      // Check if user has worker profile
      const profileResponse = await fetch('https://verinest.up.railway.app/api/labour/worker/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        toast.error('Please create a worker profile before applying to jobs');
        navigate('/create-profile');
        return;
      }

      // Navigate to application form
      navigate(`/jobs/${id}/apply`);
      
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error('Failed to apply for job. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const isJobOpen = React.useMemo(() => {
  if (!job) return false;
  
  const isOpenByStatus = job.status?.toLowerCase() === 'open';
  const isBeforeDeadline = job.deadline ? new Date() < new Date(job.deadline) : true;
  
  return isOpenByStatus && isBeforeDeadline;
}, [job]);

useEffect(() => {
  if (job) {
    console.log('🔍 Job data in JobDetails:', job);
    console.log('🔍 Job status:', job.status);
    console.log('🔍 Job deadline:', job.deadline);
    console.log('🔍 Current time:', new Date().toISOString());
    
    // Check if job is still open based on status and deadline
    const isOpenByStatus = job.status?.toLowerCase() === 'open';
    const isBeforeDeadline = job.deadline ? new Date() < new Date(job.deadline) : true;
    const isJobOpen = isOpenByStatus && isBeforeDeadline;
    
    console.log('🔍 Is open by status:', isOpenByStatus);
    console.log('🔍 Is before deadline:', isBeforeDeadline);
    console.log('🔍 Final isJobOpen:', isJobOpen);
  }
}, [job]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
            </div>
            
            <div className="space-y-6">
              <div className="h-48 bg-muted rounded animate-pulse"></div>
              <div className="h-32 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="py-12">
            <h1 className="text-2xl font-bold text-muted-foreground mb-4">Job Not Found</h1>
            <p className="text-muted-foreground mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Job Details</h1>
            <p className="text-muted-foreground">Complete information about this job opportunity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="text-sm">
                        {job.category}
                      </Badge>
                      <Badge variant={isJobOpen ? 'default' : 'secondary'}>
                        {isJobOpen ? 'Accepting Applications' : (job.status?.replace('_', ' ') || 'Closed')}
                      </Badge>
                      {job.deadline && new Date() > new Date(job.deadline) && (
                        <Badge variant="destructive">Deadline Passed</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(job.budget)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Job Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Job Description</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">
                        {job.location_address && `${job.location_address}, `}
                        {job.location_city}, {job.location_state}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Estimated Duration</p>
                      <p className="text-muted-foreground">
                        {job.estimated_duration_days} day{job.estimated_duration_days !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Posted On</p>
                      <p className="text-muted-foreground">{formatDate(job.created_at)}</p>
                    </div>
                  </div>

                  {job.deadline && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Application Deadline</p>
                        <p className="text-muted-foreground">{formatDateTime(job.deadline)}</p>
                      </div>
                    </div>
                  )}

                  {job.partial_payment_allowed && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-3 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Payment Terms</p>
                        <p className="text-muted-foreground">
                          Partial payments allowed
                          {job.partial_payment_percentage && 
                            ` (${job.partial_payment_percentage}% milestones)`
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employer Information */}
            {job.employer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About the Employer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{job.employer.name}</h3>
                        {job.employer.verified && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {job.employer.trust_score && (
                          <p>Trust Score: {job.employer.trust_score}</p>
                        )}
                        <p>Member since {formatDate(job.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
           <Card>
        <CardHeader>
          <CardTitle>Apply for this Job</CardTitle>
          <CardDescription>
            {isJobOpen 
              ? 'Submit your application for this opportunity'
              : 'This job is no longer accepting applications'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isJobOpen ? (
      <>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Job Budget:</span>
            <span className="font-semibold">{formatCurrency(job.budget)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Duration:</span>
            <span>{job.estimated_duration_days} days</span>
          </div>
          {job.deadline && (
            <div className="flex justify-between text-sm">
              <span>Deadline:</span>
              <span>{formatDate(job.deadline)}</span>
            </div>
          )}
        </div>

        {!user ? (
          <Button className="w-full" size="lg" onClick={handleApply}>
            Log In to Apply
          </Button>
        ) : !user.email_verified ? (
          <Button className="w-full" size="lg" variant="outline" onClick={handleApply}>
            Verify Email to Apply
          </Button>
        ) : (
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleApply}
            disabled={applying}
          >
            {applying ? 'Applying...' : 'Apply Now'}
          </Button>
        )}
      </>
    ) : (
      <div className="text-center space-y-3">
        <Button className="w-full" size="lg" disabled>
          Job {job.status?.replace('_', ' ') || 'Closed'}
        </Button>
        <p className="text-sm text-muted-foreground">
          {job.deadline && new Date() > new Date(job.deadline) 
            ? 'The application deadline has passed'
            : 'This job is no longer accepting applications'
          }
        </p>
      </div>
    )}
  </CardContent>
</Card>

            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="text-sm font-medium">{job.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="text-sm font-medium">{job.location_city}, {job.location_state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="text-sm font-medium">{job.estimated_duration_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Budget:</span>
                  <span className="text-sm font-medium">{formatCurrency(job.budget)}</span>
                </div>
                {job.partial_payment_allowed && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment:</span>
                    <span className="text-sm font-medium">Partial Payments OK</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Always meet in public places first</p>
                <p>• Never pay upfront for any job</p>
                <p>• Verify employer identity</p>
                <p>• Use platform messaging for communication</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};