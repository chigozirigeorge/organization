// components/DisputeResolution.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: "Raise a Dispute",
    description: "Submit your dispute with details and evidence",
    icon: FileText,
    duration: "Immediate"
  },
  {
    step: 2,
    title: "Case Review",
    description: "Our team reviews the case and gathers information",
    icon: Clock,
    duration: "1-2 business days"
  },
  {
    step: 3,
    title: "Mediation",
    description: "We mediate between both parties to find resolution",
    icon: Shield,
    duration: "3-5 business days"
  },
  {
    step: 4,
    title: "Resolution",
    description: "Final decision and implementation",
    icon: CheckCircle,
    duration: "1 business day"
  }
];

const COMMON_DISPUTES = [
  {
    type: "Payment Issues",
    description: "Disagreements about payment amounts, timing, or releases",
    resolution: "Escrow funds are distributed based on evidence and agreements"
  },
  {
    type: "Work Quality",
    description: "Concerns about the quality or completeness of work",
    resolution: "Independent verification and potential partial payments"
  },
  {
    type: "Timeline Disputes",
    description: "Delays in project completion or milestones",
    resolution: "Assessment of reasonable timelines and extensions"
  },
  {
    type: "Scope Changes",
    description: "Disagreements about work scope or additional charges",
    resolution: "Review of original contract and communication history"
  }
];

export const DisputeResolution = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold">Dispute Resolution</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fair and transparent resolution process for job-related disputes
          </p>
        </div>

        <Alert className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Always try to resolve issues directly with the other party before raising a formal dispute.
          </AlertDescription>
        </Alert>

        {/* Process Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Resolution Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <Card key={step.step} className="text-center">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                      {step.step}
                    </div>
                  </div>
                  <step.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  <div className="text-xs bg-muted px-2 py-1 rounded inline-block">
                    {step.duration}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Common Disputes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Common Dispute Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMMON_DISPUTES.map((dispute, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{dispute.type}</CardTitle>
                  <CardDescription>{dispute.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Typical Resolution:</p>
                    <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Raise Dispute */}
          <Card>
            <CardHeader>
              <CardTitle>Raise a New Dispute</CardTitle>
              <CardDescription>
                Start the formal dispute resolution process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Before raising a dispute, make sure you have:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Clear evidence (photos, messages, documents)</li>
                <li>Attempted direct resolution</li>
                <li>Relevant job and contract information</li>
                <li>Specific outcome you're seeking</li>
              </ul>
              <Button className="w-full">Raise Dispute</Button>
            </CardContent>
          </Card>

          {/* Active Disputes */}
          <Card>
            <CardHeader>
              <CardTitle>Active Disputes</CardTitle>
              <CardDescription>
                Manage your ongoing dispute cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                View the status of your current disputes and submit additional information if needed.
              </p>
              <div className="space-y-3">
                {/* Example dispute status - in real app, this would be dynamic */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Job #12345 - Payment Dispute</p>
                    <p className="text-xs text-muted-foreground">Under Review</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
              <Button variant="outline" className="w-full">View All Disputes</Button>
            </CardContent>
          </Card>
        </div>

        {/* Important Information */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="space-y-3 text-sm">
              <p><strong>Escrow Protection:</strong> Funds remain in escrow until dispute resolution</p>
              <p><strong>Fair Process:</strong> Both parties have equal opportunity to present their case</p>
              <p><strong>Transparent Decisions:</strong> All resolutions are documented and explained</p>
              <p><strong>No Additional Fees:</strong> Dispute resolution is included in our service</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};