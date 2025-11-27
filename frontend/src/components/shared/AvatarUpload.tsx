// components/AvatarUpload.tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { Upload, User, X } from 'lucide-react';

interface AvatarUploadProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AvatarUpload = ({ onSuccess, onCancel }: AvatarUploadProps) => {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      // First, upload to Cloudinary
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'verinest_avatars'); // You'll need to set this up in Cloudinary

      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.secure_url;

      // Then, update user avatar in backend
      const updateResponse = await fetch('https://verinest.up.railway.app/api/users/avatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_url: imageUrl,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update avatar');
      }

      await refreshUser();
      toast.success('Avatar updated successfully!');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://verinest.up.railway.app/api/users/avatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_url: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove avatar');
      }

      await refreshUser();
      setPreviewUrl(null);
      setSelectedFile(null);
      toast.success('Avatar removed successfully!');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast.error(error.message || 'Failed to remove avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>
          Upload a profile picture to personalize your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Avatar Preview */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Avatar preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1">
            <Label htmlFor="avatar-upload" className="text-sm font-medium">
              {previewUrl ? 'Change photo' : 'Upload photo'}
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG or WebP. Max 5MB.
            </p>
          </div>
        </div>

        {/* File Input */}
        <div className="space-y-2">
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Uploading...' : 'Upload Avatar'}
          </Button>
          
          {previewUrl && (
            <Button
              variant="outline"
              onClick={handleRemoveAvatar}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
          
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};