import { Navbar } from '../Landingpage/Navbar';
import { Footer } from '../Landingpage/Footer';
import { NotFoundPage } from './NotFoundPage';

export const NotFoundLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NotFoundPage />
      <Footer />
    </div>
  );
};
