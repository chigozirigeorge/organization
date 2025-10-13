import { UserPlus, Search, FileCheck, CheckCircle } from 'lucide-react';

const steps = [
  {
    title: 'Sign Up',
    description: 'Create your account as an employer or worker',
    icon: UserPlus,
    step: 1,
  },
  {
    title: 'Find Match',
    description: 'Browse verified workers or available job listings',
    icon: Search,
    step: 2,
  },
  {
    title: 'Secure Agreement',
    description: 'Set milestones and deposit funds into escrow',
    icon: FileCheck,
    step: 3,
  },
  {
    title: 'Complete & Rate',
    description: 'Finish the job and build your reputation',
    icon: CheckCircle,
    step: 4,
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in four simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
                      <Icon className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {step.step < 4 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
