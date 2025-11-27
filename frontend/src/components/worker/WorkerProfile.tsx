// components/WorkerProfile.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  MapPin, Star, Briefcase, Calendar, DollarSign, 
  MessageCircle, User, Award, Clock, CheckCircle,
  Phone, Mail, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../config/api';

interface WorkerProfile {
  id: string;
  user_id: string;
  category: string;
  experience_years: number;
  description: string;
  hourly_rate: number;
  daily_rate: number;
  location_state: string;
  location_city: string;
  is_available: boolean;
  skills: string[];
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar_url?: string;
    trust_score?: number;
    verified: boolean;
  };
  portfolio: PortfolioItem[];
  reviews: Review[];
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  project_date: string;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    name: string;
    username: string;
  };
}

export const WorkerProfile = ({ workerId }: { workerId?: string }) => {
  const params = useParams<{ workerId?: string; username?: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  console.log('👤 WorkerProfile component mounted with ID:', workerId);

  const resolvedWorkerId = workerId || params.workerId;
  const usernameParam = params.username;
  useEffect(() => {
    if (!resolvedWorkerId && !usernameParam) return;
    fetchWorkerProfile();
  }, [resolvedWorkerId, usernameParam, token]);

  const fetchWorkerProfile = async () => {
    if (!resolvedWorkerId && !usernameParam) return;
    try {
      setLoading(true);
      const endpoint = usernameParam ? `/profile/${usernameParam}` : `/labour/workers/${resolvedWorkerId}`;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
      });

      if (!response.ok) {
        toast.error('Failed to load worker profile');
        navigate('/dashboard/workers');
        return;
      }
      const data = await response.json();
      const normalized = normalizeWorker(data.data || data);
      setWorker(normalized);
    } catch (error) {
      console.error('Failed to fetch worker profile:', error);
      toast.error('Failed to load worker profile');
      navigate('/dashboard/workers');
    } finally {
      setLoading(false);
    }
  };

  // Normalize different possible API shapes into a consistent WorkerProfile shape
  const normalizeWorker = (raw: any): WorkerProfile => {
    if (!raw) return raw;
    // If backend returns { profile: {...}, user: {...}, portfolio, reviews }
    if (raw.profile) {
      return {
        id: raw.profile.id || raw.id,
        user_id: raw.profile.user_id || raw.user?.id || raw.user_id,
        category: raw.profile.category || raw.category || 'General',
        experience_years: raw.profile.experience_years || raw.experience_years || 0,
        description: raw.profile.description || raw.description || raw.profile.bio || '',
        hourly_rate: raw.profile.hourly_rate || raw.hourly_rate || 0,
        daily_rate: raw.profile.daily_rate || raw.daily_rate || 0,
        location_state: raw.profile.location_state || raw.location_state || raw.user?.location_state || '',
        location_city: raw.profile.location_city || raw.location_city || raw.user?.location_city || '',
        is_available: raw.profile.is_available ?? raw.is_available ?? true,
        skills: raw.profile.skills || raw.skills || [],
        user: raw.user || raw.user_info || raw.profile.user || {
          id: raw.user_id || raw.profile.user_id,
          name: raw.name || raw.user_name || raw.profile.name || 'Unknown',
          username: raw.username || raw.user?.username || '',
          email: raw.user?.email || '',
          avatar_url: raw.user?.avatar_url || raw.avatar_url || ''
        },
        portfolio: raw.portfolio || raw.profile.portfolio || raw.projects || [],
        reviews: raw.reviews || raw.profile.reviews || []
      } as WorkerProfile;
    }

    // If backend already returns flat worker object with expected fields
    return {
      id: raw.id,
      user_id: raw.user_id,
      category: raw.category || 'General',
      experience_years: raw.experience_years || 0,
      description: raw.description || '',
      hourly_rate: raw.hourly_rate || 0,
      daily_rate: raw.daily_rate || 0,
      location_state: raw.location_state || raw.user?.location_state || '',
      location_city: raw.location_city || raw.user?.location_city || '',
      is_available: raw.is_available ?? true,
      skills: raw.skills || [],
      user: raw.user || raw.user_info || { id: raw.user_id, name: raw.name || '', username: raw.username || '', email: raw.email || '' },
      portfolio: raw.portfolio || [],
      reviews: raw.reviews || []
    } as WorkerProfile;
  };

 // In WorkerProfile.tsx
