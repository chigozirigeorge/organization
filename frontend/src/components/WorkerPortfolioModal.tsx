// components/WorkerPortfolioModal.tsx - Updated
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  MapPin, Star, Briefcase, Calendar, DollarSign, User, Award, 
  CheckCircle, Clock, ExternalLink, X, Users, FileText, MessageCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { CompleteWorkerData } from '../utils/workerUtils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface WorkerPortfolioModalProps {
  workerId: string;
  workerData: CompleteWorkerData | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (workerId: string) => void;
  jobId?: string;
}

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const { user: workerUser, profile, portfolio, reviews } = workerData;

  const handleStartChat = async () => {
    if (!user || user.role !== 'employer') {
      alert('Only employers can start chats with workers');
      return;
    }
  
    try {
      navigate('/dashboard/chat', { 
        state: { 
          workerUserId: workerUser.id, // This should be the worker's user ID
          autoSelectChat: true 
        } 
      });
      onClose(); // Close the modal
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Worker Profile: {workerUser?.name || 'Unknown Worker'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {workerUser?.name?.charAt(0).toUpperCase() || 'W'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{workerUser?.name || 'Unknown'}</h3>
                        <p className="text-muted-foreground">@{workerUser?.username || 'worker'}</p>
                      </div>
                      
                      <Badge variant={profile?.is_available ? "default" : "secondary"}>
                        {profile?.is_available ? 'Available' : 'Not Available'}
                      </Badge>

                      {workerUser?.trust_score && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold">Trust: {workerUser.trust_score}%</span>
                        </div>
                      )}

                      {workerUser?.verified && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Verified</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact & Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rates & Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Hourly Rate:</span>
                        <span className="font-semibold">{formatCurrency(profile?.hourly_rate || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Daily Rate:</span>
                        <span className="font-semibold">{formatCurrency(profile?.daily_rate || 0)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                      </div>
                      <p className="font-medium">
                        {profile?.location_city}, {profile?.location_state}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Detailed Info */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Category & Experience</h4>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="capitalize">
                          {profile?.category || 'General'}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                          <span>{profile?.experience_years || 0} years experience</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{profile?.completed_jobs || 0} jobs completed</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {profile?.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {profile?.rating?.toFixed(1) || '0.0'}
                        </p>
                        <p className="text-sm text-muted-foreground">Average Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {reviews?.length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Reviews</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => onAssign(workerId)}
                        className="flex-1 gap-2"
                        size="lg"
                      >
                        <Users className="h-4 w-4" />
                        Assign to Job
                      </Button>
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={handleStartChat}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Assigning this worker will create a contract and escrow for the job.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>
                  Previous work and projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {portfolio && portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolio.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.project_date).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No portfolio items yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold">{review.reviewer?.name || 'Anonymous'}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-semibold">{review.rating}.0</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {review.comment}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews yet</p>
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