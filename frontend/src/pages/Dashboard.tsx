// components/Dashboard.tsx - Fixed TypeScript errors
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { JobsList } from '../components/JobsList';
import { WorkerProfileSetup } from '../components/WorkerProfileSetup';
import { CreateJob } from '../components/CreateJob';
import { Navbar } from '../components/Navbar';
import { WalletManagement } from '@/components/WalletManagement';
import { Footer } from '../components/Footer';
import { MyJobs } from '../components/MyJobs';
import { MyContracts } from '../components/MyContracts';
import { WorkerDashboard } from '../components/WorkerDashboard';
import { EmployerDashboard } from '../components/EmployerDashboard';
import { JobProgress } from '../components/JobProgress';
import { JobReviews } from '../components/JobReviews';
import { DisputeManagement } from '../components/DisputeManagement';
import { EscrowManagement } from '../components/EscrowManagement';
import { 
  AlertCircle, Briefcase, UserPlus, Wallet, Home, Settings, FileText, 
  TrendingUp, Users, Star, Shield, CreditCard, SettingsIcon, Menu, X,
  UserCheck, ShieldCheck, BarChart3, Building, ClipboardList, MessageSquare,
  DollarSign, Clock, Calendar, Award, Target, LucideIcon
} from 'lucide-react';
import { RoleSelection } from '@/components/RoleSelection';
import { VerificationPrompt } from '@/components/VerificationPrompt';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Settings as Setting } from '@/components/Settings';
import { VerifierDashboard } from '@/components/VerifierDashboard'; 
import { AdminDashboard } from '@/components/AdminDashboard'; 

