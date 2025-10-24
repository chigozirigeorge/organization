// components/WorkerProfileModal.tsx - Fixed version
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, User, MapPin, Star, Calendar, Briefcase, Image as ImageIcon, Mail, Phone, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';
import { 
  extractWorkerName, 
  extractWorkerEmail, 
  extractWorkerExperience, 
  extractWorkerCategory,
  extractWorkerLocation,
  extractWorkerDescription,
  extractWorkerHourlyRate,
  extractWorkerDailyRate,
  extractWorkerSkills,
  WorkerUserResponse,
  WorkerProfileApplicationResponse
} from '../types/labour';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  project_date: string;
}

interface WorkerProfileModalProps {
  workerId: string;
  workerData: WorkerUserResponse | null;
  workerProfile: WorkerProfileApplicationResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign?: (workerId: string) => void;
  jobId?: string;
}

export const WorkerProfileModal = ({ 
  workerId, 
  workerData, 
  workerProfile, 
  isOpen, 
  onClose, 
  onAssign, 
  jobId 
}: WorkerProfileModalProps) => {
  const { token } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && workerId) {
      fetchWorkerPortfolio();
    }
  }, [isOpen, workerId]);

  const fetchWorkerPortfolio = async () => {
    try {
      setLoading(true);
      
      console.log('🖼️ [WorkerProfileModal] Fetching portfolio for worker:', workerId);
      
      const response = await fetch(`https://verinest.up.railway.app/api/labour/workers/${workerId}/portfolio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [WorkerProfileModal] Portfolio response:', data);
        setPortfolio(data.data || data.portfolio || []);
      } else {
        console.log('⚠️ [WorkerProfileModal] Portfolio not available');
      }
    } catch (error) {
      console.log('⚠️ [WorkerProfileModal] Portfolio fetch failed, using application data only');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  // Extract data from application response using helper functions
  const workerName = extractWorkerName(workerData, workerProfile, workerId);
  const workerEmail = extractWorkerEmail(workerData);
  const experienceYears = extractWorkerExperience(workerProfile);
  const workerCategory = extractWorkerCategory(workerProfile);
  const workerLocation = extractWorkerLocation(workerProfile);
  const workerDescription = extractWorkerDescription(workerProfile);
  const hourlyRate = extractWorkerHourlyRate(workerProfile);
  const dailyRate = extractWorkerDailyRate(workerProfile);
  const workerSkills = extractWorkerSkills(workerProfile);

  const hasProfileData = workerProfile !== null;
  const hasPortfolio = portfolio.length > 0;
  const hasRates = hourlyRate > 0 || dailyRate > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Worker Profile</h2>
            {!hasProfileData && (
              <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700">
                Basic Information
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info Header */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{workerName}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{workerEmail}</span>
                </div>
                {experienceYears > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{experienceYears} years experience</span>
                  </div>
                )}
                {workerLocation !== 'Location not specified' && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{workerLocation}</span>
                  </div>
                )}
              </div>
            </div>
            {!hasProfileData && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700">
                Contact for Details
              </Badge>
            )}
          </div>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
                {!hasProfileData && (
                  <Badge variant="outline" className="text-xs">
                    Limited Info
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Specialization</p>
                  <Badge variant="secondary" className="mt-1">
                    {workerCategory}
                  </Badge>
                </div>
                
                <div>
                  <p className="font-medium">Experience</p>
                  <p className="text-lg font-semibold">
                    {experienceYears} {experienceYears === 1 ? 'year' : 'years'}
                  </p>
                </div>

                {hasRates && (
                  <>
                    {hourlyRate > 0 && (
                      <div>
                        <p className="font-medium">Hourly Rate</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(hourlyRate)}
                        </p>
                      </div>
                    )}
                    {dailyRate > 0 && (
                      <div>
                        <p className="font-medium">Daily Rate</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(dailyRate)}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Description */}
              <div className="pt-4 border-t">
                <p className="font-medium mb-2">About</p>
                <p className="text-muted-foreground leading-relaxed bg-slate-50 p-3 rounded">
                  {workerDescription}
                </p>
              </div>

              {/* Skills */}
              {workerSkills.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="font-medium mb-2">Skills & Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {workerSkills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portfolio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Portfolio
                <Badge variant="secondary">{portfolio.length}</Badge>
              </CardTitle>
              <CardDescription>
                {hasPortfolio ? 'Previous work and projects' : 'No portfolio items available yet'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasPortfolio ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.map((item) => (
                    <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                      {item.image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 line-clamp-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.project_date)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No portfolio items available</p>
                  <p className="text-sm mt-1">This worker hasn't added any portfolio items yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information Notice for Limited Data */}
          {!hasProfileData && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-700 text-sm">💡</span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">Next Steps</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Contact this worker directly to discuss their full qualifications, 
                      view more portfolio items, and verify their experience for your project.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onAssign && jobId && (
              <Button onClick={() => onAssign(workerId)}>
                <User className="h-4 w-4 mr-2" />
                Assign to Job
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};