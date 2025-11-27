// components/DocumentUpload.tsx
import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, FileText, ArrowLeft, ArrowRight, AlertCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dui0hakkq',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'verinest_documents',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER || 'verifications/documents'
};

const AFRICAN_COUNTRIES = [
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'SD', name: 'Sudan' },
  { code: 'MA', name: 'Morocco' },
  { code: 'AO', name: 'Angola' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'CI', name: 'Ivory Coast' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'NE', name: 'Niger' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'ML', name: 'Mali' },
  { code: 'MW', name: 'Malawi' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'TD', name: 'Chad' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'GN', name: 'Guinea' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BI', name: 'Burundi' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'LY', name: 'Libya' },
  { code: 'CG', name: 'Congo' },
  { code: 'LR', name: 'Liberia' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'NA', name: 'Namibia' },
  { code: 'GM', name: 'Gambia' },
  { code: 'BW', name: 'Botswana' },
  { code: 'GA', name: 'Gabon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'RE', name: 'Réunion' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
];


export const DocumentUpload = ({ onComplete, onBack }: DocumentUploadProps) => {
  const [documentType, setDocumentType] = useState<'nin' | 'drivers_license' | 'voters_card' | 'international_passport'>('nin');
  const [documentNumber, setDocumentNumber] = useState('');
  const [nationality, setNationality] = useState('NG');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a JPEG, PNG, or PDF file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setDocumentFile(file);
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl('');
      }
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Check if Cloudinary is configured
    if (!CLOUDINARY_CONFIG.cloudName) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', CLOUDINARY_CONFIG.folder);
    
    // Additional optimization parameters
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');
    
    // Add timestamp for unique filenames
    const timestamp = Date.now();
    formData.append('public_id', `${documentType}_${timestamp}`);

    try {
      console.log('📤 Uploading to Cloudinary...', {
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
      console.log('✅ Cloudinary upload successful:', data);
      
      return data.secure_url;
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw new Error('Failed to upload document to cloud storage');
    }
  };

  const handleSubmit = async () => {
    if (!documentFile) {
      toast.error('Please upload your document');
      return;
    }

    if (!documentNumber) {
      toast.error('Please enter your document number');
      return;
    }

    // Validate NIN number format (11 digits)
    if (documentType === 'nin' && !/^\d{11}$/.test(documentNumber)) {
      toast.error('Please enter a valid 11-digit NIN number');
      return;
    }

    setUploading(true);
    try {
      const documentUrl = await uploadToCloudinary(documentFile);

       // Get country name from code
      const countryName = AFRICAN_COUNTRIES.find(country => country.code === nationality)?.name || 'Nigeria';
      
      // Prepare data for the next step
      const verificationData = {
        document_url: documentUrl,
        document_type: documentType,
        document_id: documentNumber,
        nationality: countryName,
      };
      
      console.log('✅ Document upload completed:', verificationData);
      onComplete(verificationData);
      
      toast.success('Document uploaded successfully!');
    } catch (error: any) {
      console.error('❌ Document upload failed:', error);
      toast.error(error.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentPlaceholder = () => {
    switch (documentType) {
      case 'nin': return 'Enter your 11-digit NIN (e.g., 12345678901)';
      case 'drivers_license': return 'Enter your driver\'s license number';
      case 'voters_card': return 'Enter your voter\'s card number';
      case 'international_passport': return 'Enter your passport number';
      default: return 'Enter document number';
    }
  };

  const getDocumentValidation = () => {
    switch (documentType) {
      case 'nin': 
        return 'Must be exactly 11 digits';
      case 'drivers_license':
        return 'Enter your driver\'s license number';
      case 'voters_card':
        return 'Enter your voter\'s card number';
      case 'international_passport':
        return 'Enter your passport number';
      default:
        return '';
    }
  };

  const clearFile = () => {
    setDocumentFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ID Document Verification</CardTitle>
        <CardDescription>
          Upload a clear photo of your government-issued ID document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your document will be securely stored and used only for verification purposes.
            We support NIN, Driver's License, Voter's Card, and International Passport.
          </AlertDescription>
        </Alert>

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

        <div className="space-y-4">
           {/* Nationality Selection */}
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality *</Label>
            <Select value={nationality} onValueChange={setNationality}>
              <SelectTrigger>
                <SelectValue placeholder="Select your nationality" />
              </SelectTrigger>
              <SelectContent>
                {AFRICAN_COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {country.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select your country of citizenship
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type *</Label>
            <Select value={documentType} onValueChange={(value: any) => {
              setDocumentType(value);
              setDocumentNumber(''); // Clear number when type changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nin">National Identity Number (NIN)</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
                <SelectItem value="voters_card">Voter's Card</SelectItem>
                <SelectItem value="international_passport">International Passport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber">Document Number *</Label>
            <Input
              id="documentNumber"
              placeholder={getDocumentPlaceholder()}
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className={documentType === 'nin' && documentNumber.length > 0 && !/^\d{11}$/.test(documentNumber) ? 'border-red-500' : ''}
            />
            {documentType === 'nin' && documentNumber.length > 0 && !/^\d{11}$/.test(documentNumber) && (
              <p className="text-sm text-red-500">NIN must be exactly 11 digits</p>
            )}
            <p className="text-sm text-muted-foreground">
              {getDocumentValidation()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentUpload">Upload Document *</Label>
            <div className="space-y-4">
              {/* File Upload Area */}
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileSelect}
                />
                
                {documentFile ? (
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-green-600" />
                    <p className="font-medium">{documentFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                    >
                      Change Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="font-medium">Click to upload document</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG, or PDF (max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="space-y-2">
                  <Label>Document Preview</Label>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <img 
                      src={previewUrl} 
                      alt="Document preview" 
                      className="max-h-48 mx-auto rounded object-contain"
                    />
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Ensure all text is clear and readable
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">Document Requirements:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Document must be valid and not expired</li>
            <li>• Photo must be clear and all text readable</li>
            <li>• File must be in JPG, PNG, or PDF format</li>
            <li>• Maximum file size: 5MB</li>
            <li>• Ensure good lighting when taking photos</li>
            <li>• Avoid glare and shadows on the document</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack} disabled={uploading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!documentFile || !documentNumber || uploading}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};