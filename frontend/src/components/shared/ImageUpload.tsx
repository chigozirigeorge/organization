// components/ImageUpload.tsx
import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, X, Image, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToCloudinary, validateImageFile, createImagePreview } from '../../lib/cloudinary';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onImageRemove?: () => void;
  currentImage?: string;
  folder?: string;
  disabled?: boolean;
}

export const ImageUpload = ({ 
  onImageUpload, 
  onImageRemove, 
  currentImage, 
  folder,
  disabled = false 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error!);
      toast.error(validation.error!);
      return;
    }

    try {
      // Create preview
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);

      // Upload to Cloudinary
      setUploading(true);
      const result = await uploadToCloudinary(file, folder);
      
      // Call the callback with the uploaded image URL
      onImageUpload(result.secure_url);
      toast.success('Image uploaded successfully!');
      
    } catch (error: any) {
      console.error('Image upload error:', error);
      setError(error.message || 'Failed to upload image');
      toast.error(error.message || 'Failed to upload image');
      setPreview('');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    setError('');
    if (onImageRemove) {
      onImageRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="portfolio-image">Project Image</Label>
        
        {/* Hidden file input */}
        <Input
          id="portfolio-image"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        {/* Upload area */}
        {!preview ? (
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={handleButtonClick}
          >
            <div className="space-y-3">
              <Image className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <div>
                <p className="font-medium text-sm">Upload project image</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  JPEG, PNG, WebP, GIF • Max 10MB
                </p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                disabled={disabled || uploading}
                className="mt-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Image preview
          <div className="relative">
            <div className="border rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Project preview"
                className="w-full h-48 object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload progress info */}
      {uploading && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800 text-sm">
            Uploading your image... Please don't close this page.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};