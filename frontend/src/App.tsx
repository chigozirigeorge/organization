// App.tsx - Updated with proper dashboard routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedLayout } from './components/shared/ProtectedLayout';
import { Button } from './components/ui/button';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { PaymentVerification } from './components/shared/PaymentVerification';
import { EmailVerification } from './components/shared/EmailVerification';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailed } from './pages/PaymentFailed';
import { JobsList } from './components/worker/JobsList';
import { JobDetails } from './components/employer/JobDetails';
import { CreateJob } from './components/CreateJob';
import { WorkerProfileSetup } from './components/worker/WorkerProfileSetup';
import { MyJobs } from './components/employer/MyJobs';
import { MyContracts } from './components/employer/MyContracts';
import { CreateJobApplication } from './components/worker/CreateJobApplication';
import { TermsAndConditions } from './components/Landingpage/TermsAndConditions';
import { PrivacyPolicy } from './components/Landingpage/PrivacyPolicy';
import { AboutUs } from './components/Landingpage/AboutUs';
import { ContactUs } from './components/Landingpage/ContactUs';
import { HelpCenter } from './components/Landingpage/HelpCenter';
import { DisputeResolution } from './components/admins/DisputeResolution';
import { SafetyGuidelines } from './components/Landingpage/SafetyGuidelines';
import { Careers } from './components/Landingpage/Careers';
import { PressKit } from './components/Landingpage/PressKit';
import { Blog } from './components/Landingpage/Blog';
import { ProfessionalKYCFlow } from './components/kyc/ProfessionalKYCFlow';
import { RoleSelection } from './components/shared/RoleSelection';
import { Settings } from './components/Settings';
import { TransactionsPage } from './components/shared/TransactionsPage';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { PublicRoute } from './components/shared/PublicRoute';
import { UsernameRoute } from './components/shared/UsernameRoute';
import { AdminDashboard } from './components/admins/AdminDashboard';
import { VerifierDashboard } from './components/admins/VerifierDashboard';
import { WorkerPortfolio } from './components/worker/WorkerPortfolio';
import { Analytics } from "@vercel/analytics/react"
import OAuthCallback from './pages/OAuthCallback';
import OAuthRedirect from './pages/OAuthRedirect';
import NavigationManager from './components/NavigationManager';
import { TokenHandler } from './components/shared/TokenHandler';
import PublicWorkerProfile from './pages/PublicWorkerProfile';
import { NotFoundPage } from './components/shared/NotFoundPage';
import { NotFoundLayout } from './components/shared/NotFoundLayout';
import { StaticFileHandler } from './components/shared/StaticFileHandler';

// Main App Routes - All protected routes now go through Dashboard
const AppRoutes = () => {
  const { authInitialized } = useAuth();
  
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route path="/oauth-redirect" element={<OAuthRedirect />} />
      <Route path="/auth/callback" element={<TokenHandler />} />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/payment/verify" element={<PaymentVerification />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/support" element={<ContactUs />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/disputes" element={<DisputeResolution />} />
      <Route path="/safety" element={<SafetyGuidelines />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/press" element={<PressKit />} />
      <Route path="/blog" element={<Blog />} />
      
      {/* Public Worker Profile - Username-based URLs */}
      <Route path="/@:username" element={<PublicWorkerProfile />} />
      <Route path="/profile/:username" element={<PublicWorkerProfile />} />
      
      {/* KYC Verification Flow */}
      <Route path="/verify/kyc" element={
        <ProtectedRoute>
          <ProfessionalKYCFlow />
        </ProtectedRoute>
      } />
      
      {/* Role Selection */}
      <Route path="/select-role" element={
        <ProtectedRoute>
          <RoleSelection />
        </ProtectedRoute>
      } />

      {/* Main Dashboard - All authenticated routes are nested here */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Catch-all for direct username URLs (must be before 404) */}
      <Route path="/:username" element={<UsernameRoute />} />

      {/* 404 Page */}
      <Route path="*" element={<NotFoundLayout />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          {/* Navigation manager records last non-sensitive path and handles back on sensitive pages */}
          <NavigationManager />
          <AppRoutes />
          <Toaster position="top-right" />
          <Analytics />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;