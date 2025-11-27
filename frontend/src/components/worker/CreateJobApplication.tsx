// components/CreateJobApplication.tsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { applyToJob } from '../../services/labour';
import { Alert, AlertDescription } from '../ui/alert';

export const CreateJobApplication = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // MANUALLY EXTRACT JOB ID FROM URL
  const extractJobIdFromPath = (path: string): string | null => {
    const match = path.match(/\/dashboard\/jobs\/([^/]+)\/apply/);
    return match ? match[1] : null;
  };

  const jobId = paramId || extractJobIdFromPath(location.pathname);


  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    proposed_rate: '',
    estimated_completion: '',
    cover_letter: ''
  });
  

 // Debug the job ID
  useEffect(() => {
    console.log('🔍 CreateJobApplication Debug:', {
      paramId: paramId,
      extractedId: jobId,
      fullPath: location.pathname,
      pathSegments: location.pathname.split('/')
    });

    if (jobId) {
      console.log('✅ Using job ID:', jobId);
      fetchJobDetails(jobId);
    } else {
      console.error('❌ No job ID found in URL');
      toast.error('Invalid job URL. Please select a job to apply for.');
      navigate('/dashboard/jobs');
    }
  }, [jobId, location.pathname]);

  const fetchJobDetails = async (id: string) => {
    try {
      const response = await fetch(`https://verinest.up.railway.app/api/labour/jobs/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Job details:', data);
        setJob(data.data || data);
        
        // Pre-fill the proposed rate with job budget
        if (data.data?.budget || data.budget) {
          setFormData(prev => ({
            ...prev,
            proposed_rate: (data.data?.budget || data.budget).toString()
          }));
        }
      } else {
        throw new Error('Failed to fetch job details');
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      toast.error('Failed to load job details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate job ID
    if (!jobId) {
      toast.error('Invalid job ID. Please try again.');
      return;
    }

    if (!token || !user) {
      toast.error('Please log in to apply for jobs');
      navigate('/dashboard');
      return;
    }

    // Validate form data
    if (!formData.proposed_rate || !formData.estimated_completion || !formData.cover_letter) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.cover_letter.length < 20) {
      toast.error('Cover letter must be at least 20 characters long');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🚀 Submitting application for job:', jobId);
      console.log('📦 Application data:', {
        proposed_rate: parseFloat(formData.proposed_rate),
        estimated_completion: parseInt(formData.estimated_completion),
        cover_letter: formData.cover_letter
      });

      

      // Use centralized service wrapper
      await applyToJob(jobId, {
        proposed_rate: parseFloat(formData.proposed_rate),
        estimated_completion: parseInt(formData.estimated_completion),
        cover_letter: formData.cover_letter,
      });
      toast.success('Application submitted successfully!');
      navigate(`/dashboard/jobs/${jobId}`);
    } catch (error: any) {
      console.error('❌ Failed to submit application:', error);
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If no job ID, show error
  if (!jobId) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invalid job ID. Please select a job to apply for.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/dashboard/jobs')} className="mt-4">
            Browse Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(`/dashboard/jobs/${jobId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Apply for Job</h1>
            <p className="text-muted-foreground">
              {job ? `Applying for: ${job.title}` : 'Loading job details...'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Job ID: {jobId}
            </p>
          </div>
        </div>

        {/* Job Summary */}
        {job && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Job Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Budget:</span>
                  <p>₦{job.budget?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <span className="font-medium">Duration:</span>
                  <p>{job.estimated_duration_days} days</p>
                </div>
                <div>
                  <span className="font-medium">Location:</span>
                  <p>{job.location_city}, {job.location_state}</p>
                </div>
                <div>
                  <span className="font-medium">Category:</span>
                  <p>{job.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                    Proposed Rate (₦) *
                  </Label>
                  <Input
                    id="proposed_rate"
                    type="number"
                    min="1"
                    step="100"
                    required
                    value={formData.proposed_rate}
                    onChange={(e) => setFormData({ ...formData, proposed_rate: e.target.value })}
                    placeholder="Enter your proposed rate"
                  />
                  {job && (
                    <p className="text-sm text-muted-foreground">
                      Job budget: ₦{job.budget?.toLocaleString() || '0'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_completion" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Estimated Days *
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
                  {job && (
                    <p className="text-sm text-muted-foreground">
                      Job estimate: {job.estimated_duration_days} days
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_letter">Cover Letter *</Label>
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
                  {formData.cover_letter.length}/20 characters (minimum 20 required)
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your application will be reviewed by the employer. Make sure your proposal is competitive and your cover letter highlights your relevant experience.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/dashboard/jobs/${jobId}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};