// components/VerifierDashboard.tsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Search, Users, Shield, FileText, AlertTriangle, CheckCircle, XCircle, Eye, Wallet, Briefcase, TrendingUp, User, Calendar, MapPin, ShieldCheck, Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

interface VerificationRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_id: string;
  document_url: string;
  selfie_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'Unverified' | 'Pending' | 'Submitted' | 'Processing' | 'Approved' | 'Rejected' | 'Expired';
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    nationality?: string;
    dob?: string;
    lga?: string;
    nearest_landmark?: string;
    verification_type?: string;
    nin_number?: string;
    verification_number?: string;
  };
}

interface DashboardStats {
  pendingVerifications: number;
  totalVerified: number;
  todayVerifications: number;
  approvalRate: number;
  averageReviewTime: string;
}

export const VerifierDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('verifications');
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingVerifications: 0,
    totalVerified: 0,
    todayVerifications: 0,
    approvalRate: 0,
    averageReviewTime: '0m'
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; type: 'document' | 'selfie'; title: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

// In VerifierDashboard.tsx - Add function to fetch user data
const fetchUserDataForVerifications = async (verifications: VerificationRequest[]) => {
  try {
    const verificationsWithUsers = await Promise.all(
      verifications.map(async (verification) => {
        try {
          // Fetch user data for each verification
          const userResponse = await fetch(`https://verinest.up.railway.app/api/users/admin/users/${verification.user_id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            return {
              ...verification,
              user: userData.data?.user || userData.user || userData.data
            };
          }
          return verification; // Return original if user fetch fails
        } catch (error) {
          console.error(`Error fetching user data for ${verification.user_id}:`, error);
          return verification; // Return original if error
        }
      })
    );
    
    return verificationsWithUsers;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return verifications; // Return original array if overall error
  }
};

// Update fetchPendingVerifications to use the new function
const fetchPendingVerifications = async () => {
  try {
    setLoading(true);
    console.log('🔄 Fetching pending verifications...');
    
    const response = await fetch('https://verinest.up.railway.app/api/verification/admin/pending', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📊 API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response data:', data);
      
      let verifications = data.data || [];
      
      // If verifications don't have user data, fetch it separately
      if (verifications.length > 0 && !verifications[0].user) {
        console.log('👤 User data missing, fetching separately...');
        verifications = await fetchUserDataForVerifications(verifications);
      }
      
      setVerifications(verifications);
      calculateStats(verifications);
    } else {
      throw new Error('Failed to fetch pending verifications');
    }
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    toast.error('Failed to load verification requests');
  } finally {
    setLoading(false);
  }
};

  const calculateStats = (verifications: VerificationRequest[]) => {
    const pending = verifications.filter(v => 
      v.status === 'pending' || v.status === 'Pending' || v.status === 'Submitted' || v.status === 'Processing'
    ).length;
    const approved = verifications.filter(v => 
      v.status === 'approved' || v.status === 'Approved'
    ).length;
    const rejected = verifications.filter(v => 
      v.status === 'rejected' || v.status === 'Rejected'
    ).length;
    const totalProcessed = approved + rejected;
    const approvalRate = totalProcessed > 0 ? Math.round((approved / totalProcessed) * 100) : 0;
    
    const averageReviewTime = '15m';

    setStats({
      pendingVerifications: pending,
      totalVerified: approved,
      todayVerifications: verifications.filter(v => 
        new Date(v.created_at).toDateString() === new Date().toDateString()
      ).length,
      approvalRate,
      averageReviewTime
    });
  };

  const openReviewDialog = (verification: VerificationRequest) => {
    setSelectedVerification(verification);
    setReviewNotes('');
    setReviewDialogOpen(true);
  };

  const closeReviewDialog = () => {
    setReviewDialogOpen(false);
    setSelectedVerification(null);
    setReviewNotes('');
  };

  const handleVerificationReview = async (status: 'Approved' | 'Rejected') => {
    if (!selectedVerification) return;

    setIsProcessing(true);
    try {
      const payload = {
        status: status,
        review_notes: reviewNotes || (status === 'Approved' ? 'Documents verified successfully' : 'Documents do not match requirements'),
      };

      console.log('Sending verification review:', payload);

      const response = await fetch(`https://verinest.up.railway.app/api/verification/admin/${selectedVerification.id}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response body:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { message: responseText };
      }

      if (response.ok) {
        toast.success(`Verification ${status} successfully`);
        closeReviewDialog();
        fetchPendingVerifications(); // Refresh the list
      } else {
        throw new Error(responseData.message || `Failed to update verification (${response.status})`);
      }
    } catch (error: any) {
      console.error('Error reviewing verification:', error);
      toast.error(error.message || 'Failed to update verification');
    } finally {
      setIsProcessing(false);
    }
  };

  // Watermarked image component
  const WatermarkedImage = ({ 
    src, 
    alt, 
    className = "",
    onClick 
  }: { 
    src: string; 
    alt: string; 
    className?: string;
    onClick?: () => void;
  }) => {
    return (
      <div className="relative overflow-hidden rounded-md">
        <img 
          src={src} 
          alt={alt}
          className={`${className} cursor-zoom-in`}
          onClick={onClick}
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyOC42ODYzIDIwIDI2IDIyLjY4NjMgMjYgMjZDMjYgMjkuMzEzNyAyOC42ODYzIDMyIDMyIDMyQzM1LjMxMzcgMzIgMzggMjkuMzEzNyAzOCAyNkMzOCAyMi42ODYzIDM1LjMxMzcgMjAgMzIgMjBaIiBmaWxsPSIjOTlBQUFEIi8+CjxwYXRoIGQ9Ik0xNiAzNkMxNiAzMi42ODYzIDE4LjY4NjMgMzAgMjIgMzBINDJDMjUuMzEzNyAzMCA0OCAzMi42ODYzIDQ4IDM2VjUyQzQ4IDU1LjMxMzcgNDUuMzEzNyA1OCA0MiA1OEgyMkMxOC42ODYzIDU4IDE2IDU1LjMxMzcgMTYgNTJWMzZaIiBmaWxsPSIjOTlBQUFEIi8+Cjwvc3ZnPgo=';
          }}
        />
        {/* Watermark overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent"></div>
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(0, 0, 0, 0.1) 10px,
                rgba(0, 0, 0, 0.1) 20px
              )`,
            }}
          ></div>
          <div 
            className="absolute top-2 left-2 text-xs font-bold text-black/30 pointer-events-none"
            style={{ textShadow: '1px 1px 2px white' }}
          >
            VeriNest Secure
          </div>
          <div 
            className="absolute bottom-2 right-2 text-xs font-bold text-black/30 pointer-events-none"
            style={{ textShadow: '1px 1px 2px white' }}
          >
            {user?.username}
          </div>
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-black/15 pointer-events-none whitespace-nowrap"
            style={{ textShadow: '2px 2px 4px white' }}
          >
            VERINEST VERIFICATION
          </div>
          <div 
            className="absolute bottom-2 left-2 text-xs text-black/25 pointer-events-none"
            style={{ textShadow: '1px 1px 2px white' }}
          >
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  // Image preview functions
  const openImagePreview = (url: string, type: 'document' | 'selfie') => {
    const title = type === 'document' ? 'Verification Document' : 'Selfie Verification';
    setImagePreview({ url, type, title });
    setZoomLevel(1);
  };

  const closeImagePreview = () => {
    setImagePreview(null);
    setZoomLevel(1);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  // Enhanced document viewer with watermark protection
  const openDocumentWithWatermark = (url: string, type: 'document' | 'selfie') => {
    const watermarkText = `VeriNest Verification - Verifier: ${user?.username || user?.name} - ${new Date().toISOString()}`;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verification Document - VeriNest</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5;
              font-family: Arial, sans-serif;
            }
            .watermark {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              pointer-events: none;
              z-index: 1000;
            }
            .watermark-line {
              position: absolute;
              font-size: 24px;
              color: rgba(0,0,0,0.1);
              font-weight: bold;
              text-shadow: 1px 1px 2px white;
              transform: rotate(-45deg);
              white-space: nowrap;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              position: relative;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #e5e5e5;
            }
            .back-button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            }
            .back-button:hover {
              background: #2563eb;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 10px;
              border-radius: 4px;
              margin-bottom: 20px;
              color: #856404;
            }
            img {
              max-width: 100%;
              height: auto;
              border: 1px solid #ddd;
              border-radius: 4px;
              position: relative;
              z-index: 1;
            }
            .info {
              background: #e7f3ff;
              padding: 15px;
              border-radius: 4px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="watermark">
            <div class="watermark-line" style="top: 20%; left: 10%;">VERINEST SECURE</div>
            <div class="watermark-line" style="top: 40%; left: 30%;">${user?.username}</div>
            <div class="watermark-line" style="top: 60%; left: 20%;">${new Date().toLocaleDateString()}</div>
            <div class="watermark-line" style="top: 80%; left: 40%;">VERIFICATION DOCUMENT</div>
          </div>
          <div class="container">
            <div class="header">
              <h2>VeriNest Verification Document</h2>
              <button class="back-button" onclick="window.close()">Close Window</button>
            </div>
            <div class="warning">
              <strong>⚠️ SECURITY NOTICE:</strong> This document is protected. Unauthorized sharing or screenshots are prohibited.
            </div>
            <div class="info">
              <strong>Document Type:</strong> ${type === 'document' ? 'Verification Document' : 'Selfie'} <br>
              <strong>Viewer:</strong> ${user?.name} (${user?.username}) <br>
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </div>
            <img src="${url}" alt="Verification Document" oncontextmenu="return false" />
          </div>
          <script>
            // Disable right-click
            document.addEventListener('contextmenu', function(e) {
              e.preventDefault();
            });
            
            // Disable keyboard shortcuts for screenshots
            document.addEventListener('keydown', function(e) {
              if ((e.ctrlKey && e.key === 'p') || (e.metaKey && e.key === 'p')) {
                e.preventDefault();
                alert('Printing/Screenshots are disabled for security reasons.');
              }
              if (e.key === 'Escape') {
                window.close();
              }
            });
          </script>
        </body>
        </html>
      `);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", label: string } } = {
      'pending': { variant: 'secondary', label: 'Pending' },
      'Pending': { variant: 'secondary', label: 'Pending' },
      'Submitted': { variant: 'secondary', label: 'Submitted' },
      'Processing': { variant: 'secondary', label: 'Processing' },
      'approved': { variant: 'default', label: 'Approved' },
      'Approved': { variant: 'default', label: 'Approved' },
      'rejected': { variant: 'destructive', label: 'Rejected' },
      'Rejected': { variant: 'destructive', label: 'Rejected' },
      'Unverified': { variant: 'outline', label: 'Unverified' },
      'Expired': { variant: 'destructive', label: 'Expired' },
    };

    const statusInfo = statusMap[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const filteredVerifications = verifications.filter(verification =>
    verification.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.document_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.user?.verification_number?.toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Verifier Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Review and verify user documents securely.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {stats.pendingVerifications}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalVerified}
              </div>
              <p className="text-xs text-muted-foreground">
                Approved users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.todayVerifications}
              </div>
              <p className="text-xs text-muted-foreground">
                Processed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.approvalRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.averageReviewTime}
              </div>
              <p className="text-xs text-muted-foreground">
                Per verification
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verifications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Verifications ({stats.pendingVerifications})
            </TabsTrigger>
            <TabsTrigger value="quick-review" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Quick Review
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, document ID, or verification number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={fetchPendingVerifications} variant="outline">
                Refresh
              </Button>
            </div>

            <div className="space-y-6">
              {filteredVerifications.map((verification) => (
                <Card key={verification.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-amber-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl">
                            {verification.user?.name || 'Unknown User'}
                          </CardTitle>
                          {getStatusBadge(verification.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{verification.user?.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{verification.document_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            <span>ID: {verification.document_id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(verification.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Verification Details */}
                        {verification.user && (
                          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Verification Number:</strong>
                                <div className="text-primary font-mono">
                                  {verification.user.verification_number || 'N/A'}
                                </div>
                              </div>
                              <div>
                                <strong>NIN Number:</strong>
                                <div>{verification.user.nin_number || 'N/A'}</div>
                              </div>
                              <div>
                                <strong>Nationality:</strong>
                                <div>{verification.user.nationality || 'N/A'}</div>
                              </div>
                              <div>
                                <strong>LGA:</strong>
                                <div>{verification.user.lga || 'N/A'}</div>
                              </div>
                              {verification.user.dob && (
                                <div>
                                  <strong>Date of Birth:</strong>
                                  <div>{new Date(verification.user.dob).toLocaleDateString()}</div>
                                </div>
                              )}
                              {verification.user.nearest_landmark && (
                                <div>
                                  <strong>Landmark:</strong>
                                  <div>{verification.user.nearest_landmark}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Document Preview Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Document Preview */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Verification Document
                        </h4>
                        <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-full h-48 bg-muted/30 rounded-md overflow-hidden">
                              <WatermarkedImage 
                                src={verification.document_url} 
                                alt="Verification Document"
                                className="w-full h-full object-contain"
                                onClick={() => openImagePreview(verification.document_url, 'document')}
                              />
                            </div>
                            <div className="flex gap-2 w-full">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => openImagePreview(verification.document_url, 'document')}
                              >
                                <ZoomIn className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => openDocumentWithWatermark(verification.document_url, 'document')}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Secure View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Selfie Preview */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Selfie Verification
                        </h4>
                        <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-full h-48 bg-muted/30 rounded-md overflow-hidden">
                              <WatermarkedImage 
                                src={verification.selfie_url} 
                                alt="Selfie Verification"
                                className="w-full h-full object-contain"
                                onClick={() => openImagePreview(verification.selfie_url, 'selfie')}
                              />
                            </div>
                            <div className="flex gap-2 w-full">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => openImagePreview(verification.selfie_url, 'selfie')}
                              >
                                <ZoomIn className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => openDocumentWithWatermark(verification.selfie_url, 'selfie')}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Secure View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {(verification.status === 'pending' || verification.status === 'Pending' || verification.status === 'Submitted' || verification.status === 'Processing') && (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => openReviewDialog(verification)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Review & Verify
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredVerifications.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No verification requests found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchTerm ? 'Try adjusting your search terms' : 'All verifications have been processed'}
                    </p>
                    <Button onClick={fetchPendingVerifications} variant="outline" className="mt-4">
                      Refresh List
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Quick Review Tab */}
          <TabsContent value="quick-review">
            <Card>
              <CardHeader>
                <CardTitle>Quick Review Panel</CardTitle>
                <CardDescription>
                  Efficiently review multiple verifications in one view
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verifications.slice(0, 10).map((verification) => (
                    <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{verification.user?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {verification.document_type} • {verification.document_id}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openReviewDialog(verification)}
                      >
                        Quick Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Verification Analytics</CardTitle>
                <CardDescription>
                  Insights into verification patterns and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span>Pending Reviews:</span>
                        <Badge variant="secondary">{stats.pendingVerifications}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span>Approval Rate:</span>
                        <Badge variant="default">{stats.approvalRate}%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span>Processed Today:</span>
                        <Badge variant="default">{stats.todayVerifications}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span>Average Review Time:</span>
                        <Badge variant="default">{stats.averageReviewTime}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Document Types Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        verifications.reduce((acc, v) => {
                          acc[v.document_type] = (acc[v.document_type] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                          <span className="text-sm">{type}:</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Verification</DialogTitle>
            <DialogDescription>
              Carefully review the documents and provide your assessment for {selectedVerification?.user?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {selectedVerification.user?.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedVerification.user?.email}
                </div>
                <div>
                  <strong>Document Type:</strong> {selectedVerification.document_type}
                </div>
                <div>
                  <strong>Document ID:</strong> {selectedVerification.document_id}
                </div>
                <div>
                  <strong>Verification Number:</strong> {selectedVerification.user?.verification_number || 'N/A'}
                </div>
                <div>
                  <strong>Submitted:</strong> {new Date(selectedVerification.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Document Links */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => openImagePreview(selectedVerification.document_url, 'document')}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Preview Document
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openImagePreview(selectedVerification.selfie_url, 'selfie')}
                  className="flex-1"
                >
                  <User className="h-4 w-4 mr-2" />
                  Preview Selfie
                </Button>
              </div>

              {/* Review Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about your review decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={closeReviewDialog}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVerificationReview('Rejected')}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerificationReview('Approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={zoomOut}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={resetZoom}
              >
                {Math.round(zoomLevel * 100)}%
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={zoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={closeImagePreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Watermarked Image */}
            <div className="overflow-auto max-h-[calc(100vh-2rem)]">
              <div className="relative">
                <img
                  ref={imageRef}
                  src={imagePreview.url}
                  alt={imagePreview.title}
                  className="transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyOC42ODYzIDIwIDI2IDIyLjY4NjMgMjYgMjZDMjYgMjkuMzEzNyAyOC42ODYzIDMyIDMyIDMyQzM1LjMxMzcgMzIgMzggMjkuMzEzNyAzOCAyNkMzOCAyMi42ODYzIDM1LjMxMzcgMjAgMzIgMjBaIiBmaWxsPSIjOTlBQUFEIi8+CjxwYXRoIGQ9Ik0xNiAzNkMxNiAzMy42ODYzIDE4LjY4NjMgMzAgMjIgMzBINDJDMjUuMzEzNyAzMCA0OCAzMy42ODYzIDQ4IDM2VjUyQzQ4IDU1LjMxMzcgNDUuMzEzNyA1OCA0MiA1OEgyMkMxOC42ODYzIDU4IDE2IDU1LjMxMzcgMTYgNTJWMzZaIiBmaWxsPSIjOTlBQUFEIi8+Cjwvc3ZnPgo=';
                  }}
                />
                {/* Watermark overlay for preview modal */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 text-white/30 font-bold text-lg" style={{ textShadow: '2px 2px 4px black' }}>
                    VERINEST
                  </div>
                  <div className="absolute bottom-4 right-4 text-white/25 text-sm" style={{ textShadow: '1px 1px 2px black' }}>
                    {user?.username}
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/15 font-bold text-2xl" style={{ textShadow: '2px 2px 4px black' }}>
                    SECURE PREVIEW
                  </div>
                </div>
              </div>
            </div>
            
            {/* Title */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-2 rounded text-sm">
              {imagePreview.title} - Zoom: {Math.round(zoomLevel * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};