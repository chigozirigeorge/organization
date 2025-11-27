// components/WorkerPortfolioModal.tsx - FIXED VERSION
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  MapPin, Star, Briefcase, Calendar, DollarSign, User, Award, 
  CheckCircle, Clock, ExternalLink, X, Users, FileText, MessageCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { CompleteWorkerData, WorkerUser, WorkerProfile } from '../../utils/workerUtils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface WorkerPortfolioModalProps {
  workerId: string;
  workerData: CompleteWorkerData | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (workerId: string) => void;
  jobId?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  project_date: string;
  created_at?: string;
  category?: string;
  worker_id?: string;
}

interface Review {
  id?: string;
  reviewer?: {
    name?: string;
  };
  rating: number;
  comment: string;
  created_at?: string;
}

// Safe access helper functions
const safeGet = <T,>(obj: any, path: string, defaultValue: T): T => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
};

export const WorkerPortfolioModal = ({
  workerId,
  workerData,
  isOpen,
  onClose,
  onAssign,
  jobId
}: WorkerPortfolioModalProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Add detailed debug logging
  useEffect(() => {
    if (workerData && isOpen) {
      console.log('🔍 [WorkerPortfolioModal] FULL WORKER DATA:', workerData);
      console.log('📊 [WorkerPortfolioModal] Portfolio data:', {
        portfolio: workerData.portfolio,
        portfolioType: typeof workerData.portfolio,
        isArray: Array.isArray(workerData.portfolio),
        length: workerData.portfolio?.length,
        firstItem: workerData.portfolio?.[0]
      });
    }
  }, [workerData, isOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Safe portfolio data extraction - IMPROVED VERSION
  const getPortfolioItems = (): PortfolioItem[] => {
    if (!workerData) return [];
    
    console.log('🔄 [getPortfolioItems] Processing worker data:', workerData);
    
    try {
      let portfolioData = workerData.portfolio;
      
      // Handle different possible portfolio data structures
      if (portfolioData && typeof portfolioData === 'object' && 'data' in portfolioData) {
        portfolioData = (portfolioData as any).data;
      }
      
      // If portfolio is nested in a response structure
      if (portfolioData && typeof portfolioData === 'object' && 'portfolio' in portfolioData) {
        portfolioData = (portfolioData as any).portfolio;
      }
      
      if (Array.isArray(portfolioData)) {
        const items = portfolioData
          .filter(item => item && typeof item === 'object')
          .map((item, index) => {
            console.log(`🎨 [Portfolio Item ${index}]:`, item);
            return {
              id: item.id || `portfolio-${index}-${Math.random().toString(36).substr(2, 9)}`,
              title: item.title || 'Untitled Project',
              description: item.description || 'No description available.',
              image_url: item.image_url || item.image_urls?.[0] || '',
              project_date: item.project_date || item.created_at || new Date().toISOString(),
              created_at: item.created_at,
              category: item.category,
              worker_id: item.worker_id
            };
          });
        
        console.log('✅ [getPortfolioItems] Processed portfolio items:', items);
        return items;
      }
      
      // If portfolio is directly in workerData as an array
      if (Array.isArray(workerData.portfolio)) {
        return workerData.portfolio.map((item, index) => ({
          id: item.id || `portfolio-${index}-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title || 'Untitled Project',
          description: item.description || 'No description available.',
          image_url: item.image_url || '',
          project_date: item.project_date || item.created_at || new Date().toISOString(),
          created_at: item.created_at,
          category: item.category,
          worker_id: item.worker_id
        }));
      }
      
      console.log('❌ [getPortfolioItems] Portfolio data is not an array:', portfolioData);
      return [];
    } catch (error) {
      console.error('❌ [WorkerPortfolioModal] Error parsing portfolio data:', error);
      return [];
    }
  };

  const portfolioItems = getPortfolioItems();
  
  // Safe access to nested data
  const reviews: Review[] = Array.isArray(workerData?.reviews) ? workerData.reviews : [];
  const profile: Partial<WorkerProfile> = workerData?.profile || {};
  const workerUser: Partial<WorkerUser> = workerData?.user || {};

  console.log('📋 [WorkerPortfolioModal] Final portfolio items:', portfolioItems);

  const handleStartChat = async () => {
    if (!user || user.role !== 'employer') {
      alert('Only employers can start chats with workers');
      return;
    }

    if (!workerUser.id) {
      toast.error('Cannot start chat: Missing worker user ID');
      return;
    }
  
    try {
      navigate('/dashboard/chat', { 
        state: { 
          workerUserId: workerUser.id,
          autoSelectChat: true 
        } 
      });
      onClose();
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const handleAssignWorker = () => {
    console.log('🔍 [WorkerPortfolioModal] Assigning worker:', {
      workerId,
      workerUserId: workerUser?.id,
      jobId
    });
    
    if (!workerUser?.id) {
      toast.error('Cannot assign worker: Missing user ID');
      return;
    }
    
    onAssign(workerUser.id); // Use user ID for assignment
  };

  if (!workerData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Worker Profile</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading worker profile...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Worker Profile: {workerUser?.name || 'Unknown Worker'}
            <Badge variant="outline" className="ml-2">
              {portfolioItems.length} Portfolio Items
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile & Details</TabsTrigger>
            <TabsTrigger value="portfolio">
              Portfolio ({portfolioItems.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {workerUser?.name?.charAt(0)?.toUpperCase() || 'W'}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">{workerUser?.name || 'Unknown'}</h3>
                        <p className="text-muted-foreground">@{workerUser?.username || 'worker'}</p>
                      </div>
                      
                      <Badge variant={profile?.is_available ? "default" : "secondary"}>
                        {profile?.is_available ? 'Available for Work' : 'Not Available'}
                      </Badge>

                      {workerUser?.trust_score !== undefined && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold">Trust Score: {workerUser.trust_score}%</span>
                        </div>
                      )}

                      {workerUser?.verified && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Verified Worker</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact & Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Rates & Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Hourly Rate:</span>
                        <span className="font-semibold text-lg">{formatCurrency(profile?.hourly_rate || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily Rate:</span>
                        <span className="font-semibold text-lg">{formatCurrency(profile?.daily_rate || 0)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>Work Location</span>
                      </div>
                      <p className="font-medium text-lg">
                        {profile?.location_city || 'Unknown'}, {profile?.location_state || 'Unknown'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Experience:</span>
                      <span className="font-semibold">{profile?.experience_years || 0} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Jobs Completed:</span>
                      <span className="font-semibold">{profile?.completed_jobs || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Portfolio Items:</span>
                      <span className="font-semibold text-green-600">{portfolioItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Reviews:</span>
                      <span className="font-semibold">{reviews.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Detailed Info */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Professional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3">Category & Specialization</h4>
                      <div className="flex items-center gap-4 flex-wrap">
                        <Badge variant="secondary" className="text-base capitalize px-3 py-1">
                          {profile?.category || 'General Labor'}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                          <span>{profile?.experience_years || 0} years professional experience</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{profile?.completed_jobs || 0} successful jobs completed</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-3">About This Worker</h4>
                      <p className="text-muted-foreground leading-relaxed text-base bg-slate-50 p-4 rounded-lg">
                        {profile?.description || 'No professional description provided. This worker prefers to let their portfolio speak for their skills and experience.'}
                      </p>
                    </div>

                    {/* Skills */}
                    {profile?.skills && profile.skills.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-lg mb-3">Skills & Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating Summary */}
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-3xl font-bold text-yellow-600">
                          {(profile?.rating || 0).toFixed(1)}
                        </p>
                        <div className="flex justify-center my-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(profile?.rating || 0)
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">Average Rating</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">
                          {reviews.length}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Reviews</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Button 
                        onClick={handleAssignWorker}
                        className="flex-1 gap-2 py-3 text-lg"
                        size="lg"
                        disabled={!profile?.is_available}
                      >
                        <Users className="h-5 w-5" />
                        {profile?.is_available ? 'Assign to Job' : 'Not Available'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="gap-2 py-3 text-lg"
                        onClick={handleStartChat}
                        size="lg"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Send Message
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      {profile?.is_available 
                        ? 'Assigning this worker will create a contract and escrow for the job. Review their portfolio below before making a decision.'
                        : 'This worker is currently not available for new assignments.'
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Briefcase className="h-6 w-6" />
                  Work Portfolio
                </CardTitle>
                <CardDescription className="text-lg">
                  {portfolioItems.length > 0 
                    ? `Viewing ${portfolioItems.length} project${portfolioItems.length !== 1 ? 's' : ''} from ${workerUser?.name || 'this worker'}`
                    : 'No portfolio projects available'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {portfolioItems.length > 0 ? (
                  <div className="space-y-6">
                    {/* Portfolio Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {portfolioItems.map((item) => (
                        <Card 
                          key={item.id} 
                          className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden"
                        >
                          {/* Image Section */}
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            {item.image_url ? (
                              <>
                                <img 
                                  src={item.image_url} 
                                  alt={item.title}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    console.error('❌ Image failed to load:', item.image_url);
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center text-gray-500';
                                      fallback.innerHTML = `
                                        <svg class="h-12 w-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <span class="text-sm">Image not available</span>
                                      `;
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                              </>
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon className="h-16 w-16 mb-2 opacity-50" />
                                <span className="text-sm">No project image</span>
                              </div>
                            )}
                            
                            {/* Project Date Badge */}
                            <div className="absolute top-3 left-3">
                              <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(item.project_date)}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Content Section */}
                          <CardContent className="p-4 space-y-3">
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                            
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                              {item.description}
                            </p>
                            
                            {/* Project Meta */}
                            <div className="flex justify-between items-center pt-2 border-t">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {item.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                )}
                              </div>
                              
                              {item.created_at && (
                                <span className="text-xs text-muted-foreground">
                                  Added {formatDate(item.created_at)}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Portfolio Summary */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-blue-900 text-lg">Portfolio Summary</h4>
                            <p className="text-blue-700 text-sm">
                              {workerUser?.name || 'This worker'} has {portfolioItems.length} project{portfolioItems.length !== 1 ? 's' : ''} in their portfolio
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-white text-blue-700 border-blue-300 text-lg py-1 px-3">
                            {portfolioItems.length} Projects
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Portfolio Projects</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      {workerUser?.name || 'This worker'} hasn't added any portfolio projects yet. 
                      You can still hire them based on their profile information and reviews.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('profile')}
                      variant="outline"
                    >
                      View Profile Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Star className="h-6 w-6" />
                  Reviews & Ratings
                </CardTitle>
                <CardDescription className="text-lg">
                  Feedback from previous employers ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <Card key={review.id || `review-${index}`} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {review.reviewer?.name || 'Anonymous Employer'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {review.created_at ? formatDate(review.created_at) : 'Date not available'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                                <span className="font-semibold text-yellow-700">{review.rating}.0</span>
                              </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed bg-gray-50 p-4 rounded-lg">
                              {review.comment || 'No comment provided.'}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-10 w-10 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {workerUser?.name || 'This worker'} hasn't received any reviews yet. 
                      Be the first to work with them and leave a review!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};