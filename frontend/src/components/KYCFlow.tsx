// components/KYCFlow.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, Camera, FileText, UserCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { TermsAndConditions } from './TermsAndConditions';
import { PrivacyPolicy } from './PrivacyPolicy';
import { DocumentUpload } from './DocumentUpload';
import { FacialVerification } from './FacialVerification';
import { LocationVerification } from './LocationVerification';
import { PersonalInformation } from './PersonalInformation';

type KYCStep = 'terms' | 'privacy' | 'document' | 'personal' | 'facial' | 'location' | 'complete';

export const KYCFlow = () => {
  const { user, token, refreshUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<KYCStep>('terms');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState({
    document_url: '',
    selfie_url: '',
    document_id: '',
    document_type: 'nin' as 'nin' | 'drivers_license' | 'voters_card' | 'international_passport',
    state: '',
    lga: '',
    dob: '',
    nearest_landmark: '',
    nationality: ''
  });

  const [termsScrolled, setTermsScrolled] = useState(false);
  const [privacyScrolled, setPrivacyScrolled] = useState(false);

  const steps: { key: KYCStep; title: string; description: string; icon: any }[] = [
    { key: 'terms', title: 'Terms & Conditions', description: 'Review and accept our terms', icon: FileText },
    { key: 'privacy', title: 'Privacy Policy', description: 'Understand how we protect your data', icon: UserCheck },
    { key: 'document', title: 'ID Verification', description: 'Upload your government ID', icon: FileText },
    { key: 'personal', title: 'Personal Info', description: 'Provide your date of birth', icon: UserCheck },
    { key: 'facial', title: 'Facial Verification', description: 'Take a selfie for identity confirmation', icon: Camera },
    { key: 'location', title: 'Location Details', description: 'Provide your location information', icon: UserCheck },
    { key: 'complete', title: 'Verification Complete', description: 'Your verification is being processed', icon: CheckCircle }
  ];

  useEffect(() => {
    // Check if user has already completed some steps
    if (user?.kyc_verified === 'pending') {
      setCurrentStep('complete');
    }
  }, [user]);

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    setCurrentStep('privacy');
  };

  const handleAcceptPrivacy = () => {
    setAcceptedPrivacy(true);
    setCurrentStep('document');
  };

  // Add scroll handlers for terms and privacy
  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 60; // 50px buffer
    
    if (scrolledToBottom && !termsScrolled) {
      setTermsScrolled(true);
    }
  };

  const handlePrivacyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 60; // 50px buffer
    
    if (scrolledToBottom && !privacyScrolled) {
      setPrivacyScrolled(true);
    }
  };


  const handleDocumentUpload = (data: any) => {
    setVerificationData(prev => ({ ...prev, ...data }));
    setCurrentStep('personal');
  };

  const handlePersonalInfo = (personalData: { dob: string }) => {
  setVerificationData(prev => ({ ...prev, ...personalData }));
  setCurrentStep('facial');
};

  const handleFacialVerification = (selfieUrl: string) => {
    setVerificationData(prev => ({ ...prev, selfie_url: selfieUrl }));
    setCurrentStep('location');
  };

  const handleLocationSubmit = (locationData: { state: string; lga: string; nearest_landmark: string }) => {
    setVerificationData(prev => ({ ...prev, ...locationData }));
    submitVerification();
  };

