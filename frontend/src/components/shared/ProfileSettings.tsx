import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Star,
  Copy,
  ExternalLink,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Edit2,
  Save,
  Loader2,
  Camera,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../utils/api';
import { uploadToCloudinary, uploadToBackend } from '../../utils/cloudinary';

const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_URL || "https://verinest.xyz";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettings = ({ isOpen, onClose }: ProfileSettingsProps) => {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [usernameData, setUsernameData] = useState({
    new_username: user?.username || '',
  });

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const referralLink = user?.referral_code 
    ? `${PUBLIC_BASE_URL}/register?ref=${user.referral_code}` 
    : '';
    
  const publicProfileUrl = user?.username 
    ? `${PUBLIC_BASE_URL}/${user.username}` 
    : '';

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      setUsernameData({
        new_username: user.username || '',
      });
    }
  }, [user]);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(false);
      return;
    }

    if (username === user?.username) {
      setUsernameAvailable(true);
      return;
    }

    setCheckingUsername(true);
    try {
      // Use the real backend endpoint
      const response = await apiClient.get(`/users/check-username?username=${encodeURIComponent(username)}`);
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await apiClient.put('/users/name', { name: profileData.name });
      toast.success("Profile updated successfully!");
      await refreshUser();
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!usernameAvailable) {
      toast.error("Please choose an available username");
      return;
    }

    setLoading(true);
    try {
      await apiClient.put('/users/username', { username: usernameData.new_username });
      toast.success("Username updated successfully!");
      await refreshUser();
      setUsernameAvailable(null);
      setEditing(false);
    } catch (error: any) {
      console.error("Error updating username:", error);
      toast.error(error.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Step 1: Upload to Cloudinary
      const cloudinaryResponse = await uploadToCloudinary(file);
      
      // Step 2: Send the Cloudinary URL to backend using correct endpoint
      const response = await apiClient.put('/users/avatar', {
        avatar_url: cloudinaryResponse.secure_url
      });

      toast.success('Profile photo updated successfully!');
      await refreshUser(); // Refresh user data to get new avatar URL
    } catch (error: any) {
      console.error('Error uploading profile photo:', error);
      toast.error(error.message || 'Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getVerificationBadge = () => {
    const status = user?.kyc_verified;
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending':
      case 'submitted':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800"><AlertCircle className="h-3 w-3 mr-1" />Not Verified</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Manage your profile information and public visibility
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Overview</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? <XCircle className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="w-20 h-20">
                    <AvatarImage 
                      src={user?.avatar_url} 
                      alt={user?.name || 'Profile'}
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=80`;
                      }}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-2xl">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Upload button overlay */}
                  <div 
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{user?.name}</h3>
                    {getVerificationBadge()}
                  </div>
                  <p className="text-slate-600">@{user?.username}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      {user?.role}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Trust Score: {user?.trust_score || 0}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Click on your photo to update it
                  </p>
                </div>
              </div>

              {/* Editable Fields */}
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="space-y-2">
                      <Input
                        id="username"
                        value={usernameData.new_username}
                        onChange={(e) => {
                          const newUsername = e.target.value.toLowerCase();
                          setUsernameData({ new_username: newUsername });
                          checkUsernameAvailability(newUsername);
                        }}
                        placeholder="Choose a username"
                      />
                      {usernameData.new_username !== user?.username && (
                        <div className="flex items-center gap-2 text-sm">
                          {checkingUsername ? (
                            <span className="text-blue-600">Checking availability...</span>
                          ) : usernameAvailable === true ? (
                            <span className="text-green-600">✓ Username available</span>
                          ) : usernameAvailable === false ? (
                            <span className="text-red-600">✗ Username not available</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                      placeholder="Your email address"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      placeholder="Your address"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium">{user?.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="font-medium">{user?.address || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Member Since</p>
                      <p className="font-medium">
                        {user?.id ? `ID: ${user.id.slice(0, 8)}...` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {editing && (
                <div className="flex gap-2">
                  <Button onClick={handleProfileUpdate} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                  {usernameData.new_username !== user?.username && usernameAvailable && (
                    <Button 
                      variant="outline" 
                      onClick={handleUsernameUpdate}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Update Username
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Public Profile & Links */}
          <Card>
            <CardHeader>
              <CardTitle>Public Profile & Links</CardTitle>
              <CardDescription>
                Share your profile and referral links with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {publicProfileUrl && (
                <div className="space-y-2">
                  <Label>Public Profile URL</Label>
                  <div className="flex gap-2">
                    <Input value={publicProfileUrl} disabled className="bg-muted" />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(publicProfileUrl, "Profile link copied!")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(publicProfileUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Referral Code</Label>
                <div className="flex gap-2">
                  <Input value={user?.referral_code || ''} disabled className="bg-muted" />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(user?.referral_code || '', "Referral code copied!")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {referralLink && (
                <div className="space-y-2">
                  <Label>Referral Link</Label>
                  <div className="flex gap-2">
                    <Input value={referralLink} disabled className="bg-muted" />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(referralLink, "Referral link copied!")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Statistics</CardTitle>
              <CardDescription>
                Track your referral performance and rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Referrals</p>
                      <p className="text-2xl font-bold text-blue-800">{user?.referral_count || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Trust Score</p>
                      <p className="text-2xl font-bold text-green-800">{user?.trust_score || 0}</p>
                    </div>
                    <Star className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Referral Rewards</p>
                      <p className="text-2xl font-bold text-purple-800">₦0</p>
                    </div>
                    <Shield className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Your complete account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'User ID', value: user?.id || 'N/A' },
                  { label: 'Email Verified', value: user?.email_verified ? 'Yes' : 'No' },
                  { label: 'KYC Status', value: user?.kyc_verified || 'Not Verified' },
                  { label: 'Role', value: user?.role || 'user' },
                  { label: 'Subscription Tier', value: user?.subscription_tier || 'free' },
                  { label: 'Wallet Address', value: user?.wallet_address || 'Not set' },
                  { label: 'Nationality', value: user?.nationality || 'N/A' },
                  { label: 'LGA', value: user?.lga || 'N/A' },
                ].map((field) => (
                  <div key={field.label} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{field.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{field.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
