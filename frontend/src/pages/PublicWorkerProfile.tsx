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
import { Star, MapPin, Clock, CheckCircle, Phone, Mail, Calendar, Briefcase, MessageCircle, UserPlus } from 'lucide-react';

const PublicWorkerProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
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

    if (!user?.id || !workerData?.profile.user_id) {
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

  const { profile, portfolio, reviews, stats } = workerData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url} alt={profile.user_name} />
                <AvatarFallback className="text-lg">
                  {profile.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.user_name}</h1>
                <p className="text-gray-600">@{profile.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={profile.is_available ? 'default' : 'secondary'}>
                    {profile.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                  <Badge variant="outline">{profile.category}</Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 ml-auto">
              <Button
                onClick={handleContactWorker}
                disabled={actionLoading || !profile.is_available}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                {actionLoading ? 'Loading...' : 'Contact'}
              </Button>
              <Button
                onClick={handleAssignWorker}
                disabled={actionLoading || !profile.is_available}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {actionLoading ? 'Loading...' : 'Assign Worker'}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {profile.location_city}, {profile.location_state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {profile.experience_years} years experience
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {profile.completed_jobs} jobs completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {profile.rating.toFixed(1)} rating
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
                  <div className="flex gap-4">
                    {profile.hourly_rate && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          ₦{profile.hourly_rate.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">per hour</p>
                      </div>
                    )}
                    {profile.daily_rate && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          ₦{profile.daily_rate.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">per day</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Section */}
            {portfolio.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolio.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        
                        {item.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {item.images.slice(0, 3).map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`${item.title} ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.completion_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
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
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Jobs</span>
                  <span className="font-semibold">{stats.total_jobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold">{stats.completion_rate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{stats.average_rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold">{stats.response_time}h</span>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      profile.verification_status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm capitalize">
                      {profile.verification_status === 'approved' ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                  
                  {profile.verification_status === 'approved' && (
                    <p className="text-xs text-gray-600">
                      This worker's identity has been verified
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {!isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle>Connect with {profile.user_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Create an account to contact this worker or assign them to your project
                  </p>
                  <Button 
                    onClick={() => navigate('/register', { 
                      state: { 
                        message: 'Create an account to connect with workers',
                        redirectTo: `/@${username}`
                      } 
                    })}
                    className="w-full"
                  >
                    Create Free Account
                  </Button>
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