const submitVerification = async () => {
  setLoading(true);
  try {
    // Validate required fields before sending
    if (!verificationData.document_url || verificationData.document_url.trim().length === 0) {
      throw new Error('Document URL is required');
    }
    if (!verificationData.selfie_url || verificationData.selfie_url.trim().length === 0) {
      throw new Error('Selfie URL is required');
    }
    if (!verificationData.document_id || verificationData.document_id.trim().length === 0) {
      throw new Error('Document ID is required');
    }
    if (!verificationData.nationality || verificationData.nationality.trim().length === 0) {
      throw new Error('Nationality is required');
    }

    // Map document type to backend format
    const mapDocumentTypeToBackend = (docType: string): string => {
      const typeMap: { [key: string]: string } = {
        'nin': 'NationalId',           // Changed to PascalCase
        'drivers_license': 'DriverLicense', // Changed to PascalCase
        'voters_card': 'NationalId',   // Changed to PascalCase
        'international_passport': 'Passport' // Changed to PascalCase
      };
      return typeMap[docType] || 'NationalId';
    };

    const requestBody = {
      verification_type: mapDocumentTypeToBackend(verificationData.document_type),
      document_id: verificationData.document_id.trim(),
      nationality: verificationData.nationality.trim(),
      document_url: verificationData.document_url.trim(),
      selfie_url: verificationData.selfie_url.trim(),
      dob: verificationData.dob,
      lga: verificationData.lga,
      nearest_landmark: verificationData.nearest_landmark
    };

    // Add optional fields only if they exist and are not empty
    if (verificationData.dob && verificationData.dob.trim().length > 0) {
      requestBody.dob = new Date(verificationData.dob).toISOString();
    }
    if (verificationData.lga && verificationData.lga.trim().length > 0) {
      requestBody.lga = verificationData.lga.trim();
    }
    if (verificationData.nearest_landmark && verificationData.nearest_landmark.trim().length > 0) {
      requestBody.nearest_landmark = verificationData.nearest_landmark.trim();
    }

    console.log('🎯 Final request body:', JSON.stringify(requestBody, null, 2));
    console.log('🔍 Field lengths:', {
      document_url_length: requestBody.document_url.length,
      selfie_url_length: requestBody.selfie_url.length,
      document_id_length: requestBody.document_id.length,
      nationality_length: requestBody.nationality.length
    });

    const response = await fetch('https://verinest.up.railway.app/api/verification/document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('📨 Response status:', response.status);
    console.log('📨 Response body:', responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      toast.success('Verification submitted successfully!');
      setCurrentStep('complete');
      
      await refreshUser();

      // Update local user state immediately
      if (updateUser) {
        updateUser({ 
          kyc_verified: 'pending',
          verification_status: 'submitted'
        });
      }

      setCurrentStep('complete');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || `HTTP ${response.status}` };
      }
      console.error('❌ Backend error details:', errorData);
      
      // Provide more specific error messages
      if (response.status === 422) {
        throw new Error('Validation failed. Please check that all required fields are filled correctly.');
      } else if (response.status === 400) {
        throw new Error(errorData.message || 'Invalid data submitted. Please check your information.');
      } else {
        throw new Error(errorData.message || `Verification failed: ${response.status}`);
      }
    }
  } catch (error: any) {
    console.error('❌ Submission failed:', error);
    toast.error(error.message || 'Failed to submit verification');
  } finally {
    setLoading(false);
  }
};

  const goBack = () => {
    const stepIndex = steps.findIndex(step => step.key === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'terms':
        return (
          <div className="space-y-6">
            <div className="h-[500px] overflow-y-auto border rounded-lg" onScroll={handleTermsScroll}>
              <TermsAndConditions />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button 
                onClick={handleAcceptTerms} 
                disabled={!termsScrolled} // Enable only after scrolling
              >
                I Accept Terms
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="h-[500px] overflow-y-auto border rounded-lg" onScroll={handlePrivacyScroll}>
              <PrivacyPolicy />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('terms')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Terms
              </Button>
              <Button 
                onClick={handleAcceptPrivacy} 
                disabled={!privacyScrolled} // Enable only after scrolling
              >
                I Accept Privacy Policy
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'document':
        return (
          <DocumentUpload 
            onComplete={handleDocumentUpload}
            onBack={() => setCurrentStep('privacy')}
          />
        );

      case 'personal':
        return (
          <PersonalInformation
            onSubmit={handlePersonalInfo}
            onBack={() => setCurrentStep('document')}
          />
        ); 

      case 'facial':
        return (
          <FacialVerification 
            onComplete={handleFacialVerification}
            onBack={() => setCurrentStep('personal')}
          />
        );

      case 'location':
  return (
    <div className="space-y-6">
      {/* Debug Section - Add this here */}
      {process.env.NODE_ENV === 'development' && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800 text-xs">
            <strong>Debug - Data to be submitted:</strong><br />
            Document Type: {verificationData.document_type}<br />
            Document ID: {verificationData.document_id}<br />
            Nationality: {verificationData.nationality}<br />
            DOB: {verificationData.dob}<br />
            Has Document: {verificationData.document_url ? '✅ Yes' : '❌ No'}<br />
            Has Selfie: {verificationData.selfie_url ? '✅ Yes' : '❌ No'}<br />
            State: {verificationData.state}<br />
            LGA: {verificationData.lga}<br />
            Landmark: {verificationData.nearest_landmark || 'Not provided'}
          </AlertDescription>
        </Alert>
      )}
      
      <LocationVerification 
        onSubmit={handleLocationSubmit}
        onBack={() => setCurrentStep('facial')}
        loading={loading}
      />
    </div>
  );

      case 'complete':
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Verification Submitted!</CardTitle>
              <CardDescription>
                Your KYC verification has been submitted and is under review.
                You'll be notified once it's completed.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <AlertDescription>
                  Verification typically takes 24-48 hours. You can still browse the platform while waiting.
                </AlertDescription>
              </Alert>
              <Button onClick={() => navigate('/dashboard')}>
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStepIndex 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-300"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Content */}
        {getStepContent()}

        {/* Quick Navigation */}
        {currentStep !== 'complete' && (
          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              {steps.map((step, index) => (
                <button
                  key={step.key}
                  onClick={() => setCurrentStep(step.key)}
                  className={`w-3 h-3 rounded-full ${
                    step.key === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};