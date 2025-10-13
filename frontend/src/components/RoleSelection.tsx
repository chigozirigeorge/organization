// components/RoleSelection.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Briefcase, UserPlus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const RoleSelection = () => {
  const { user, updateUserRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role: 'worker' | 'employer') => {
    setLoading(true);
    try {
      const success = await updateUserRole(role);
      if (success) {
        toast.success(`Welcome as ${role === 'worker' ? 'a Worker' : 'an Employer'}!`);
        
        if (role === 'worker') {
          navigate('/worker/profile-setup');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error('Failed to set role');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to VeriNest! 🎉</h1>
          <p className="text-xl text-muted-foreground">
            How would you like to use our platform?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Worker Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Join as Worker</CardTitle>
              <CardDescription className="text-lg">
                Find jobs, build your profile, and get hired
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Create multiple job profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Apply for jobs in your field</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Get paid securely through escrow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Build your reputation with reviews</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleRoleSelect('worker')}
                disabled={loading}
                className="w-full group-hover:bg-blue-600"
                size="lg"
              >
                Become a Worker
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Employer Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Hire as Employer</CardTitle>
              <CardDescription className="text-lg">
                Post jobs, find talent, and manage projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Post jobs for free</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Find qualified workers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure payments with escrow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Manage multiple projects</span>
                </div>
              </div>
              
              <Button 
                onClick={() => handleRoleSelect('employer')}
                disabled={loading}
                variant="outline"
                className="w-full group-hover:border-green-600 group-hover:text-green-600"
                size="lg"
              >
                Start Hiring
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 text-muted-foreground">
          <p>You can always change your role later in settings</p>
        </div>
      </div>
    </div>
  );
};