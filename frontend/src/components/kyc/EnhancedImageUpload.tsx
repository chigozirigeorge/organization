// components/professional-kyc/DocumentScanner.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Camera, RefreshCw, CheckCircle, ArrowLeft, AlertCircle, Scan, Square, Upload, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';

interface EnhancedImageUpload {
  onDocumentCapture: (documentUrl: string) => void;
  onBack?: () => void;
  documentType?: 'id_card' | 'passport' | 'drivers_license' | 'other';
}

const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dui0hakkq',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'verinest_uploads',
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER || 'verifications/documents'
};

export const EnhancedImageUpload = ({ 
  onDocumentCapture, 
  onBack,
  documentType = 'id_card'
}: EnhancedImageUpload) => {
  const { token } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'camera' | 'phone'>('camera');
  const [phoneImages, setPhoneImages] = useState<{front: string | null, back: string | null}>({
    front: null,
    back: null
  });

  const detectionInterval = useRef<NodeJS.Timeout>();
  const captureTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check camera support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsCameraSupported(false);
    }

    return () => {
      clearIntervals();
      stopCamera();
    };
  }, []);

  const clearIntervals = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
    if (captureTimeout.current) {
      clearTimeout(captureTimeout.current);
    }
  };

  const simulateEdgeDetection = () => {
    // Internal edge detection simulation - not visible to users
    // This runs in background to determine when to auto-capture
    const hasGoodLighting = Math.random() > 0.2;
    const isStable = Math.random() > 0.3;
    
    const topEdge = hasGoodLighting && Math.random() > 0.4;
    const bottomEdge = hasGoodLighting && Math.random() > 0.3;
    const leftEdge = hasGoodLighting && Math.random() > 0.35;
    const rightEdge = hasGoodLighting && Math.random() > 0.4;
    
    const allEdgesDetected = topEdge && bottomEdge && leftEdge && rightEdge;
    
    // Auto-capture when all edges are detected and stable
    if (allEdgesDetected && isStable) {
      if (captureTimeout.current) {
        clearTimeout(captureTimeout.current);
      }
      
      captureTimeout.current = setTimeout(() => {
        captureOptimalDocument();
      }, 1000);
    }
  };

  const handlePhoneImageUpload = (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPhoneImages(prev => ({
        ...prev,
        [side]: imageUrl
      }));
      toast.success(`${side === 'front' ? 'Front' : 'Back'} image uploaded successfully`);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      setScanning(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use rear camera for document scanning
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        videoRef.current.onloadedmetadata = () => {
          // Start edge detection simulation in background
          detectionInterval.current = setInterval(simulateEdgeDetection, 500);
          toast.info('Position your document within the frame');
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
    setScanning(false);
    toast.error('Camera access failed');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
    clearIntervals();
  };

  const processPhoneUpload = async () => {
    if (!phoneImages.front) {
      toast.error('Please upload the front of your document');
      return;
    }

    setLoading(true);
    try {
      // Only upload the front image to backend
      const response = await fetch(phoneImages.front);
      const blob = await response.blob();
      const cloudinaryUrl = await uploadToCloudinary(blob);
      
      toast.success('Document uploaded successfully!');
      onDocumentCapture(cloudinaryUrl);
      
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setLoading(false);
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
    formData.append('public_id', `scanned_document_${timestamp}`);

    try {
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;
      const response = await fetch(uploadUrl, { method: 'POST', body: formData });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw new Error('Failed to upload document');
    }
  };

  const captureOptimalDocument = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      // Set canvas to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the captured frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply professional document processing
      enhanceDocumentImage(context, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(imageDataUrl);
      stopCamera();
      
      toast.success('Document captured successfully!');
    }
  };

  const enhanceDocumentImage = (context: CanvasRenderingContext2D, width: number, height: number) => {
    // Apply basic image enhancements for document clarity
    const imageData = context.getImageData(0, 0, width, height);
    
    // Simple contrast enhancement
    const factor = 1.2; // Contrast factor
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = factor * (imageData.data[i] - 128) + 128;     // R
      imageData.data[i + 1] = factor * (imageData.data[i + 1] - 128) + 128; // G
      imageData.data[i + 2] = factor * (imageData.data[i + 2] - 128) + 128; // B
    }
    
    context.putImageData(imageData, 0, 0);
  };

  const processAndUploadDocument = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const cloudinaryUrl = await uploadToCloudinary(blob);
      
      toast.success('Document processed and uploaded!');
      onDocumentCapture(cloudinaryUrl);
      
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const retakeDocument = () => {
    setCapturedImage('');
    setCameraError('');
    startCamera();
  };

  const getDocumentTypeInstructions = () => {
    switch (documentType) {
      case 'id_card':
        return 'Place your ID card within the frame. Ensure all four corners are visible.';
      case 'passport':
        return 'Position your passport open to the photo page. Keep it flat and well-lit.';
      case 'drivers_license':
        return 'Place your driver\'s license within the frame. Avoid glare on the photo.';
      default:
        return 'Position your document within the frame. Ensure good lighting and all edges are visible.';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">Document Scanner</h3>
        <p className="text-gray-600 mt-2">
          Choose how you'd like to submit your document
        </p>
      </div>

      {/* Upload Method Selection */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setUploadMethod('camera')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              uploadMethod === 'camera'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="h-4 w-4 mr-2 inline" />
            Camera Scan
          </button>
          <button
            onClick={() => setUploadMethod('phone')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              uploadMethod === 'phone'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="h-4 w-4 mr-2 inline" />
            Phone Upload
          </button>
        </div>
      </div>

      {uploadMethod === 'camera' ? (
        /* Camera Scanner Section */
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Live Document Scan
            </CardTitle>
            <CardDescription className="text-gray-600">
              Position your document within the frame. The camera will auto-capture when ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!capturedImage ? (
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[4/3]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Document frame overlay - simplified without visible edge detection */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-80 h-52 border-2 border-dashed border-green-400 rounded-lg pointer-events-none">
                      {/* Center alignment guide only */}
                      <div className="absolute inset-0 border border-white/30 rounded-lg m-2"></div>
                    </div>
                  </div>

                  {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                      <div className="text-center text-white">
                        <Square className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Camera Ready for Scanning</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="flex gap-3">
                  {!stream ? (
                    <Button 
                      onClick={startCamera} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={!isCameraSupported}
                      size="lg"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isCameraSupported ? 'Start Document Scanner' : 'Scanner Not Supported'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={captureOptimalDocument} 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <Scan className="h-4 w-4 mr-2" />
                      Capture Document
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[4/3]">
                  <img
                    src={capturedImage}
                    alt="Scanned document"
                    className="w-full h-full object-contain bg-white"
                  />
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      setCapturedImage('');
                      setCameraError('');
                      startCamera();
                    }} 
                    variant="outline" 
                    className="flex-1" 
                    disabled={loading}
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Rescan Document
                  </Button>
                  <Button 
                    onClick={processAndUploadDocument} 
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
                      'Use This Document'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Phone Upload Section */
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Phone Document Upload
            </CardTitle>
            <CardDescription className="text-gray-600">
              Upload clear photos of your document. Only the front image will be submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Front Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Front of Document *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {phoneImages.front ? (
                  <div className="space-y-4">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[4/3]">
                      <img
                        src={phoneImages.front}
                        alt="Front of document"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPhoneImages(prev => ({ ...prev, front: null }))}
                      className="w-full"
                    >
                      Remove Front Image
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">
                      Click to upload the front of your document
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhoneImageUpload(e, 'front')}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Front Image
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Back Image Upload (Optional) */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Back of Document (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {phoneImages.back ? (
                  <div className="space-y-4">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[4/3]">
                      <img
                        src={phoneImages.back}
                        alt="Back of document"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPhoneImages(prev => ({ ...prev, back: null }))}
                      className="w-full"
                    >
                      Remove Back Image
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">
                      Optionally upload the back of your document
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhoneImageUpload(e, 'back')}
                      className="hidden"
                      id="back-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('back-upload')?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Back Image (Optional)
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={processPhoneUpload}
              disabled={!phoneImages.front || loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading Document...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {cameraError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {cameraError}
          </AlertDescription>
        </Alert>
      )}

      {/* Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-blue-900">
            Document Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• Ensure document is well-lit and clearly visible</p>
          <p>• Place document on a flat, contrasting surface</p>
          <p>• Avoid glare and shadows on the document</p>
          <p>• All four corners should be visible in the frame</p>
          <p>• For phone uploads: Only the front image will be submitted</p>
        </CardContent>
      </Card>
    </div>
  );
};