// components/LocationVerification.tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { nigeriaStates, StateWithLGAs } from '../lib/states'; // Adjust import path as needed
import { Textarea } from './ui/textarea';

interface LocationVerificationProps {
  onSubmit: (data: { state: string; lga: string; nearest_landmark: string }) => void;
  onBack: () => void;
  loading: boolean;
}

export const LocationVerification = ({ onSubmit, onBack, loading }: LocationVerificationProps) => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedLGA, setSelectedLGA] = useState('');
  const [nearestLandmark, setNearestLandmark] = useState('');

  const handleSubmit = () => {
    if (!selectedState || !selectedLGA || !nearestLandmark.trim()) {
      return;
    }

    onSubmit({
      state: selectedState,
      lga: selectedLGA,
      nearest_landmark: nearestLandmark.trim()
    });
  };

  // Get the selected state object to find its LGAs
  const selectedStateData = nigeriaStates.find(state => state.state === selectedState);
  const availableLGAs = selectedStateData?.lgas || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Information</CardTitle>
        <CardDescription>
          Provide your state and local government area for verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select 
              value={selectedState} 
              onValueChange={(value) => {
                setSelectedState(value);
                setSelectedLGA(''); // Reset LGA when state changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {nigeriaStates.map((state: StateWithLGAs) => (
                  <SelectItem key={state.state} value={state.state}>
                    {state.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lga">Local Government Area (LGA)</Label>
            <Select 
              value={selectedLGA} 
              onValueChange={setSelectedLGA}
              disabled={!selectedState}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedState ? "Select your LGA" : "Select state first"} />
              </SelectTrigger>
              <SelectContent>
                {availableLGAs.map((lga: string) => (
                  <SelectItem key={lga} value={lga}>
                    {lga}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nearestLandmark">Nearest Landmark or Address *</Label>
            <Textarea
              id="nearestLandmark"
              placeholder="e.g., Near Central Market, Opposite GTBank, 123 Main Street"
              value={nearestLandmark}
              onChange={(e) => setNearestLandmark(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-sm text-muted-foreground">
              Provide a recognizable landmark or your full address for verification
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">Why we need this information:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Helps verify your residential location</li>
            <li>• Used for service area matching</li>
            <li>• Ensures accurate service delivery</li>
            <li>• Required for complete KYC verification</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedState || !selectedLGA || !nearestLandmark.trim() || loading}
          >
            {loading ? 'Submitting...' : 'Complete Verification'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};