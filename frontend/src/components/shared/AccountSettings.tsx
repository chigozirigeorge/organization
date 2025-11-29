import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Shield, 
  Key, 
  Briefcase, 
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  RefreshCw,
  Crown,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle,
  Settings,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../utils/api';
import { getSubscriptionStatus, initiatePremiumPayment } from '../../services/subscription';
import { getAvailableRoles, upgradeUserRole } from '../../services/roles';
import { TransactionPinSetup } from './TransactionPinSetup';
import { ChangeTransactionPin } from './ChangeTransactionPin';
import { TransactionPinModal } from './TransactionPinModal';
import type { AllowedRole } from '../../types/roles';

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettings = ({ isOpen, onClose }: AccountSettingsProps) => {
  const { user, token, refreshUser, updateUserRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('role');
  const [showPassword, setShowPassword] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{
    type: 'payment' | 'role_upgrade';
    data: any;
    callback: (pin: string) => Promise<void>;
  } | null>(null);

  // Password state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  // Subscription state
  const [subscription, setSubscription] = useState<{
    tier: string;
    status: string;
    expires_at: string | null;
  } | null>(null);
  const [subLoading, setSubLoading] = useState(false);

  // Role state
  const [availableRoles, setAvailableRoles] = useState<AllowedRole[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSubscription();
      fetchRoles();
    }
  }, [token]);

  const fetchSubscription = async () => {
    if (!token) return;
    setSubLoading(true);
    try {
      // Use the real backend endpoint
      const res = await apiClient.get('/users/subscription/premium');
      const data = res.data || res; // Handle both response formats
      
      setSubscription({
        tier: data.user_tier || data.tier || 'free',
        status: 'active',
        expires_at: data.active_subscription?.expires_at || data.expires_at || null
      });
    } catch (err) {
      console.error("Failed to fetch subscription status:", err);
      // Fallback to default subscription based on user data
      const defaultSubscription = {
        tier: user?.subscription_tier || 'free',
        status: 'active',
        expires_at: null
      };
      setSubscription(defaultSubscription);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchRoles = async () => {
    if (!token || !user) return;
    setRoleLoading(true);
    try {
      // Use the real backend endpoint
      const res = await apiClient.get('/users/role/available');
      console.log('Available roles response:', res.data);
      const roles = res.data.available_roles.map((r: any) => r.role.toLowerCase()); // Direct access
      console.log('Processed roles:', roles);
      setAvailableRoles(roles);
    } catch (err) {
      console.error("Failed to fetch available roles:", err);
      // Fallback to default roles
      const defaultRoles: AllowedRole[] = ['worker', 'employer', 'vendor'];
      setAvailableRoles(defaultRoles);
    } finally {
      setRoleLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.put('/users/password', passwordData);
      toast.success("Password updated successfully!");
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpgrade = async (newRole: AllowedRole) => {
    if (!user) return;
    setRoleLoading(true);
    try {
      if (!token) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      console.log('Upgrading role to:', newRole);
      console.log('Current user role:', user.role);

      // Use the real backend endpoint for self role upgrade
      const res = await apiClient.put('/users/role/upgrade', {
        target_user_id: user.id,
        new_role: newRole.charAt(0).toUpperCase() + newRole.slice(1) // Capitalize first letter for backend
      });
      
      console.log('Role upgrade response:', res.data);
      
      // Check if the upgrade was successful
      if (res.data.status === 'success') {
        toast.success(`Role changed to ${newRole} successfully!`);
        
        // Update local user data immediately for instant UI feedback
        if (user) {
          user.role = newRole;
          user.role_change_count = (user.role_change_count || 0) + 1;
        }
        
        // Force refresh user data to get updated role from backend
        const updatedUser = await refreshUser();
        console.log('After refresh user role:', updatedUser?.role);
        
        // Also refresh available roles since they might change based on new role
        await fetchRoles();
        
        // Update the UI immediately by forcing a re-render
        setTimeout(() => {
          window.location.reload(); // Temporary fix to ensure UI updates
        }, 1000);
      } else {
        throw new Error(res.data.message || 'Role upgrade failed');
      }
    } catch (err: any) {
      console.error("Failed to upgrade role:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to upgrade role";
      toast.error(errorMessage);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setSubLoading(true);
    try {
      if (!token) {
        toast.error('You must be logged in to subscribe');
        return;
      }
      
      console.log('🚀 Starting premium subscription upgrade...');
      
      // Set up pending transaction and show PIN modal using the established pattern
      const paymentData = {
        amount: 9000,
        description: 'Premium Subscription (1 Year)',
        subscription_type: 'premium'
      };

      setPendingTransaction({
        type: 'payment',
        data: paymentData,
        callback: async (pin: string) => {
          console.log('💳 Processing premium payment with verified PIN...');
          
          // Initiate the premium payment now that PIN is verified
          const res = await apiClient.post('/users/subscription/premium/initiate');
          console.log('📄 Payment initiation response:', res.data);
          
          // Update subscription status
          await fetchSubscription();
          
          toast.success("Premium subscription activated successfully!");
        }
      });
      
      setShowPinModal(true);
      setSubLoading(false);
      
    } catch (err: any) {
      console.error("❌ Failed to start premium upgrade:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to start premium upgrade";
      toast.error(errorMessage);
      setSubLoading(false);
    }
  };

  const handlePinVerify = async (pin: string) => {
    if (pendingTransaction) {
      try {
        await pendingTransaction.callback(pin);
      } catch (error: any) {
        toast.error(error.message || 'Transaction failed');
      }
    }
    setPendingTransaction(null);
  };

  const handleResetPin = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-transaction-pin');
      toast.success("PIN reset instructions sent to your email!");
    } catch (error: any) {
      console.error("Error resetting PIN:", error);
      toast.error(error.message || "Failed to reset PIN");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'worker': return <User className="h-5 w-5" />;
      case 'employer': return <Briefcase className="h-5 w-5" />;
      case 'vendor': return <Settings className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'worker': return 'Find jobs and get hired for your skills';
      case 'employer': return 'Post jobs and hire skilled workers';
      case 'vendor': return 'Offer services and manage your business';
      default: return 'Platform user';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account security, roles, and subscriptions
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="role" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Role
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="transaction-pin" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              PIN
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </TabsTrigger>
          </TabsList>

          {/* Role Management Tab */}
          <TabsContent value="role" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Selection</CardTitle>
                <CardDescription>
                  Choose your primary role on the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Role Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Current Role</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleIcon(user?.role || 'user')}
                        <span className="text-xl font-bold capitalize text-blue-800">
                          {user?.role || 'user'}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      Active
                    </Badge>
                  </div>
                </div>

                {/* Role Change Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-600 font-medium">Role Changes Used</p>
                        <p className="text-2xl font-bold text-amber-800">{user?.role_change_count || 0}</p>
                      </div>
                      <RefreshCw className="h-8 w-8 text-amber-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Remaining Changes</p>
                        <p className="text-2xl font-bold text-purple-800">
                          {user?.subscription_tier === 'premium' ? '∞' : `${Math.max(0, 5 - (user?.role_change_count || 0))}/5`}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Available Roles */}
                {roleLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading available roles...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {availableRoles.map((role) => (
                      <Card
                        key={role}
                        className={`border-2 transition-all cursor-pointer hover:shadow-md ${
                          user?.role === role ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                        }`}
                      >
                        <CardHeader className="text-center">
                          <div className="mx-auto mb-2 text-primary">
                            {getRoleIcon(role)}
                          </div>
                          <CardTitle className="capitalize">{role}</CardTitle>
                          <CardDescription className="text-sm">
                            {getRoleDescription(role)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            className="w-full"
                            variant={user?.role === role ? "default" : "outline"}
                            onClick={() => handleRoleUpgrade(role)}
                            disabled={roleLoading || user?.role === role || (user?.subscription_tier !== 'premium' && (user?.role_change_count || 0) >= 5)}
                          >
                            {roleLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : user?.role === role ? (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            {user?.role === role ? "Current Role" : `Switch to ${role}`}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {user?.subscription_tier === 'premium' 
                      ? "Premium users have unlimited role changes." 
                      : `Free users can change their role up to 5 times. ${(user?.role_change_count || 0) >= 5 ? 'You have used all your free role changes. Upgrade to Premium for unlimited changes.' : `You have ${5 - (user?.role_change_count || 0)} changes remaining.`}`
                    }
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  View and manage your subscription tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading subscription details...</span>
                  </div>
                ) : subscription ? (
                  <div className="space-y-6">
                    {/* Current Subscription */}
                    <div className={`p-6 rounded-lg border ${
                      subscription.tier === 'premium' || subscription.tier === 'premium'
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                        : 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {subscription.tier === 'premium' || subscription.tier === 'premium' ? (
                            <Crown className="h-8 w-8 text-purple-600" />
                          ) : (
                            <Star className="h-8 w-8 text-slate-600" />
                          )}
                          <div>
                            <h3 className="text-xl font-bold capitalize">{subscription.tier} Plan</h3>
                            <p className="text-sm text-slate-600">{subscription.status}</p>
                          </div>
                        </div>
                        <Badge variant={subscription.tier === 'premium' || subscription.tier === 'premium' ? 'default' : 'secondary'}>
                          {subscription.tier === 'premium' || subscription.tier === 'premium' ? 'Active' : 'Free'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Expires</p>
                          <p className="font-semibold">
                            {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Status</p>
                          <p className="font-semibold capitalize">{subscription.status}</p>
                        </div>
                      </div>
                    </div>

                    {/* Upgrade Button */}
                    {(subscription.tier === 'basic' || subscription.tier === 'free') && (
                      <div className="text-center">
                        <Button onClick={handleUpgrade} disabled={subLoading} size="lg">
                          {subLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4 mr-2" />
                          )}
                          Upgrade to Premium
                        </Button>
                        <p className="text-sm text-slate-600 mt-2">
                          Unlock all features and remove limitations
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No subscription information available</p>
                  </div>
                )}

                {/* Subscription Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="h-5 w-5 text-slate-600" />
                      <h4 className="font-semibold">Free Plan</h4>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Basic job posting</li>
                      <li>• Limited profile features</li>
                      <li>• Standard support</li>
                    </ul>
                  </Card>
                  
                  <Card className="p-4 border-purple-200 bg-purple-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Crown className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold">Premium Plan</h4>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Unlimited job postings</li>
                      <li>• Advanced profile features</li>
                      <li>• Priority support</li>
                      <li>• Analytics dashboard</li>
                    </ul>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction PIN Tab */}
          <TabsContent value="transaction-pin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction PIN Management</CardTitle>
                <CardDescription>
                  Manage your 6-digit PIN for authorizing financial transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user?.transaction_pin_set ? (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Your transaction PIN is set up and active for secure transactions.
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowChangePin(true)}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Change Transaction PIN
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleResetPin}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        Reset PIN via Email
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        You haven't set up a transaction PIN yet. Set one up to secure your financial transactions.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={() => setShowPinSetup(true)}
                      className="w-full"
                      size="lg"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Set Up Transaction PIN
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-6">
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
                        type={showPassword ? "text" : "password"}
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        placeholder="Enter current password"
                        required
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
                      type={showPassword ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password_confirm">Confirm New Password</Label>
                    <Input
                      id="new_password_confirm"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.new_password_confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !passwordData.old_password || !passwordData.new_password || passwordData.new_password !== passwordData.new_password_confirm}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <TransactionPinSetup
          isOpen={showPinSetup}
          onClose={() => setShowPinSetup(false)}
          onSetupComplete={() => {
            setShowPinSetup(false);
            refreshUser();
            toast.success("Transaction PIN set up successfully!");
          }}
        />

        <ChangeTransactionPin
          isOpen={showChangePin}
          onClose={() => setShowChangePin(false)}
          onSuccess={() => {
            setShowChangePin(false);
            refreshUser();
            toast.success("Transaction PIN changed successfully!");
          }}
        />

        <TransactionPinModal
          isOpen={showPinModal}
          onClose={() => {
            setShowPinModal(false);
            setPendingTransaction(null);
          }}
          onVerify={handlePinVerify}
          transactionType={pendingTransaction?.type || 'payment'}
          transactionData={pendingTransaction?.data}
          amount={parseFloat(pendingTransaction?.data?.amount || '9000')}
        />
      </DialogContent>
    </Dialog>
  );
};
