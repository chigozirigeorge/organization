// components/SafetyGuidelines.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, UserCheck, MessageCircle, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

const GUIDELINES = {
  workers: [
    {
      icon: UserCheck,
      title: "Verify Employers",
      description: "Check employer ratings and completed jobs before accepting work"
    },
    {
      icon: MessageCircle,
      title: "Communicate Clearly",
      description: "Use the platform for all work-related communication"
    },
    {
      icon: CreditCard,
      title: "Use Escrow",
      description: "Never accept direct payments outside the platform"
    },
    {
      icon: Shield,
      title: "Report Issues",
      description: "Immediately report any suspicious behavior or safety concerns"
    }
  ],
  employers: [
    {
      icon: UserCheck,
      title: "Check Credentials",
      description: "Verify worker profiles, ratings, and portfolio before hiring"
    },
    {
      icon: MessageCircle,
      title: "Set Clear Expectations",
      description: "Define scope, timeline, and deliverables in the contract"
    },
    {
      icon: CreditCard,
      title: "Use Escrow Protection",
      description: "Fund escrow before work begins to ensure payment security"
    },
    {
      icon: Shield,
      title: "Monitor Progress",
      description: "Use progress updates and maintain regular communication"
    }
  ]
};

const RED_FLAGS = [
  "Requests for payment outside the platform",
  "Pressure to share personal contact information early",
  "Vague job descriptions or unclear requirements",
  "Offers that seem too good to be true",
  "Rushed timelines without proper planning"
];

const EMERGENCY_CONTACTS = [
  { name: "Emergency Services", number: "112" },
  { name: "Local Police", number: "Varies by location" },
  { name: "VeriNest Emergency", number: "+234 800 000 0000" }
];

export const SafetyGuidelines = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold">Safety Guidelines</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your safety and security are our top priority
          </p>
        </div>

        <Alert className="mb-8 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Verified Platform:</strong> All users are verified, and payments are protected by escrow.
          </AlertDescription>
        </Alert>

        {/* Guidelines for Workers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Safety Guidelines for Workers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GUIDELINES.workers.map((guideline, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-start space-x-4">
                  <guideline.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-lg">{guideline.title}</CardTitle>
                    <CardDescription>{guideline.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Guidelines for Employers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Safety Guidelines for Employers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GUIDELINES.employers.map((guideline, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-start space-x-4">
                  <guideline.icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-lg">{guideline.title}</CardTitle>
                    <CardDescription>{guideline.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Red Flags */}
        <Card className="mb-12 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Red Flags to Watch For
            </CardTitle>
            <CardDescription className="text-red-800">
              Be cautious if you encounter any of these situations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-red-800">
              {RED_FLAGS.map((flag, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                Important numbers for emergency situations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {EMERGENCY_CONTACTS.map((contact, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-primary font-semibold">{contact.number}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report a Safety Concern</CardTitle>
              <CardDescription>
                Immediate assistance and reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you feel unsafe or encounter suspicious behavior:
              </p>
              <div className="space-y-2 text-sm">
                <p>1. Remove yourself from the situation</p>
                <p>2. Contact emergency services if needed</p>
                <p>3. Report the incident to VeriNest immediately</p>
                <p>4. Preserve any evidence or documentation</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="destructive">Emergency Report</Button>
                <Button variant="outline">Safety Tips</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Features */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Our Safety Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="space-y-2">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                <span>Identity Verification</span>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                <span>Escrow Payment Protection</span>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                <span>Secure Messaging</span>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                <span>Rating & Review System</span>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                <span>Dispute Resolution</span>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                <span>24/7 Support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};