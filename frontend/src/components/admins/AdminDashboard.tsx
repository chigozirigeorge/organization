// components/AdminDashboard.tsx - Fixed TypeScript errors
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Search, Users, Shield, FileText, AlertTriangle, CheckCircle, XCircle, Eye, Wallet, TrendingUp, Building, CreditCard, Edit, UserPlus, UserMinus, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';

interface VerificationRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_id: string;
  document_url: string;
  selfie_url: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  user?: {
    name: string;
    email: string;
    username: string;
  };
}

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  trust_score: number;
  email_verified: boolean;
  document_verified: boolean;
  verification_status: string;
  created_at: string;
  wallet_address?: string;
  referral_code?: string;
  referral_count?: number;
}

interface DashboardStats {
  totalUsers: number;
  pendingVerifications: number;
  platformRevenue: number;
  activeJobs: number;
  totalTransactions: number;
  disputeRate: number;
  userGrowth: number;
}

export const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingVerifications: 0,
    platformRevenue: 0,
    activeJobs: 0,
    totalTransactions: 0,
    disputeRate: 2.5,
    userGrowth: 12
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 50
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  // Available roles for the platform
 const availableRoles = [
  { value: 'User', label: 'User', description: 'Basic platform user' },
  { value: 'Worker', label: 'Worker', description: 'Can apply for and complete jobs' },
  { value: 'Employer', label: 'Employer', description: 'Can post jobs and hire workers' },
  { value: 'Verifier', label: 'Verifier', description: 'Can review user verifications' },
  { value: 'Moderator', label: 'Moderator', description: 'Can moderate content and disputes' },
  { value: 'Admin', label: 'Admin', description: 'Full platform access' },
  { value: 'SuperAdmin', label: 'Super Admin', description: 'Full platform access with extra privileges' },
  { value: 'Lawyer', label: 'Lawyer', description: 'Legal professional' },
  { value: 'Agent', label: 'Agent', description: 'Platform agent' },
  { value: 'Landlord', label: 'Landlord', description: 'Property owner' },
  { value: 'Whistleblower', label: 'Whistleblower', description: 'Reports issues' },
  { value: 'CustomerCare', label: 'Customer Care', description: 'Customer support' },
  { value: 'Dev', label: 'Developer', description: 'Platform developer' }
];

  useEffect(() => {
    fetchVerifications();
    fetchPlatformUsers(1);
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/verification/admin/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVerifications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verification requests');
    }
  };

  const fetchPlatformUsers = async (page: number = 1) => {
    try {
      setUsersLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        limit: pagination.limit.toString(),
        page: page.toString()
      });
      
      const response = await fetch(`https://verinest.up.railway.app/api/users/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin users data received:', data);
        
        let users: PlatformUser[] = [];
        let totalCount = 0;
        
        if (data.data && data.data.users && Array.isArray(data.data.users)) {
          users = data.data.users;
          totalCount = data.data.total_count || data.data.totalCount || users.length;
        } else if (data.users && Array.isArray(data.users)) {
          users = data.users;
          totalCount = data.total_count || data.totalCount || users.length;
        } else if (data.data && Array.isArray(data.data)) {
          users = data.data;
          totalCount = data.total_count || data.totalCount || users.length;
        } else if (Array.isArray(data)) {
          users = data;
          totalCount = data.length;
        }
        
        setPlatformUsers(users);
        
        // Update pagination
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalPages: Math.ceil(totalCount / prev.limit),
          totalUsers: totalCount
        }));
        
        calculateStats(users, verifications);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load users');
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setUsersLoading(false);
    }
  };

  const calculateStats = (users: PlatformUser[], verifications: VerificationRequest[]) => {
    const totalUsers = users.length;
    const pendingVerifications = verifications.filter(v => v.status === 'pending').length;
    
    // Calculate user growth (mock data for now)
    const userGrowth = 12; // 12% growth this month
    
    setStats(prev => ({
      ...prev,
      totalUsers,
      pendingVerifications,
      userGrowth
    }));
  };

  useEffect(() => {
    calculateStats(platformUsers, verifications);
  }, [platformUsers, verifications]);

  const handleVerificationReview = async (verificationId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const response = await fetch(`https://verinest.up.railway.app/api/verification/admin/${verificationId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          review_notes: notes || '',
        }),
      });

      if (response.ok) {
        toast.success(`Verification ${status} successfully`);
        fetchVerifications();
      } else {
        throw new Error('Failed to update verification');
      }
    } catch (error) {
      console.error('Error reviewing verification:', error);
      toast.error('Failed to update verification');
    }
  };

 // In AdminDashboard.tsx - Fix the handleRoleChange function
