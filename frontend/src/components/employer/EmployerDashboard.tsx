// components/EmployerDashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Calendar, DollarSign, Clock, Users, TrendingUp, Briefcase, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Job, Contract } from '../../types/labour';
import { getEmployerDashboard } from '../../services/labour';

interface DashboardResponse {
  data?: {
    posted_jobs: Job[];
    active_contracts: Contract[];
    completed_jobs: number;
    total_spent: number;
  };
  posted_jobs?: Job[];
  active_contracts?: Contract[];
  completed_jobs?: number;
  total_spent?: number;
}

export const EmployerDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeContracts: 0,
    completedJobs: 0,
    totalSpent: 0,
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await getEmployerDashboard();
      const data = res.data || res;
      const dashboardData = data.data || data;

      const postedJobs = dashboardData.posted_jobs || dashboardData.posted_jobs || [];
      const activeContractsData = dashboardData.active_contracts || [];

      setStats({
        totalJobs: postedJobs.length || 0,
        activeContracts: activeContractsData.length || 0,
        completedJobs: dashboardData.completed_jobs || 0,
        totalSpent: dashboardData.total_spent || 0,
      });

      setRecentJobs(postedJobs);

      const processedContracts = (activeContractsData || []).map((contract: Contract) => ({
        ...contract,
        job: contract.job || findJobById(postedJobs, (contract as any).job_id),
      }));
      setActiveContracts(processedContracts);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to find job by ID from posted_jobs array
  const findJobById = (jobs: Job[], jobId: string): Job | undefined => {
    return jobs?.find(job => job.id === jobId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Safe contract display function
  const renderContractInfo = (contract: Contract) => {
    // If job data is missing, show basic contract info
    if (!contract.job) {
      return (
        <div className="p-3 border rounded-lg">
          <div className="space-y-2">
            <p className="font-medium">Contract #{contract.id.slice(0, 8)}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatCurrency(Number(contract.agreed_rate) || 0)}</span>
              <span>{contract.agreed_timeline} days</span>
              <Badge variant="outline">{contract.status}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Job details not available
            </div>
          </div>
        </div>
      );
    }

    // Full job data available
    return (
      <div className="p-3 border rounded-lg">
        <div className="space-y-2">
          <p className="font-medium">{contract.job.title}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatCurrency(Number(contract.agreed_rate) || 0)}</span>
            <span>{contract.agreed_timeline} days</span>
            <Badge variant="outline">{contract.status}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {contract.worker?.user?.name || 'Worker not specified'}
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {contract.job.location_city}, {contract.job.location_state}
            </div>
          </div>
        </div>
      </div>
    );
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
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <p className="text-muted-foreground">Manage your jobs and workers</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/jobs/create">Post New Job</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Jobs posted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing jobs
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
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Total payments made
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>
              Your most recent job postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No jobs posted yet</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/dashboard/jobs/create">Post Your First Job</Link>
                  </Button>
                </div>
              ) : (
                recentJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{job.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatCurrency(Number(job.budget))}</span>
                        <span>{job.estimated_duration_days} days</span>
                        <Badge variant={
                          job.status === 'open' ? 'default' : 
                          job.status === 'assigned' ? 'secondary' : 'outline'
                        }>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/jobs/${job.id}`}>View</Link>
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
              Jobs currently in progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeContracts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No active contracts</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/dashboard/jobs/create">Post a Job</Link>
                  </Button>
                </div>
              ) : (
                activeContracts.slice(0, 5).map((contract) => (
                  <div key={contract.id}>
                    {renderContractInfo(contract)}
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
            Quickly access common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-20 flex flex-col">
              <Link to="/dashboard/jobs/create">
                <Briefcase className="h-6 w-6 mb-2" />
                <span>Post New Job</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col">
              <Link to="/dashboard/my-jobs">
                <Users className="h-6 w-6 mb-2" />
                <span>Manage Jobs</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col">
              <Link to="/dashboard/contracts">
                <FileText className="h-6 w-6 mb-2" />
                <span>View Contracts</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};