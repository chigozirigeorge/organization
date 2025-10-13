// components/WorkerDashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Calendar, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Job, Contract, JobApplication } from '../types/labour';

export const WorkerDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeContracts: 0,
    completedJobs: 0,
    totalEarnings: 0,
  });
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/labour/worker/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || data);
        setRecentApplications(data.recentApplications || []);
        setActiveContracts(data.activeContracts || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold">Worker Dashboard</h1>
          <p className="text-muted-foreground">Manage your jobs and applications</p>
        </div>
        <Button asChild>
          <Link to="/jobs">Browse Jobs</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Job applications submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{stats.totalEarnings.toLocaleString()}</div>
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
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No applications yet</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to="/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              ) : (
                recentApplications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{application.cover_letter}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>₦{application.proposed_rate.toLocaleString()}</span>
                        <span>{application.estimated_completion} days</span>
                        <Badge variant={
                          application.status === 'accepted' ? 'default' : 
                          application.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {application.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/jobs/${application.job_id}`}>View</Link>
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
                  <p>No active contracts</p>
                </div>
              ) : (
                activeContracts.slice(0, 5).map((contract) => (
                  <div key={contract.id} className="p-3 border rounded-lg">
                    <div className="space-y-2">
                      <p className="font-medium">{contract.job.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>₦{contract.agreed_rate.toLocaleString()}</span>
                        <span>{contract.agreed_timeline} days</span>
                        <Badge variant="outline">{contract.status}</Badge>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        {contract.job.location_city}, {contract.job.location_state}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};