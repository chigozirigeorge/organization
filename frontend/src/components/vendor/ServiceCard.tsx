// components/vendor/ServiceCard.tsx
// Individual service display card with slideshow

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Heart, Eye, MessageCircle, Package, MapPin, 
  Star, ShoppingCart 
} from 'lucide-react';
import { ImageSlideshow } from './ImageSlideshow';
import { VendorService } from '../../types/vendor.types';

interface ServiceCardProps {
  service: VendorService;
  onViewDetails?: (service: VendorService) => void;
  onBuyNow?: (service: VendorService) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onViewDetails,
  onBuyNow 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(service);
    } else {
      navigate(`/dashboard/services/${service.id}`);
    }
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(service);
    } else {
      navigate(`/dashboard/services/${service.id}/purchase`);
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden bg-white">
      <div className="relative cursor-pointer" onClick={handleViewDetails}>
        <ImageSlideshow images={service.images || []} />
        
        {/* Quick Actions Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-primary text-white shadow-lg">
            {service.category}
          </Badge>
          {service.stock_quantity < 10 && service.stock_quantity > 0 && (
            <Badge variant="destructive" className="shadow-lg animate-pulse">
              Only {service.stock_quantity} left!
            </Badge>
          )}
          {service.stock_quantity === 0 && (
            <Badge variant="destructive" className="shadow-lg">
              Sold Out
            </Badge>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} 
          />
        </button>
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors cursor-pointer" onClick={handleViewDetails}>
            {service.title}
          </CardTitle>
          <div className="flex items-center gap-1 text-yellow-500 shrink-0">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-semibold">4.8</span>
          </div>
        </div>
        <CardDescription className="line-clamp-2 text-sm">
          {service.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">
            ₦{service.price.toLocaleString()}
          </span>
          {service.is_negotiable && (
            <Badge variant="outline" className="text-xs">
              Negotiable
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-1" title="Views">
            <Eye className="h-4 w-4" />
            <span>{service.view_count || 0}</span>
          </div>
          <div className="flex items-center gap-1" title="Inquiries">
            <MessageCircle className="h-4 w-4" />
            <span>{service.inquiry_count || 0}</span>
          </div>
          <div className="flex items-center gap-1" title="In Stock">
            <Package className="h-4 w-4" />
            <span>{service.stock_quantity}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          <span>{service.location_city}, {service.location_state}</span>
        </div>

        {/* Vendor Info */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold text-xs">
            V
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Verified Vendor</p>
            <p className="text-xs text-slate-500">Member since 2024</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
        <Button 
          className="flex-1 gap-2"
          onClick={handleBuyNow}
          disabled={service.stock_quantity === 0}
        >
          <ShoppingCart className="h-4 w-4" />
          {service.stock_quantity === 0 ? 'Sold Out' : 'Buy Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};