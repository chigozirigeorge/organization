// components/CreateJob.tsx (Fixed deadline format)
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { NIGERIAN_STATES, getLGAsForState } from '@/lib/states';

// Use the EXACT categories from the backend error message
const CATEGORIES = [
  'Painter',
  'Plumber',
  'Electrician',
  'Carpenter',
  'Mason',
  'Tiler',
  'Roofer',
  'Welder',
  'SteelBender',
  'ConcreteWorker',
  'Bricklayer',
  'FlooringSpecialist',
  'Glazier',
  'InteriorDecorator',
  'FurnitureMaker',
  'Upholsterer',
  'CurtainBlindInstaller',
  'WallpaperSpecialist',
  'Landscaper',
  'Gardener',
  'FenceInstaller',
  'SwimmingPoolTechnician',
  'OutdoorLightingSpecialist',
  'RealEstateAgent',
  'PropertyManager',
  'FacilityManager',
  'BuildingInspector',
  'QuantitySurveyor',
  'Architect',
  'CivilEngineer',
  'StructuralEngineer',
  'Cleaner',
  'Handyman',
  'HVACTechnician',
  'ElevatorTechnician',
  'SecuritySystemInstaller',
  'PestControlSpecialist',
  'DemolitionExpert',
  'SiteSupervisor',
  'ConstructionLaborer',
  'SafetyOfficer',
  'FireSafetyOfficer',
  'Other'
];

export const CreateJob = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location_state: '',
    location_city: '',
    location_address: '',
    budget: '',
    estimated_duration_days: '',
    partial_payment_allowed: false,
    partial_payment_percentage: '40',
    deadline: '',
  });

  // Convert local datetime to ISO 8601 with timezone
  const formatDeadlineForBackend = (localDateTime: string): string | undefined => {
    if (!localDateTime) return undefined;
    
    try {
      // Convert local datetime to ISO string with timezone
      const date = new Date(localDateTime);
      return date.toISOString(); // This will include timezone info
    } catch (error) {
      console.error('Error formatting deadline:', error);
      return undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email_verified) {
      toast.error('Please verify your email first');
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      // Prepare the request body according to API documentation
      const requestBody = {
        category: formData.category,
        title: formData.title,
        description: formData.description,
        location_state: formData.location_state,
        location_city: formData.location_city,
        location_address: formData.location_address,
        budget: parseFloat(formData.budget),
        estimated_duration_days: parseInt(formData.estimated_duration_days),
        partial_payment_allowed: formData.partial_payment_allowed,
        partial_payment_percentage: formData.partial_payment_allowed 
          ? parseFloat(formData.partial_payment_percentage)
          : undefined,
        deadline: formatDeadlineForBackend(formData.deadline),
      };

      console.log('Sending job creation request:', requestBody);

      const response = await fetch('https://verinest.up.railway.app/api/labour/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Handle non-JSON responses
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error(`Server error: ${responseText}`);
      }

      if (!response.ok) {
        console.error('Job creation failed:', responseData);
        
        if (response.status === 422 && responseData.errors) {
          // Handle validation errors
          const validationErrors: Record<string, string> = {};
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            validationErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
          });
          setErrors(validationErrors);
          toast.error('Please fix the validation errors');
        } else {
          throw new Error(responseData.message || `Failed to create job (${response.status})`);
        }
        return;
      }

      toast.success('Job created successfully!');
      navigate('/jobs/my-jobs');
    } catch (error: any) {
      console.error('Job creation error:', error);
      toast.error(error.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.email_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email Verification Required</CardTitle>
            <CardDescription>
              Please verify your email before creating a job.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/verify-email')} className="w-full">
              Verify Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Job Posting</CardTitle>
            <CardDescription>
              Post a job to find qualified workers for your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select job category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    required
                    placeholder="e.g., Home Electrical Wiring"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  required
                  placeholder="Describe the job requirements, scope of work, and any specific skills needed..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_state">State *</Label>
                  <Select 
                    value={formData.location_state} 
                    onValueChange={(value) => setFormData({ ...formData, location_state: value })}
                  >
                    <SelectTrigger className={errors.location_state ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location_state && (
                    <p className="text-sm text-red-500">{errors.location_state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_city">City *</Label>
                  <Input
                    id="location_city"
                    type="text"
                    required
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                    className={errors.location_city ? 'border-red-500' : ''}
                  />
                  {errors.location_city && (
                    <p className="text-sm text-red-500">{errors.location_city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_address">Address *</Label>
                  <Input
                    id="location_address"
                    type="text"
                    required
                    placeholder="Street address"
                    value={formData.location_address}
                    onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                    className={errors.location_address ? 'border-red-500' : ''}
                  />
                  {errors.location_address && (
                    <p className="text-sm text-red-500">{errors.location_address}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (₦) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className={errors.budget ? 'border-red-500' : ''}
                  />
                  {errors.budget && (
                    <p className="text-sm text-red-500">{errors.budget}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_duration_days">Estimated Duration (Days) *</Label>
                  <Input
                    id="estimated_duration_days"
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={formData.estimated_duration_days}
                    onChange={(e) => setFormData({ ...formData, estimated_duration_days: e.target.value })}
                    className={errors.estimated_duration_days ? 'border-red-500' : ''}
                  />
                  {errors.estimated_duration_days && (
                    <p className="text-sm text-red-500">{errors.estimated_duration_days}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.partial_payment_allowed}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, partial_payment_allowed: checked })
                    }
                  />
                  <Label htmlFor="partial_payment">Allow Partial Payments</Label>
                </div>

                {formData.partial_payment_allowed && (
                  <div className="space-y-2">
                    <Label htmlFor="partial_payment_percentage">
                      Partial Payment Percentage (%)
                    </Label>
                    <Input
                      id="partial_payment_percentage"
                      type="number"
                      min="10"
                      max="90"
                      value={formData.partial_payment_percentage}
                      onChange={(e) => setFormData({ ...formData, partial_payment_percentage: e.target.value })}
                      className={errors.partial_payment_percentage ? 'border-red-500' : ''}
                    />
                    {errors.partial_payment_percentage && (
                      <p className="text-sm text-red-500">{errors.partial_payment_percentage}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={errors.deadline ? 'border-red-500' : ''}
                />
                {errors.deadline && (
                  <p className="text-sm text-red-500">{errors.deadline}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Leave empty if there's no specific deadline
                </p>
              </div>

              {/* Debug information */}
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please fix the following errors:
                    <ul className="list-disc list-inside mt-2">
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field}>
                          <strong>{field}:</strong> {message}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Funds will be held in escrow once you accept a worker. Payments are only released when you approve work milestones.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Job...' : 'Create Job Posting'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};