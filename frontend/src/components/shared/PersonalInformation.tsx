// components/PersonalInformation.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, ArrowRight, Calendar, AlertCircle } from 'lucide-react';

interface PersonalInformationProps {
  onSubmit: (data: { dob: string }) => void;
  onBack: () => void;
}

export const PersonalInformation = ({ onSubmit, onBack }: PersonalInformationProps) => {
  const [dob, setDob] = useState('');

  // Calculate date limits
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  const handleSubmit = () => {
    if (!dob) return;
    
    // Format the date to ISO string for backend
    const formattedDob = new Date(dob).toISOString();
    onSubmit({ dob: formattedDob });
  };

  // Calculate age for validation
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const isUnder18 = dob && calculateAge(dob) < 18;
  const isFormValid = dob && !isUnder18;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Provide your date of birth for identity verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your personal information is securely stored and used only for verification purposes 
            in compliance with data protection regulations.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date of Birth *
            </Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              min={minDate}
              max={maxDate}
              required
              className={isUnder18 ? 'border-red-500' : ''}
            />
            {dob && (
              <p className={`text-sm ${isUnder18 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                {isUnder18 
                  ? 'You must be at least 18 years old to use this platform' 
                  : `Age: ${calculateAge(dob)} years old`}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              You must be at least 18 years old to register
            </p>
          </div>
        </div>

        {/* Information Usage */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">How we use your information:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Age verification for platform eligibility</li>
            <li>• Identity confirmation with your government ID</li>
            <li>• Compliance with regulatory requirements</li>
            <li>• Enhanced security and fraud prevention</li>
          </ul>
        </div>

        {/* Privacy Notice */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800 text-xs">
            <strong>Privacy Notice:</strong> Your date of birth is encrypted and stored securely. 
            We never share your personal information with third parties without your consent, 
            except as required by law or for verification purposes.
          </AlertDescription>
        </Alert>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid} // Fixed: Now only accepts boolean (true/false)
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};