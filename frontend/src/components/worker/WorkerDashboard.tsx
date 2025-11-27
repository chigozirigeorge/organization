// components/WorkerDashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Calendar, DollarSign, Clock, TrendingUp, Briefcase, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Job, Contract, JobApplication } from '../../types/labour';
import { getWorkerDashboard } from '../../services/labour';

export const WorkerDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeContracts: 0,
    completedJobs: 0,
    totalEarnings: 0,
  });
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // In WorkerDashboard.tsx - Update the fetchDashboardData function
const fetchDashboardData = async () => {
  try {
    setError(null);
    const data = await getWorkerDashboard();
    console.log('📊 Worker Dashboard API Response:', data);
    const dashboardData = data.data || data;
    const totalApplications = dashboardData.pending_applications?.length || 0;
    const activeContractsCount = dashboardData.active_jobs?.length || dashboardData.active_contracts?.length || 0;

    setStats({
      totalApplications,
      activeContracts: activeContractsCount,
      completedJobs: dashboardData.completed_jobs || 0,
      totalEarnings: dashboardData.total_earnings || 0,
    });
    setRecentApplications(dashboardData.pending_applications || []);
    setActiveContracts(dashboardData.active_contracts || dashboardData.active_jobs || []);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    setError('Failed to load dashboard data. Please try again.');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Worker Dashboard</h1>
            <p className="text-muted-foreground">Manage your jobs and applications</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Worker Dashboard</h1>
          <p className="text-muted-foreground">Manage your jobs and applications</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/dashboard/worker/portfolio">
              <ImageIcon className="h-4 w-4 mr-2" />
              My Portfolio
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {/* Stats Grid - Updated to show actual data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Applications awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(stats.totalEarnings || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Your most recent job applications
              {recentApplications.length > 0 && (
                <Button asChild variant="outline" size="sm" className="ml-4">
                  <Link to="/dashboard/my-jobs">View All</Link>
                </Button>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No applications yet</p>
                  <p className="text-sm mb-4">Start by applying to available jobs</p>
                  <Button asChild variant="outline">
                    <Link to="/dashboard/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              ) : (   ///changed id to job id
                recentApplications.slice(0, 5).map((application) => (
                  <div key={application.job_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">{application.job?.title || 'Job Application'}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatCurrency(application.proposed_rate || 0)}</span>
                        <span>{application.estimated_completion || 0} days</span>
                        <Badge variant={
                          application.status === 'accepted' ? 'default' : 
                          application.status === 'rejected' ? 'destructive' : 'secondary'
                        } className="text-xs">
                          {application.status}
                        </Badge>
                      </div>
                      {application.job && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {application.job.location_city}, {application.job.location_state}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/jobs/${application.job_id}`}>View</Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Contracts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Contracts</CardTitle>
            <CardDescription>
              Jobs you're currently working on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeContracts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active contracts</p>
                  <p className="text-sm">When you get hired, your contracts will appear here</p>
                </div>
              ) : (
                activeContracts.slice(0, 5).map((contract) => (
                  <div key={contract.id} className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="space-y-2">
                      <p className="font-medium text-sm">{contract.job?.title || 'Untitled Job'}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatCurrency(contract.agreed_rate || 0)}</span>
                        <span>{contract.agreed_timeline || 0} days</span>
                        <Badge variant="outline" className="text-xs">{contract.status}</Badge>
                      </div>
                      {contract.job && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {contract.job.location_city || 'Unknown'}, {contract.job.location_state || 'Unknown'}
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">
                          Started {contract.created_at ? new Date(contract.created_at).toLocaleDateString() : 'Recently'}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/dashboard/contracts/${contract.id}`}>Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Quickly access important features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-16 flex flex-col">
              <Link to="/dashboard/jobs">
                <Briefcase className="h-5 w-5 mb-2" />
                <span className="text-sm">Browse Jobs</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col">
              <Link to="/dashboard/worker/portfolio">
                <ImageIcon className="h-5 w-5 mb-2" />
                <span className="text-sm">My Portfolio</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex flex-col">
              <Link to="/dashboard/my-jobs">
                <TrendingUp className="h-5 w-5 mb-2" />
                <span className="text-sm">My Applications</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion Status */}
      {user && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Profile Status</CardTitle>
            <CardDescription className="text-blue-700">
              Complete your profile to get more job opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Basic Profile</span>
                <Badge variant="default" className="bg-green-500">
                  Complete
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Portfolio</span>
                <Button asChild variant="link" className="p-0 h-auto text-blue-600">
                  <Link to="/dashboard/worker/portfolio">
                    {recentApplications.length > 0 ? 'Add Items' : 'Set Up'}
                  </Link>
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Verification</span>
                <Badge variant="outline" className="text-orange-500 border-orange-300">
                  {user.kyc_verified === 'verified' ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};