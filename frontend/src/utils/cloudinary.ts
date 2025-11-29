interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
}

export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResponse> => {
  // Cloudinary configuration
  const cloudName = 'YOUR_CLOUDINARY_CLOUD_NAME'; // Replace with your cloud name
  const uploadPreset = 'profile_pictures'; // Create this preset in Cloudinary dashboard
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'verinest/avatars');
  
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

export const createCloudinarySignature = async (params: any) => {
  // This would be used for signed uploads if needed
  // For now, we'll use unsigned uploads with upload preset
  return null;
};
