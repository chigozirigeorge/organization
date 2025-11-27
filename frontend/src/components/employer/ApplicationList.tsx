import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { X, User, DollarSign, Calendar, Check, X as RejectIcon } from 'lucide-react';
import { toast } from 'sonner';
import { assignWorkerToJob, rejectApplication } from '../../services/labour';

interface Job {
  id: string;
  title: string;
  employer_id: string;
}

interface JobApplication {
  id: string;
  worker_id: string;  // This is worker_profile.id
  worker_user_id?: string;  // This is the actual user.id - USE THIS!
  worker: {
    id: string;
    name: string;
    email: string;
  };
  proposed_rate: number;
  estimated_completion: number;
  cover_letter: string;
  status: string;
}

interface ApplicationListProps {
  job: Job;
  applications: JobApplication[];
  onClose: () => void;
  onApplicationUpdate: () => void;
  token: string;
}

export const ApplicationList = ({ 
  job, 
  applications, 
  onClose, 
  onApplicationUpdate,
  token 
}: ApplicationListProps) => {

  const handleAcceptApplication = async (application: JobApplication) => {
    try {
      const workerIdToSend = application.worker_user_id || application.worker_id;
      console.log('[ApplicationList] Assigning worker:', workerIdToSend, 'to job', job.id);
      const result = await assignWorkerToJob(job.id, workerIdToSend);
      console.log('[ApplicationList] Assignment result:', result);
      toast.success('Worker assigned successfully!');
      onApplicationUpdate();
      onClose();
    } catch (error: any) {
      console.error('[ApplicationList] Assignment error:', error);
      toast.error(error.message || 'Failed to assign worker');
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    const confirm = window.confirm('Are you sure you want to reject this application?');
    if (!confirm) return;

    // Ask for optional reason
    const reason = window.prompt('Optional rejection reason (will be sent to applicant):');

    try {
      await rejectApplication(applicationId, reason || undefined);
      toast.success('Application rejected');
      onApplicationUpdate();
      onClose();
    } catch (error: any) {
      console.error('[ApplicationList] Reject error:', error);
      toast.error(error?.message || 'Failed to reject application');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Job Applications</CardTitle>
            <CardDescription>
              Applications for "{job.title}"
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No applications yet</p>
            </div>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {application.worker.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {application.worker.email}
                        </p>
                        {/* Debug info - remove in production */}
                        <p className="text-xs text-blue-600">
                          Profile ID: {application.worker_id.substring(0, 8)}...
                          {application.worker_user_id && (
                            <> | User ID: {application.worker_user_id.substring(0, 8)}...</>
                          )}
                        </p>
                      </div>
                      <Badge variant={
                        application.status === 'accepted' ? 'default' : 
                        application.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {application.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Proposed: ₦{application.proposed_rate.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Estimate: {application.estimated_completion} days</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Cover Letter:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {application.cover_letter}
                      </p>
                    </div>
                  </div>

                  {application.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptApplication(application)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectApplication(application.id)}
                      >
                        <RejectIcon className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};