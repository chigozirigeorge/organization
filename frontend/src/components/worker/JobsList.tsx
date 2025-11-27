// components/JobsList.tsx - Updated
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Calendar, DollarSign, Clock, Search, LogIn, UserPlus, User } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location_state: string;
  location_city: string;
  estimated_duration_days: number;
  created_at: string;
  employer: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
}

export const JobsList = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all',
    'Painter',
    'Plumber', 
    'Electrician',
    'Carpenter',
    'Mason',
    'Tiler',
    'Roofer',
    'InteriorDecorator',
    'Landscaper',
    'Cleaner',
    'SecurityGuard',
    'Other'
  ];

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: '1',
        limit: '20'
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const url = `https://verinest.up.railway.app/api/labour/jobs?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle response structure
      let jobsData: Job[] = [];
      
      if (data.data && Array.isArray(data.data)) {
        jobsData = data.data;
      } else if (Array.isArray(data)) {
        jobsData = data;
      } else if (data.jobs && Array.isArray(data.jobs)) {
        jobsData = data.jobs;
      }

      setJobs(jobsData);

    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user || !token) {
      toast.info('Please log in to apply for this job');
      navigate('/login', { 
        state: { 
          returnTo: `/jobs/${jobId}`,
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
      const profileResponse = await fetch('https://verinest.up.railway.app/api/labour/worker/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        toast.error('Please create a worker profile before applying to jobs');
        navigate('/dashboard/worker/profile-setup');
        return;
      }

      navigate(`/dashboard/jobs/${jobId}/apply`);
      
    } catch (error) {
      console.error('Error checking profile:', error);
      toast.error('Please create a worker profile before applying to jobs');
      navigate('/dashboard/worker/profile-setup');
    }
  };

  const handleLogin = () => {
    navigate('/login', { 
      state: { 
        returnTo: window.location.pathname,
        message: 'Log in to apply for jobs'
      } 
    });
  };

  const handleSignup = () => {
    navigate('/signup', { 
      state: { 
        returnTo: window.location.pathname,
        message: 'Sign up to apply for jobs'
      } 
    });
  };

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
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Category Filter Skeleton */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div key={category} className="h-9 w-20 bg-muted rounded-md animate-pulse"></div>
          ))}
        </div>

        {/* Jobs Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Auth CTA for non-logged in users */}
      {!user && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold">Ready to Apply for Jobs?</h2>
              <p className="opacity-90">Create an account or log in to start applying to jobs</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleLogin} variant="secondary" className="gap-2">
                <LogIn className="h-4 w-4" />
                Log In
              </Button>
              <Button onClick={handleSignup} variant="default" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Available Jobs</h1>
          <p className="text-muted-foreground">
            Find your next opportunity from verified employers
            {!user && " - Log in to apply"}
          </p>
        </div>
        <Button onClick={fetchJobs} variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'All Jobs' : category}
          </Button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {jobs.length > 0 ? `${jobs.length} job${jobs.length === 1 ? '' : 's'} found` : 'No jobs found'}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="mb-4">There are no job listings {selectedCategory !== 'all' ? `in the ${selectedCategory} category` : 'available'} yet.</p>
              {selectedCategory !== 'all' && (
                <Button onClick={() => setSelectedCategory('all')}>
                  View All Jobs
                </Button>
              )}
            </div>
          </div>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 group border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    <Link 
                      to={`/dashboard/jobs/${job.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {job.title}
                    </Link>
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0 ml-2">
                    {job.category}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-3 text-sm">
                  {job.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-3 space-y-2">
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-semibold">{formatCurrency(job.budget)}</span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{job.location_city}, {job.location_state}</span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{job.estimated_duration_days} day{job.estimated_duration_days !== 1 ? 's' : ''}</span>
                </div>
                
                {/* Employer Info */}
                <div className="flex items-center text-sm text-muted-foreground pt-2 border-t">
                  <User className="h-4 w-4 mr-2" />
                  <div>
                    <span className="font-medium">{job.employer?.name || 'Employer'}</span>
                    {job.employer?.username && (
                      <span className="text-xs ml-2">@{job.employer.username}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Posted {formatDate(job.created_at)}</span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-3">
                {!user ? (
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => handleApply(job.id)}
                  >
                    <LogIn className="h-4 w-4" />
                    Log In to Apply
                  </Button>
                ) : !user.email_verified ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate('/verify-email')}
                  >
                    Verify Email to Apply
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleApply(job.id)}
                  >
                    Apply Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};