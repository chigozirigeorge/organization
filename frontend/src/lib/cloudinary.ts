// lib/cloudinary.ts

// Cloudinary configuration for portfolio images
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dui0hakkq',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_PORTFOLIO || 'verinest_portfolio',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER_PORTFOLIO || 'portfolio/projects'
};

export interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
  api_key: string;
}

export const uploadToCloudinary = async (file: File, folder?: string): Promise<CloudinaryUploadResponse> => {
  // Check if Cloudinary is configured
  if (!CLOUDINARY_CONFIG.cloudName) {
    throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
  }

  if (!CLOUDINARY_CONFIG.uploadPreset) {
    throw new Error('Cloudinary upload preset is missing. Please check your environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  
  // Only append folder if provided and upload preset allows it
  if (folder) {
    formData.append('folder', folder);
  }
  
  // For unsigned uploads, ONLY include allowed parameters:
  // upload_preset, callback, public_id, folder, asset_folder, tags, context, 
  // metadata, face_coordinates, custom_coordinates, source, filename_override,
  // manifest_transformation, manifest_json, template, template_vars, regions, public_id_prefix
  
  // REMOVED transformation parameters that are not allowed with unsigned uploads
  // formData.append('quality', 'auto');
  // formData.append('fetch_format', 'auto');
  // formData.append('transformation', 'f_auto,q_auto:good');
  
  // Add timestamp for unique filename (using public_id_prefix instead of public_id)
  const timestamp = Date.now();
  const originalName = file.name.split('.')[0];
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9-_]/g, '_');
  formData.append('public_id', `portfolio_${sanitizedName}_${timestamp}`);

  try {
    console.log('📤 Uploading portfolio image to Cloudinary...', {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      folder: folder || CLOUDINARY_CONFIG.folder,
      fileSize: file.size,
      fileType: file.type
    });

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudinary upload failed:', errorText);
      
      let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use the text as is
      }
      
      throw new Error(errorMessage);
    }

    const data: CloudinaryUploadResponse = await response.json();
    console.log('✅ Portfolio image uploaded successfully:', {
      url: data.secure_url,
      size: data.bytes,
      dimensions: `${data.width}x${data.height}`,
      format: data.format,
      public_id: data.public_id
    });
    
    return data;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error('Failed to upload image to cloud storage');
  }
};

// Alternative method if you need transformations - apply them to the URL after upload
export const getOptimizedImageUrl = (originalUrl: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
} = {}): string => {
  if (!originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  // Insert transformations before the filename
  const parts = originalUrl.split('/upload/');
  if (parts.length !== 2) return originalUrl;

  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
};

// Utility to validate file before upload
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'Image size must be less than 10MB'
    };
  }

  return { isValid: true };
};

// Utility to create image preview
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to create image preview'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};