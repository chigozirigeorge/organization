import { Shield, Lock, Award, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Verified Workers',
    description: 'Every worker is KYC-verified and rated by past employers.',
    icon: Shield,
  },
  {
    title: 'Escrow Protection',
    description: 'Secure milestone payments managed transparently via smart contracts.',
    icon: Lock,
  },
  {
    title: 'Trust Points System',
    description: 'Earn and grow your reputation with every successful job.',
    icon: Award,
  },
  {
    title: 'Dispute Resolution',
    description: 'Independent verifiers ensure fairness and accountability.',
    icon: Scale,
  },
];

export const FeatureGrid = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose VeriNest?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built on trust, transparency, and technology
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
