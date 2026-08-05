import { NextResponse } from 'next/server';

let deliveriesStore = [
  {
    id: 'del-001',
    order_id: 'ORD-QUITO-101',
    customer_name: 'Carlos Mendoza',
    customer_phone: '+593 99 876 5432',
    sector_name: 'Norte Urbano (Iñaquito)',
    sector_code: 'quito_norte',
    street_address: 'Av. República E7-120 y Pradera, Apto 4B',
    lat: -0.1800,
    lng: -78.4800,
    shipping_fee: 3.00,
    payment_method: 'transfer',
    payment_status: 'approved',
    delivery_status: 'dispatched', // pending, dispatched, delivered, cancelled
    origin_hub_id: 'hub-4',
    origin_hub_name: 'Hub Hospital Andrade Marín (HCAM)',
    created_at: '2026-08-05T10:15:00Z',
  },
  {
    id: 'del-002',
    order_id: 'ORD-QUITO-102',
    customer_name: 'María Fernanda Ruiz',
    customer_phone: '+593 98 111 2233',
    sector_name: 'Valle de Los Chillos (Conocoto)',
    sector_code: 'valle_chillos_conocoto',
    street_address: 'Conjunto San José, Casa 14, Conocoto',
    lat: -0.2950,
    lng: -78.4800,
    shipping_fee: 4.50,
    payment_method: 'deuna',
    payment_status: 'approved',
    delivery_status: 'pending',
    origin_hub_id: 'hub-3',
    origin_hub_name: 'Bodega Conocoto (Valle de Los Chillos)',
    created_at: '2026-08-05T11:40:00Z',
  },
  {
    id: 'del-003',
    order_id: 'ORD-QUITO-103',
    customer_name: 'Juan Pablo Salazar',
    customer_phone: '+593 99 444 5566',
    sector_name: 'Sur Urbano (Villa Flora)',
    sector_code: 'quito_sur',
    street_address: 'Av. Alonso de Angulo y Galte',
    lat: -0.2350,
    lng: -78.5200,
    shipping_fee: 3.50,
    payment_method: 'card',
    payment_status: 'approved',
    delivery_status: 'delivered',
    origin_hub_id: 'hub-1',
    origin_hub_name: 'Bodega La Magdalena (Sur)',
    created_at: '2026-08-05T09:30:00Z',
  },
  {
    id: 'del-004',
    order_id: 'ORD-QUITO-104',
    customer_name: 'Andrea Benítez',
    customer_phone: '+593 99 222 3344',
    sector_name: 'Calderón y Carapungo',
    sector_code: 'calderon',
    street_address: 'Av. Geovanny Calles N12-40',
    lat: -0.0900,
    lng: -78.4500,
    shipping_fee: 4.00,
    payment_method: 'transfer',
    payment_status: 'approved',
    delivery_status: 'pending',
    origin_hub_id: 'hub-5',
    origin_hub_name: 'Bodega Cotocollao (Norte)',
    created_at: '2026-08-05T12:05:00Z',
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    deliveries: deliveriesStore,
  });
}

export async function PATCH(request: Request) {
  try {
    const { id, delivery_status, origin_hub_id, origin_hub_name } = await request.json();

    deliveriesStore = deliveriesStore.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          delivery_status: delivery_status || d.delivery_status,
          origin_hub_id: origin_hub_id || d.origin_hub_id,
          origin_hub_name: origin_hub_name || d.origin_hub_name,
        };
      }
      return d;
    });

    return NextResponse.json({
      success: true,
      message: 'Estado del envío actualizado correctamente.',
      deliveries: deliveriesStore,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
