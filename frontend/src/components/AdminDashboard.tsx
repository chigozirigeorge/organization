// components/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Search, Users, Shield, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

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

interface Dispute {
  id: string;
  job_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved';
  created_by: string;
  created_at: string;
}

export const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('verifications');
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVerifications();
    fetchDisputes();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputes = async () => {
    try {
      // This endpoint would need to be created
      const response = await fetch('https://verinest.up.railway.app/api/disputes/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDisputes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    }
  };

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
        fetchVerifications(); // Refresh the list
      } else {
        throw new Error('Failed to update verification');
      }
    } catch (error) {
      console.error('Error reviewing verification:', error);
      toast.error('Failed to update verification');
    }
  };

  const filteredVerifications = verifications.filter(verification =>
    verification.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.document_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDisputes = disputes.filter(dispute =>
    dispute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.description.toLowerCase().includes(searchTerm.toLowerCase())
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
            Welcome back, {user?.name}. Manage platform operations and user verifications.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {verifications.filter(v => v.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {disputes.filter(d => d.status === 'open').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Role</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user?.role}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verifications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Verifications
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

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

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search disputes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredDisputes.map((dispute) => (
                <Card key={dispute.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{dispute.title}</span>
                      <Badge variant={
                        dispute.status === 'resolved' ? 'default' :
                        dispute.status === 'in_review' ? 'secondary' : 'destructive'
                      }>
                        {dispute.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {dispute.description}
                      <br />
                      Created: {new Date(dispute.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm">Review Dispute</Button>
                  </CardContent>
                </Card>
              ))}

              {filteredDisputes.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No open disputes found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage all platform users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};