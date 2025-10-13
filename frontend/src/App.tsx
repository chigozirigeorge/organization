// App.tsx - Updated with proper protected routes
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import Home from './pages/Landing';
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


// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
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
            
            {/* Protected Routes with Role Selection */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
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
            
            <Route path="/jobs" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <JobsList />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/jobs/create" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <CreateJob />
                </ProtectedLayout>
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
                <ProtectedLayout>
                  <WorkerProfileSetup />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/contracts" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <MyContracts />
                </ProtectedLayout>
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;