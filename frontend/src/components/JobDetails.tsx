// components/JobDetails.tsx - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Calendar, DollarSign, Clock, User, ArrowLeft, Building, Shield, Users, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { WorkerProfileModal } from './WorkerPortfolioModal';
import { extractWorkerCategory, extractWorkerEmail, extractWorkerExperience, extractWorkerName } from '@/types/labour';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  location_state: string;
  location_city: string;
  location_address?: string;
  estimated_duration_days?: number;
  created_at: string;
  status: string;
  employer_id: string;
  employer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    trust_score?: number;
    verified: boolean;
  };
  partial_payment_allowed: boolean;
  partial_payment_percentage?: number;
  deadline?: string;
  applications_count?: number;
}

interface WorkerUserResponse {
  id: string;
  name: string;
  email: string;
}

interface WorkerProfileApplicationResponse {
  category: string;
  experience_years: number;
  description: string;
  hourly_rate: number;
  daily_rate: number;
  location_state: string;
  location_city: string;
  skills: string[];
}

interface JobApplication {
  id: string;
  worker_id: string;
  worker?: WorkerUserResponse | null;
  worker_profile?: WorkerProfileApplicationResponse | null;
  proposed_rate: number;
  estimated_completion: number;
  cover_letter: string;
  status: string;
  created_at: string;
}

