// components/CreateJobApplication.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ArrowLeft, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const CreateJobApplication = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    proposed_rate: '',
    estimated_completion: '',
    cover_letter: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Please log in to apply for jobs');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${id}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          proposed_rate: parseFloat(formData.proposed_rate),
          estimated_completion: parseInt(formData.estimated_completion),
          cover_letter: formData.cover_letter
        }),
      });

      if (response.ok) {
        toast.success('Application submitted successfully!');
        navigate(`/jobs/${id}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(`/jobs/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Apply for Job</h1>
            <p className="text-muted-foreground">Submit your application for this job opportunity</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Tell the employer why you're the right person for this job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proposed_rate" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Proposed Rate (₦)
                  </Label>
                  <Input
                    id="proposed_rate"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={formData.proposed_rate}
                    onChange={(e) => setFormData({ ...formData, proposed_rate: e.target.value })}
                    placeholder="Enter your proposed rate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_completion" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Estimated Completion (Days)
                  </Label>
                  <Input
                    id="estimated_completion"
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={formData.estimated_completion}
                    onChange={(e) => setFormData({ ...formData, estimated_completion: e.target.value })}
                    placeholder="Estimated days to complete"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_letter">Cover Letter</Label>
                <Textarea
                  id="cover_letter"
                  required
                  rows={6}
                  value={formData.cover_letter}
                  onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                  placeholder="Describe your experience, why you're interested in this job, and how you plan to complete it..."
                  className="min-h-[150px]"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum 20 characters. Be specific about your qualifications and approach.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};