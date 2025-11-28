// components/Dashboard.tsx - Updated with verification status improvements
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { JobsList } from '../components/worker/JobsList';
import { WorkerProfileSetup } from '../components/worker/WorkerProfileSetup';
import { CreateJob } from '../components/CreateJob';
import { Navbar } from '../components/Landingpage/Navbar';
import { WalletManagement } from '@/components/shared/WalletManagement';
import { Footer } from '../components/Landingpage/Footer';
import { MyJobs } from '../components/employer/MyJobs';
import { MyContracts } from '../components/employer/MyContracts';
import { WorkerDashboard } from '../components/worker/WorkerDashboard';
import { EmployerDashboard } from '../components/employer/EmployerDashboard';
import { JobProgress } from '../components/employer/JobProgress';
import { JobReviews } from '../components/employer/JobReviews';
import { DisputeManagement } from '../components/admins/DisputeManagement';
import { EscrowManagement } from '../components/shared/EscrowManagement';
import { 
  AlertCircle, Briefcase, UserPlus, Wallet, Home, Settings, FileText, 
  TrendingUp, Users, Star, Shield, CreditCard, SettingsIcon, Menu, X,
  UserCheck, ShieldCheck, BarChart3, Building, ClipboardList, MessageSquare,
  DollarSign, Clock, Calendar, Award, Target, LucideIcon, HeadphonesIcon,
  Image as ImageIcon, MessageCircle, CheckCircle, BadgeCheck, CircleAlert,
  Store, Package
} from 'lucide-react';
import { RoleSelection } from '@/components/shared/RoleSelection'; 
import { getWorkerDashboard } from '../services/labour';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Settings as Setting } from '@/components/Settings';
import { VerifierDashboard } from '@/components/admins/VerifierDashboard';  
import { AdminDashboard } from '@/components/admins/AdminDashboard';  
import { WorkerPortfolio } from '@/components/worker/WorkerPortfolio';
import { WorkersList } from '@/components/worker/WorkersList'; 
import { JobDetails } from '@/components/employer/JobDetails';
import { ContractSign } from '@/components/employer/ContractSign';
import { CreateJobApplication } from '@/components/worker/CreateJobApplication'; 
import { CustomerServiceDashboard } from '@/components/admins/CustomerServiceDashboard'; 
import { ChatSystem } from '@/components/chat/ChatSystem'; 
import { SupportTickets } from '@/components/admins/SupportTickets'; 
import { WorkerProfile } from '@/components/worker/WorkerProfile';
import { VendorDashboard } from '@/components/vendor/VendorDashboard';
import { MyServices } from '@/components/vendor/MyServices';
import { ServiceDetails } from '@/components/vendor/ServiceDetails';
import { PurchaseService } from '@/components/vendor/PurchaseService';
import { VendorMarketplace } from '@/components/vendor/VendorMarketplace';
import { WorkerJobProgress } from '@/components/worker/WorkerJobProgress'; 
import SettingsDropdown from '@/components/shared/SettingsDropdown';

// Define interfaces for better TypeScript support
interface DashboardStat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  description: string;
  id?: string; // Optional ID for navigation
}

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  path: string;
  badge?: number; // Optional badge for notifications/unread messages
}

