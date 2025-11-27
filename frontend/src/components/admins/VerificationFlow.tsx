// components/VerificationFlow.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Camera, FileText, UserCheck, Wallet, Briefcase, UserPlus, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { TermsAndConditions } from '../Landingpage/TermsAndConditions';
import { PrivacyPolicy } from '../Landingpage/PrivacyPolicy';
import { RoleSelection } from '../shared/RoleSelection';
import { DocumentUpload } from '../shared/DocumentUpload';
import { FacialVerification } from '../FacialVerification';
import { WalletManagement } from '../shared/WalletManagement';
import { toast } from 'sonner';

// Create simplified versions of the components for the verification flow
const WalletSetup = ({ onComplete, compact }: { onComplete: () => void; compact?: boolean }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://verinest.up.railway.app/api/wallet/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Wallet created successfully!');
        onComplete();
      } else {
        const errorData = await response.json().catch(() => ({}));
        // If wallet already exists, still mark as complete
        if (response.status === 400 && errorData.message?.includes('already exists')) {
          toast.info('Wallet already exists');
          onComplete();
        } else {
          throw new Error(errorData.message || 'Failed to create wallet');
        }
      }
    } catch (error: any) {
      console.error('Wallet creation failed:', error);
      toast.error(error.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={compact ? 'max-w-2xl mx-auto' : ''}>
      <CardHeader>
        <CardTitle>Wallet Setup</CardTitle>
        <CardDescription>
          Create your digital wallet to send and receive payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Digital Wallet</h3>
            <p className="text-muted-foreground">
              Your wallet allows you to securely store funds and make transactions
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Secure Storage</p>
              <p className="text-sm text-muted-foreground">Bank-level security for your funds</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Instant Transfers</p>
              <p className="text-sm text-muted-foreground">Send and receive money instantly</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Easy Withdrawals</p>
              <p className="text-sm text-muted-foreground">Withdraw to your bank account anytime</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleCreateWallet} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Creating Wallet...' : 'Create Wallet'}
        </Button>
      </CardContent>
    </Card>
  );
};

