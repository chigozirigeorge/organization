// components/vendor/ServiceDetails.tsx
// Detailed view of a single service with purchase options

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  ArrowLeft, MapPin, Package, Star, Heart, Share2, 
  MessageCircle, ShoppingCart, Shield, TrendingUp,
  CheckCircle, Clock, User, Phone, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageSlideshow } from './ImageSlideshow';
import { vendorApi } from '../../utils/vendorApi';
import { VendorService } from '../../types/vendor.types';
import { useAuth } from '../../contexts/AuthContext';

export const ServiceDetails: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState<VendorService | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    try {
      const data = await vendorApi.viewService(serviceId!);
      setService(data);
    } catch (error: any) {
      console.error('Failed to fetch service:', error);
      toast.error('Failed to load service details');
      navigate('/dashboard/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInquiry = async () => {
    if (!user) {
      toast.error('Please login to send an inquiry');
      navigate('/login');
      return;
    }

    if (!inquiryMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingInquiry(true);
    try {
      await vendorApi.createInquiry(serviceId!, inquiryMessage);
      toast.success('Inquiry sent successfully!');
      setInquiryMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    if (!user.email_verified) {
      toast.error('Please verify your email first');
      navigate('/verify-email');
      return;
    }

    navigate(`/dashboard/services/${serviceId}/purchase`, { 
      state: { service, quantity } 
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service?.title,
        text: service?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-slate-200 rounded" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-32 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Service not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalPrice = service.price * quantity;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => navigate('/dashboard/marketplace')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column - Images */}
        <div className="space-y-4">
          <ImageSlideshow images={service.images || []} className="h-96" />
          
          {/* Service Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary text-white">
              {service.category}
            </Badge>
            {service.is_negotiable && (
              <Badge variant="outline">Negotiable Price</Badge>
            )}
            {service.stock_quantity < 10 && service.stock_quantity > 0 && (
              <Badge variant="destructive">Only {service.stock_quantity} left!</Badge>
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Title and Actions */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{service.title}</h1>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-semibold">4.8</span>
              </div>
              <span className="text-slate-500">(127 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-bold text-primary">
                ₦{service.price.toLocaleString()}
              </span>
              {service.is_negotiable && (
                <span className="text-slate-500">or best offer</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{service.view_count || 0}</div>
                  <div className="text-xs text-slate-500">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{service.inquiry_count || 0}</div>
                  <div className="text-xs text-slate-500">Inquiries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{service.stock_quantity}</div>
                  <div className="text-xs text-slate-500">In Stock</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="text-2xl font-bold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(service.stock_quantity, quantity + 1))}
                  disabled={quantity >= service.stock_quantity}
                >
                  +
                </Button>
                <div className="ml-auto">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="text-2xl font-bold text-primary">
                    ₦{totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full h-12 gap-2 text-lg"
              onClick={handleBuyNow}
              disabled={service.stock_quantity === 0}
            >
              <ShoppingCart className="h-5 w-5" />
              {service.stock_quantity === 0 ? 'Out of Stock' : 'Buy Now'}
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 gap-2"
              onClick={() => setInquiryMessage('I am interested in this service.')}
            >
              <MessageCircle className="h-5 w-5" />
              Contact Vendor
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Verified Vendor</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 whitespace-pre-wrap">{service.description}</p>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="h-5 w-5 text-primary" />
            <span>{service.location_city}, {service.location_state}</span>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              V
            </div>
            <div>
              <h3 className="font-semibold text-lg">Verified Vendor</h3>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">4.8</span>
                <span className="text-sm text-slate-500">(200 sales)</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="h-4 w-4" />
              <span>98% positive feedback</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4" />
              <span>Member since 2024</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Inquiry */}
      <Card>
        <CardHeader>
          <CardTitle>Send Inquiry</CardTitle>
          <CardDescription>
            Have questions? Send a message to the vendor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Type your message here..."
            value={inquiryMessage}
            onChange={(e) => setInquiryMessage(e.target.value)}
            rows={4}
          />
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSendInquiry}
            disabled={sendingInquiry || !inquiryMessage.trim()}
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {sendingInquiry ? 'Sending...' : 'Send Inquiry'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};