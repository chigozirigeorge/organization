// components/professional-kyc/PersonalInformationForm.tsx
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { nigeriaStates, NIGERIAN_STATES, getLGAsForState } from '../../lib/states';

interface PersonalInformationFormProps {
  onSubmit: (data: PersonalInfoData) => void;
  onBack?: () => void;
  initialData?: Partial<PersonalInfoData>;
}

export interface PersonalInfoData {
  documentType: 'nin' | 'drivers_license' | 'voters_card' | 'international_passport';
  documentId: string;
  nationality: string;
  stateOfOrigin: string;
  lga: string;
  dateOfBirth: string;
  residentialAddress: string;
  nearestLandmark: string;
}

export const PersonalInformationForm = ({ 
  onSubmit, 
  onBack, 
  initialData 
}: PersonalInformationFormProps) => {
  const [formData, setFormData] = useState<PersonalInfoData>({
    documentType: 'nin',
    documentId: '',
    nationality: 'Nigerian',
    stateOfOrigin: '',
    lga: '',
    dateOfBirth: '',
    residentialAddress: '',
    nearestLandmark: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfoData, string>>>({});
  const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);

  useEffect(() => {
    if (formData.stateOfOrigin) {
      const lgas = getLGAsForState(formData.stateOfOrigin);
      setAvailableLGAs(lgas);
      
      // Reset LGA if it's not in the new state's LGAs
      if (formData.lga && !lgas.includes(formData.lga)) {
        setFormData(prev => ({ ...prev, lga: '' }));
      }
    } else {
      setAvailableLGAs([]);
    }
  }, [formData.stateOfOrigin, formData.lga]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalInfoData, string>> = {};

    if (!formData.documentId.trim()) {
      newErrors.documentId = 'Document ID is required';
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required';
    }

    if (!formData.stateOfOrigin) {
      newErrors.stateOfOrigin = 'State of origin is required';
    }

    if (!formData.lga) {
      newErrors.lga = 'LGA is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    if (!formData.residentialAddress.trim()) {
      newErrors.residentialAddress = 'Residential address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof PersonalInfoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'nin': 'National Identity Number (NIN)',
      'drivers_license': "Driver's License",
      'voters_card': "Voter's Card",
      'international_passport': 'International Passport'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
        <p className="text-gray-600 mt-2">
          Please provide your official identification details
        </p>
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Identification Details
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your official government-issued identification information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type and ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="documentType" className="text-sm font-medium text-gray-900">
                  Document Type *
                </Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value: PersonalInfoData['documentType']) => 
                    handleInputChange('documentType', value)
                  }
                >
                  <SelectTrigger className="w-full">
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
                <Label htmlFor="documentId" className="text-sm font-medium text-gray-900">
                  {getDocumentTypeLabel(formData.documentType)} Number *
                </Label>
                <Input
                  id="documentId"
                  value={formData.documentId}
                  onChange={(e) => handleInputChange('documentId', e.target.value)}
                  placeholder={`Enter your ${getDocumentTypeLabel(formData.documentType).toLowerCase()} number`}
                  className={cn(errors.documentId && 'border-red-500')}
                />
                {errors.documentId && (
                  <p className="text-red-500 text-xs mt-1">{errors.documentId}</p>
                )}
              </div>
            </div>

            {/* Nationality */}
            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-sm font-medium text-gray-900">
                Nationality *
              </Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                placeholder="Enter your nationality"
                className={cn(errors.nationality && 'border-red-500')}
              />
              {errors.nationality && (
                <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>
              )}
            </div>

            {/* State and LGA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="stateOfOrigin" className="text-sm font-medium text-gray-900">
                  State of Origin *
                </Label>
                <Select
                  value={formData.stateOfOrigin}
                  onValueChange={(value) => handleInputChange('stateOfOrigin', value)}
                >
                  <SelectTrigger className={cn('w-full', errors.stateOfOrigin && 'border-red-500')}>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stateOfOrigin && (
                  <p className="text-red-500 text-xs mt-1">{errors.stateOfOrigin}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lga" className="text-sm font-medium text-gray-900">
                  Local Government Area (LGA) *
                </Label>
                <Select
                  value={formData.lga}
                  onValueChange={(value) => handleInputChange('lga', value)}
                  disabled={!formData.stateOfOrigin}
                >
                  <SelectTrigger className={cn('w-full', errors.lga && 'border-red-500')}>
                    <SelectValue placeholder={formData.stateOfOrigin ? "Select your LGA" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLGAs.map((lga) => (
                      <SelectItem key={lga} value={lga}>
                        {lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.lga && (
                  <p className="text-red-500 text-xs mt-1">{errors.lga}</p>
                )}
                {!formData.stateOfOrigin && (
                  <p className="text-gray-500 text-xs mt-1">Please select a state first</p>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-900">
                Date of Birth *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground",
                      errors.dateOfBirth && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? (
                      format(new Date(formData.dateOfBirth), 'PPP')
                    ) : (
                      <span>Pick your date of birth</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                    onSelect={(date) => 
                      handleInputChange('dateOfBirth', date ? date.toISOString() : '')
                    }
                    disabled={(date) => 
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Residential Address */}
            <div className="space-y-2">
              <Label htmlFor="residentialAddress" className="text-sm font-medium text-gray-900">
                Residential Address *
              </Label>
              <Input
                id="residentialAddress"
                value={formData.residentialAddress}
                onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
                placeholder="Enter your complete residential address"
                className={cn(errors.residentialAddress && 'border-red-500')}
              />
              {errors.residentialAddress && (
                <p className="text-red-500 text-xs mt-1">{errors.residentialAddress}</p>
              )}
            </div>

            {/* Nearest Landmark */}
            <div className="space-y-2">
              <Label htmlFor="nearestLandmark" className="text-sm font-medium text-gray-900">
                Nearest Landmark
              </Label>
              <Input
                id="nearestLandmark"
                value={formData.nearestLandmark}
                onChange={(e) => handleInputChange('nearestLandmark', e.target.value)}
                placeholder="Enter nearest landmark to your address (optional)"
              />
              <p className="text-gray-500 text-xs">
                This helps us verify your location more accurately
              </p>
            </div>

            {/* Information Notice */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Your information is protected by bank-level security and will only be used for verification purposes.
                We comply with all data protection regulations.
              </AlertDescription>
            </Alert>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {onBack && (
                <Button variant="outline" onClick={onBack} type="button" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 ml-auto"
                size="lg"
              >
                Continue to Document Scan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};