const handleStartChat = async () => {
  if (!worker?.user?.id) {
    toast.error('Worker information not available');
    return;
  }

  console.log('💬 Starting chat from profile with worker ID:', worker.user.id);

  try {
    const response = await fetch('https://verinest.up.railway.app/api/chat/chats', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        other_user_id: worker.user.id 
      }),
    });

    let chatData;
    
    // Handle both success and existing chat cases
    if (response.ok) {
      chatData = await response.json();
      console.log('✅ Chat created from profile:', chatData);
    } else if (response.status === 422) {
      // Chat already exists - fetch existing chats and find the right one
      console.log('🔄 Chat already exists, fetching existing chats...');
      const chatsResponse = await fetch('https://verinest.up.railway.app/api/chat/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json();
        const existingChat = chatsData.data.find((chat: any) => 
          chat.other_user.id === worker.user.id
        );
        
        if (existingChat) {
          chatData = { data: { chat: existingChat } };
        }
      }
    }

    if (chatData?.data?.chat) {
      // Navigate to chat with the specific chat
      navigate('/dashboard/chat', { 
        state: { 
          autoSelectChatId: chatData.data.chat.id 
        }
      });
      toast.success('Chat opened successfully!');
    } else {
      // Fallback - just navigate to chat
      navigate('/dashboard/chat');
      toast.info('Opening chat...');
    }
  } catch (error) {
    console.error('❌ Error starting chat from profile:', error);
    // Fallback - just navigate to chat
    navigate('/dashboard/chat');
    toast.info('Opening chat...');
  }
};
  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
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

  if (!worker) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Worker Not Found</h2>
        <Button onClick={() => navigate('/dashboard/workers')}>
          Back to Workers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{worker.user.name}</h1>
          <p className="text-muted-foreground">@{worker.user.username} • {worker.category}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Copy profile link - available to everyone */}
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const profileUrl = `${window.location.origin}/dashboard/workers/${worker.user.id}`;
                await navigator.clipboard.writeText(profileUrl);
                toast.success('Profile link copied to clipboard');
              } catch (e) {
                console.error('Failed to copy profile link', e);
                toast.error('Failed to copy link');
              }
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Copy profile link
          </Button>

          {user?.role === 'employer' && (
            <Button 
              onClick={handleStartChat}
              disabled={startingChat}
              className="gap-2"
              size="lg"
            >
              <MessageCircle className="h-4 w-4" />
              {startingChat ? 'Starting Chat...' : 'Start Chat'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {worker.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{worker.user.name}</h2>
                  <p className="text-muted-foreground">@{worker.user.username}</p>
                </div>
                
                {/* Availability Badge */}
                <Badge variant={worker.is_available ? "default" : "secondary"}>
                  {worker.is_available ? 'Available for Work' : 'Not Available'}
                </Badge>

                {/* Trust Score */}
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold">Trust Score: {worker.user.trust_score || 85}%</span>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-2">
                  {worker.user.verified ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-600">Verification Pending</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Rates Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact & Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hourly Rate:</span>
                  <span className="font-semibold">{formatCurrency(worker.hourly_rate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Daily Rate:</span>
                  <span className="font-semibold">{formatCurrency(worker.daily_rate)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </div>
                <p className="font-medium">{worker.location_city}, {worker.location_state}</p>
              </div>
            </CardContent>
          </Card>

          {/* Skills Card */}
          {worker.skills && worker.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {worker.user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {worker.description || 'No description provided.'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Experience</p>
                        <p className="text-lg font-bold">{worker.experience_years} years</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">Rating</p>
                        <p className="text-lg font-bold">
                          {calculateAverageRating(worker.reviews)} ({worker.reviews.length} reviews)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions for Employers */}
              {user?.role === 'employer' && (
                <Card className="bg-gradient-to-r from-primary/5 to-blue-50/50 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Interested in hiring {worker.user.name}?
                    </CardTitle>
                    <CardDescription>
                      Start a conversation to discuss your project requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={handleStartChat}
                        disabled={startingChat}
                        className="gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {startingChat ? 'Starting Chat...' : 'Start Chat'}
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Phone className="h-4 w-4" />
                        Request Contact
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Chat directly with {worker.user.name} to discuss project details, timelines, and pricing.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                  <CardDescription>
                    Previous work and projects by {worker.user.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {worker.portfolio.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No portfolio items yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {worker.portfolio.map((item) => (
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Reviews & Ratings</CardTitle>
                      <CardDescription>
                        What clients say about {worker.user.name}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">
                        {calculateAverageRating(worker.reviews)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {worker.reviews.length} reviews
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {worker.reviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reviews yet</p>
                      <p className="text-sm">Be the first to review this worker</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {worker.reviews.map((review) => (
                          <Card key={review.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold">{review.reviewer.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    @{review.reviewer.username}
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
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};