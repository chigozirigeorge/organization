// types/vendor.types.ts
// TypeScript interfaces for vendor marketplace

export type ServiceCategory = 
  | 'Electronics' 
  | 'HomeAppliances' 
  | 'Fashion' 
  | 'Beauty'
  | 'FoodDrinks' 
  | 'Health' 
  | 'Sports' 
  | 'Books'
  | 'Toys' 
  | 'Automotive' 
  | 'RealEstate' 
  | 'Services' 
  | 'Other';

export type ServiceStatus = 'Active' | 'Paused' | 'Sold' | 'Expired' | 'Removed';

export type DeliveryType = 'LocalPickup' | 'CrossStateDelivery' | 'DigitalDelivery';

export type OrderStatus = 
  | 'Pending' 
  | 'Paid' 
  | 'Processing' 
  | 'Shipped'
  | 'InTransit' 
  | 'Delivered' 
  | 'Completed' 
  | 'Disputed'
  | 'Cancelled' 
  | 'Refunded';

export interface VendorService {
  id: string;
  vendor_id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  price: number;
  images?: string[];
  status?: ServiceStatus;
  stock_quantity: number;
  is_negotiable?: boolean;
  view_count?: number;
  inquiry_count?: number;
  location_state: string;
  location_city: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  location_state: string;
  location_city: string;
  subscription_tier: 'Normal' | 'Pro' | 'Premium';
  subscription_expires_at?: string;
  is_verified?: boolean;
  total_sales?: number;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceOrder {
  id: string;
  order_number: string;
  service_id: string;
  vendor_id: string;
  buyer_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  platform_fee: number;
  vendor_amount: number;
  payment_reference: string;
  status?: OrderStatus;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  delivery_type: DeliveryType;
  delivery_fee?: number;
  delivery_amount_held?: number;
  delivery_confirmed?: boolean;
  delivery_confirmed_at?: string;
  delivery_address?: string;
  delivery_state?: string;
  delivery_city?: string;
  notes?: string;
  created_at?: string;
  paid_at?: string;
  completed_at?: string;
  cancelled_at?: string;
}

export interface CreateServiceDto {
  title: string;
  description: string;
  category: ServiceCategory;
  price: number;
  images?: string[];
  location_state: string;
  location_city: string;
  tags?: string[];
  stock_quantity?: number;
  is_negotiable?: boolean;
}

export interface CreateOrderDto {
  service_id: string;
  quantity: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  delivery_type: DeliveryType;
  delivery_address?: string;
  delivery_state?: string;
  delivery_city?: string;
  notes?: string;
}