// components/vendor/VendorDashboard.tsx
// Dashboard for vendors to manage their services

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Store, Package, TrendingUp, Eye, MessageCircle, 
  Plus, Edit, Trash2, BarChart3, DollarSign, ShoppingBag,
  AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { vendorApi } from '../../utils/vendorApi';
import { VendorService, VendorProfile } from '../../types/vendor.types';
import { useAuth } from '../../contexts/AuthContext';

interface VendorStats {
  totalServices: number;
  activeServices: number;
  totalViews: number;
  totalInquiries: number;
  totalSales: number;
  totalRevenue: number;
}

export const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [services, setServices] = useState<VendorService[]>([]);
  const [stats, setStats] = useState<VendorStats>({
    totalServices: 0,
    activeServices: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalSales: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      // Fetch vendor profile
      const profileData = await vendorApi.getVendorProfile();
      setProfile(profileData);

      // Fetch vendor services
      const servicesData = await vendorApi.getMyServices();
      setServices(servicesData);

      // Calculate stats
      const activeServices = servicesData.filter(s => s.status === 'Active').length;
      const totalViews = servicesData.reduce((sum, s) => sum + (s.view_count || 0), 0);
      const totalInquiries = servicesData.reduce((sum, s) => sum + (s.inquiry_count || 0), 0);

      setStats({
        totalServices: servicesData.length,
        activeServices,
        totalViews,
        totalInquiries,
        totalSales: profileData.total_sales || 0,
        totalRevenue: 0 // This would come from orders
      });
    } catch (error: any) {
      console.error('Failed to fetch vendor data:', error);
      
      // If vendor profile doesn't exist, redirect to create one
      if (error.message?.includes('not found')) {
        navigate('/dashboard/vendor/setup');
      } else {
        toast.error('Failed to load vendor dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await vendorApi.deleteService(serviceId);
      toast.success('Service deleted successfully');
      fetchVendorData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete service');
    }
  };

  const handleStatusChange = async (serviceId: string, newStatus: string) => {
    try {
      await vendorApi.updateServiceStatus(serviceId, newStatus);
      toast.success('Service status updated');
      fetchVendorData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-slate-600">Manage your services and track performance</p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => navigate('/dashboard/vendor/services/create')}
        >
          <Plus className="h-4 w-4" />
          List New Service
        </Button>
      </div>

      {/* Profile Card */}
      {profile && (
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {profile.business_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile.business_name}</h2>
                  <p className="text-slate-600">{profile.location_city}, {profile.location_state}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={profile.is_verified ? 'default' : 'secondary'}>
                      {profile.is_verified ? '✓ Verified' : 'Pending Verification'}
                    </Badge>
                    <Badge variant="outline">{profile.subscription_tier}</Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/dashboard/vendor/profile/edit')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.totalServices}</div>
                <p className="text-xs text-slate-500">{stats.activeServices} active</p>
              </div>
              <Store className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-slate-500">Across all services</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.totalInquiries}</div>
                <p className="text-xs text-slate-500">Customer messages</p>
              </div>
              <MessageCircle className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.totalSales}</div>
                <p className="text-xs text-slate-500">Completed orders</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/dashboard/vendor/services/create')}
            >
              <Plus className="h-6 w-6" />
              <span>New Service</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/dashboard/vendor/orders')}
            >
              <ShoppingBag className="h-6 w-6" />
              <span>View Orders</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/dashboard/vendor/inquiries')}
            >
              <MessageCircle className="h-6 w-6" />
              <span>Inquiries</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/dashboard/vendor/analytics')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Services</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard/vendor/services')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2">No services yet</h3>
              <p className="text-slate-500 mb-4">Start by listing your first service</p>
              <Button onClick={() => navigate('/dashboard/vendor/services/create')}>
                <Plus className="h-4 w-4 mr-2" />
                List Your First Service
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {services.slice(0, 5).map(service => (
                <div
                  key={service.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <img
                    src={service.images?.[0] || 'https://via.placeholder.com/80'}
                    alt={service.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-1">{service.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Eye className="h-4 w-4" />
                        <span>{service.view_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <MessageCircle className="h-4 w-4" />
                        <span>{service.inquiry_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Package className="h-4 w-4" />
                        <span>{service.stock_quantity} in stock</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      ₦{service.price.toLocaleString()}
                    </div>
                    <Badge 
                      variant={service.status === 'Active' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {service.status}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/dashboard/vendor/services/${service.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};