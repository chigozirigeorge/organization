// pages/PublicWorkerProfile.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { PublicWorkerService, type PublicWorkerPortfolioResponse } from '../services/publicWorker';
import { createChat } from '../services/chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, CheckCircle, Phone, Mail, Calendar, Briefcase, MessageCircle, UserPlus, Home, Shield, Award } from 'lucide-react';
import logo from '../assets/verinest.png';

const PublicWorkerProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  
  const [workerData, setWorkerData] = useState<PublicWorkerPortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (username) {
      fetchWorkerProfile(username);
    }
  }, [username]);

  const fetchWorkerProfile = async (username: string) => {
    try {
      setLoading(true);
      const data = await PublicWorkerService.getCompleteWorkerProfile(username);
      setWorkerData(data);
    } catch (err: any) {
      console.error('Error fetching worker profile:', err);
      if (err.message?.includes('not found') || err.status === 404) {
        setError('Worker profile not found');
      } else {
        setError('Failed to load worker profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContactWorker = async () => {
    if (!isAuthenticated) {
      // Save the intended action and redirect to register
      localStorage.setItem('intended_action', JSON.stringify({
        type: 'contact_worker',
        username: username,
        timestamp: Date.now()
      }));
      navigate('/register', { 
        state: { 
          message: 'Create an account to contact this worker',
          redirectTo: `/@${username}`
        } 
      });
      return;
    }

    if (!authUser?.id || !workerData?.profile.user_id) {
      toast.error('Unable to initiate contact. Please try again.');
      return;
    }

    try {
      setActionLoading(true);
      await createChat(workerData.profile.user_id);
      toast.success('Chat initiated! You can now message the worker.');
      navigate('/chat');
    } catch (err: any) {
      console.error('Error initiating chat:', err);
      toast.error(err.message || 'Failed to initiate chat');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignWorker = async () => {
    if (!isAuthenticated) {
      // Save the intended action and redirect to register
      localStorage.setItem('intended_action', JSON.stringify({
        type: 'assign_worker',
        username: username,
        timestamp: Date.now()
      }));
      navigate('/register', { 
        state: { 
          message: 'Create an account to assign this worker',
          redirectTo: `/@${username}`
        } 
      });
      return;
    }

    // Redirect to job creation with worker pre-selected
    navigate('/dashboard/employer/post-job', { 
      state: { 
        preselectedWorker: workerData?.profile 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !workerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'This worker profile could not be found.'}</p>
            <Button onClick={() => navigate('/workers/search')}>
              Search Workers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile, portfolio, reviews, stats, user } = workerData;

  // Debug: Log verification status
  console.log('Worker verification status:', profile?.verification_status);
  console.log('Full worker data:', workerData);

  // Merge user data with profile data for easier access
  const mergedProfile = {
    ...profile,
    user_name: user?.name || profile.user_name,
    username: user?.username || profile.username,
    avatar_url: user?.avatar_url || profile.avatar_url,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* VeriNest Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-lg font-bold text-primary"
              >
                <img src={logo} alt="VeriNest" className="h-6 w-6" />
                VeriNest
              </Button>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate('/dashboard/jobs')} className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Find Workers
              </Button>
              <Button variant="ghost" onClick={() => navigate('/dashboard/vendors')} className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Vendors
              </Button>
            </nav>
            
            {/* CTA Button */}
            <Button 
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary/90"
            >
              Join VeriNest
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Profile Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary-foreground/20">
                  <AvatarImage 
                    src={mergedProfile.avatar_url} 
                    alt={mergedProfile.user_name || 'Profile'}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mergedProfile.user_name || mergedProfile.username || 'User')}&background=6366f1&color=fff&size=96`;
                    }}
                  />
                  <AvatarFallback className="text-xl bg-primary-foreground/20 text-primary-foreground">
                    {mergedProfile.user_name ? mergedProfile.user_name.split(' ').map(n => n[0]).join('').toUpperCase() : mergedProfile.username ? mergedProfile.username.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                {(workerData?.user?.verified || 
  (mergedProfile.verification_status && 
   (mergedProfile.verification_status.toLowerCase() === 'verified' || 
    mergedProfile.verification_status.toLowerCase() === 'approved' ||
    mergedProfile.verification_status.toLowerCase() === 'completed'))) && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary-foreground mb-2">{mergedProfile.user_name || mergedProfile.username || 'Unknown User'}</h1>
                <p className="text-primary-foreground/80 text-lg mb-3">@{mergedProfile.username}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30">
                    {mergedProfile.category || 'Professional Service'}
                  </Badge>
                  <Badge className={mergedProfile.is_available ? 'bg-green-500 text-white border-green-600' : 'bg-yellow-500 text-white border-yellow-600'}>
                    {mergedProfile.is_available ? 'Available Now' : 'Currently Unavailable'}
                  </Badge>
                  {(workerData?.user?.verified || 
  (mergedProfile.verification_status && 
   (mergedProfile.verification_status.toLowerCase() === 'verified' || 
    mergedProfile.verification_status.toLowerCase() === 'approved' ||
    mergedProfile.verification_status.toLowerCase() === 'completed'))) && (
                    <Badge className="bg-accent text-accent-foreground border-accent flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 ml-auto">
              <Button
                onClick={handleContactWorker}
                disabled={actionLoading || !mergedProfile.is_available}
                variant="outline"
                className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 flex items-center gap-2"
                size="lg"
              >
                <MessageCircle className="h-4 w-4" />
                {actionLoading ? 'Loading...' : 'Send Message'}
              </Button>
              <Button
                onClick={handleAssignWorker}
                disabled={actionLoading || !mergedProfile.is_available}
                className="bg-primary-foreground text-primary hover:bg-gray-100 flex items-center gap-2"
                size="lg"
              >
                <UserPlus className="h-4 w-4" />
                {actionLoading ? 'Loading...' : 'Hire Worker'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card className="border shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary border-b">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-gray max-w-none">
                  <p className="text-foreground leading-relaxed text-base">{mergedProfile.description || 'No description available.'}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">
                          {mergedProfile.location_city && mergedProfile.location_state ? `${mergedProfile.location_city}, ${mergedProfile.location_state}` : mergedProfile.location_city || mergedProfile.location_state || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-medium text-foreground">
                          {mergedProfile.experience_years ? `${mergedProfile.experience_years} years` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed Jobs</p>
                        <p className="font-medium text-foreground">
                          {mergedProfile.completed_jobs ? `${mergedProfile.completed_jobs} jobs` : 'No jobs yet'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Star className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p className="font-medium text-foreground">
                          {mergedProfile.rating ? `${mergedProfile.rating.toFixed(1)} / 5.0` : 'No rating yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mt-8 p-5 bg-gradient-to-r from-primary/5 to-secondary rounded-lg border border-primary/20">
                  <h3 className="font-semibold text-foreground mb-4 text-lg">Service Rates</h3>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    {mergedProfile.hourly_rate && (
                      <div className="text-center p-4 bg-card rounded-lg shadow-sm border">
                        <p className="text-3xl font-bold text-primary mb-1">
                          ₦{mergedProfile.hourly_rate.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">per hour</p>
                      </div>
                    )}
                    {mergedProfile.daily_rate && (
                      <div className="text-center p-4 bg-card rounded-lg shadow-sm border">
                        <p className="text-3xl font-bold text-primary mb-1">
                          ₦{mergedProfile.daily_rate.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">per day</p>
                      </div>
                    )}
                    {!mergedProfile.hourly_rate && !mergedProfile.daily_rate && (
                      <div className="col-span-2 text-center p-4 bg-card rounded-lg shadow-sm border">
                        <p className="text-muted-foreground">Rates available upon discussion</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Section */}
            {portfolio && portfolio.length > 0 && (
              <Card className="border shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary border-b">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Portfolio Showcase ({portfolio.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolio.map((item) => (
                      <div key={item.id} className="group relative overflow-hidden rounded-xl border border-border hover:border-primary transition-all duration-300 hover:shadow-xl bg-card">
                        {/* Project Image */}
                        <div className="aspect-video bg-muted overflow-hidden relative">
                          {item.image_url ? (
                            <>
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=6366f1&color=fff&size=200`;
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary">
                              <Briefcase className="h-12 w-12 text-primary/30" />
                            </div>
                          )}
                        </div>
                        
                        {/* Project Details */}
                        <div className="p-5">
                          <h3 className="font-bold text-foreground mb-2 text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
                            {item.description}
                          </p>
                          
                          {/* Project Date */}
                          <div className="flex items-center justify-between">
                            {item.project_date && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Completed {new Date(item.project_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: 'numeric'
                                })}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>View Project</span>
                              <Award className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            {reviews && reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Reviews ({reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.reviewer_avatar} alt={review.reviewer_name} />
                            <AvatarFallback>
                              {review.reviewer_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm">{review.comment}</p>
                            
                            {(review.quality_score || review.timeliness_score || review.communication_score) && (
                              <div className="flex gap-4 mt-2 text-xs">
                                {review.quality_score && (
                                  <span>Quality: {review.quality_score}/5</span>
                                )}
                                {review.timeliness_score && (
                                  <span>Timeliness: {review.timeliness_score}/5</span>
                                )}
                                {review.communication_score && (
                                  <span>Communication: {review.communication_score}/5</span>
                                )}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Performance Stats Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-gray-900">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Total Jobs</span>
                  <span className="font-bold text-blue-600 text-lg">{stats?.total_jobs || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Success Rate</span>
                  <span className="font-bold text-green-600 text-lg">{stats?.completion_rate || 0}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Average Rating</span>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-yellow-600 text-lg">{stats?.average_rating ? stats.average_rating.toFixed(1) : '0.0'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Response Time</span>
                  <span className="font-bold text-purple-600 text-lg">{stats?.response_time || 'N/A'}h</span>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Shield className="h-5 w-5 text-green-600" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      workerData?.user.verified || mergedProfile.verification_status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="font-medium capitalize">
                      {workerData?.user.verified || mergedProfile.verification_status === 'approved' ? 'Verified Professional' : 'Pending Verification'}
                    </span>
                  </div>
                  
                  {workerData?.user.verified || mergedProfile.verification_status === 'approved' ? (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 font-medium mb-2">
                        ✓ Identity Verified
                      </p>
                      <p className="text-xs text-green-700">
                        This worker's identity and credentials have been verified by VeriNest
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800 font-medium mb-2">
                        Verification In Progress
                      </p>
                      <p className="text-xs text-yellow-700">
                        This worker is currently undergoing verification process
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {!isAuthenticated && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="border-b border-blue-200">
                  <CardTitle className="text-gray-900">Connect with {mergedProfile.user_name || 'Worker'}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-gray-700">
                    Create an account to contact this professional or hire them for your project
                  </p>
                  <Button 
                    onClick={() => navigate('/register', { 
                      state: { 
                        message: 'Create an account to connect with workers',
                        redirectTo: `/@${username}`
                      } 
                    })}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Create Free Account
                  </Button>
                  <p className="text-xs text-gray-600 text-center">
                    Join thousands of trusted professionals on VeriNest
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicWorkerProfile;
