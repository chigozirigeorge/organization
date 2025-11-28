// components/worker/WorkerJobProgress.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertCircle, Upload, Camera, ArrowLeft, Save, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary, validateImageFile, createImagePreview } from '../../lib/cloudinary';

interface WorkerJobProgressProps {
  jobId: string;
}

interface JobDetails {
  id: string;
  title: string;
  description: string;
  agreed_rate: number;
  agreed_timeline: number;
  status: string;
  employer_id: string;
  worker_id: string;
  location_city: string;
  location_state: string;
}

interface ProgressUpdate {
  progress_percentage: number;
  description: string;
  image_urls: string[];
}

export const WorkerJobProgress = ({ jobId }: WorkerJobProgressProps) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progressData, setProgressData] = useState<ProgressUpdate>({
    progress_percentage: 0,
    description: '',
    image_urls: []
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.verinest.xyz'}/api/labour/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Job not found');
        } else if (response.status === 403) {
          throw new Error('You are not authorized to view this job');
        } else {
          throw new Error(`Failed to fetch job details: ${response.status}`);
        }
      }

      const data = await response.json();
      setJobDetails(data.data || data);
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      toast.error(error.message || 'Failed to load job details');
      navigate('/dashboard/my-jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (uploadedImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate and upload each file
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.error!);
        continue;
      }

      try {
        // Create preview
        const previewUrl = await createImagePreview(file);
        setPreviewUrls(prev => [...prev, previewUrl]);
        setUploadedImages(prev => [...prev, file]);
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error('Failed to process image');
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToCloud = async (): Promise<string[]> => {
    const imageUrls: string[] = [];
    
    for (const file of uploadedImages) {
      try {
        const result = await uploadToCloudinary(file, 'job-progress');
        imageUrls.push(result.secure_url);
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobDetails) return;
    
    if (progressData.progress_percentage < 0 || progressData.progress_percentage > 100) {
      toast.error('Progress percentage must be between 0 and 100');
      return;
    }

    if (!progressData.description.trim()) {
      toast.error('Please provide a description of your progress');
      return;
    }

    if (progressData.description.length < 10) {
      toast.error('Description must be at least 10 characters long');
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    setSubmitting(true);
    
    try {
      // Upload images to Cloudinary first
      toast.loading('Uploading images...', { id: 'upload' });
      const imageUrls = await uploadImagesToCloud();
      toast.dismiss('upload');
      
      if (imageUrls.length === 0) {
        toast.error('Failed to upload images. Please try again.');
        return;
      }

      // Submit progress to backend
      const payload = {
        progress_percentage: progressData.progress_percentage,
        description: progressData.description,
        image_urls: imageUrls
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.verinest.xyz'}/api/labour/jobs/${jobId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to submit progress`);
      }

      const result = await response.json();
      toast.success('Progress update submitted successfully!');
      
      // Reset form
      setProgressData({
        progress_percentage: 0,
        description: '',
        image_urls: []
      });
      setUploadedImages([]);
      setPreviewUrls([]);
      
      // Navigate back after successful submission
      setTimeout(() => {
        navigate('/dashboard/my-jobs');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting progress:', error);
      toast.error(error.message || 'Failed to submit progress update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-4">Unable to load job details</p>
        <Button onClick={() => navigate('/dashboard/my-jobs')}>
          Back to My Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/my-jobs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Update Job Progress</h1>
          <p className="text-muted-foreground">Submit progress updates for: {jobDetails.title}</p>
        </div>
      </div>

      {/* Job Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Job Information
            <Badge variant={jobDetails.status === 'in_progress' ? 'default' : 'secondary'}>
              {jobDetails.status.replace('_', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{jobDetails.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{jobDetails.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Agreed Rate</Label>
              <p className="font-semibold">₦{jobDetails.agreed_rate?.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Timeline</Label>
              <p className="font-semibold">{jobDetails.agreed_timeline} days</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Location</Label>
              <p className="font-semibold">{jobDetails.location_city}, {jobDetails.location_state}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <p className="font-semibold capitalize">{jobDetails.status.replace('_', ' ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Progress Update</CardTitle>
          <CardDescription>
            Update your employer on the current progress of this job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Progress Percentage */}
            <div className="space-y-3">
              <Label htmlFor="progress">Progress Percentage</Label>
              <div className="space-y-2">
                <Input
                  id="progress"
                  type="range"
                  min="0"
                  max="100"
                  value={progressData.progress_percentage}
                  onChange={(e) => setProgressData(prev => ({ ...prev, progress_percentage: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span>0%</span>
                  <span className="text-2xl font-bold text-primary">{progressData.progress_percentage}%</span>
                  <span>100%</span>
                </div>
                <Progress value={progressData.progress_percentage} className="w-full" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Progress Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you've accomplished so far..."
                value={progressData.description}
                onChange={(e) => setProgressData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label>Work Photos (Optional)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                <div className="text-center">
                  <Camera className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    Upload photos of your work progress (max 5 images)
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting || progressData.progress_percentage === 0}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Progress Update
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/my-jobs')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Alert */}
      {progressData.progress_percentage === 100 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            You're marking this job as complete! Make sure all work is finished before submitting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
