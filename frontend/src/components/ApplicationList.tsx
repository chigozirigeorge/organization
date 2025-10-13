// components/ApplicationList.tsx
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, User, DollarSign, Calendar, Check, X as RejectIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Job, JobApplication } from '../types/labour';
import { useAuth } from '../contexts/AuthContext';

interface ApplicationListProps {
  job: Job;
  applications: JobApplication[];
  onClose: () => void;
  onApplicationUpdate: () => void;
}

export const ApplicationList = ({ job, applications, onClose, onApplicationUpdate }: ApplicationListProps) => {
  const { token } = useAuth();

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${job.id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          worker_id: applications.find(app => app.id === applicationId)?.worker.id,
        }),
      });

      if (response.ok) {
        toast.success('Worker assigned successfully!');
        onApplicationUpdate();
        onClose();
      } else {
        throw new Error('Failed to assign worker');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign worker');
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    // You might need to create this endpoint
    toast.info('Reject functionality to be implemented');
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
                          {application.worker.user.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {application.worker.profile.experience_years} years experience
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
                        onClick={() => handleAcceptApplication(application.id)}
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