export const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [showWorkerModal, setShowWorkerModal] = useState(false);

  // Check if current user is the job owner
  const isJobOwner = user?.id === job?.employer_id;
  const isWorker = user?.role === 'worker';

  useEffect(() => {
    console.log('🔄 [JobDetails] useEffect triggered');
    
    // Extract ID from URL if useParams doesn't work
    const pathSegments = window.location.pathname.split('/');
    const extractedId = pathSegments[3];
    const finalId = id || extractedId;
    
    if (finalId) {
      fetchJobDetails(finalId);
    } else {
      console.error('❌ [JobDetails] No job ID found');
      toast.error('Invalid job URL');
      navigate('/dashboard/jobs');
    }
  }, [id, navigate]);

  const fetchJobDetails = async (jobId: string) => {
    try {
      setLoading(true);
      console.log('🔍 [JobDetails] Fetching job details for ID:', jobId);
      
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${jobId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch job details: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 [JobDetails] API response:', data);
      
      // Handle different response structures
      const jobData = data.data || data.job || data;
      
      if (!jobData) {
        throw new Error('No job data received from server');
      }

      setJob(jobData);

      // If user is the job owner, fetch applications
      if (user?.id === jobData.employer_id) {
        fetchJobApplications(jobId);
      }

    } catch (error) {
      console.error('❌ [JobDetails] Failed to fetch job details:', error);
      toast.error('Failed to load job details. Please try again.');
      navigate('/dashboard/jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplications = async (jobId: string) => {
  try {
    console.log('📥 [JobDetails] Fetching applications for job:', jobId);
    
    const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${jobId}/applications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('🔍 [JobDetails] FULL Applications API Response:', data);
      
      // Log each application to see the complete structure
      if (data.data && data.data.length > 0) {
        data.data.forEach((app: any, index: number) => {
          console.log(`📋 Application ${index + 1}:`, app);
          console.log(`👤 Worker data in app ${index + 1}:`, app.worker);
          console.log('---');
        });
      }
      
      setApplications(data.data || data.applications || []);
    } else {
      console.error('❌ [JobDetails] Failed to fetch applications:', response.status);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ [JobDetails] Error fetching applications:', error);
  }
};

 const handleViewWorkerProfile = (workerId: string) => {
    setSelectedWorker(workerId);
    setShowWorkerModal(true);
  };

  // Update the handleAcceptApplication function
  const handleAcceptApplication = async (applicationId: string, workerId: string) => {
    try {
      console.log('✅ [JobDetails] Accepting application:', applicationId);
      
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${job?.id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          worker_id: workerId,
        }),
      });

      if (response.ok) {
        toast.success('Worker assigned successfully!');
        // Refresh applications
        if (job?.id) {
          fetchJobApplications(job.id);
        }
        setShowWorkerModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign worker');
      }
    } catch (error: any) {
      console.error('❌ [JobDetails] Error accepting application:', error);
      toast.error(error.message || 'Failed to assign worker');
    }
  };


  const handleApply = async () => {
    if (!user || !token) {
      toast.info('Please log in to apply for this job');
      navigate('/login', { 
        state: { 
          returnTo: `/dashboard/jobs/${id}`,
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
        navigate('/dashboard/worker/profile');
        return;
      }

      // Navigate to application form
      const jobId = id || window.location.pathname.split('/')[3];
      navigate(`/dashboard/jobs/${jobId}/apply`);
      
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

  const formatCurrency = (amount: number | undefined) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';

    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


 // In JobDetails.tsx - Update the renderApplicationsSection function
// In JobDetails.tsx - Update the renderApplicationsSection function
const renderApplicationsSection = () => {
  if (!isJobOwner || !applications.length) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Job Applications
            <Badge variant="secondary">
              {applications.length} application{applications.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          <CardDescription>
            Review applications from workers. Click "View Profile" to see worker details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((application: any) => {
              const workerName = extractWorkerName(application.worker, application.worker_profile, application.worker_id);
              const workerEmail = extractWorkerEmail(application.worker);
              const experienceYears = extractWorkerExperience(application.worker_profile);
              const workerCategory = extractWorkerCategory(application.worker_profile);

              const hasProfileData = application.worker_profile !== null;

              return (
                <Card key={application.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      {/* Worker Info */}
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{workerName}</p>
                          <div className="text-sm text-muted-foreground">
                            <p>{workerEmail}</p>
                            {experienceYears > 0 && (
                              <p>{experienceYears} years experience • {workerCategory}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={
                          application.status === 'accepted' ? 'default' : 
                          application.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {application.status || 'pending'}
                        </Badge>
                      </div>

                      {/* Application Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Proposed: {formatCurrency(application.proposed_rate)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Estimate: {application.estimated_completion} days</span>
                        </div>
                      </div>

                      {/* Cover Letter */}
                      <div>
                        <p className="text-sm font-medium mb-1">Cover Letter:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-slate-50 p-3 rounded">
                          {application.cover_letter}
                        </p>
                      </div>

                      {/* Profile Availability Indicator */}
                      {!hasProfileData && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                          <span className="text-xs">ℹ️</span>
                          <span>Full profile not available - basic contact information shown</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {application.status === 'pending' && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedWorker(application.worker_id);
                            setShowWorkerModal(true);
                          }}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <User className="h-3 w-3" />
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptApplication(application.id, application.worker_id)}
                          className="flex items-center gap-1"
                        >
                          <Users className="h-3 w-3" />
                          Accept & Assign
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Worker Profile Modal - Pass both worker data and profile */}
      <WorkerProfileModal
        workerId={selectedWorker || ''}
        workerData={applications.find(app => app.worker_id === selectedWorker)?.worker || null}
        workerProfile={applications.find(app => app.worker_id === selectedWorker)?.worker_profile || null}
        isOpen={showWorkerModal}
        onClose={() => {
          setShowWorkerModal(false);
          setSelectedWorker(null);
        }}
        onAssign={(workerId) => {
          const application = applications.find(app => app.worker_id === workerId);
          if (application) {
            handleAcceptApplication(application.id, workerId);
          }
        }}
        jobId={job?.id}
      />
    </>
  );
};

  // Render apply section for workers (not job owners)
const renderApplySection = () => {
  if (isJobOwner || !isWorker || !job) return null;

  return (
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
                <span className="font-semibold">{formatCurrency(job.budget || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Duration:</span>
                <span>{job.estimated_duration_days || 0} days</span>
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
  );
};

  // Render job management section for job owners
  const renderJobManagementSection = () => {
    if (!isJobOwner) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage This Job</CardTitle>
          <CardDescription>
            Job management tools and statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Applications Received:</span>
              <span className="font-semibold">{applications.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Job Status:</span>
              <Badge variant={isJobOpen ? 'default' : 'secondary'}>
                {job?.status?.replace('_', ' ') || 'Unknown'}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowApplications(!showApplications)}
            >
              <Users className="h-4 w-4 mr-2" />
              {showApplications ? 'Hide Applications' : 'View Applications'}
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Edit Job
            </Button>
          </div>
        </CardContent>
      </Card>
    );
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
              <Link to="/dashboard/jobs">Back to Jobs</Link>
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
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/jobs')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Job Details</h1>
            <p className="text-muted-foreground">
              {isJobOwner ? 'Manage your job posting' : 'Complete information about this job opportunity'}
            </p>
          </div>
          {isJobOwner && (
            <Badge variant="default" className="ml-auto">
              Your Job
            </Badge>
          )}
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
                      {isJobOwner && (
                        <Badge variant="outline">
                          {applications.length} applications
                        </Badge>
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
                        <p className="text-muted-foreground">{formatDate(job.deadline)}</p>
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

            {/* Show applications if job owner and showApplications is true */}
            {isJobOwner && showApplications && renderApplicationsSection()}

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
            {/* Show job management for owners, apply section for workers */}
            {isJobOwner ? renderJobManagementSection() : renderApplySection()}

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
          </div>
        </div>
      </div>
    </div>
  );
};