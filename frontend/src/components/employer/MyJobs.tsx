// components/MyJobs.tsx - Fixed version
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Calendar, DollarSign, Clock, User, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getEmployerDashboard, getWorkerDashboard } from '../../services/labour';
import type { Job, JobApplication, JobWithApplications } from '../../types/labour';

// Using shared types from src/types/labour.ts

export const MyJobs = () => {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  
  interface ApplicationDisplay {
    id: string;
    job_id: string;
    worker_id?: string;
    proposed_rate: number;
    estimated_completion: number;
    cover_letter?: string;
    status: string;
    created_at: string;
    job?: Job;
  }

  const [applications, setApplications] = useState<ApplicationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employer' | 'worker'>('employer');

  useEffect(() => {
    fetchMyJobs();
  }, [activeTab, token, user]);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      if (activeTab === 'employer') {
        const data = await getEmployerDashboard();
        if (data.data && data.data.posted_jobs) setJobs(data.data.posted_jobs);
        else if (data.posted_jobs) setJobs(data.posted_jobs);
        else setJobs([]);
        setApplications([]);
      } else {
        const data = await getWorkerDashboard();
        const rawApplications = data.data?.pending_applications || data.pending_applications || [];
        if (rawApplications.length > 0) {
          const formattedApplications = rawApplications.map((app: any) => ({
            id: app.id,
            job_id: app.job_id,
            proposed_rate: app.proposed_rate,
            estimated_completion: app.estimated_completion,
            cover_letter: app.cover_letter,
            status: app.status || 'pending',
            created_at: app.created_at,
            job: app.job || {
              title: 'Job Application',
              description: app.cover_letter || 'No description available',
              budget: app.proposed_rate,
              location_city: 'Unknown',
              location_state: 'Unknown',
              estimated_duration_days: app.estimated_completion,
              category: 'General'
            }
          }));
          setApplications(formattedApplications);
        } else {
          setApplications([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load your data');
      setJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
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
    switch (status?.toLowerCase()) {
      case 'open': return 'default';
      case 'assigned': return 'secondary';
      case 'in_progress': return 'outline';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getApplicationStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
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
          <h1 className="text-3xl font-bold">My Jobs</h1>
          <p className="text-muted-foreground">
            {activeTab === 'employer' ? 'Jobs you posted' : 'Jobs you applied for'}
          </p>
        </div>
        {activeTab === 'employer' && (
          <Button asChild>
            <Link to="/dashboard/jobs/create">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'employer'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('employer')}
        >
          Jobs I Posted
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'worker'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('worker')}
        >
          Jobs I Applied For
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'employer' ? (
        /* Employer View - Jobs Posted */
        <div className="grid grid-cols-1 gap-6">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold">No jobs posted yet</h3>
                  <p className="mb-4">
                    You haven't posted any jobs yet. Start by creating your first job posting.
                  </p>
                  <Button asChild>
                    <Link to="/dashboard/jobs/create">Post Your First Job</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">
                        <Link 
                          to={`/dashboard/jobs/${job.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {job.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {job.description}
                      </CardDescription>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={getStatusVariant(job.status)}>
                        {job.status ? job.status.replace('_', ' ') : 'Unknown'}
                      </Badge>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(job.budget)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{job.location_city}, {job.location_state}</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{job.estimated_duration_days} days</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      <span>
                        {(
                          job.applications_count ?? job.applications_count ?? job.applications?.length ?? job.applications_count_total ?? 0
                        )} application{((job.applications_count ?? job.applications_count ?? job.applications?.length ?? job.applications_count_total ?? 0) !== 1 ? 's' : '')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/dashboard/jobs/${job.id}`}>
                          View Details
                        </Link>
                      </Button>
                      {job.status === 'open' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dashboard/jobs/${job.id}/applications`}>
                            View Applications
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
      ) : (
        /* Worker View - Job Applications */
        <div className="grid grid-cols-1 gap-6">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold">No applications yet</h3>
                  <p className="mb-4">
                    You haven't applied for any jobs yet. Browse available jobs to get started.
                  </p>
                  <Button asChild>
                    <Link to="/dashboard/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">
                        <Link 
                          to={`/dashboard/jobs/${application.job_id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {application.job?.title || 'Job Application'}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {application.job?.description || application.cover_letter || 'No description available'}
                      </CardDescription>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={getApplicationStatusVariant(application.status)}>
                        {application.status || 'pending'}
                      </Badge>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(application.proposed_rate || 0)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {application.job && (
                      <>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{application.job.location_city}, {application.job.location_state}</span>
                        </div>
                        
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{application.job.estimated_duration_days} days (job estimate)</span>
                        </div>
                        
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Applied {formatDate(application.created_at)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Application Details */}
                  <div className="pt-4 border-t">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Your Proposal</p>
                        <p className="text-sm text-muted-foreground">
                          Proposed: {formatCurrency(application.proposed_rate)} • 
                          Estimated: {application.estimated_completion} days
                        </p>
                      </div>
                      
                      {application.cover_letter && (
                        <div>
                          <p className="text-sm font-medium mb-1">Cover Letter</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        Job Budget: {formatCurrency(application.job?.budget || application.proposed_rate || 0)}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/dashboard/jobs/${application.job_id}`}>
                          View Job Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};