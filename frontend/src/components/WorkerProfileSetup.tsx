// components/WorkerProfileSetup.tsx (Enhanced for multiple profiles)
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Briefcase, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'Painter',
  'Plumber', 
  'Electrician',
  'Carpenter',
  'Mason',
  'Tiler',
  'Roofer',
  'InteriorDecorator',
  'Landscaper',
  'Cleaner',
  'SecurityGuard',
  'Other'
];

const STATES = [
  'Lagos', 'Abuja', 'Rivers', 'Kano', 'Delta', 'Oyo', 'Kaduna', 'Edo', 'Ogun', 'Enugu'
];

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
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<WorkerProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<WorkerProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    if (user?.role === 'worker') {
      fetchWorkerProfiles();
    }
  }, [user]);

  const fetchWorkerProfiles = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/labour/worker/profiles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch worker profiles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      const url = editingProfile 
        ? `https://verinest.up.railway.app/api/labour/worker/profiles/${editingProfile.id}`
        : 'https://verinest.up.railway.app/api/labour/worker/profiles';

      const method = editingProfile ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 422 && responseData.errors) {
          const validationErrors: Record<string, string> = {};
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            validationErrors[field] = Array.isArray(messages) ? messages[0] : String(messages);
          });
          setErrors(validationErrors);
          toast.error('Please fix the validation errors');
        } else {
          throw new Error(responseData.message || 'Failed to save profile');
        }
        return;
      }

      toast.success(editingProfile ? 'Profile updated successfully!' : 'Profile created successfully!');
      resetForm();
      fetchWorkerProfiles();
    } catch (error: any) {
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
  };

  const editProfile = (profile: WorkerProfile) => {
    setFormData(profile);
    setEditingProfile(profile);
    setShowForm(true);
  };

  const deleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      const response = await fetch(`https://verinest.up.railway.app/api/labour/worker/profiles/${profileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Profile deleted successfully!');
        fetchWorkerProfiles();
      } else {
        throw new Error('Failed to delete profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete profile');
    }
  };

  const setPrimaryProfile = async (profileId: string) => {
    try {
      const response = await fetch(`https://verinest.up.railway.app/api/labour/worker/profiles/${profileId}/primary`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Primary profile updated!');
        fetchWorkerProfiles();
      } else {
        throw new Error('Failed to set primary profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to set primary profile');
    }
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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Worker Profiles</h1>
            <p className="text-muted-foreground">
              Create multiple job profiles like a CV to showcase your skills
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profiles List */}
          <div className="lg:col-span-2 space-y-6">
            {profiles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No profiles yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first job profile to start applying for jobs
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    Create Your First Profile
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
                          {profile.category.charAt(0).toUpperCase() + profile.category.slice(1)}
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
                      <div className="flex gap-2">
                        {!profile.is_primary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPrimaryProfile(profile.id!)}
                          >
                            Set Primary
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editProfile(profile)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProfile(profile.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                        <p className="text-muted-foreground">₦{profile.hourly_rate.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Daily Rate</p>
                        <p className="text-muted-foreground">₦{profile.daily_rate.toLocaleString()}</p>
                      </div>
                    </div>

                    {profile.skills.length > 0 && (
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
          {(showForm || editingProfile) && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingProfile ? 'Edit Profile' : 'Create New Profile'}
                  </CardTitle>
                  <CardDescription>
                    Add a new job profile to showcase your skills
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
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
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
                        value={formData.experience_years}
                        onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                        className={errors.experience_years ? 'border-red-500' : ''}
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
                        placeholder="Describe your skills and experience..."
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
                          step="0.01"
                          required
                          value={formData.hourly_rate}
                          onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                          className={errors.hourly_rate ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="daily_rate">Daily Rate (₦) *</Label>
                        <Input
                          id="daily_rate"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={formData.daily_rate}
                          onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) || 0 })}
                          className={errors.daily_rate ? 'border-red-500' : ''}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                            {STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills</Label>
                      <div className="space-y-2">
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
                        {loading ? 'Saving...' : (editingProfile ? 'Update Profile' : 'Create Profile')}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
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
                <Button onClick={() => setShowForm(true)} className="h-20 flex flex-col">
                  <Plus className="h-6 w-6 mb-2" />
                  <span>Add Another Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};