const Dashboard = () => {
  const { user, token, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const jobIdFromUrl = location.pathname.split('/jobs/')[1]?.split('/')[0];
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeStat, setActiveStat] = useState('Overview');
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    activeContracts: 0,
    completedJobs: 0,
    totalEarnings: 0,
    pendingApplications: 0,
    pendingVerifications: 0,
    totalUsers: 0,
    platformRevenue: 0,
    supportTickets: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      // Refresh user data to get the latest information
      refreshUser();
      fetchDashboardStats();
      setLoading(false);
    }
  }, [isAuthenticated, navigate, refreshUser]);

  if (user && !user.role) {
    return <RoleSelection />;
  }

  const getCurrentSection = () => {
    const path = location.pathname;
    console.log('🔍 Dashboard Route Detection - Current path:', path);

    // Worker routes
    if (path.includes('/dashboard/workers') && !path.includes('/workers/')) return 'workers';
    
    // Job-related routes
    if (path === '/dashboard/jobs' || path.includes('/dashboard/jobs/browse')) return 'jobs';
    if (path.includes('/dashboard/jobs/create')) return 'create-job';
    if (path.includes('/dashboard/jobs/') && path.includes('/apply')) return 'job-apply';
    if (path.match(/\/dashboard\/jobs\/[^/]+$/)) return 'job-details';
    if (path.includes('/dashboard/jobs/') && !path.includes('/apply')) return 'job-details';
    
    // Worker profile routes
    if (path.includes('/dashboard/worker/portfolio')) return 'portfolio';
    if (path.includes('/dashboard/worker/profile')) return 'worker-setup';
    if (path.includes('/dashboard/workers/') && path.split('/').length === 4) return 'worker-profile';
    
    // Chat and Support routes
    if (path.includes('/dashboard/chat')) return 'chat';
    if (path.includes('/dashboard/support')) return 'support';
    if (path.includes('/dashboard/customer-service')) return 'customer-service';
    
    // Other routes
    if (path.includes('/dashboard/wallet')) return 'wallet';
    if (path.includes('/dashboard/my-jobs')) return 'my-jobs';
    if (path.includes('/dashboard/contracts')) return 'contracts';
    if (path.includes('/dashboard/settings')) return 'settings';
    
    return 'home';
  };

  const [activeSection, setActiveSection] = useState(getCurrentSection());

  useEffect(() => {
    setActiveSection(getCurrentSection());
  }, [location.pathname]);

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
      } else if (user?.role === 'customer_care') {
        endpoint = 'https://verinest.up.railway.app/api/support/stats';
      }

      if (user?.role === 'worker') {
        try {
          const data = await getWorkerDashboard();
          setDashboardStats(data.stats || data || {});
        } catch (err) {
          console.error('Failed to fetch worker dashboard via service:', err);
        }
      } else if (endpoint) {
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
          } else if (user?.role === 'customer_care') {
            setDashboardStats(prev => ({
              ...prev,
              supportTickets: data.pending_tickets || 0,
              totalUsers: data.total_users || 0
            }));
          } else {
            setDashboardStats(data.stats || data);
          }
        }
      }

      // Fetch unread messages count for all users
      if (user) {
        const messagesResponse = await fetch('https://verinest.up.railway.app/api/chat/unread-count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setDashboardStats(prev => ({
            ...prev,
            unreadMessages: messagesData.unread_count || 0
          }));
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

  // Enhanced role-based stats with professional design
  const getRoleBasedStats = (): DashboardStat[] => {
    const baseStats: DashboardStat[] = [];

    if (user.role === 'vendor' || user.role === 'employer' || user.role === 'worker') {
      navigationItems.push({
        id: 'vendor-dashboard',
        label: 'Vendor Panel',
        icon: Store,
        description: 'Manage your services',
        path: '/dashboard/vendor/dashboard'
      });
    }
    
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
    } else if (user.role === 'customer_care') {
      return [
        { 
          label: 'Pending Tickets', 
          value: dashboardStats.supportTickets, 
          icon: HeadphonesIcon, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          description: 'Awaiting response'
        },
        { 
          label: 'Total Users', 
          value: dashboardStats.totalUsers, 
          icon: Users, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          description: 'Platform users'
        },
        { 
          label: 'Resolved Today', 
          value: '24', 
          icon: CheckCircle, 
          color: 'text-emerald-600', 
          bgColor: 'bg-emerald-50',
          description: 'Completed tickets'
        },
        { 
          label: 'Response Time', 
          value: '2.3h', 
          icon: Clock, 
          color: 'text-orange-600', 
          bgColor: 'bg-orange-50',
          description: 'Average response'
        },
      ];
    }
    return baseStats;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const renderActiveSection = () => {
    const pathSegments = location.pathname.split('/');
    const jobId = pathSegments[3];
    const workerId = pathSegments[3];

    // Handle job browsing for all roles
    if (activeSection === 'jobs') {
      return <JobsList />;
    }

    if (pathSegments[2] === 'workers' && pathSegments[3] && pathSegments.length === 4) {
      const workerId = pathSegments[3];
      console.log('👤 Loading worker profile for ID:', workerId);
      return <WorkerProfile key={workerId} workerId={workerId} />;
    }

    // Handle job details view
    // Handle contract signing route explicitly before job-details
    if (location.pathname.includes('/dashboard/contracts/') && location.pathname.includes('/sign')) {
      const pathSegments = location.pathname.split('/');
      const contractId = pathSegments[3];
      console.log('🔐 Contract sign route detected, contractId:', contractId);
      return <ContractSign contractId={contractId} />;
    }

    // Handle job progress route
    if (location.pathname.includes('/dashboard/jobs/') && location.pathname.includes('/progress')) {
      const pathSegments = location.pathname.split('/');
      const jobId = pathSegments[3];
      console.log('📈 Job progress route detected, jobId:', jobId);
      
      if (!jobId) {
        console.error('❌ No jobId found in URL for progress update');
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Invalid Job</h2>
            <p className="text-muted-foreground">No job ID provided for progress update.</p>
            <Button onClick={() => navigate('/dashboard/my-jobs')}>
              Back to My Jobs
            </Button>
          </div>
        );
      }

      // Create a worker-specific job progress component
      return <WorkerJobProgress jobId={jobId} />;
    }

    if (activeSection === 'job-details') {
      const pathSegments = location.pathname.split('/');
      const jobIdFromUrl = pathSegments[3]; // Get jobId from URL
      console.log('🎯 Loading JobDetails with jobId from URL:', jobIdFromUrl);
      
      if (!jobIdFromUrl) {
        console.error('❌ No jobId found in URL');
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Invalid Job</h2>
            <p className="text-muted-foreground">No job ID provided in the URL.</p>
            <Button onClick={() => navigate('/dashboard/jobs')}>
              Back to Jobs
            </Button>
          </div>
        );
    }
  
  return <JobDetails jobId={jobIdFromUrl} key={jobIdFromUrl} />;
}

    // Handle job application view
    if (activeSection === 'job-apply') {
      return <CreateJobApplication key={jobId} />;
    }

    // Handle chat system
    if (activeSection === 'chat') {
      return <ChatSystem />;
    }

    // Handle support tickets for regular users
    if (activeSection === 'support') {
      return <SupportTickets />;
    }

    // Handle customer service dashboard
    if (activeSection === 'customer-service') {
      return <CustomerServiceDashboard />;
    }

    if (activeSection === 'marketplace') {
    return <VendorMarketplace />;
  }
  
  if (pathSegments[2] === 'vendor' && pathSegments[3] === 'dashboard') {
    return <VendorDashboard />;
  }
  
  if (pathSegments[2] === 'vendor' && pathSegments[3] === 'services' && !pathSegments[4]) {
    return <MyServices />;
  }
  
  if (pathSegments[2] === 'services' && pathSegments[3] && pathSegments[4] === 'purchase') {
    return <PurchaseService />;
  }
  
  if (pathSegments[2] === 'services' && pathSegments[3] && !pathSegments[4]) {
    return <ServiceDetails />;
  }

    // Home now shows role-appropriate content instead of Feed
    if (activeSection === 'home') {
      // Show role-specific content instead of problematic feed
      if (user.role === 'worker') {
        return <JobsList />; // Workers see jobs
      } else if (user.role === 'employer') {
        return <WorkersList />; // Employers see workers
      } else if (user.role === 'vendor') {
        return <VendorMarketplace />; // Vendors see marketplace
      } else {
        // For other roles (admin, verifier, customer_care), show their respective dashboards
        if (user.role === 'verifier') return <VerifierDashboard />;
        if (user.role === 'admin') return <AdminDashboard />;
        if (user.role === 'customer_care') return <CustomerServiceDashboard />;
        // Fallback to jobs list
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
      case 'portfolio':
        return <WorkerPortfolio />;
      case 'workers':
        return <WorkersList />;
      default:
        if (location.pathname.includes('/dashboard/jobs/') && !location.pathname.includes('/apply')) {
          return <JobDetails jobId={jobIdFromUrl} key={jobIdFromUrl} />;
        }
        // Fallback to role-appropriate content instead of Feed
        if (user.role === 'worker') {
          return <JobsList />;
        } else if (user.role === 'employer') {
          return <WorkersList />;
        } else if (user.role === 'vendor') {
          return <VendorMarketplace />;
        } else {
          return <JobsList />; // Safe fallback
        }
    }
  };

  // Enhanced navigation items based on role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        id: 'home',
        label: 'Home',
        icon: Home,
        description: 'Main dashboard',
        path: '/dashboard'
      },
      {
      id: 'marketplace',  // ADD THIS
      label: 'Marketplace',
      icon: Store,
      description: 'Browse services & jobs',
      path: '/dashboard/marketplace'
      },
      {
        id: 'wallet',
        label: 'Wallet',
        icon: Wallet,
        description: 'Manage funds',
        path: '/dashboard/wallet'
      },
      {
        id: 'chat',
        label: 'Messages',
        icon: MessageCircle,
        description: 'Chat with users',
        path: '/dashboard/chat',
        badge: dashboardStats.unreadMessages > 0 ? dashboardStats.unreadMessages : undefined
      }
    ];

    // Common items for all roles
    const commonItems = [
      ...baseItems,
      {
        id: 'support',
        label: 'Support',
        icon: HeadphonesIcon,
        description: 'Get help & support',
        path: '/dashboard/support'
      }
    ];

    if (user.role === 'worker') {
      return [
        ...commonItems,
        {
          id: 'jobs',
          label: 'Browse Jobs',
          icon: Briefcase,
          description: 'Find work opportunities',
          path: '/dashboard/jobs'
        },
        {
          id: 'my-jobs',
          label: 'My Applications',
          icon: FileText,
          description: 'Job applications',
          path: '/dashboard/my-jobs'
        },
        {
          id: 'portfolio',
          label: 'My Portfolio',
          icon: ImageIcon,
          description: 'Showcase your work',
          path: '/dashboard/worker/portfolio'
        },
        {
          id: 'contracts',
          label: 'Contracts',
          icon: FileText,
          description: 'Active contracts',
          path: '/dashboard/contracts'
        },
      ];
    } else if (user.role === 'employer') {
      return [
        ...commonItems,
        {
          id: 'create-job',
          label: 'Post Job',
          icon: UserPlus,
          description: 'Hire workers',
          path: '/dashboard/jobs/create'
        },
        {
          id: 'workers',
          label: 'Browse Workers',
          icon: Users,
          description: 'Find talent',
          path: '/dashboard/workers'
        },
        {
          id: 'my-jobs',
          label: 'My Jobs',
          icon: Briefcase,
          description: 'Job postings',
          path: '/dashboard/my-jobs'
        },
        {
          id: 'contracts',
          label: 'Contracts',
          icon: FileText,
          description: 'Worker agreements',
          path: '/dashboard/contracts'
        },
      ];
    } else if (user.role === 'verifier') {
      return [
        ...commonItems,
        {
          id: 'verifications',
          label: 'Verifications',
          icon: UserCheck,
          description: 'Review documents',
          path: '/dashboard/verifications'
        },
      ];
    } else if (user.role === 'admin') {
      return [
        ...commonItems,
        {
          id: 'admin',
          label: 'Admin Panel',
          icon: Shield,
          description: 'Platform management',
          path: '/dashboard/admin'
        },
        {
          id: 'users',
          label: 'User Management',
          icon: Users,
          description: 'Manage all users',
          path: '/dashboard/users'
        },
      ];
    } else if (user.role === 'customer_care') {
      return [
        ...baseItems,
        {
          id: 'customer-service',
          label: 'Customer Service',
          icon: HeadphonesIcon,
          description: 'Manage support tickets',
          path: '/dashboard/customer-service'
        },
        {
          id: 'tickets',
          label: 'All Tickets',
          icon: ClipboardList,
          description: 'View all support tickets',
          path: '/dashboard/tickets'
        },
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();
  const roleStats = getRoleBasedStats();

  // Check if user is verified
  const isUserVerified = user?.kyc_verified === 'verified';

  // Get dashboard stats based on user role
  const getDashboardStats = (): DashboardStat[] => {
    const baseStats: DashboardStat[] = [
      {
        id: 'overview',
        label: 'Overview',
        value: '📊',
        icon: BarChart3,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        description: 'Dashboard Overview'
      }
    ];

    if (user.role === 'worker') {
      return [
        ...baseStats,
        {
          id: 'applications',
          label: 'Applications',
          value: dashboardStats.pendingApplications || 0,
          icon: Briefcase,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Pending Applications'
        },
        {
          id: 'contracts',
          label: 'Active Jobs',
          value: dashboardStats.activeContracts || 0,
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          description: 'Active Contracts'
        },
        {
          id: 'earnings',
          label: 'Earnings',
          value: `₦${(dashboardStats.totalEarnings || 0).toLocaleString()}`,
          icon: DollarSign,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          description: 'Total Earnings'
        }
      ];
    }

    if (user.role === 'employer') {
      return [
        ...baseStats,
        {
          id: 'jobs',
          label: 'Posted Jobs',
          value: dashboardStats.totalJobs || 0,
          icon: Briefcase,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: 'Total Posted Jobs'
        },
        {
          id: 'contracts',
          label: 'Active Contracts',
          value: dashboardStats.activeContracts || 0,
          icon: FileText,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Active Contracts'
        },
        {
          id: 'applications',
          label: 'Applications',
          value: dashboardStats.pendingApplications || 0,
          icon: Users,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          description: 'Pending Applications'
        }
      ];
    }

    if (user.role === 'admin' || user.role === 'verifier') {
      return [
        ...baseStats,
        {
          id: 'users',
          label: 'Total Users',
          value: dashboardStats.totalUsers || 0,
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: 'Platform Users'
        },
        {
          id: 'jobs',
          label: 'Total Jobs',
          value: dashboardStats.totalJobs || 0,
          icon: Briefcase,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Platform Jobs'
        },
        {
          id: 'revenue',
          label: 'Revenue',
          value: `₦${(dashboardStats.platformRevenue || 0).toLocaleString()}`,
          icon: DollarSign,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          description: 'Platform Revenue'
        }
      ];
    }

    if (user.role === 'vendor') {
      return [
        ...baseStats,
        {
          id: 'services',
          label: 'Services',
          value: '🛍️',
          icon: Store,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: 'My Services'
        },
        {
          id: 'orders',
          label: 'Orders',
          value: '📦',
          icon: Package,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          description: 'Customer Orders'
        }
      ];
    }

    return baseStats;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Fixed Navbar with proper props */}
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
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
            </div>

            {/* User Profile Card */}
            <div className="p-6 border-b border-slate-200/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  {/* Blue check for verified users */}
                  {isUserVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                      <BadgeCheck className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate flex items-center gap-1">
                    {user.name}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  {user.username && (
                    <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                  )}
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
                  className="w-full justify-start h-12 px-4 rounded-xl transition-all duration-200 hover:shadow-md relative"
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className={`h-4 w-4 mr-3 ${
                    activeSection === item.id ? 'text-white' : 'text-slate-600'
                  }`} />
                  <div className="text-left flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {item.label}
                      {item.badge && item.badge > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </Badge>
                      )}
                    </div>
                    <div className={`text-xs ${
                      activeSection === item.id ? 'text-white/80' : 'text-slate-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Verification Status above Settings */}
            {!isUserVerified && (
              <div className="p-4 border-t border-slate-200/60">
                <Button
                  variant="outline"
                  className="w-full justify-start text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                  onClick={() => handleNavigation('/verify/kyc')}
                >
                  <CircleAlert className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Not Verified</div>
                    <div className="text-xs text-amber-500">Complete verification</div>
                  </div>
                </Button>
              </div>
            )}

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-200/60">
              <SettingsDropdown />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen p-6 lg:p-8 pt-20">
          {/* Only show welcome message on statistics page */}
          {activeSection === 'statistics' && (
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
                    {user.role === 'customer_care' && 'Provide excellent customer support'}
                    {user.role === 'vendor' && 'Manage your services and products'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Account Status</p>
                    <p className="font-semibold text-slate-800 capitalize">
                      {user.subscription_tier === 'premium' ? 'Premium' : 'Free'}
                    </p>
                  </div>
                  {isUserVerified && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-full">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics Tabs - Only show on statistics page */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                  {getDashboardStats().map((stat: DashboardStat, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveStat(stat.label)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeStat === stat.label
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                      }`}
                    >
                      {stat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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

          {/* KYC Verification Status Card - Only show for unverified users */}
          {!isUserVerified && (
            <Card className="mb-6 shadow-sm border-slate-200/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-5 w-5 text-slate-600" />
                    Identity Verification Status
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={checkKYCStatus}>
                    Refresh Status
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600">Current Status:</span>
                      <Badge 
                        variant={
                          user?.kyc_verified === 'pending' ? 'secondary' :
                          user?.kyc_verified === 'rejected' ? 'destructive' :
                          'destructive'
                        }
                        className="px-3 py-1"
                      >
                        {user?.kyc_verified === 'pending' ? 'Under Review' :
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
          )}

          {/* Limited Access Notice for Unverified Users */}
          {!isUserVerified && user.role && (
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
                    onClick={() => handleNavigation('/dashboard/worker/profile')}
                    className="bg-gradient-to-r from-primary to-primary/90 shadow-lg"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Become a Worker
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleNavigation('/dashboard/jobs/create')}
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
          <div className="bg-white rounded-2xl border mt-5 -mx-4 px-3 py-3 border-slate-200/60 shadow-sm overflow-hidden">
            {renderActiveSection()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;