const handleRoleChange = async () => {
  if (!selectedUser || !newRole) return;

  setIsUpdatingRole(true);
  try {
    console.log('🔄 Updating user role:', {
      target_user_id: selectedUser.id,
      role: newRole
    });

    const requestBody = {
      target_user_id: selectedUser.id,
      role: newRole // Now using correct case: 'Verifier' instead of 'verifier'
    };

    const response = await fetch('https://verinest.up.railway.app/api/users/role', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📨 Role update response status:', response.status);

    const responseText = await response.text();
    console.log('📨 Role update response body:', responseText);

    // Handle the response - it might be JSON or plain text
    if (response.ok) {
      // Success case
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        // If success response is not JSON, that's fine
        responseData = { message: 'Role updated successfully' };
      }
      
      toast.success(`User role updated to ${newRole} successfully`);
      setRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
      fetchPlatformUsers(pagination.currentPage);
    } else {
      // Error case - the backend returns plain text for errors
      if (responseText.includes('unknown variant')) {
        // Extract the role that failed from the error message
        const roleMatch = responseText.match(/unknown variant `([^`]+)`/);
        const failedRole = roleMatch ? roleMatch[1] : newRole;
        throw new Error(`Invalid role value: "${failedRole}". Please use one of the available roles.`);
      } else if (response.status === 422) {
        throw new Error(`Validation error: ${responseText}`);
      } else {
        throw new Error(`Failed to update role: ${responseText || response.status}`);
      }
    }
  } catch (error: any) {
    console.error('❌ Error updating user role:', error);
    toast.error(error.message || 'Failed to update user role');
  } finally {
    setIsUpdatingRole(false);
  }
};

  const openRoleDialog = (user: PlatformUser) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
    debugUserRoles();
  };

  const closeRoleDialog = () => {
    setRoleDialogOpen(false);
    setSelectedUser(null);
    setNewRole('');
  };

 const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'Admin':
    case 'SuperAdmin':
      return 'destructive';
    case 'Moderator':
      return 'default';
    case 'Verifier':
      return 'secondary';
    case 'Employer':
      return 'outline';
    case 'Worker':
      return 'secondary';
    case 'Lawyer':
      return 'default';
    case 'Agent':
      return 'outline';
    case 'Landlord':
      return 'secondary';
    case 'Whistleblower':
      return 'destructive';
    case 'CustomerCare':
      return 'default';
    case 'Dev':
      return 'secondary';
    default: // User
      return 'outline';
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'Admin':
    case 'SuperAdmin':
      return <Crown className="h-3 w-3" />;
    case 'Moderator':
      return <Shield className="h-3 w-3" />;
    case 'Verifier':
      return <CheckCircle className="h-3 w-3" />;
    case 'Employer':
      return <UserPlus className="h-3 w-3" />;
    case 'Worker':
      return <Building className="h-3 w-3" />;
    case 'Lawyer':
      return <Shield className="h-3 w-3" />;
    case 'Agent':
      return <UserPlus className="h-3 w-3" />;
    case 'Landlord':
      return <Building className="h-3 w-3" />;
    case 'Whistleblower':
      return <AlertTriangle className="h-3 w-3" />;
    case 'CustomerCare':
      return <Users className="h-3 w-3" />;
    case 'Dev':
      return <TrendingUp className="h-3 w-3" />;
    default: // User
      return <Users className="h-3 w-3" />;
  }
};
  const filteredVerifications = verifications.filter(verification =>
    verification.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.document_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = platformUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
//////////
  const debugUserRoles = () => {
  const uniqueRoles = [...new Set(platformUsers.map(user => user.role))];
  console.log('🔍 Current roles in system:', uniqueRoles);
  
  // Also log the selected user's current role
  if (selectedUser) {
    console.log('🔍 Selected user current role:', selectedUser.role);
  }
};

  // Fixed PaginationControls component
  const PaginationControls = () => (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Showing {platformUsers.length} of {pagination.totalUsers} users
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPlatformUsers(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1 || usersLoading}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPlatformUsers(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages || usersLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Complete platform administration and oversight.
          </p>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.userGrowth}% this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₦{stats.platformRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">Ongoing work</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Total processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispute Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.disputeRate}%</div>
              <p className="text-xs text-muted-foreground">Of total jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Role</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user?.role}</div>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="verifications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Verifications
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users ({platformUsers.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Verifications</CardTitle>
                  <CardDescription>Latest verification requests requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {verifications.slice(0, 5).map((verification) => (
                      <div key={verification.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{verification.user?.name}</p>
                          <p className="text-sm text-muted-foreground">{verification.document_type}</p>
                        </div>
                        <Badge variant="secondary">{verification.status}</Badge>
                      </div>
                    ))}
                    {verifications.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No pending verifications</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent User Registrations</CardTitle>
                  <CardDescription>New users joined the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platformUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>Key platform metrics and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-2xl font-bold text-green-600">99.8%</span>
                    <span className="text-sm text-muted-foreground">Uptime</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-2xl font-bold text-blue-600">4.7/5.0</span>
                    <span className="text-sm text-muted-foreground">Satisfaction</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-2xl font-bold text-purple-600">2.1s</span>
                    <span className="text-sm text-muted-foreground">Avg. Response</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-2xl font-bold text-orange-600">98%</span>
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search verifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredVerifications.map((verification) => (
                <Card key={verification.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{verification.user?.name || 'Unknown User'}</span>
                        <Badge variant={
                          verification.status === 'approved' ? 'default' :
                          verification.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {verification.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(verification.document_url, '_blank')}
                        >
                          View Document
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(verification.selfie_url, '_blank')}
                        >
                          View Selfie
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Document Type: {verification.document_type} | ID: {verification.document_id}
                      <br />
                      Submitted: {new Date(verification.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleVerificationReview(verification.id, 'approved', 'Documents verified successfully')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleVerificationReview(verification.id, 'rejected', 'Documents do not match requirements')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {filteredVerifications.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No verification requests found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Users Tab - Enhanced with Role Management */}
          <TabsContent value="users" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="flex justify-between items-center">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={() => fetchPlatformUsers(1)}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, username, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={() => fetchPlatformUsers(pagination.currentPage)} 
                variant="outline" 
                disabled={usersLoading}
              >
                {usersLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            {!error && (
              <>
                <div className="grid gap-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{user.name}</h3>
                                <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                                  {getRoleIcon(user.role)}
                                  {user.role}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>@{user.username}</span>
                                <span>•</span>
                                <span>Trust: {user.trust_score}</span>
                                <span>•</span>
                                <span>
                                  {user.email_verified ? (
                                    <Badge variant="default" className="text-xs">Email Verified</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Email Pending</Badge>
                                  )}
                                </span>
                                <span>•</span>
                                <span>
                                  {user.document_verified ? (
                                    <Badge variant="default" className="text-xs">KYC Verified</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">KYC Pending</Badge>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRoleDialog(user)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Change Role
                            </Button>
                          </div>
                        </div>
                        
                        {/* Additional user info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-sm font-medium">Joined</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Referrals</p>
                            <p className="text-sm text-muted-foreground">
                              {user.referral_count || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Wallet</p>
                            <p className="text-sm text-muted-foreground">
                              {user.wallet_address ? 'Connected' : 'Not Connected'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Status</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {user.verification_status || 'Not Submitted'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredUsers.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No users found</p>
                        <Button onClick={() => fetchPlatformUsers(1)} variant="outline" className="mt-4">
                          Refresh Users
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Pagination Controls */}
                {platformUsers.length > 0 && <PaginationControls />}
              </>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Platform Reports</CardTitle>
                <CardDescription>
                  Comprehensive platform analytics and reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Financial Reports</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Revenue Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Transaction Analysis
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Fee Structure Report
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">User Reports</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        User Growth Analysis
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Verification Statistics
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Trust Score Distribution
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && selectedUser && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
              <p className="font-medium text-yellow-800">Debug Info:</p>
              <p>User ID: {selectedUser.id}</p>
              <p>Current Role: {selectedUser.role}</p>
              <p>New Role: {newRole}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Role</label>
              <div className="flex items-center gap-2 p-2 border rounded-lg">
                {getRoleIcon(selectedUser?.role || '')}
                <span className="font-medium capitalize">{selectedUser?.role}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a new role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.value)}
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newRole === 'admin' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Admin Role Warning</span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  Granting admin role provides full platform access. Only assign this role to trusted individuals.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeRoleDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleRoleChange} 
              disabled={!newRole || newRole === selectedUser?.role || isUpdatingRole}
            >
              {isUpdatingRole ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};