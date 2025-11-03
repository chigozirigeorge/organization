// components/vendor/CreateServiceForm.tsx
// Form to create/list a new service with image upload

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { X, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { vendorApi } from '../../utils/vendorApi';
import { CreateServiceDto, ServiceCategory } from '../../types/vendor.types';

const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Electronics', 'HomeAppliances', 'Fashion', 'Beauty', 
  'FoodDrinks', 'Health', 'Sports', 'Books', 
  'Toys', 'Automotive', 'RealEstate', 'Services', 'Other'
];

interface CreateServiceFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateServiceForm: React.FC<CreateServiceFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateServiceDto>({
    title: '',
    description: '',
    category: 'Electronics',
    price: 0,
    location_state: '',
    location_city: '',
    stock_quantity: 1,
    is_negotiable: false,
    tags: [],
    images: []
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    if (newFiles.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate file sizes (max 5MB per image)
    const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    // Validate file types
    const invalidTypes = newFiles.filter(file => !file.type.startsWith('image/'));
    if (invalidTypes.length > 0) {
      toast.error('Only image files are allowed');
      return;
    }

    // Create preview URLs
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setImageFiles([...imageFiles, ...newFiles]);
    setImageUrls([...imageUrls, ...newUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.stock_quantity || formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Stock quantity must be 0 or greater';
    }

    if (!formData.location_state.trim()) {
      newErrors.location_state = 'State is required';
    }

    if (!formData.location_city.trim()) {
      newErrors.location_city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImages = async (): Promise<string[]> => {
    // In production, upload images to cloud storage (Cloudinary, AWS S3, etc.)
    // For now, we'll use placeholder URLs
    // You should replace this with actual image upload logic
    
    if (imageUrls.length === 0) {
      return [];
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In real implementation:
    // const uploadPromises = imageFiles.map(file => uploadToCloudStorage(file));
    // const uploadedUrls = await Promise.all(uploadPromises);
    // return uploadedUrls;

    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages();

      // Prepare payload
      const payload: CreateServiceDto = {
        ...formData,
        images: uploadedImageUrls,
      };

      // Create service via API
      await vendorApi.createService(payload);

      toast.success('Service listed successfully!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to create service:', error);
      toast.error(error.message || 'Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">List New Service</CardTitle>
              <CardDescription>Fill in the details to list your service</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label>Service Images (Max 5) *</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={url} 
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {imageUrls.length < 5 && (
                <label className="border-2 border-dashed rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Upload className="h-6 w-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Upload up to 5 images. Each image must be less than 5MB.
            </p>
          </div>

          {/* Title and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., iPhone 13 Pro Max"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as ServiceCategory})}
                className="w-full p-2 border rounded-md"
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your service in detail..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-slate-500">
              {formData.description.length} / 2000 characters
            </p>
          </div>

          {/* Price, Stock, and Negotiable */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₦) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock_quantity || ''}
                onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})}
                placeholder="1"
                className={errors.stock_quantity ? 'border-red-500' : ''}
              />
              {errors.stock_quantity && (
                <p className="text-xs text-red-500">{errors.stock_quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 h-10">
                <input
                  type="checkbox"
                  checked={formData.is_negotiable}
                  onChange={(e) => setFormData({...formData, is_negotiable: e.target.checked})}
                  className="w-4 h-4"
                />
                <span>Negotiable Price</span>
              </Label>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.location_state}
                onChange={(e) => setFormData({...formData, location_state: e.target.value})}
                placeholder="Lagos"
                className={errors.location_state ? 'border-red-500' : ''}
              />
              {errors.location_state && (
                <p className="text-xs text-red-500">{errors.location_state}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.location_city}
                onChange={(e) => setFormData({...formData, location_city: e.target.value})}
                placeholder="Ikeja"
                className={errors.location_city ? 'border-red-500' : ''}
              />
              {errors.location_city && (
                <p className="text-xs text-red-500">{errors.location_city}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => setFormData({
                ...formData, 
                tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
              })}
              placeholder="smartphone, apple, 5g"
            />
            <p className="text-xs text-slate-500">
              Add relevant tags to help buyers find your service
            </p>
          </div>
        </CardContent>

        <CardFooter className="sticky bottom-0 bg-white border-t flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="flex-1"
          >
            {loading ? 'Creating...' : 'List Service'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};