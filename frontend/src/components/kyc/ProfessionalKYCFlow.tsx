// components/professional-kyc/CompleteProfessionalKYCFlow.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, Camera, FileText, UserCheck, ArrowLeft, ArrowRight, Shield, Scan, User } from 'lucide-react';
import { toast } from 'sonner';
import { TermsAndConditions } from '../Landingpage/TermsAndConditions';
import { PrivacyPolicy } from '../Landingpage/PrivacyPolicy';
import { EnhancedImageUpload } from './EnhancedImageUpload';
import { EnhancedFacialVerification } from './EnhancedFacialVerification';
import { PersonalInformationForm, PersonalInfoData } from './PersonalInformationForm';

type ProfessionalKYCStep = 'welcome' | 'terms' | 'privacy' | 'personal' | 'document' | 'facial' | 'review' | 'complete';

export const ProfessionalKYCFlow = () => {
  const { user, token, refreshUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ProfessionalKYCStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [privacyScrolled, setPrivacyScrolled] = useState(false);

  const [verificationData, setVerificationData] = useState({
    personalInfo: {} as PersonalInfoData,
    document_url: '',
    selfie_url: '',
  });

  const steps = [
    { key: 'welcome', title: 'Welcome', description: 'Get started with verification', icon: Shield },
    { key: 'terms', title: 'Terms', description: 'Review and accept terms', icon: FileText },
    { key: 'privacy', title: 'Privacy', description: 'Understand data usage', icon: UserCheck },
    { key: 'personal', title: 'Personal Info', description: 'Enter your details', icon: User },
    { key: 'document', title: 'ID Document', description: 'Scan your ID', icon: Scan },
    { key: 'facial', title: 'Biometric', description: 'Facial verification', icon: Camera },
    { key: 'review', title: 'Review', description: 'Confirm details', icon: UserCheck },
    { key: 'complete', title: 'Complete', description: 'Verification done', icon: CheckCircle }
  ];

  useEffect(() => {
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
    setCurrentStep('personal');
  };

  const handlePersonalInfo = (personalData: PersonalInfoData) => {
    setVerificationData(prev => ({ ...prev, personalInfo: personalData }));
    setCurrentStep('document');
  };

  const handleDocumentCapture = (documentUrl: string) => {
    setVerificationData(prev => ({ ...prev, document_url: documentUrl }));
    setCurrentStep('facial');
  };

  const handleFacialVerification = (selfieUrl: string) => {
    setVerificationData(prev => ({ ...prev, selfie_url: selfieUrl }));
    setCurrentStep('review');
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 60;
    if (scrolledToBottom && !termsScrolled) {
      setTermsScrolled(true);
    }
  };

  const handlePrivacyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 60;
    if (scrolledToBottom && !privacyScrolled) {
      setPrivacyScrolled(true);
    }
  };

  const submitVerification = async () => {
    setLoading(true);
    try {
      // Map document type to backend format
      const mapDocumentTypeToBackend = (docType: string): string => {
        const typeMap: { [key: string]: string } = {
          'nin': 'NationalId',
          'drivers_license': 'DriverLicense',
          'voters_card': 'NationalId',
          'international_passport': 'Passport'
        };
        return typeMap[docType] || 'NationalId';
      };

      const requestBody = {
        verification_type: mapDocumentTypeToBackend(verificationData.personalInfo.documentType),
        document_id: verificationData.personalInfo.documentId.trim(),
        nationality: verificationData.personalInfo.nationality.trim(),
        document_url: verificationData.document_url.trim(),
        selfie_url: verificationData.selfie_url.trim(),
        dob: verificationData.personalInfo.dateOfBirth,
        state: verificationData.personalInfo.stateOfOrigin,
        lga: verificationData.personalInfo.lga,
        nearest_landmark: verificationData.personalInfo.nearestLandmark || ''
      };

      console.log('🎯 Submitting verification data:', JSON.stringify(requestBody, null, 2));

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
        toast.success('Professional verification submitted successfully!');
        setCurrentStep('complete');
        
        await refreshUser();

        if (updateUser) {
          updateUser({ 
            kyc_verified: 'pending',
            verification_status: 'submitted'
          });
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || `HTTP ${response.status}` };
        }
        
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

  const getStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center mb-6">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Professional Identity Verification
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                Secure your account with our enterprise-grade verification process. 
                This ensures trust and security for all platform participants.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Shield, title: 'Bank-Level Security', desc: 'Enterprise-grade encryption' },
                  { icon: UserCheck, title: 'Trusted Community', desc: 'Verified professionals only' },
                  { icon: CheckCircle, title: 'Quick Process', desc: 'Typically 5-10 minutes' }
                ].map((item, index) => (
                  <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="h-12 w-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <item.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4">Verification Process:</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  {steps.slice(1).map((step, index) => (
                    <div key={step.key} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <step.icon className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>{step.title} - {step.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={() => setCurrentStep('terms')} 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                >
                  Begin Professional Verification
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <p className="text-gray-500 text-sm mt-4">
                  Protected by bank-level security standards • GDPR compliant
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'terms':
        return (
          <div className="space-y-6">
            <div className="h-[500px] overflow-y-auto border rounded-lg" onScroll={handleTermsScroll}>
              <TermsAndConditions />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('welcome')} size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleAcceptTerms} 
                disabled={!termsScrolled}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                I Accept Terms & Conditions
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
              <Button variant="outline" onClick={() => setCurrentStep('terms')} size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Terms
              </Button>
              <Button 
                onClick={handleAcceptPrivacy} 
                disabled={!privacyScrolled}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                I Accept Privacy Policy
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'personal':
        return (
          <PersonalInformationForm
            onSubmit={handlePersonalInfo}
            onBack={() => setCurrentStep('privacy')}
          />
        );

      case 'document':
        return (
          <EnhancedImageUpload
            onDocumentCapture={handleDocumentCapture}
            onBack={() => setCurrentStep('personal')}
            documentType={verificationData.personalInfo.documentType as any}
          />
        );

      case 'facial':
        return (
          <EnhancedFacialVerification
            onComplete={handleFacialVerification}
            onBack={() => setCurrentStep('document')}
          />
        );

      case 'review':
        return (
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Review Your Verification
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Please verify all information is correct before submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information Review */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Personal Information</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Document Type:</span>
                    <p className="text-gray-900">{verificationData.personalInfo.documentType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Document ID:</span>
                    <p className="text-gray-900">{verificationData.personalInfo.documentId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Nationality:</span>
                    <p className="text-gray-900">{verificationData.personalInfo.nationality}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">State of Origin:</span>
                    <p className="text-gray-900">{verificationData.personalInfo.stateOfOrigin}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">LGA:</span>
                    <p className="text-gray-900">{verificationData.personalInfo.lga}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Date of Birth:</span>
                    <p className="text-gray-900">
                      {new Date(verificationData.personalInfo.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document and Facial Review */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">ID Document</h4>
                  {verificationData.document_url && (
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={verificationData.document_url}
                        alt="Document preview"
                        className="w-full h-48 object-contain bg-gray-50"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600">Professional document scan completed</p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Facial Verification</h4>
                  {verificationData.selfie_url && (
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={verificationData.selfie_url}
                        alt="Selfie preview"
                        className="w-full h-48 object-contain bg-gray-50"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600">Professional headshot captured</p>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  Your information is encrypted and secure. By submitting, you confirm all details are accurate and complete.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep('facial')} size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Facial
                </Button>
                <Button 
                  onClick={submitVerification} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit for Verification
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'complete':
        return (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto h-24 w-24 rounded-full bg-green-500 flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Verification Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your professional identity verification is being processed. 
                You'll receive notification once completed, typically within 24-48 hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-green-200 max-w-2xl mx-auto">
                <h4 className="font-semibold text-gray-900 mb-4">What happens next?</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Our team reviews your submission for accuracy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <span>You'll receive email confirmation upon approval</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Full platform access will be granted automatically</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
                >
                  Continue to Dashboard
                </Button>
                <p className="text-gray-500 text-sm mt-4">
                  You can browse the platform while your verification is processing
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Professional Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Verification
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure your identity with our enterprise-grade verification process
          </p>
        </div>

        {/* Enhanced Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center flex-1 relative">
                <div className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 ${
                  index <= currentStepIndex 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                    : 'border-gray-300 text-gray-400 bg-white'
                } ${index === currentStepIndex ? 'ring-4 ring-blue-200 scale-110' : ''}`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-semibold transition-colors ${
                    index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative">
            <div className="absolute top-7 left-0 right-0 h-1 bg-gray-200 -z-10" />
            <div 
              className="absolute top-7 left-0 h-1 bg-blue-600 -z-10 transition-all duration-500 ease-out"
              style={{ 
                width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                background: 'linear-gradient(90deg, #3B82F6, #60A5FA)'
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {getStepContent()}
        </div>

        {/* Security Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Shield className="h-4 w-4" />
            <span>Bank-level security • Encrypted transmission • GDPR compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};