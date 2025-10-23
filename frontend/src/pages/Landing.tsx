import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { FeatureGrid } from '../components/FeatureGrid';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { CallToAction } from '../components/CallToAction';
import { Footer } from '../components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureGrid />
        <HowItWorksSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
