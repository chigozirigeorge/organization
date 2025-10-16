// components/FacialVerification.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Camera, RefreshCw, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';

interface FacialVerificationProps {
  onComplete: (selfieUrl: string) => void;
  onBack?: () => void;
}

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dui0hakkq',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_SELFIES || 'verinest_selfies',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER_SELFIES || 'verifications/selfies'
};

export const FacialVerification = ({ onComplete, onBack }: FacialVerificationProps) => {
  const { token } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [isCameraSupported, setIsCameraSupported] = useState(true);

  // Check camera support on component mount
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsCameraSupported(false);
      setCameraError('Camera access is not supported in your browser');
    }
  }, []);

  // Clean up stream on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setCameraError('');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Camera started successfully');
        };
      }
    } catch (error: any) {
      console.error('❌ Error accessing camera:', error);
      
      let errorMessage = 'Cannot access camera. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and refresh the page.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on your device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in your browser.';
      } else {
        errorMessage += 'Please check permissions and try again.';
      }
      
      setCameraError(errorMessage);
      toast.error('Camera access failed');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        toast.error('Failed to capture image');
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to JPEG with quality
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
      stopCamera();
      
      console.log('📸 Image captured successfully');
    }
  };

  const uploadToCloudinary = async (blob: Blob): Promise<string> => {
    // Check if Cloudinary is configured
    if (!CLOUDINARY_CONFIG.cloudName) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', CLOUDINARY_CONFIG.folder);
    
    // Additional optimization parameters for selfies
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');
    
    // Add timestamp for unique filename
    const timestamp = Date.now();
    formData.append('public_id', `selfie_${timestamp}`);

    try {
      console.log('📤 Uploading selfie to Cloudinary...', {
        cloudName: CLOUDINARY_CONFIG.cloudName,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        folder: CLOUDINARY_CONFIG.folder
      });

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Cloudinary upload failed:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Selfie uploaded successfully:', data);
      
      return data.secure_url;
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw new Error('Failed to upload selfie to cloud storage');
    }
  };

  // const saveToBackend = async (selfieUrl: string): Promise<boolean> => {
  //   try {
  //     const saveResponse = await fetch('https://verinest.up.railway.app/api/verification/facial', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         selfie_url: selfieUrl,
  //         verification_type: 'facial',
  //       }),
  //     });

  //     if (saveResponse.ok) {
  //       console.log('✅ Facial verification saved to backend');
  //       return true;
  //     } else {
  //       const errorData = await saveResponse.json().catch(() => ({}));
  //       throw new Error(errorData.message || `Backend save failed: ${saveResponse.status}`);
  //     }
  //   } catch (error) {
  //     console.error('❌ Backend save error:', error);
  //     throw error;
  //   }
  // };

  const uploadImage = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      console.log('🔄 Starting selfie upload process...');

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(blob);
      
      // // Save to backend
      // await saveToBackend(cloudinaryUrl);

      toast.success('Facial verification completed!');
      onComplete(cloudinaryUrl);
      
    } catch (error: any) {
      console.error('❌ Selfie upload failed:', error);
      toast.error(error.message || 'Failed to upload selfie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage('');
    setCameraError('');
    startCamera();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Facial Verification</h3>
        <p className="text-muted-foreground">
          Take a clear selfie for identity verification
        </p>
      </div>

      {/* Cloudinary Config Debug (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800 text-xs">
            <strong>Cloudinary Config:</strong> {CLOUDINARY_CONFIG.cloudName ? 'Configured' : 'Missing'} | 
            Preset: {CLOUDINARY_CONFIG.uploadPreset} | 
            Folder: {CLOUDINARY_CONFIG.folder}
          </AlertDescription>
        </Alert>
      )}

      {/* Camera Error Alert */}
      {cameraError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{cameraError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Camera Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Take Selfie</CardTitle>
            <CardDescription>
              Ensure good lighting and face the camera directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!capturedImage ? (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50 rounded-lg">
                      <div className="text-center">
                        <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Camera not active</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="flex gap-3">
                  {!stream ? (
                    <Button 
                      onClick={startCamera} 
                      className="flex-1"
                      disabled={!isCameraSupported}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isCameraSupported ? 'Start Camera' : 'Camera Not Supported'}
                    </Button>
                  ) : (
                    <Button onClick={captureImage} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                  )}
                </div>

                {!isCameraSupported && (
                  <Alert variant="destructive" className="text-sm">
                    <AlertDescription>
                      Your browser doesn't support camera access. Please try using Chrome, Firefox, or Safari.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <img
                    src={capturedImage}
                    alt="Captured selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={retakePhoto} variant="outline" className="flex-1" disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  <Button onClick={uploadImage} disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      'Use This Photo'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Instructions</CardTitle>
            <CardDescription>
              Follow these guidelines for a successful verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium">Good Lighting</p>
                  <p className="text-muted-foreground">Ensure your face is well-lit without shadows</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium">Neutral Expression</p>
                  <p className="text-muted-foreground">Face the camera directly with a neutral expression</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium">No Accessories</p>
                  <p className="text-muted-foreground">Remove hats, sunglasses, or face coverings</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium mt-0.5">
                  4
                </div>
                <div>
                  <p className="font-medium">Clear View</p>
                  <p className="text-muted-foreground">Make sure your entire face is visible and in focus</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium mt-0.5">
                  5
                </div>
                <div>
                  <p className="font-medium">Recent Photo</p>
                  <p className="text-muted-foreground">Should match your current appearance</p>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">Tips for Best Results:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use natural light when possible</li>
                <li>• Keep the camera at eye level</li>
                <li>• Ensure your eyes are clearly visible</li>
                <li>• Avoid using filters or beauty modes</li>
                <li>• Take the photo in a well-lit room</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add back button if onBack is provided */}
      {onBack && (
        <div className="flex justify-start pt-4">
          <Button variant="outline" onClick={onBack} disabled={loading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
};