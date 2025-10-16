// App.tsx - Fixed with proper route protection
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { PaymentVerification } from './components/PaymentVerification';
import { EmailVerification } from './components/EmailVerification';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailed } from './pages/PaymentFailed';
import { WorkerDashboard } from './components/WorkerDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';
import { JobsList } from './components/JobsList';
import { JobDetails } from './components/JobDetails';
import { CreateJob } from './components/CreateJob';
import { WorkerProfileSetup } from './components/WorkerProfileSetup';
import { MyJobs } from './components/MyJobs';
import { MyContracts } from './components/MyContracts';
import { CreateJobApplication } from './components/CreateJobApplication';
import { TermsAndConditions } from './components/TermsAndConditions';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AboutUs } from './components/AboutUs';
import { ContactUs } from './components/ContactUs';
import { HelpCenter } from './components/HelpCenter';
import { DisputeResolution } from './components/DisputeResolution';
import { SafetyGuidelines } from './components/SafetyGuidelines';
import { Careers } from './components/Careers';
import { PressKit } from './components/PressKit';
import { Blog } from './components/Blog';
import { KYCFlow } from './components/KYCFlow';
import { RoleSelection } from './components/RoleSelection';
import { Button } from './components/ui/button';
import { Settings } from './components/Settings';
import { TransactionsPage } from './components/TransactionsPage';

// Protected Route Component - Basic auth check only
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// KYC Required Route - Only for routes that need KYC
const KYCRequiredRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If KYC is already verified, go to dashboard
  if (user?.kyc_verified) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// Main App Routes - No KYC check for basic routes
const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
      
      {/* KYC Verification Flow - Only for unverified users */}
      <Route path="/verify/kyc" element={
        <ProtectedRoute>
          <KYCFlow />
        </ProtectedRoute>
      } />
      
      {/* Role Selection - Protected but no KYC required */}
      <Route path="/select-role" element={
        <ProtectedRoute>
          <RoleSelection />
        </ProtectedRoute>
      } />

      
      {/* Protected Routes - Require authentication but not necessarily KYC */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      {/* Routes that require KYC verification */}
      {user?.kyc_verified && (
        <>
          <Route path="/worker/dashboard" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <WorkerDashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/employer/dashboard" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <EmployerDashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <TransactionsPage />
              </ProtectedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/jobs" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <JobsList />
              </ProtectedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/jobs/create" element={
            <ProtectedRoute>
              <KYCRequiredRoute>
                <CreateJob />
              </KYCRequiredRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/jobs/my-jobs" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <MyJobs />
              </ProtectedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/jobs/:id" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <JobDetails />
              </ProtectedLayout>
            </ProtectedRoute>
          } />

          <Route path="/jobs/:id/apply" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <CreateJobApplication />
              </ProtectedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/worker/profile-setup" element={
            <ProtectedRoute>
              <KYCRequiredRoute>
                <WorkerProfileSetup />
              </KYCRequiredRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/contracts" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <MyContracts />
              </ProtectedLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
               <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            </ProtectedRoute>
          } />
        </>
      )}
      
      {/* Routes that work without KYC but show appropriate messaging */}
      {!user?.kyc_verified && (
        <>
          <Route path="/jobs" element={
            <ProtectedRoute>
              <ProtectedLayout>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">KYC Verification Required</h2>
                  <p className="text-muted-foreground mb-4">
                    Please complete your KYC verification to access job listings.
                  </p>
                  <Button onClick={() => window.location.href = '/verify/kyc'}>
                    Complete KYC Verification
                  </Button>
                </div>
              </ProtectedLayout>
            </ProtectedRoute>
          } />
        </>
      )}

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;