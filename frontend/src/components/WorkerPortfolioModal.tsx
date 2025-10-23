// components/WorkerProfileModal.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, User, MapPin, Star, Calendar, Briefcase, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

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
  skills: string[];
  rating?: number;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  project_date: string;
}

interface WorkerProfileModalProps {
  workerId: string;
  isOpen: boolean;
  onClose: () => void;
  onAssign?: (workerId: string) => void;
  jobId?: string;
}

export const WorkerProfileModal = ({ workerId, isOpen, onClose, onAssign, jobId }: WorkerProfileModalProps) => {
  const { token } = useAuth();
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && workerId) {
      fetchWorkerDetails();
    }
  }, [isOpen, workerId]);

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch worker profile
      const profileResponse = await fetch(`https://verinest.up.railway.app/api/labour/workers/${workerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setWorkerProfile(profileData.data?.profile || profileData.profile);
        setPortfolio(profileData.data?.portfolio || profileData.portfolio || []);
      } else {
        throw new Error('Failed to fetch worker details');
      }
    } catch (error) {
      console.error('Error fetching worker details:', error);
      toast.error('Failed to load worker profile');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Worker Profile</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading worker profile...</p>
          </div>
        ) : workerProfile ? (
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Category</p>
                    <Badge variant="secondary">{workerProfile.category}</Badge>
                  </div>
                  <div>
                    <p className="font-medium">Experience</p>
                    <p>{workerProfile.experience_years} years</p>
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{workerProfile.location_city}, {workerProfile.location_state}</span>
                    </div>
                  </div>
                  {workerProfile.rating && (
                    <div>
                      <p className="font-medium">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{workerProfile.rating}/5</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Hourly Rate</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(workerProfile.hourly_rate)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Daily Rate</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(workerProfile.daily_rate)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-muted-foreground mt-1">{workerProfile.description}</p>
                </div>

                {workerProfile.skills && workerProfile.skills.length > 0 && (
                  <div>
                    <p className="font-medium">Skills</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {workerProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Portfolio ({portfolio.length})
                </CardTitle>
                <CardDescription>
                  Previous work and projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {portfolio.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No portfolio items yet</p>
                  </div>
                ) : (
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
                          <h4 className="font-semibold mb-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.project_date).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {onAssign && jobId && (
                <Button onClick={() => onAssign(workerId)}>
                  Assign to Job
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Worker profile not found</p>
          </div>
        )}
      </div>
    </div>
  );
};