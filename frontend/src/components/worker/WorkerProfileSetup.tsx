// FIXED WorkerProfileSetup.tsx with proper TypeScript
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Briefcase, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

// Import Nigerian states and LGAs with proper types
import { NIGERIAN_STATES, getLGAsForState } from '../../lib/states';

// Enhanced worker categories based on your backend enum
const CATEGORIES = [
  // Construction & Building Trades
  'Painter', 'Plumber', 'Electrician', 'Carpenter', 'Mason', 'Tiler', 'Roofer',
  'Welder', 'SteelBender', 'ConcreteWorker', 'Bricklayer', 'FlooringSpecialist', 'Glazier',
  
  // Interior & Finishing
  'InteriorDecorator', 'FurnitureMaker', 'Upholsterer', 'CurtainBlindInstaller', 'WallpaperSpecialist',
  
  // Landscaping & Outdoor
  'Landscaper', 'Gardener', 'FenceInstaller', 'SwimmingPoolTechnician', 'OutdoorLightingSpecialist',
  
  // Specialized Real Estate Services
  'RealEstateAgent', 'PropertyManager', 'FacilityManager', 'BuildingInspector', 
  'QuantitySurveyor', 'Architect', 'CivilEngineer', 'StructuralEngineer',
  
  // Maintenance & Repair
  'Cleaner', 'Handyman', 'HVACTechnician', 'ElevatorTechnician', 
  'SecuritySystemInstaller', 'PestControlSpecialist',
  
  // Demolition & Site Work
  'DemolitionExpert', 'SiteSupervisor', 'ConstructionLaborer',
  
  // Safety & Compliance
  'SafetyOfficer', 'FireSafetyOfficer',
  
  'Other'
] as const;

// Skills suggestions for each category
const SKILLS_SUGGESTIONS: Record<string, string[]> = {
  // Construction & Building Trades
  Painter: ['Wall Painting', 'Spray Painting', 'Decorative Finishes', 'Color Consultation', 'Surface Preparation'],
  Plumber: ['Pipe Installation', 'Leak Repair', 'Fixture Installation', 'Drain Cleaning', 'Water Heater Installation'],
  Electrician: ['Wiring Installation', 'Circuit Repair', 'Lighting Installation', 'Panel Upgrade', 'Safety Inspection'],
  Carpenter: ['Furniture Making', 'Cabinet Installation', 'Trim Work', 'Framing', 'Door Installation'],
  Mason: ['Brick Laying', 'Concrete Work', 'Block Work', 'Stone Masonry', 'Plastering'],
  Tiler: ['Floor Tiling', 'Wall Tiling', 'Pattern Design', 'Grouting', 'Waterproofing'],
  Roofer: ['Shingle Installation', 'Metal Roofing', 'Leak Repair', 'Roof Inspection', 'Gutter Installation'],
  
  // Interior & Finishing
  InteriorDecorator: ['Space Planning', 'Color Scheme Design', 'Furniture Selection', 'Lighting Design', 'Accessory Styling'],
  FurnitureMaker: ['Custom Furniture', 'Woodworking', 'Upholstery', 'Furniture Repair', 'Finishing'],
  
  // Real Estate Services
  RealEstateAgent: ['Property Listing', 'Client Representation', 'Market Analysis', 'Negotiation', 'Contract Management'],
  PropertyManager: ['Tenant Management', 'Maintenance Coordination', 'Rent Collection', 'Property Inspection', 'Budget Management'],
  
  // Maintenance & Repair
  Cleaner: ['Deep Cleaning', 'Office Cleaning', 'Residential Cleaning', 'Post-Construction Cleanup', 'Window Cleaning'],
  Handyman: ['General Repairs', 'Assembly', 'Mounting', 'Minor Installations', 'Maintenance Tasks'],
  
  // Add more categories as needed
  Other: ['General Labor', 'Site Cleanup', 'Material Handling', 'Equipment Operation']
};

interface WorkerProfile {
  id?: string;
  category: string;
  experience_years: number;
  description: string;
  hourly_rate: number;
  daily_rate: number;
  location_state: string;
  location_city: string;
  skills: string[];
  is_primary?: boolean;
  is_verified?: boolean;
}

