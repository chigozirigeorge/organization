import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Connecting Verified Workers with Trusted Employers
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Empowering Africa's construction and real estate labor market through transparency, verification, and escrow protection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                Hire Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                Find Jobs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
