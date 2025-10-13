import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/90">
            Join thousands of employers and workers building trust in Africa's labor market
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 w-full sm:w-auto">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
