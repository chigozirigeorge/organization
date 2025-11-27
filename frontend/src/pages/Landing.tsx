import { Navbar } from '../components/Landingpage/Navbar';
import { HeroSection } from '../components/Landingpage/HeroSection';
import { FeatureGrid } from '../components/Landingpage/FeatureGrid';
import { HowItWorksSection } from '../components/Landingpage/HowItWorksSection';
import { CallToAction } from '../components/Landingpage/CallToAction';
import { Footer } from '../components/Landingpage/Footer';

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
