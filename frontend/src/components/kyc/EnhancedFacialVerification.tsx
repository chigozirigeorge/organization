// components/professional-kyc/EnhancedFacialVerification.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Camera, RefreshCw, CheckCircle, ArrowLeft, AlertCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, AlertDescription } from '../ui/alert';

interface EnhancedFacialVerificationProps {
  onComplete: (selfieUrl: string) => void;
  onBack?: () => void;
}

const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dui0hakkq',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_SELFIES || 'verinest_selfies',
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER_SELFIES || 'verifications/selfies'
};

export const EnhancedFacialVerification = ({ onComplete, onBack }: EnhancedFacialVerificationProps) => {
  const { token } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [faceDetection, setFaceDetection] = useState({
    isDetecting: false,
    isFaceVisible: false,
    positionScore: 0,
    stabilityScore: 0
  });
  const detectionInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setIsCameraSupported(false);
      setCameraError('Camera access is not supported in your browser');
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  const simulateFaceDetection = () => {
    // In a real implementation, integrate with a face detection library like face-api.js
    const context = detectionCanvasRef.current?.getContext('2d');
    if (!context || !videoRef.current) return;

    const video = videoRef.current;
    context.drawImage(video, 0, 0, 300, 300);

    // Simulate face detection logic
    const isFaceVisible = Math.random() > 0.3; // Replace with actual face detection
    const positionScore = isFaceVisible ? Math.min(100, Math.random() * 30 + 70) : 0;
    const stabilityScore = isFaceVisible ? Math.min(100, Math.random() * 20 + 80) : 0;

    setFaceDetection({
      isDetecting: true,
      isFaceVisible,
      positionScore,
      stabilityScore
    });

    // Auto-capture when conditions are optimal
    if (positionScore > 85 && stabilityScore > 90 && !capturedImage) {
      setTimeout(() => {
        captureOptimalImage();
      }, 1000);
    }
  };

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
        
        videoRef.current.onloadedmetadata = () => {
          // Start face detection simulation
          detectionInterval.current = setInterval(simulateFaceDetection, 500);
        };
      }
    } catch (error: any) {
      console.error('Camera access error:', error);
      handleCameraError(error);
    }
  };

  const handleCameraError = (error: any) => {
    let errorMessage = 'Cannot access camera. ';
    if (error.name === 'NotAllowedError') {
      errorMessage += 'Please allow camera permissions and refresh the page.';
    } else if (error.name === 'NotFoundError') {
      errorMessage += 'No camera found on your device.';
    } else {
      errorMessage += 'Please check permissions and try again.';
    }
    
    setCameraError(errorMessage);
    toast.error('Camera access failed');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
  };

  const captureOptimalImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Create oval mask for professional look
      context.save();
      context.beginPath();
      context.ellipse(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.4,
        canvas.height * 0.5,
        0, 0, 2 * Math.PI
      );
      context.clip();
      
      // Draw image with oval mask
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.restore();

      // Add professional styling
      context.strokeStyle = '#3B82F6';
      context.lineWidth = 4;
      context.beginPath();
      context.ellipse(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.4,
        canvas.height * 0.5,
        0, 0, 2 * Math.PI
      );
      context.stroke();

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
      stopCamera();
      
      toast.success('Professional photo captured successfully');
    }
  };

  const uploadToCloudinary = async (blob: Blob): Promise<string> => {
    if (!CLOUDINARY_CONFIG.cloudName) {
      throw new Error('Cloudinary configuration missing');
    }

    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', CLOUDINARY_CONFIG.folder);
    formData.append('quality', 'auto:best');
    formData.append('fetch_format', 'auto');
    
    const timestamp = Date.now();
    formData.append('public_id', `professional_selfie_${timestamp}`);

    try {
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;
      const response = await fetch(uploadUrl, { method: 'POST', body: formData });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw new Error('Failed to upload selfie');
    }
  };

  const uploadImage = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const cloudinaryUrl = await uploadToCloudinary(blob);
      
      toast.success('Facial verification completed!');
      onComplete(cloudinaryUrl);
      
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage('');
    setCameraError('');
    setFaceDetection({ isDetecting: false, isFaceVisible: false, positionScore: 0, stabilityScore: 0 });
    startCamera();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">Professional Identity Verification</h3>
        <p className="text-gray-600 mt-2">
          Capture a professional headshot for identity confirmation
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Camera Section */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Professional Headshot
            </CardTitle>
            <CardDescription className="text-gray-600">
              Position your face within the oval frame for optimal capture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!capturedImage ? (
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[3/4]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Oval overlay for professional framing */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-80 border-2 border-blue-500 border-dashed rounded-full pointer-events-none">
                      <div className="absolute inset-0 border-2 border-white/20 rounded-full m-2"></div>
                    </div>
                  </div>

                  {/* Detection status */}
                  {faceDetection.isDetecting && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
                        <div className="flex items-center justify-between text-sm">
                          <span>Face Detection</span>
                          <span className={faceDetection.isFaceVisible ? 'text-green-400' : 'text-yellow-400'}>
                            {faceDetection.isFaceVisible ? 'Optimal' : 'Adjust Position'}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Position</span>
                            <span>{faceDetection.positionScore}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1">
                            <div 
                              className="bg-green-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${faceDetection.positionScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                      <div className="text-center text-white">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Camera Ready</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                <canvas ref={detectionCanvasRef} className="hidden" />
                
                <div className="flex gap-3">
                  {!stream ? (
                    <Button 
                      onClick={startCamera} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={!isCameraSupported}
                      size="lg"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isCameraSupported ? 'Start Professional Camera' : 'Camera Not Supported'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={captureOptimalImage} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Professional Photo
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[3/4]">
                  <img
                    src={capturedImage}
                    alt="Professional headshot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={retakePhoto} 
                    variant="outline" 
                    className="flex-1" 
                    disabled={loading}
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retake Photo
                  </Button>
                  <Button 
                    onClick={uploadImage} 
                    disabled={loading} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
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

        {/* Professional Guidelines */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Professional Photo Guidelines
            </CardTitle>
            <CardDescription className="text-gray-600">
              Follow these standards for optimal verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-100">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Professional Attire</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Wear professional clothing as you would for a business meeting
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-100">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <span className="text-sm font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Neutral Background</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Use a plain, professional background without distractions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-100">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <span className="text-sm font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Natural Lighting</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Face natural light sources for clear, professional illumination
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-100">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <span className="text-sm font-semibold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Professional Expression</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Maintain a professional, confident expression with eyes open
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Tips */}
            <div className="bg-blue-100/50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">Professional Standards</h4>
              <ul className="text-blue-800 text-xs space-y-1">
                <li>• Business casual or professional attire recommended</li>
                <li>• Ensure face is clearly visible without shadows</li>
                <li>• Maintain professional demeanor and expression</li>
                <li>• Avoid hats, sunglasses, or face coverings</li>
                <li>• Use high-quality camera settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {onBack && (
        <div className="flex justify-start pt-6">
          <Button variant="outline" onClick={onBack} disabled={loading} size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Previous Step
          </Button>
        </div>
      )}
    </div>
  );
};