// components/vendor/PurchaseService.tsx
// Service purchase flow with payment options

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  ArrowLeft, ShoppingCart, CreditCard, Wallet, 
  MapPin, Package, AlertCircle, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { vendorApi } from '../../utils/vendorApi';
import { CreateOrderDto, VendorService, DeliveryType } from '../../types/vendor.types';
import { useAuth } from '../../contexts/AuthContext';

export const PurchaseService: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [service, setService] = useState<VendorService | null>(
    location.state?.service || null
  );
  const [quantity, setQuantity] = useState(location.state?.quantity || 1);
  const [loading, setLoading] = useState(!service);
  const [processing, setProcessing] = useState(false);
  
  const [formData, setFormData] = useState<CreateOrderDto>({
    service_id: serviceId!,
    quantity: quantity,
    buyer_name: user?.name || '',
    buyer_email: user?.email || '',
    buyer_phone: '',
    delivery_type: 'LocalPickup' as DeliveryType,
    delivery_address: '',
    delivery_state: '',
    delivery_city: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (!service && serviceId) {
      fetchService();
    }
    fetchWalletBalance();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const data = await vendorApi.viewService(serviceId!);
      setService(data);
    } catch (error) {
      toast.error('Failed to load service');
      navigate('/dashboard/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('https://verinest.up.railway.app/api/wallet/naira', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.data?.available_balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const calculateCosts = () => {
    if (!service) return { subtotal: 0, platformFee: 0, deliveryFee: 0, total: 0 };
    
    const subtotal = service.price * quantity;
    const platformFee = subtotal * 0.05; // 5% platform fee
    
    let deliveryFee = 0;
    if (formData.delivery_type === 'CrossStateDelivery') {
      deliveryFee = 2500; // Fixed delivery fee
    }
    
    const total = subtotal + platformFee + deliveryFee;
    
    return { subtotal, platformFee, deliveryFee, total };
  };

  const costs = calculateCosts();
  const canAfford = walletBalance >= costs.total * 100; // Convert to kobo

  const validateForm = (): boolean => {
    if (!formData.buyer_name.trim()) {
      toast.error('Please enter your name');
      return false;
    }

    if (!formData.buyer_email.trim() || !/\S+@\S+\.\S+/.test(formData.buyer_email)) {
      toast.error('Please enter a valid email');
      return false;
    }

    if (formData.delivery_type === 'CrossStateDelivery') {
      if (!formData.delivery_address || !formData.delivery_state || !formData.delivery_city) {
        toast.error('Please fill in all delivery details');
        return false;
      }
    }

    if (paymentMethod === 'wallet' && !canAfford) {
      toast.error('Insufficient wallet balance');
      return false;
    }

    return true;
  };

  const handlePurchase = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    try {
      const orderData: CreateOrderDto = {
        ...formData,
        quantity
      };

      await vendorApi.createOrder(orderData);
      
      toast.success('Order placed successfully!');
      navigate('/dashboard/orders/my-purchases');
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-64 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => navigate(`/dashboard/services/${serviceId}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Service
      </Button>

      <h1 className="text-3xl font-bold mb-8">Complete Your Purchase</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Buyer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.buyer_name}
                  onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.buyer_email}
                  onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.buyer_phone || ''}
                  onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Delivery Type *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, delivery_type: 'LocalPickup' as DeliveryType })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.delivery_type === 'LocalPickup'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Package className="h-6 w-6 mb-2 mx-auto" />
                    <div className="font-semibold">Local Pickup</div>
                    <div className="text-xs text-slate-500">Free</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, delivery_type: 'CrossStateDelivery' as DeliveryType })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.delivery_type === 'CrossStateDelivery'
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <MapPin className="h-6 w-6 mb-2 mx-auto" />
                    <div className="font-semibold">Delivery</div>
                    <div className="text-xs text-slate-500">₦2,500</div>
                  </button>
                </div>
              </div>

              {formData.delivery_type === 'CrossStateDelivery' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.delivery_address || ''}
                      onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                      placeholder="Enter full delivery address"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.delivery_state || ''}
                        onChange={(e) => setFormData({ ...formData, delivery_state: e.target.value })}
                        placeholder="Lagos"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.delivery_city || ''}
                        onChange={(e) => setFormData({ ...formData, delivery_city: e.target.value })}
                        placeholder="Ikeja"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special delivery instructions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Wallet className="h-6 w-6 mb-2 mx-auto" />
                  <div className="font-semibold">Wallet</div>
                  <div className="text-xs text-slate-500">
                    Balance: ₦{(walletBalance / 100).toLocaleString()}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="h-6 w-6 mb-2 mx-auto" />
                  <div className="font-semibold">Card</div>
                  <div className="text-xs text-slate-500">Debit/Credit</div>
                </button>
              </div>

              {paymentMethod === 'wallet' && !canAfford && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Insufficient wallet balance. Please fund your wallet or use card payment.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Info */}
              <div className="flex gap-3 pb-4 border-b">
                <img
                  src={service.images?.[0] || 'https://via.placeholder.com/80'}
                  alt={service.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold line-clamp-2">{service.title}</h3>
                  <p className="text-sm text-slate-500">Qty: {quantity}</p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">₦{costs.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Platform Fee (5%)</span>
                  <span className="font-semibold">₦{costs.platformFee.toLocaleString()}</span>
                </div>
                {costs.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Delivery Fee</span>
                    <span className="font-semibold">₦{costs.deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">₦{costs.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Buyer Protection</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full h-12 gap-2"
                onClick={handlePurchase}
                disabled={processing || (paymentMethod === 'wallet' && !canAfford)}
              >
                <ShoppingCart className="h-5 w-5" />
                {processing ? 'Processing...' : `Pay ₦${costs.total.toLocaleString()}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};