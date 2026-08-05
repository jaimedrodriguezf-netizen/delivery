import { NextResponse } from 'next/server';

function calculateHaversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function calculateDynamicFee(distanceKm: number): number {
  if (distanceKm <= 3.0) return 2.00;
  if (distanceKm <= 7.0) return 3.00;
  if (distanceKm <= 15.0) return 4.50;
  const extraKm = Math.ceil(distanceKm - 15.0);
  return Number((4.50 + extraKm * 0.50).toFixed(2));
}

let externalDeliveriesStore: any[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('x-api-key') || request.headers.get('authorization');

    const {
      order_reference,
      customer_name,
      customer_phone,
      pickup,
      delivery,
      payment_method,
    } = body;

    if (!delivery || !delivery.lat || !delivery.lng) {
      return NextResponse.json(
        { success: false, error: 'Coordenadas GPS de entrega requeridas (lat, lng).' },
        { status: 422 }
      );
    }

    const pickupLat = pickup?.lat || -0.1800;
    const pickupLng = pickup?.lng || -78.4800;
    const destLat = Number(delivery.lat);
    const destLng = Number(delivery.lng);

    const distanceKm = calculateHaversineKm(pickupLat, pickupLng, destLat, destLng);
    const shippingFee = calculateDynamicFee(distanceKm);
    const trackingId = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newDelivery = {
      id: `del-ext-${Date.now()}`,
      tracking_id: trackingId,
      order_reference: order_reference || `EXT-ORD-${Date.now()}`,
      customer_name: customer_name || 'Cliente Final',
      customer_phone: customer_phone || '+593 99 000 0000',
      pickup_location: {
        hub_id: pickup?.hub_id || 'custom',
        lat: pickupLat,
        lng: pickupLng,
      },
      delivery_address: {
        street_address: delivery.street_address || 'Dirección de Entrega',
        lat: destLat,
        lng: destLng,
        reference_notes: delivery.reference_notes || '',
      },
      distance_km: distanceKm,
      shipping_fee: shippingFee,
      payment_method: payment_method || 'transfer',
      status: 'pending_pickup',
      tracking_url: `http://localhost:3000/tracking/${trackingId}`,
      created_at: new Date().toISOString(),
    };

    externalDeliveriesStore.push(newDelivery);

    return NextResponse.json(
      {
        success: true,
        message: 'Envío 3PL registrado exitosamente.',
        tracking_id: trackingId,
        shipping_fee: shippingFee,
        distance_km: distanceKm,
        status: 'pending_pickup',
        tracking_url: `http://localhost:3000/tracking/${trackingId}`,
        delivery: newDelivery,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
