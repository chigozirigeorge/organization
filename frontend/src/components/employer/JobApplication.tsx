// components/JobApplicationsList.tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  User, MapPin, Star, Calendar, DollarSign, 
  Briefcase, CheckCircle, MessageCircle, ExternalLink,
  Loader2
} from 'lucide-react';
import { WorkerPortfolioModal } from '../worker/WorkerPortfolioModal';
import { CompleteWorkerData, fetchCompleteWorkerData } from '../../utils/workerUtils';
import { toast } from 'sonner';

interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  worker_user_id?: string;
  proposed_rate: number;
  estimated_completion: number;
  cover_letter: string;
  status: string;
  created_at: string;
  worker?: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar_url?: string;
    trust_score: number;
    verified: boolean;
  };
  worker_profile?: {
    id?: string;
    profile_id?: string;
    category: string;
    experience_years: number;
    description: string;
    hourly_rate: number;
    daily_rate: number;
    location_state: string;
    location_city: string;
    is_available: boolean;
    rating: number;
    completed_jobs: number;
    skills: string[];
  };
  worker_portfolio?: any[];
  worker_reviews?: any[];
}

interface JobApplicationsListProps {
  jobId: string;
  applications: JobApplication[];
  onApplicationUpdate: () => void;
}

export const JobApplicationsList = ({ 
  jobId, 
  applications, 
  onApplicationUpdate 
}: JobApplicationsListProps) => {
  const { token } = useAuth();
  const [selectedWorker, setSelectedWorker] = useState<CompleteWorkerData | null>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [assigningWorker, setAssigningWorker] = useState<string | null>(null);

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
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewPortfolio = async (application: JobApplication) => {
    try {
      const workerUserId = application.worker_user_id || application.worker?.id;
      if (!workerUserId) {
        toast.error('Cannot load worker profile: Missing user ID');
        return;
      }

      console.log('🔍 Fetching worker data for user ID:', workerUserId);
      
      const workerData = await fetchCompleteWorkerData(workerUserId, token!);
      
      if (workerData) {
        setSelectedWorker(workerData);
        setShowPortfolioModal(true);
      } else {
        toast.error('Failed to load worker profile');
      }
    } catch (error) {
      console.error('Error fetching worker data:', error);
      toast.error('Failed to load worker profile');
    }
  };

  const handleAssignWorker = async (application: JobApplication) => {
    if (!application.worker_user_id) {
      toast.error('Cannot assign worker: Missing user ID');
      return;
    }

    setAssigningWorker(application.id);
    
    try {
      console.log('🤝 Assigning worker:', {
        jobId,
        workerId: application.worker_user_id,
        applicationId: application.id
      });

      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${jobId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          worker_id: application.worker_user_id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Worker assigned successfully:', data);
        toast.success('Worker assigned successfully! Contract created.');
        onApplicationUpdate();
      } else {
        const errorText = await response.text();
        console.error('❌ Assignment failed:', errorText);
        
        let errorMessage = 'Failed to assign worker';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Failed to assign worker. Please check your connection.');
    } finally {
      setAssigningWorker(null);
    }
  };

  const handlePortfolioClose = () => {
    setShowPortfolioModal(false);
    setSelectedWorker(null);
  };

  const handleAssignFromPortfolio = (workerUserId: string) => {
    console.log('🎯 Assigning from portfolio:', workerUserId);
    const application = applications.find(app => 
      app.worker_user_id === workerUserId || app.worker?.id === workerUserId
    );
    
    if (application) {
      handleAssignWorker(application);
    } else {
      toast.error('Application not found for this worker');
    }
    
    setShowPortfolioModal(false);
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p>Applications from workers will appear here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Job Applications ({applications.length})
          </CardTitle>
          <CardDescription>
            Review and manage applications from skilled workers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Worker Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {application.worker?.name?.charAt(0).toUpperCase() || 'W'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg flex items-center gap-2">
                                {application.worker?.name || 'Unknown Worker'}
                                {application.worker?.verified && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </h3>
                              <p className="text-muted-foreground">
                                @{application.worker?.username || 'worker'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {application.worker_profile?.category || 'General'}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{application.worker_profile?.rating?.toFixed(1) || '0.0'}</span>
                                </div>
                                {application.worker?.trust_score && (
                                  <Badge variant="secondary" className="text-xs">
                                    Trust: {application.worker.trust_score}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(application.proposed_rate)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Proposed rate
                            </p>
                          </div>
                        </div>

                        {/* Worker Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {application.worker_profile?.location_city}, {application.worker_profile?.location_state}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {application.worker_profile?.experience_years || 0} years experience
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {application.worker_profile?.completed_jobs || 0} jobs completed
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Est. {application.estimated_completion} days
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Cover Letter */}
                        {application.cover_letter && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Cover Letter:</h4>
                            <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 lg:w-48">
                        <Button
                          onClick={() => handleViewPortfolio(application)}
                          variant="outline"
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Portfolio
                        </Button>
                        
                        <Button
                          onClick={() => handleAssignWorker(application)}
                          disabled={assigningWorker === application.id || !application.worker_profile?.is_available}
                          className="gap-2"
                        >
                          {assigningWorker === application.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              {application.worker_profile?.is_available ? 'Assign Worker' : 'Not Available'}
                            </>
                          )}
                        </Button>

                        <div className="text-xs text-muted-foreground text-center">
                          Applied {formatDate(application.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Portfolio Modal */}
      {selectedWorker && (
        <WorkerPortfolioModal
          workerId={selectedWorker.user.id}
          workerData={selectedWorker}
          isOpen={showPortfolioModal}
          onClose={handlePortfolioClose}
          onAssign={handleAssignFromPortfolio}
          jobId={jobId}
        />
      )}
    </div>
  );
};