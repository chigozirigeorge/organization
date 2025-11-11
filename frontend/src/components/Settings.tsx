// components/Settings.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Eye, EyeOff, Save, User, Shield, Key, Briefcase, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';
import { TransactionPinSetup } from './TransactionPinSetup';
import { ChangeTransactionPin } from './ChangeTransactionPin';

export const Settings = () => {
  const { user, token, refreshUser, updateUserRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [usernameData, setUsernameData] = useState({
  new_username: user?.username || '',
  });

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://verinest.up.railway.app/api/users/name', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
        }),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        await refreshUser();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Check username availability
const checkUsernameAvailability = async (username: string) => {
  if (username.length < 3) {
    setUsernameAvailable(false);
    return;
  }

  if (username === user?.username) {
    setUsernameAvailable(true);
    return;
  }

  setCheckingUsername(true);
  try {
    const response = await fetch(`https://verinest.up.railway.app/api/users/check-username?username=${encodeURIComponent(username)}`);
    if (response.ok) {
      const data = await response.json();
      setUsernameAvailable(data.available);
    }
  } catch (error) {
    console.error('Error checking username:', error);
  } finally {
    setCheckingUsername(false);
  }
};

  // Update username
  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usernameAvailable) {
      toast.error('Please choose an available username');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://verinest.up.railway.app/api/users/username', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usernameData.new_username,
        }),
      });

      if (response.ok) {
        toast.success('Username updated successfully!');
        await refreshUser();
        setUsernameAvailable(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update username');
      }
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast.error(error.message || 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://verinest.up.railway.app/api/auth/reset-transaction-pin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('PIN reset instructions sent to your email!');
      } else {
        throw new Error('Failed to send PIN reset');
      }
    } catch (error: any) {
      console.error('Error resetting PIN:', error);
      toast.error(error.message || 'Failed to reset PIN');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://verinest.up.railway.app/api/users/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        toast.success('Password updated successfully!');
        setPasswordData({
          old_password: '',
          new_password: '',
          new_password_confirm: '',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: 'worker' | 'employer') => {
    setLoading(true);
    
    try {
      const success = await updateUserRole(newRole);
      if (success) {
        toast.success(`You are now a ${newRole}!`);
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="transaction-pin" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Transaction PIN
            </TabsTrigger>
            <TabsTrigger value="role" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Role Management
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you on the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="space-y-2">
                        <Input
                          id="username"
                          value={usernameData.new_username}
                          onChange={(e) => {
                            const newUsername = e.target.value.toLowerCase();
                            setUsernameData({ new_username: newUsername });
                            checkUsernameAvailability(newUsername);
                          }}
                          placeholder="Choose a username"
                        />
                        {usernameData.new_username !== user?.username && (
                          <div className="flex items-center gap-2 text-sm">
                            {checkingUsername ? (
                              <span className="text-blue-600">Checking availability...</span>
                            ) : usernameAvailable === true ? (
                              <span className="text-green-600">✓ Username available</span>
                            ) : usernameAvailable === false ? (
                              <span className="text-red-600">✗ Username not available</span>
                            ) : null}
                          </div>
                        )}
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleUsernameUpdate}
                        disabled={!usernameAvailable || usernameData.new_username === user?.username || loading}
                        size="sm"
                      >
                        Update Username
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                      placeholder="Your email address"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

        
                {/* Account Status Card */}
                <Card>
                <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Verification Status</Label>
                        <div>
                        <Badge 
                            variant={
                            user?.kyc_verified === 'verified' ? 'default' :
                            user?.kyc_verified === 'pending' ? 'secondary' :
                            user?.kyc_verified === 'rejected' ? 'destructive' :
                            'destructive'
                            }
                        >
                            {user?.kyc_verified === 'verified' ? 'Verified' :
                            user?.kyc_verified === 'pending' ? 'Under Review' :
                            user?.kyc_verified === 'rejected' ? 'Rejected' :
                            'Not Verified'}
                        </Badge>
                        </div>
                        {user?.verification_status && (
                        <p className="text-xs text-muted-foreground">
                            Backend: {user.verification_status}
                        </p>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Trust Score</Label>
                        <div className="text-2xl font-bold text-primary">
                        {user?.trust_score || 0}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Current Role</Label>
                        <div>
                        <Badge variant="outline" className="capitalize">
                            {user?.role || 'user'}
                        </Badge>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Email Verification</Label>
                        <div>
                        <Badge variant={user?.email_verified ? 'default' : 'destructive'}>
                            {user?.email_verified ? 'Verified' : 'Not Verified'}
                        </Badge>
                        </div>
                    </div>

                     <div className="space-y-2">
                    <Label htmlFor="referral_code">Referral Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="referral_code"
                        value={user?.referral_code || ''}
                        disabled
                        className="bg-muted flex-1"
                        placeholder="Your referral code"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (user?.referral_code) {
                            navigator.clipboard.writeText(user.referral_code);
                            toast.success('Referral code copied to clipboard!');
                          }
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share this code with friends to earn rewards
                    </p>
                  </div>

                  {/* Add referral stats if available */}
                  {user?.referral_count !== undefined && (
                    <div className="space-y-2">
                      <Label>Referral Stats</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Referrals</p>
                          <p className="text-2xl font-bold">{user.referral_count || 0}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Points Earned</p>
                          <p className="text-2xl font-bold">{user.trust_score || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                    </div>
                </CardContent>
                </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old_password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="old_password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password_confirm">Confirm New Password</Label>
                    <Input
                      id="new_password_confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.new_password_confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !passwordData.old_password || !passwordData.new_password || passwordData.new_password !== passwordData.new_password_confirm}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Change Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role Management Tab */}
          <TabsContent value="role" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Choose how you want to use VeriNest. You can change your role at any time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Worker Role Card */}
                  <Card className={`border-2 ${
                    user?.role === 'worker' ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Worker
                        {user?.role === 'worker' && (
                          <Badge variant="default" className="ml-auto">Current</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Find jobs and get hired for your skills
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Browse available jobs
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Set your rates and availability
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Build your professional profile
                        </li>
                      </ul>
                      
                      <Button 
                        className="w-full"
                        variant={user?.role === 'worker' ? 'default' : 'outline'}
                        onClick={() => handleRoleChange('worker')}
                        disabled={loading || user?.role === 'worker'}
                      >
                        {user?.role === 'worker' ? 'Current Role' : 'Become Worker'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Employer Role Card */}
                  <Card className={`border-2 ${
                    user?.role === 'employer' ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Employer
                        {user?.role === 'employer' && (
                          <Badge variant="default" className="ml-auto">Current</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Post jobs and hire skilled workers
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Post job listings
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Browse skilled workers
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Manage your workforce
                        </li>
                      </ul>
                      
                      <Button 
                        className="w-full"
                        variant={user?.role === 'employer' ? 'default' : 'outline'}
                        onClick={() => handleRoleChange('employer')}
                        disabled={loading || user?.role === 'employer'}
                      >
                        {user?.role === 'employer' ? 'Current Role' : 'Become Employer'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Role Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Role Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>• Identity verification is required to become a Worker</p>
                      <p>• Employers can post jobs immediately after registration</p>
                      <p>• You can switch roles at any time</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Transaction pin section */}
          <TabsContent value="transaction-pin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction PIN Management</CardTitle>
                <CardDescription>
                  Manage your 6-digit PIN for authorizing financial transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user?.transaction_pin ? (
                  <div className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your transaction PIN is set up and active.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowChangePin(true)}
                      >
                        Change Transaction PIN
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleResetPin}
                        disabled={loading}
                      >
                        {loading ? 'Resetting...' : 'Reset PIN via Email'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        You haven't set up a transaction PIN yet. Set one up to secure your financial transactions.
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      onClick={() => setShowPinSetup(true)}
                      className="w-full"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Set Up Transaction PIN
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

         {/* Add the TransactionPinSetup modal */}
         <TransactionPinSetup
          isOpen={showPinSetup}
          onClose={() => setShowPinSetup(false)}
          onSetupComplete={() => {
            setShowPinSetup(false);
            refreshUser(); // Refresh user data to get the new PIN status
            toast.success('Transaction PIN set up successfully!');
          }}
        />

        {/* Add Change PIN Modal (you'll need to create this component) */}
        <ChangeTransactionPin
          isOpen={showChangePin}
          onClose={() => setShowChangePin(false)}
          onSuccess={() => {
            setShowChangePin(false);
            refreshUser();
            toast.success('Transaction PIN changed successfully!');
          }}
        />
      </div>
    </div>
  );
};