const BankAccountSetup = ({ onComplete, compact }: { onComplete: () => void; compact?: boolean }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState({
    account_name: '',
    account_number: '',
    bank_code: ''
  });

  const banks = [
    { code: '044', name: 'Access Bank' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '033', name: 'United Bank for Africa' },
    { code: '057', name: 'Zenith Bank' },
    { code: '011', name: 'First Bank' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '068', name: 'Standard Chartered Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '032', name: 'Union Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '070', name: 'Fidelity Bank' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://verinest.up.railway.app/api/wallet/bank-accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      if (response.ok) {
        toast.success('Bank account added successfully!');
        onComplete();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add bank account');
      }
    } catch (error: any) {
      console.error('Failed to add bank account:', error);
      toast.error(error.message || 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={compact ? 'max-w-2xl mx-auto' : ''}>
      <CardHeader>
        <CardTitle>Add Bank Account</CardTitle>
        <CardDescription>
          Link your bank account for withdrawals and payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="account_name" className="text-sm font-medium">
              Account Name
            </label>
            <input
              id="account_name"
              type="text"
              required
              value={accountData.account_name}
              onChange={(e) => setAccountData({ ...accountData, account_name: e.target.value })}
              placeholder="Enter account name as it appears on your bank statement"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="account_number" className="text-sm font-medium">
              Account Number
            </label>
            <input
              id="account_number"
              type="text"
              required
              value={accountData.account_number}
              onChange={(e) => setAccountData({ ...accountData, account_number: e.target.value })}
              placeholder="Enter 10-digit account number"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bank_code" className="text-sm font-medium">
              Bank
            </label>
            <select
              id="bank_code"
              required
              value={accountData.bank_code}
              onChange={(e) => setAccountData({ ...accountData, bank_code: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select your bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !accountData.account_name || !accountData.account_number || !accountData.bank_code}
            className="w-full"
          >
            {loading ? 'Adding Bank Account...' : 'Add Bank Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const WorkerProfileSetup = ({ onComplete, compact }: { onComplete: () => void; compact?: boolean }) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    skills: '',
    experience: '',
    bio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile setup completed!');
      onComplete();
    } catch (error) {
      toast.error('Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={compact ? 'max-w-2xl mx-auto' : ''}>
      <CardHeader>
        <CardTitle>Complete Your Worker Profile</CardTitle>
        <CardDescription>
          Tell us about your skills and experience to help employers find you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="skills" className="text-sm font-medium">
              Skills
            </label>
            <input
              id="skills"
              type="text"
              required
              value={profileData.skills}
              onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
              placeholder="e.g., Plumbing, Electrical Work, Carpentry"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="experience" className="text-sm font-medium">
              Years of Experience
            </label>
            <select
              id="experience"
              required
              value={profileData.experience}
              onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select experience level</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              required
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Tell us about yourself and your work experience..."
              rows={4}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Saving Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const CreateJob = ({ onComplete, compact }: { onComplete: () => void; compact?: boolean }) => {
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Job template created!');
      onComplete();
    } catch (error) {
      toast.error('Failed to create job template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={compact ? 'max-w-2xl mx-auto' : ''}>
      <CardHeader>
        <CardTitle>Create Your First Job</CardTitle>
        <CardDescription>
          Set up a job template to quickly post jobs when you need workers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Job Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={jobData.title}
              onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
              placeholder="e.g., House Cleaning, Plumbing Repair, Electrical Installation"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              required
              value={jobData.category}
              onChange={(e) => setJobData({ ...jobData, category: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select category</option>
              <option value="cleaning">Cleaning</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="carpentry">Carpentry</option>
              <option value="painting">Painting</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Job Description
            </label>
            <textarea
              id="description"
              required
              value={jobData.description}
              onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
              placeholder="Describe the job requirements and expectations..."
              rows={4}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Job Template...' : 'Create Job Template'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

type VerificationStep = 
  | 'terms'
  | 'document'
  | 'facial'
  | 'role'
  | 'wallet'
  | 'bank'
  | 'profile'
  | 'complete';

export const VerificationFlow = () => {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<VerificationStep>('terms');
  const [completedSteps, setCompletedSteps] = useState<VerificationStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState({
    documentUrl: '',
    selfieUrl: '',
    documentType: 'nin' as 'nin' | 'driver_license' | 'passport',
    documentId: '',
    role: '' as 'worker' | 'employer' | '',
  });

  const steps: { key: VerificationStep; title: string; description: string; icon: React.ReactNode }[] = [
    { key: 'terms', title: 'Terms & Privacy', description: 'Review and accept our policies', icon: <FileText className="h-5 w-5" /> },
    { key: 'document', title: 'ID Verification', description: 'Upload your government ID', icon: <FileText className="h-5 w-5" /> },
    { key: 'facial', title: 'Facial Verification', description: 'Take a selfie for verification', icon: <Camera className="h-5 w-5" /> },
    { key: 'role', title: 'Choose Role', description: 'Select how you want to use VeriNest', icon: <UserCheck className="h-5 w-5" /> },
    { key: 'wallet', title: 'Setup Wallet', description: 'Create your digital wallet', icon: <Wallet className="h-5 w-5" /> },
    { key: 'bank', title: 'Bank Account', description: 'Link your bank account', icon: <Wallet className="h-5 w-5" /> },
    { key: 'profile', title: 'Complete Profile', description: 'Finish your profile setup', icon: <UserCheck className="h-5 w-5" /> },
    { key: 'complete', title: 'Ready!', description: 'Start using VeriNest', icon: <CheckCircle className="h-5 w-5" /> },
  ];

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('verificationProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCompletedSteps(progress.completedSteps || []);
      setCurrentStep(progress.currentStep || 'terms');
      setVerificationData(progress.data || {});
    }
  }, []);

  const saveProgress = () => {
    localStorage.setItem('verificationProgress', JSON.stringify({
      currentStep,
      completedSteps,
      data: verificationData,
    }));
  };

  const markStepComplete = (step: VerificationStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
    saveProgress();
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      markStepComplete(currentStep);
      
      const stepIndex = steps.findIndex(s => s.key === currentStep);
      if (stepIndex < steps.length - 1) {
        setCurrentStep(steps[stepIndex + 1].key);
      } else {
        // Final completion
        await handleVerificationComplete();
      }
    } catch (error) {
      console.error('Error proceeding to next step:', error);
      toast.error('Failed to proceed to next step');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const stepIndex = steps.findIndex(s => s.key === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key);
    }
  };

  const handleVerificationComplete = async () => {
    try {
      // Update user verification status
      const response = await fetch('https://verinest.up.railway.app/api/verification/complete-status', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verification_status: 'submitted',
          verification_data: verificationData,
        }),
      });

      if (response.ok) {
        // Clear progress
        localStorage.removeItem('verificationProgress');
        
        // Update user context
        if (updateUser) {
          const userResponse = await fetch('https://verinest.up.railway.app/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            updateUser(userData);
          }
        }

        toast.success('Verification completed successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error completing verification:', error);
      toast.error('Failed to complete verification');
    }
  };

  const handleSkipToDashboard = () => {
    navigate('/dashboard');
  };

  const updateVerificationData = (data: Partial<typeof verificationData>) => {
    setVerificationData(prev => ({ ...prev, ...data }));
    saveProgress();
  };

  const progress = (completedSteps.length / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 'terms':
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <TermsAndConditions />
              <PrivacyPolicy />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="agree-terms"
                className="rounded border-gray-300"
                onChange={(e) => {
                  if (e.target.checked) {
                    markStepComplete('terms');
                  }
                }}
              />
              <label htmlFor="agree-terms" className="text-sm">
                I agree to the Terms & Conditions and Privacy Policy
              </label>
            </div>
          </div>
        );

      case 'document':
        return (
          <DocumentUpload
            onComplete={(data: any) => {
              updateVerificationData({
                documentUrl: data.document_url,
                documentId: data.nin_number,
                documentType: data.document_type,
              });
              markStepComplete('document');
              handleNext();
            }}
            onBack={handleBack}
          />
        );

      case 'facial':
        return (
          <FacialVerification
            onComplete={(selfieUrl: string) => {
              updateVerificationData({ selfieUrl });
              markStepComplete('facial');
              handleNext();
            }}
            onBack={handleBack}
          />
        );

      case 'role':
        return (
          <RoleSelection
            onSelect={(role: 'worker' | 'employer') => {
              updateVerificationData({ role });
              markStepComplete('role');
              handleNext();
            }}
            selectedRole={verificationData.role}
          />
        );

      case 'wallet':
        return (
          <WalletSetup
            onComplete={() => {
              markStepComplete('wallet');
              handleNext();
            }}
            compact={true}
          />
        );

      case 'bank':
        return (
          <BankAccountSetup
            onComplete={() => {
              markStepComplete('bank');
              handleNext();
            }}
            compact={true}
          />
        );

      case 'profile':
        return verificationData.role === 'worker' ? (
          <WorkerProfileSetup
            onComplete={() => {
              markStepComplete('profile');
              handleNext();
            }}
            compact={true}
          />
        ) : (
          <CreateJob
            onComplete={() => {
              markStepComplete('profile');
              handleNext();
            }}
            compact={true}
          />
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Setup Complete!</h3>
              <p className="text-muted-foreground mt-2">
                You're all set to start using VeriNest. {verificationData.role === 'worker' 
                  ? 'Browse available jobs and start working.' 
                  : 'Post jobs and find skilled workers.'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = completedSteps.includes(currentStep);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Follow these steps to verify your identity and start using VeriNest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 text-center ${
                    currentStep === step.key
                      ? 'border-primary bg-primary/5'
                      : completedSteps.includes(step.key)
                      ? 'border-green-500 bg-green-50'
                      : 'border-muted'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    completedSteps.includes(step.key)
                      ? 'bg-green-100 text-green-600'
                      : currentStep === step.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.icon}
                  </div>
                  <span className="text-xs font-medium mt-2">{step.title}</span>
                  <Badge 
                    variant={completedSteps.includes(step.key) ? "default" : "outline"}
                    className="mt-1 text-xs"
                  >
                    {index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps.find(s => s.key === currentStep)?.icon}
              {steps.find(s => s.key === currentStep)?.title}
            </CardTitle>
            <CardDescription>
              {steps.find(s => s.key === currentStep)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
          <CardContent className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'terms' || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkipToDashboard}
              >
                Skip to Dashboard
              </Button>
              
              {currentStep !== 'complete' && currentStep !== 'document' && currentStep !== 'facial' && currentStep !== 'role' ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed || loading}
                >
                  {loading ? 'Processing...' : 'Continue'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : currentStep === 'complete' ? (
                <Button onClick={handleVerificationComplete}>
                  Get Started
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};