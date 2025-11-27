// components/vendor/VendorMarketplace.tsx
// Main marketplace page showing both services and jobs

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Search, Grid, List, Plus, ShoppingBag, Briefcase, 
  ArrowRight, MapPin, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { ServiceCard } from './ServiceCard';
import { CreateServiceForm } from './CreateServiceForm';
import { vendorApi } from '../../utils/vendorApi';
import { VendorService, ServiceCategory } from '../../types/vendor.types';
import { useAuth } from '../../contexts/AuthContext';
import { listJobs } from '../../services/labour';

const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Electronics', 'HomeAppliances', 'Fashion', 'Beauty', 
  'FoodDrinks', 'Health', 'Sports', 'Books', 
  'Toys', 'Automotive', 'RealEstate', 'Services', 'Other'
];

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location_state: string;
  location_city: string;
  estimated_duration_days: number;
  created_at: string;
}

type ViewType = 'all' | 'services' | 'jobs';
type ViewMode = 'grid' | 'list';

export const VendorMarketplace: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [services, setServices] = useState<VendorService[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const servicesParams: any = {
        page: 1,
        limit: 20
      };

      if (selectedCategory !== 'all') {
        servicesParams.category = selectedCategory;
      }

      if (searchQuery) {
        servicesParams.search = searchQuery;
      }

      const servicesData = await vendorApi.searchServices(servicesParams);
      setServices(servicesData);

      // Use labour service to list jobs
  const jobsData = await listJobs({ page: 1, limit: 20 });
  setJobs(jobsData.data || jobsData.jobs || jobsData || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    if (!user) {
      toast.error('Please login to list a service');
      navigate('/login');
      return;
    }

    if (!user.email_verified) {
      toast.error('Please verify your email first');
      navigate('/verify-email');
      return;
    }

    if (user.kyc_verified !== 'verified') {
      toast.error('Please complete KYC verification first');
      navigate('/verify/kyc');
      return;
    }

    setShowCreateForm(true);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = searchQuery === '' || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Discover Jobs & Services
            </h1>
            <p className="text-xl opacity-90">
              Find skilled workers or shop for quality products and services
            </p>
            
            <div className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                  placeholder="Search for jobs or services..."
                  className="pl-10 h-12 text-slate-900"
                />
              </div>
              <Button variant="secondary" className="h-12 px-6" onClick={fetchData}>
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* View Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex gap-2">
            <Button
              variant={view === 'all' ? 'default' : 'outline'}
              onClick={() => setView('all')}
              className="gap-2"
            >
              <Grid className="h-4 w-4" />
              All
            </Button>
            <Button
              variant={view === 'services' ? 'default' : 'outline'}
              onClick={() => setView('services')}
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Services ({services.length})
            </Button>
            <Button
              variant={view === 'jobs' ? 'default' : 'outline'}
              onClick={() => setView('jobs')}
              className="gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Jobs ({jobs.length})
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            <Button onClick={handleCreateService} className="gap-2">
              <Plus className="h-4 w-4" />
              List Service
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        {(view === 'all' || view === 'services') && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Button>
            {SERVICE_CATEGORIES.slice(0, 8).map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        {/* Services Grid */}
        {!loading && (view === 'all' || view === 'services') && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Featured Services ({filteredServices.length})
            </h2>

            <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-6`}>
              {filteredServices.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onViewDetails={(s) => navigate(`/dashboard/services/${s.id}`)}
                  onBuyNow={(s) => navigate(`/dashboard/services/${s.id}/purchase`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Jobs Section */}
        {!loading && (view === 'all' || view === 'jobs') && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Available Jobs ({jobs.length})
              </h2>
              <Button variant="ghost" className="gap-2" onClick={() => navigate('/dashboard/jobs')}>
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.slice(0, 6).map(job => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/dashboard/jobs/${job.id}`)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      {job.title}
                    </CardTitle>
                    <CardDescription>{job.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">₦{job.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location_city}, {job.location_state}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Apply Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCreateForm && (
        <CreateServiceForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            fetchData();
            toast.success('Service listed successfully!');
          }}
        />
      )}
    </div>
  );
};