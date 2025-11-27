// components/WorkerAssignmentModal.tsx - NEW COMPONENT
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { User, MapPin, Star, Briefcase, CheckCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WorkerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (workerId: string, workerUserId: string) => void;
  applications: any[];
  jobId: string;
}

export const WorkerAssignmentModal = ({
  isOpen,
  onClose,
  onAssign,
  applications,
  jobId
}: WorkerAssignmentModalProps) => {
  const [assigning, setAssigning] = useState<string | null>(null);

  const handleAssignWorker = async (application: any) => {
    setAssigning(application.worker_id);
    
    try {
      // Use worker_id (profile_id) for assignment
      await onAssign(application.worker_id, application.worker_user_id);
      toast.success(`Successfully assigned ${application.worker?.name || 'worker'} to job`);
      onClose();
    } catch (error) {
      toast.error('Failed to assign worker');
    } finally {
      setAssigning(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assign Worker to Job
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select a worker from the applications to assign to this job
          </p>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Applications</h3>
                <p className="text-muted-foreground">No workers have applied to this job yet.</p>
              </div>
            ) : (
              applications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {application.worker?.name?.charAt(0).toUpperCase() || 'W'}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {application.worker?.name || 'Unknown Worker'}
                            </h3>
                            {application.worker?.verified && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {application.worker_profile?.location_city}, {application.worker_profile?.location_state}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span className="capitalize">
                                  {application.worker_profile?.category} • {application.worker_profile?.experience_years} yrs exp
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>
                                  {application.worker_profile?.rating?.toFixed(1) || '0.0'} 
                                  ({application.worker_reviews?.length || 0} reviews)
                                </span>
                              </div>
                              
                              <div className="text-green-600 font-semibold">
                                Proposed: {formatCurrency(application.proposed_rate)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Portfolio Preview */}
                          {application.worker_portfolio && application.worker_portfolio.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground mb-2">
                                Portfolio: {application.worker_portfolio.length} project{application.worker_portfolio.length !== 1 ? 's' : ''}
                              </p>
                              <div className="flex gap-2 overflow-x-auto">
                                {application.worker_portfolio.slice(0, 3).map((item: any) => (
                                  <div key={item.id} className="flex-shrink-0 w-20 h-20 bg-muted rounded-lg overflow-hidden">
                                    {item.image_url ? (
                                      <img 
                                        src={item.image_url} 
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                        <Briefcase className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {application.worker_portfolio.length > 3 && (
                                  <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                                    <span className="text-sm font-medium">
                                      +{application.worker_portfolio.length - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Cover Letter */}
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-1">Cover Letter:</p>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {application.cover_letter}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleAssignWorker(application)}
                          disabled={assigning === application.worker_id}
                          className="whitespace-nowrap"
                        >
                          {assigning === application.worker_id ? (
                            'Assigning...'
                          ) : (
                            'Assign Worker'
                          )}
                        </Button>
                        
                        <Button variant="outline" size="sm" className="gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};