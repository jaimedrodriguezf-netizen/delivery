export type DeliveryStatus =
  | 'pending'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed';

export type PaymentMethod =
  | 'deuna'
  | 'card'
  | 'transfer';

export interface PricingZone {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  flat_rate: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DeliveryAddress {
  street_address: string;
  sector_code: string;
  lat: number;
  lng: number;
  reference_notes?: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  pricing_zone_id: string;
  delivery_status: DeliveryStatus;
  payment_status: PaymentStatus;
  delivery_address: DeliveryAddress;
  shipping_fee: number;
  created_at: string;
  updated_at: string;
  pricing_zone?: PricingZone;
}

export interface ShippingPaymentRequest {
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  customer_email?: string;
  delivery_address: DeliveryAddress;
  pricing_zone_id: string;
}

export interface ShippingPaymentResponse {
  success: boolean;
  transaction_id?: string;
  status: PaymentStatus;
  error?: string;
}

export interface RouteSortRequestPayload {
  hub_lat: number;
  hub_lng: number;
  delivery_ids: string[];
}

export interface OptimizedStop {
  delivery_id: string;
  sequence: number;
  lat: number;
  lng: number;
  distance_from_prev_km: number;
  cumulative_distance_km: number;
  address: DeliveryAddress;
}

export interface RouteSortResponsePayload {
  hub: {
    lat: number;
    lng: number;
  };
  total_stops: number;
  total_distance_km: number;
  sorted_deliveries: OptimizedStop[];
}
