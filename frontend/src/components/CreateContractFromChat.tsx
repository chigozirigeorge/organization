// components/CreateContractFromChat.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileText, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface CreateContractFromChatProps {
  worker: {
    id: string;
    name: string;
    username: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateContractFromChat = ({ worker, onCancel, onSuccess }: CreateContractFromChatProps) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agreed_rate: '',
    agreed_timeline: '',
    terms: `This contract is between the Employer and ${worker.name} (@${worker.username}).

Scope of Work:
To be determined based on mutual agreement.

Payment Terms:
- Total agreed amount: ₦0.00
- Payment will be held in escrow and released upon job completion
- Work to be completed within 0 days

Responsibilities:
1. Worker agrees to complete the work as described
2. Employer agrees to provide necessary information and access
3. Both parties agree to communicate regularly about progress

Termination:
Either party may terminate this contract with 24 hours notice.

Both parties agree to these terms and conditions.`
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://verinest.up.railway.app/api/labour/jobs/contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          worker_id: worker.id,
          agreed_rate: parseFloat(formData.agreed_rate),
          agreed_timeline: parseInt(formData.agreed_timeline),
          terms: formData.terms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create contract');
      }

      const contractData = await response.json();
      toast.success('Contract created successfully!');
      
      // Navigate to contracts page
      navigate('/dashboard/contracts');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create Contract with {worker.name}
        </CardTitle>
        <CardDescription>
          Create a formal contract to begin work with {worker.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="0.00"
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
                  placeholder="7"
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

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={loading || !formData.agreed_rate || !formData.agreed_timeline}
            >
              {loading ? (
                <>Creating Contract...</>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Contract
                </>
              )}
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