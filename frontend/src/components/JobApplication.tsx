// components/JobApplication.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Job } from '../types/labour';

interface JobApplicationProps {
  job: Job;
  onSuccess: () => void;
  onCancel: () => void;
}

export const JobApplication = ({ job, onSuccess, onCancel }: JobApplicationProps) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    proposed_rate: '',
    estimated_completion: '',
    cover_letter: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${job.id}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proposed_rate: parseFloat(formData.proposed_rate),
          estimated_completion: parseInt(formData.estimated_completion),
          cover_letter: formData.cover_letter,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      toast.success('Application submitted successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Job</CardTitle>
        <CardDescription>
          Submit your proposal for "{job.title}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposed_rate">Proposed Rate (₦)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="proposed_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="pl-10"
                  value={formData.proposed_rate}
                  onChange={(e) => setFormData({ ...formData, proposed_rate: e.target.value })}
                  placeholder="Enter your proposed rate"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Job budget: ₦{job.budget.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_completion">Estimated Days</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="estimated_completion"
                  type="number"
                  min="1"
                  required
                  className="pl-10"
                  value={formData.estimated_completion}
                  onChange={(e) => setFormData({ ...formData, estimated_completion: e.target.value })}
                  placeholder="Estimated days to complete"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Employer's estimate: {job.estimated_duration_days} days
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover Letter</Label>
            <Textarea
              id="cover_letter"
              required
              placeholder="Explain why you're the right person for this job, your experience, and how you plan to approach the work..."
              value={formData.cover_letter}
              onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
              rows={6}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your application will be reviewed by the employer. If accepted, you'll need to sign a contract before starting work.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};