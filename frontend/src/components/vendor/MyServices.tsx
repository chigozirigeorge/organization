// components/vendor/MyServices.tsx
// Full list of vendor's services with filtering and management

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, Filter, Plus, Edit, Trash2, Eye, MessageCircle, 
  Package, MoreVertical, Power, PowerOff
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { vendorApi } from '../../utils/vendorApi';
import { VendorService } from '../../types/vendor.types';

export const MyServices: React.FC = () => {
  const navigate = useNavigate();
  
  const [services, setServices] = useState<VendorService[]>([]);
  const [filteredServices, setFilteredServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchServices();
  }, [statusFilter]);

  useEffect(() => {
    filterServices();
  }, [searchQuery, services]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await vendorApi.getMyServices(
        statusFilter !== 'all' ? statusFilter : undefined
      );
      setServices(data);
      setFilteredServices(data);
    } catch (error: any) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await vendorApi.deleteService(serviceId);
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete service');
    }
  };

  const handleStatusToggle = async (service: VendorService) => {
    const newStatus = service.status === 'Active' ? 'Paused' : 'Active';
    
    try {
      await vendorApi.updateServiceStatus(service.id, newStatus);
      toast.success(`Service ${newStatus === 'Active' ? 'activated' : 'paused'}`);
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Services</h1>
          <p className="text-slate-600">Manage all your listed services</p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => navigate('/dashboard/vendor/services/create')}
        >
          <Plus className="h-4 w-4" />
          List New Service
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'Active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'Paused' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Paused')}
              >
                Paused
              </Button>
              <Button
                variant={statusFilter === 'Sold' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Sold')}
              >
                Sold
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-slate-600 mb-4">
        Showing {filteredServices.length} of {services.length} services
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-slate-200 rounded" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Services List */}
      {!loading && filteredServices.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-slate-500 mb-4">
              {searchQuery 
                ? 'Try adjusting your search criteria'
                : 'Start by listing your first service'}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/dashboard/vendor/services/create')}>
                <Plus className="h-4 w-4 mr-2" />
                List Your First Service
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredServices.map(service => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Service Image */}
                  <img
                    src={service.images?.[0] || 'https://via.placeholder.com/120'}
                    alt={service.title}
                    className="w-24 h-24 object-cover rounded cursor-pointer"
                    onClick={() => navigate(`/dashboard/services/${service.id}`)}
                  />
                  
                  {/* Service Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 
                          className="text-xl font-semibold line-clamp-1 cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/dashboard/services/${service.id}`)}
                        >
                          {service.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => navigate(`/dashboard/services/${service.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => navigate(`/dashboard/vendor/services/${service.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusToggle(service)}>
                            {service.status === 'Active' ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mb-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{service.view_count || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{service.inquiry_count || 0} inquiries</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{service.stock_quantity} in stock</span>
                      </div>
                    </div>

                    {/* Price and Status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          ₦{service.price.toLocaleString()}
                        </span>
                        {service.is_negotiable && (
                          <Badge variant="outline" className="ml-2">
                            Negotiable
                          </Badge>
                        )}
                      </div>
                      <Badge 
                        variant={
                          service.status === 'Active' ? 'default' : 
                          service.status === 'Paused' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};