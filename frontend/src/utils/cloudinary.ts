interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
}

export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResponse> => {
  // Cloudinary configuration - use your actual credentials
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = 'verinest_portfolio'; // Use your portfolio preset for avatars
  const folder = 'verinest/avatars'; // Create avatars folder
  
  if (!cloudName) {
    console.error('Cloudinary cloud name not configured');
    throw new Error('Cloudinary not properly configured');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      bytes: data.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Fallback method for development - upload directly to backend
export const uploadToBackend = async (file: File): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    const response = await fetch('https://api.verinest.xyz/api/users/upload-avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // If backend returns the avatar URL, use that
    if (data.avatar_url) {
      return {
        secure_url: data.avatar_url,
        public_id: data.public_id || `backend_${Date.now()}`,
        format: 'jpg',
        bytes: file.size,
      };
    }
    
    // Otherwise, create a mock response
    return {
      secure_url: `https://ui-avatars.com/api/?name=uploaded&background=6366f1&color=fff&size=200`,
      public_id: `backend_${Date.now()}`,
      format: 'jpg',
      bytes: file.size,
    };
  } catch (error) {
    console.error('Backend upload error:', error);
    throw error;
  }
};

export const createCloudinarySignature = async (params: any) => {
  // This would be used for signed uploads if needed
  // For now, we'll use unsigned uploads with upload preset
  return null;
};