// Define interfaces for better TypeScript support
interface DashboardStat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  description: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const Dashboard = () => {
  const { user, token, logout, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    activeContracts: 0,
    completedJobs: 0,
    totalEarnings: 0,
    pendingApplications: 0,
    pendingVerifications: 0,
    totalUsers: 0,
    platformRevenue: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchDashboardStats();
      setLoading(false);
    }
  }, [isAuthenticated, navigate]);

  if (user && !user.role) {
    return <RoleSelection />;
  }

  // Add a function to manually refresh KYC status
  const checkKYCStatus = async () => {
    await refreshUser();
    toast.info('KYC status updated');
  };

  const fetchDashboardStats = async () => {
    try {
      let endpoint = '';
      if (user?.role === 'worker') {
        endpoint = 'https://verinest.up.railway.app/api/labour/worker/dashboard';
      } else if (user?.role === 'employer') {
        endpoint = 'https://verinest.up.railway.app/api/labour/employer/dashboard';
      } else if (user?.role === 'verifier') {
        endpoint = 'https://verinest.up.railway.app/api/verification/admin/pending';
      } else if (user?.role === 'admin') {
        endpoint = 'https://verinest.up.railway.app/api/users/admin/users?limit=100';
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (user?.role === 'verifier') {
            const verifications = data.data || [];
            setDashboardStats(prev => ({
              ...prev,
              pendingVerifications: verifications.length,
              totalJobs: verifications.filter((v: any) => 
                v.status === 'approved' || v.status === 'Approved'
              ).length
            }));
          } else if (user?.role === 'admin') {
            const users = data.data?.users || data.users || [];
            setDashboardStats(prev => ({
              ...prev,
              totalUsers: users.length,
              pendingVerifications: users.filter((u: any) => 
                u.verification_status === 'pending'
              ).length
            }));
          } else {
            setDashboardStats(data.stats || data);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  if (!user || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  // Enhanced role-based stats with professional design - FIXED TypeScript
  const getRoleBasedStats = (): DashboardStat[] => {
    const baseStats: DashboardStat[] = [];
    
    if (user.role === 'worker') {
      return [
        { 
          label: 'Total Jobs', 
          value: dashboardStats.totalJobs, 
          icon: Briefcase, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          description: 'Jobs applied'
        },
        { 
          label: 'Active Contracts', 
          value: dashboardStats.activeContracts, 
          icon: FileText, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          description: 'Ongoing work'
        },
        { 
          label: 'Completed Jobs', 
          value: dashboardStats.completedJobs, 
          icon: TrendingUp, 
          color: 'text-orange-600', 
          bgColor: 'bg-orange-50',
          description: 'Successfully completed'
        },
        { 
          label: 'Total Earnings', 
          value: `₦${dashboardStats.totalEarnings?.toLocaleString() || '0'}`, 
          icon: Wallet, 
          color: 'text-emerald-600', 
          bgColor: 'bg-emerald-50',
          description: 'Lifetime earnings'
        },
      ];
    } else if (user.role === 'employer') {
      return [
        { 
          label: 'Jobs Posted', 
          value: dashboardStats.totalJobs, 
          icon: Briefcase, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          description: 'Total posted'
        },
        { 
          label: 'Active Workers', 
          value: dashboardStats.activeContracts, 
          icon: Users, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          description: 'Currently working'
        },
        { 
          label: 'Completed Jobs', 
          value: dashboardStats.completedJobs, 
          icon: TrendingUp, 
          color: 'text-orange-600', 
          bgColor: 'bg-orange-50',
          description: 'Successfully completed'
        },
        { 
          label: 'Pending Applications', 
          value: dashboardStats.pendingApplications, 
          icon: UserPlus, 
          color: 'text-amber-600', 
          bgColor: 'bg-amber-50',
          description: 'Awaiting review'
        },
      ];
    } else if (user.role === 'verifier') {
      return [
        { 
          label: 'Pending Verifications', 
          value: dashboardStats.pendingVerifications, 
          icon: UserCheck, 
          color: 'text-amber-600', 
          bgColor: 'bg-amber-50',
          description: 'Awaiting review'
        },
        { 
          label: 'Approved Today', 
          value: dashboardStats.totalJobs, 
          icon: ShieldCheck, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          description: 'Verified users'
        },
        { 
          label: 'Average Time', 
          value: '15m', 
          icon: Clock, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          description: 'Per verification'
        },
        { 
          label: 'Accuracy Rate', 
          value: '98.5%', 
          icon: Target, 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-50',
          description: 'Verification accuracy'
        },
      ];
    } else if (user.role === 'admin') {
      return [
        { 
          label: 'Total Users', 
          value: dashboardStats.totalUsers, 
          icon: Users, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          description: 'Platform users'
        },
        { 
          label: 'Pending Verifications', 
          value: dashboardStats.pendingVerifications, 
          icon: UserCheck, 
          color: 'text-amber-600', 
          bgColor: 'bg-amber-50',
          description: 'Awaiting review'
        },
        { 
          label: 'Platform Revenue', 
          value: `₦${dashboardStats.platformRevenue.toLocaleString()}`, 
          icon: DollarSign, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          description: 'Total earnings'
        },
        { 
          label: 'User Growth', 
          value: '12%', 
          icon: TrendingUp, 
          color: 'text-emerald-600', 
          bgColor: 'bg-emerald-50',
          description: 'This month'
        },
      ];
    }
    return baseStats;
  };

  // Render different sections based on active section
  // const renderActiveSection = () => {
  //   switch (activeSection) {
  //     case 'home':
  //       if (user.role === 'verifier') {
  //         return <VerifierDashboard />;
  //       } else if (user.role === 'admin') {
  //         return <AdminDashboard />;
  //       }
  //       return <JobsList />;
  //     case 'worker-setup':
  //       return <WorkerProfileSetup />;
  //     case 'create-job':
  //       return <CreateJob />;
  //     case 'wallet':
  //       return <WalletManagement />;
  //     case 'my-jobs':
  //       return <MyJobs />;
  //     case 'contracts':
  //       return <MyContracts />;
  //     case 'worker-dashboard':
  //       return <WorkerDashboard />;
  //     case 'employer-dashboard':
  //       return <EmployerDashboard />;
  //     case 'verifier-dashboard':
  //       return <VerifierDashboard />;
  //     case 'admin-dashboard':
  //       return <AdminDashboard />;
  //     case 'job-progress':
  //       return <JobProgress />;
  //     case 'reviews':
  //       return <JobReviews />;
  //     case 'disputes':
  //       return <DisputeManagement />;
  //     case 'escrow':
  //       return <EscrowManagement />;
  //     case 'settings':
  //       return <Setting />;
  //     default:
  //       if (user.role === 'verifier') {
  //         return <VerifierDashboard />;
  //       } else if (user.role === 'admin') {
  //         return <AdminDashboard />;
  //       }
  //       return <JobsList />;
  //   }
  // };

  const renderActiveSection = () => {
  // Always show role-specific dashboard for 'home' section
  if (activeSection === 'home') {
    switch (user.role) {
      case 'worker':
        return <WorkerDashboard />;
      case 'employer':
        return <EmployerDashboard />;
      case 'verifier':
        return <VerifierDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        // For users without role or basic users, show jobs list
        return <JobsList />;
    }
  }

  // Other sections remain the same
  switch (activeSection) {
    case 'worker-setup':
      return <WorkerProfileSetup />;
    case 'create-job':
      return <CreateJob />;
    case 'wallet':
      return <WalletManagement />;
    case 'my-jobs':
      return <MyJobs />;
    case 'contracts':
      return <MyContracts />;
    case 'job-progress':
      return <JobProgress />;
    case 'reviews':
      return <JobReviews />;
    case 'disputes':
      return <DisputeManagement />;
    case 'escrow':
      return <EscrowManagement />;
    case 'settings':
      return <Setting />;
    default:
      // Fallback to role-specific dashboard
      switch (user.role) {
        case 'worker':
          return <WorkerDashboard />;
        case 'employer':
          return <EmployerDashboard />;
        case 'verifier':
          return <VerifierDashboard />;
        case 'admin':
          return <AdminDashboard />;
        default:
          return <JobsList />;
      }
  }
};

  // Enhanced navigation items based on role - FIXED TypeScript
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        id: 'home',
        label: 'Home',
        icon: Home,
        description: 'Main dashboard'
      },
      {
        id: 'wallet',
        label: 'Wallet',
        icon: Wallet,
        description: 'Manage funds'
      }
    ];

    if (user.role === 'worker') {
      return [
        ...baseItems,
        {
          id: 'my-jobs',
          label: 'My Jobs',
          icon: Briefcase,
          description: 'Job applications'
        },
        {
          id: 'contracts',
          label: 'Contracts',
          icon: FileText,
          description: 'Active contracts'
        },
        {
          id: 'worker-dashboard',
          label: 'Dashboard',
          icon: BarChart3,
          description: 'Performance overview'
        },
        {
          id: 'job-progress',
          label: 'Job Progress',
          icon: TrendingUp,
          description: 'Track work status'
        },
        {
          id: 'reviews',
          label: 'My Reviews',
          icon: Star,
          description: 'Client feedback'
        }
      ];
    } else if (user.role === 'employer') {
      return [
        ...baseItems,
        {
          id: 'create-job',
          label: 'Post Job',
          icon: UserPlus,
          description: 'Hire workers'
        },
        {
          id: 'my-jobs',
          label: 'My Jobs',
          icon: Briefcase,
          description: 'Job postings'
        },
        {
          id: 'contracts',
          label: 'Contracts',
          icon: FileText,
          description: 'Worker agreements'
        },
        {
          id: 'employer-dashboard',
          label: 'Dashboard',
          icon: BarChart3,
          description: 'Business overview'
        },
        {
          id: 'escrow',
          label: 'Escrow',
          icon: CreditCard,
          description: 'Payment management'
        }
      ];
    } else if (user.role === 'verifier') {
      return [
        ...baseItems,
        {
          id: 'verifier-dashboard',
          label: 'Verifications',
          icon: UserCheck,
          description: 'Review documents'
        },
        {
          id: 'quick-review',
          label: 'Quick Review',
          icon: ClipboardList,
          description: 'Efficient review'
        }
      ];
    } else if (user.role === 'admin') {
      return [
        ...baseItems,
        {
          id: 'admin-dashboard',
          label: 'Admin Panel',
          icon: Shield,
          description: 'Platform management'
        },
        {
          id: 'user-management',
          label: 'Users',
          icon: Users,
          description: 'User management'
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          description: 'Platform insights'
        }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();
  const roleStats = getRoleBasedStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Fixed Navbar with proper props */}
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <main className="flex">
        {/* Enhanced Collapsible Sidebar */}
        <div className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:w-80 w-64 bg-white/95 backdrop-blur-sm border-r border-slate-200/60
          shadow-xl lg:shadow-none
        `}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">VN</span>
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">VeriNest</h2>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* User Profile Card */}
            <div className="p-6 border-b border-slate-200/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{user.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              
              {/* Trust Score Badge */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-800">Trust Score</p>
                    <p className="text-lg font-bold text-emerald-700">85%</p>
                  </div>
                  <Award className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  className="w-full justify-start h-12 px-4 rounded-xl transition-all duration-200 hover:shadow-md"
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className={`h-4 w-4 mr-3 ${
                    activeSection === item.id ? 'text-white' : 'text-slate-600'
                  }`} />
                  <div className="text-left flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className={`text-xs ${
                      activeSection === item.id ? 'text-white/80' : 'text-slate-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-200/60">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-slate-800"
                onClick={() => setActiveSection('settings')}
              >
                <SettingsIcon className="h-4 w-4 mr-3" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-slate-600 mt-2">
                  {user.role === 'worker' && 'Ready to find your next opportunity?'}
                  {user.role === 'employer' && 'Manage your workforce efficiently'}
                  {user.role === 'verifier' && 'Review and verify user documents'}
                  {user.role === 'admin' && 'Complete platform oversight and management'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Email Verification Alert */}
          {!user.email_verified && (
            <Alert className="mb-6 bg-amber-50 border-amber-200 shadow-sm">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Please verify your email to access all features. 
                <Button 
                  variant="link" 
                  className="text-amber-800 p-0 ml-1 h-auto font-medium" 
                  onClick={() => navigate('/verify-email')}
                >
                  Verify now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* KYC Verification Status */}
          <Card className="mb-6 shadow-sm border-slate-200/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-slate-600" />
                  Identity Verification Status
                </div>
                <Button variant="outline" size="sm" onClick={checkKYCStatus}>
                  Refresh Status
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">Current Status:</span>
                    <Badge 
                      variant={
                        user?.kyc_verified === 'verified' ? 'default' :
                        user?.kyc_verified === 'pending' ? 'secondary' :
                        user?.kyc_verified === 'rejected' ? 'destructive' :
                        'destructive'
                      }
                      className="px-3 py-1"
                    >
                      {user?.kyc_verified === 'verified' ? 'Verified' :
                      user?.kyc_verified === 'pending' ? 'Under Review' :
                      user?.kyc_verified === 'rejected' ? 'Rejected' :
                      'Not Verified'}
                    </Badge>
                  </div>
                  
                  {user?.kyc_verified === 'pending' && (
                    <p className="text-sm text-slate-500 mt-2">
                      Verification typically takes 24-48 hours
                    </p>
                  )}
                  
                  {user?.kyc_verified === 'rejected' && (
                    <p className="text-sm text-red-600 mt-2">
                      Your verification was rejected. Please submit new documents.
                    </p>
                  )}
                </div>
                
                {(user?.kyc_verified === 'unverified' || user?.kyc_verified === 'rejected') && (
                  <Button 
                    onClick={() => navigate('/verify/kyc')}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                  >
                    {user?.kyc_verified === 'rejected' ? 'Resubmit Verification' : 'Start Verification'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Limited Access Notice for Unverified Users */}
          {(!user?.kyc_verified || user.kyc_verified === 'unverified') && user.role && (
            <Alert className="mb-6 bg-blue-50 border-blue-200 shadow-sm">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Limited Access:</strong> Complete verification to access all features. 
                <Button 
                  variant="link" 
                  className="text-blue-800 p-0 ml-1 h-auto font-medium" 
                  onClick={() => navigate('/verify/kyc')}
                >
                  Verify now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Stats Grid */}
          {roleStats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {roleStats.map((stat, index) => (
                <Card 
                  key={index} 
                  className="border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                          {stat.value}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {stat.description}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    {/* Progress bar for visual appeal */}
                    <div className="mt-4 w-full bg-slate-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${stat.bgColor.replace('bg-', 'bg-')} transition-all duration-1000`}
                        style={{ width: '85%' }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Welcome Message for New Users */}
          {!user.role && activeSection === 'home' && (
            <Card className="mb-6 bg-gradient-to-r from-primary/5 to-blue-50/50 border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  Welcome to VeriNest!
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Get started by choosing your role. Become a worker to find jobs, or become an employer to hire talent.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setActiveSection('worker-setup')}
                    className="bg-gradient-to-r from-primary to-primary/90 shadow-lg"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Become a Worker
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveSection('create-job')}
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Hire Workers
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Section Content */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            {renderActiveSection()}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;