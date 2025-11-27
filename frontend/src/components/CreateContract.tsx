// components/CreateContract.tsx
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
import { Job, JobApplication } from '../types/labour';

interface CreateContractProps {
  job: Job;
  application: JobApplication;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateContract = ({ job, application, onSuccess, onCancel }: CreateContractProps) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agreed_rate: application.proposed_rate.toString(),
    agreed_timeline: application.estimated_completion.toString(),
    terms: `The worker will complete the following job: "${job.title}"

Scope of Work:
${job.description}

Payment Terms:
- Total agreed amount: ₦${application.proposed_rate.toLocaleString()}
- ${job.partial_payment_allowed ? `Partial payment of ${job.partial_payment_percentage}% upfront` : 'Full payment upon completion'}
- Work to be completed within ${application.estimated_completion} days

Both parties agree to these terms and conditions.`
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!token) {
        toast.error('You must be logged in to create a contract');
        setLoading(false);
        return;
      }
      if (!application.worker && !application.worker_id) {
        toast.error('Worker information is missing for this application');
        setLoading(false);
        return;
      }
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${job.id}/contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          worker_id: application.worker?.id || (application as any).worker_id,
          agreed_rate: parseFloat(formData.agreed_rate),
          agreed_timeline: parseInt(formData.agreed_timeline),
          terms: formData.terms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create contract');
      }

      toast.success('Contract created successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Contract</CardTitle>
        <CardDescription>
          Create a contract for {application.worker?.name || (application as any).worker_id || 'Selected worker'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agreed_rate">Agreed Rate (₦)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="agreed_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="pl-10"
                  value={formData.agreed_rate}
                  onChange={(e) => setFormData({ ...formData, agreed_rate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agreed_timeline">Timeline (Days)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="agreed_timeline"
                  type="number"
                  min="1"
                  required
                  className="pl-10"
                  value={formData.agreed_timeline}
                  onChange={(e) => setFormData({ ...formData, agreed_timeline: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Contract Terms</Label>
            <Textarea
              id="terms"
              required
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This contract will be sent to the worker for signing. Once both parties sign, the job will begin and funds will be held in escrow.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating Contract...' : 'Create Contract'}
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