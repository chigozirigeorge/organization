// FIXED RoleSelection.tsx with correct snake_case role values
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Briefcase, UserPlus, CheckCircle, Star, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface RoleSelectionProps {
  onSelect?: (role: 'worker' | 'employer') => void;
  selectedRole?: 'worker' | 'employer' | '';
}

export const RoleSelection = ({ onSelect, selectedRole }: RoleSelectionProps) => {
  const { token, updateUser, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role: 'worker' | 'employer') => {
    // Check if user has completed KYC verification
    if (!user?.kyc_verified || user.kyc_verified === 'unverified') {
      toast.error('Please complete identity verification first');
      navigate('/verify/kyc');
      return;
    }

    // Check if KYC is still pending
    if (user.kyc_verified === 'pending') {
      toast.info('Your identity verification is under review. Please wait for approval before selecting a role.');
      return;
    }

    // Check if KYC is rejected
    if (user.kyc_verified === 'rejected') {
      toast.error('Your identity verification was rejected. Please complete verification again.');
      navigate('/verify/kyc');
      return;
    }

    setLoading(true);
    try {
      // Use the EXACT snake_case values from the database enum
      const backendRole = role === 'worker' ? 'Worker' : 'Employer';

      console.log('Attempting to update role to:', backendRole);
      console.log('User ID:', user?.id);

      const response = await fetch('https://verinest.up.railway.app/api/users/role/upgrade', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_user_id: user?.id,
          new_role: backendRole // 'worker' or 'employer' (exact snake_case values)
        }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Role update successful:', result);

        // Update local user context
        if (updateUser) {
          const userResponse = await fetch('https://verinest.up.railway.app/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('Updated user data:', userData);
            updateUser(userData);
          }
        }

        // Success
        if (onSelect) {
          onSelect(role);
        } else {
          toast.success(`You're now a ${role}!`);
          if (role === 'worker') {
            navigate('/worker/profile-setup');
          } else {
            navigate('/employer/dashboard');
          }
        }
      } else {
        // Handle specific error responses
        const errorText = await response.text();
        console.error('Role update failed:', errorText);
        
        let errorMessage = 'Failed to update role';
        
        if (response.status === 422) {
          errorMessage = 'Invalid role format. Please try again.';
        } else if (response.status === 500) {
          // Provide more specific error message for constraint violations
          if (errorText.includes('violates check constraint')) {
            errorMessage = 'Database constraint error. The role value is not accepted.';
          } else {
            errorMessage = 'Server error. Please try again or contact support.';
          }
        } else if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorText;
          } catch {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'worker',
      title: 'Worker',
      description: 'Find jobs and get hired',
      icon: <Briefcase className="h-8 w-8" />,
      features: [
        'Browse available jobs',
        'Set your rates and availability',
        'Build your professional profile',
        'Get paid securely through escrow',
        'Receive reviews and build reputation'
      ],
      badge: 'Earn Money',
      color: 'blue'
    },
    {
      id: 'employer',
      title: 'Employer',
      description: 'Post jobs and hire talent',
      icon: <UserPlus className="h-8 w-8" />,
      features: [
        'Post job listings',
        'Browse skilled workers',
        'Secure escrow payments',
        'Track job progress',
        'Leave reviews for workers'
      ],
      badge: 'Hire Talent',
      color: 'green'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Choose Your Path</h3>
        <p className="text-muted-foreground">
          Select how you want to use VeriNest. You can change this later.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <Card 
            key={role.id}
            className={`relative cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === role.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleRoleSelect(role.id as 'worker' | 'employer')}
          >
            {selectedRole === role.id && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className={`mx-auto h-16 w-16 rounded-full ${
                role.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              } flex items-center justify-center mb-4`}>
                {role.icon}
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                {role.title}
                <Badge variant={role.color === 'blue' ? 'default' : 'secondary'}>
                  {role.badge}
                </Badge>
              </CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {role.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full" 
                variant={selectedRole === role.id ? "default" : "outline"}
                disabled={loading}
              >
                {loading ? 'Selecting...' : `Become ${role.title}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Why Verify with VeriNest?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold">Secure Platform</h4>
              <p className="text-sm text-muted-foreground">
                Your data is protected with bank-level security and encryption
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold">Trusted Community</h4>
              <p className="text-sm text-muted-foreground">
                Join verified professionals and build your reputation
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold">Quick Process</h4>
              <p className="text-sm text-muted-foreground">
                Complete verification in minutes and start immediately
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};