export const WorkerProfileSetup = () => {
  const { user, token, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<WorkerProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<WorkerProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<WorkerProfile>({
    category: '',
    experience_years: 0,
    description: '',
    hourly_rate: 0,
    daily_rate: 0,
    location_state: '',
    location_city: '',
    skills: [],
  });

  useEffect(() => {
    console.log('🔐 Auth State:', {
      isAuthenticated,
      hasToken: !!token,
      tokenLength: token?.length,
      userRole: user?.role,
      userId: user?.id
    });
  }, [isAuthenticated, token, user]);

  useEffect(() => {
    if (user?.role === 'worker' && isAuthenticated && token) {
      fetchWorkerProfiles();
    }
  }, [user]);

  // Update LGAs when state changes
  useEffect(() => {
    if (formData.location_state) {
      const lgAs = getLGAsForState(formData.location_state);
      setAvailableLGAs(lgAs);
      // Reset city if state changes
      if (!lgAs.includes(formData.location_city)) {
        setFormData(prev => ({ ...prev, location_city: '' }));
      }
    } else {
      setAvailableLGAs([]);
      setFormData(prev => ({ ...prev, location_city: '' }));
    }
  }, [formData.location_state]);

  // Update skills suggestions when category changes
  useEffect(() => {
    if (formData.category && SKILLS_SUGGESTIONS[formData.category]) {
      setCurrentSkills(SKILLS_SUGGESTIONS[formData.category]);
    } else {
      setCurrentSkills([]);
    }
  }, [formData.category]);

  const fetchWorkerProfiles = async () => {

    if (!token) {
      console.error('❌ No token available for fetchWorkerProfiles');
      toast.error('Authentication required. Please log in again.');
      return;
    }

    try {
      console.log('🔄 Fetching worker profiles with token:', token.substring(0, 20) + '...');

      // FIXED: Use correct endpoint - singular "profile" not "profiles"
      const response = await fetch('https://verinest.up.railway.app/api/labour/worker/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📡 Profile fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        // Handle both single profile and array response formats
        if (data.data) {
          setProfiles(Array.isArray(data.data) ? data.data : [data.data]);
        } else if (data.profile) {
          setProfiles([data.profile]);
        } else {
          setProfiles([]);
        }
      } else if (response.status === 401) {
        console.error('❌ Unauthorized - token may be invalid');
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else if (response.status === 404) {
        console.log('ℹ️ No profile exists yet');
        setProfiles([]);
      } else {
        console.error('❌ Failed to fetch profiles:', response.status);
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('❌ Network error fetching profiles:', error);
      toast.error('Network error. Please check your connection.');
      setProfiles([]);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication before proceeding
    if (!isAuthenticated || !token) {
      toast.error('Please log in to create a worker profile');
      navigate('/login');
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      console.log('🔄 Submitting profile with token:', token.substring(0, 20) + '...');
      console.log('📦 Request payload:', formData);

      const response = await fetch('https://verinest.up.railway.app/api/labour/worker/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: formData.category,
          experience_years: formData.experience_years,
          description: formData.description,
          hourly_rate: formData.hourly_rate,
          daily_rate: formData.daily_rate,
          location_state: formData.location_state,
          location_city: formData.location_city,
        }),
      });

      console.log('📡 Profile creation response status:', response.status);

      const responseData = await response.json();
      console.log('📦 Response data:', responseData);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Unauthorized - token invalid or expired');
          toast.error('Session expired. Please log in again.');
          logout();
          navigate('/login');
          return;
        } else if (response.status === 422 && responseData.errors) {
          const validationErrors: Record<string, string> = {};
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            validationErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
          });
          setErrors(validationErrors);
          toast.error('Please fix the validation errors');
        } else {
          throw new Error(responseData.message || `Failed to save profile: ${response.status}`);
        }
        return;
      }

      toast.success('Profile created successfully!');
      resetForm();
      fetchWorkerProfiles();
      
      // Navigate to worker dashboard after successful creation
      setTimeout(() => {
        navigate('/worker/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Profile creation error:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      experience_years: 0,
      description: '',
      hourly_rate: 0,
      daily_rate: 0,
      location_state: '',
      location_city: '',
      skills: [],
    });
    setEditingProfile(null);
    setShowForm(false);
    setErrors({});
    setAvailableLGAs([]);
    setCurrentSkills([]);
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill.trim()]
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };


   // Check if user is properly authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the worker profile setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/login')} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  if (!user?.email_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email Verification Required</CardTitle>
            <CardDescription>
              Please verify your email before setting up your worker profile.
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

   if (user.role !== 'worker') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Role Required</CardTitle>
            <CardDescription>
              You need to be a worker to access this page. Please select the worker role first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Debug info - remove in production */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Token: {token ? `Present (${token.length} chars)` : 'Missing'}</p>
          <p>User Role: {user?.role}</p>
        </div>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Worker Profile</h1>
            <p className="text-muted-foreground">
              Set up your professional profile to start applying for jobs
            </p>
          </div>
          {profiles.length === 0 && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profiles List */}
          <div className="lg:col-span-2 space-y-6">
            {profiles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No profile yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your professional profile to start applying for jobs
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    Create Profile
                  </Button>
                </CardContent>
              </Card>
            ) : (
              profiles.map((profile) => (
                <Card key={profile.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {formatCategoryName(profile.category)}
                          {profile.is_primary && (
                            <Badge variant="default">Primary</Badge>
                          )}
                          {profile.is_verified && (
                            <Badge variant="secondary">Verified</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {profile.experience_years} years experience • {profile.location_city}, {profile.location_state}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Description</p>
                      <p className="text-sm text-muted-foreground">{profile.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Hourly Rate</p>
                        <p className="text-muted-foreground">₦{profile.hourly_rate?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Daily Rate</p>
                        <p className="text-muted-foreground">₦{profile.daily_rate?.toLocaleString() || '0'}</p>
                      </div>
                    </div>

                    {profile.skills && profile.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <Badge key={index} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Profile Form */}
          {(showForm || profiles.length === 0) && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Create Worker Profile</CardTitle>
                  <CardDescription>
                    Set up your professional profile to start applying for jobs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select your specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {formatCategoryName(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-red-500">{errors.category}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience_years">Years of Experience *</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        min="0"
                        max="50"
                        required
                        value={formData.experience_years || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          experience_years: parseInt(e.target.value) || 0 
                        })}
                        className={errors.experience_years ? 'border-red-500' : ''}
                        placeholder="Enter years of experience"
                      />
                      {errors.experience_years && (
                        <p className="text-sm text-red-500">{errors.experience_years}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        required
                        placeholder="Describe your skills, experience, and what you specialize in..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500">{errors.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourly_rate">Hourly Rate (₦) *</Label>
                        <Input
                          id="hourly_rate"
                          type="number"
                          min="0"
                          step="100"
                          required
                          value={formData.hourly_rate || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            hourly_rate: parseFloat(e.target.value) || 0 
                          })}
                          className={errors.hourly_rate ? 'border-red-500' : ''}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="daily_rate">Daily Rate (₦) *</Label>
                        <Input
                          id="daily_rate"
                          type="number"
                          min="0"
                          step="500"
                          required
                          value={formData.daily_rate || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            daily_rate: parseFloat(e.target.value) || 0 
                          })}
                          className={errors.daily_rate ? 'border-red-500' : ''}
                          placeholder="0"
                        />
                      </div>
                    </div>

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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location_city">City/LGA *</Label>
                      <Select 
                        value={formData.location_city} 
                        onValueChange={(value) => setFormData({ ...formData, location_city: value })}
                        disabled={!formData.location_state}
                      >
                        <SelectTrigger className={errors.location_city ? 'border-red-500' : ''}>
                          <SelectValue placeholder={formData.location_state ? "Select city/LGA" : "Select state first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLGAs.map((lga) => (
                            <SelectItem key={lga} value={lga}>
                              {lga}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills</Label>
                      <div className="space-y-3">
                        <Input
                          id="skills"
                          type="text"
                          placeholder="Add a skill and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        
                        {/* Skills Suggestions */}
                        {currentSkills.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Suggested skills for {formatCategoryName(formData.category)}:</p>
                            <div className="flex flex-wrap gap-2">
                              {currentSkills.map((skill, index) => (
                                <Button
                                  key={index}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addSkill(skill)}
                                  disabled={formData.skills.includes(skill)}
                                >
                                  {skill}
                                  {!formData.skills.includes(skill) && (
                                    <Plus className="h-3 w-3 ml-1" />
                                  )}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Selected Skills */}
                        {formData.skills.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Selected Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {formData.skills.map((skill, index) => (
                                <div key={index} className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1">
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="text-primary hover:text-primary/70"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {Object.keys(errors).length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Please fix the validation errors
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-3">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? 'Creating...' : 'Create Profile'}
                      </Button>
                      {profiles.length > 0 && (
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {profiles.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-20 flex flex-col">
                  <a href="/jobs">
                    <Briefcase className="h-6 w-6 mb-2" />
                    <span>Browse Jobs</span>
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-20 flex flex-col">
                  <a href="/worker/dashboard">
                    <span>View Dashboard</span>
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-20 flex flex-col">
                  <a href="/worker/portfolio">
                    <span>Manage Portfolio</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};