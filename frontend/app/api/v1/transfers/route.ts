import { NextResponse } from 'next/server';

// In-memory demo store for transfer verification (linked to Supabase deliveries table)
let mockTransfers = [
  {
    id: 'TRF-1001',
    delivery_id: 'DEL- Quito-081',
    order_id: 'ORD-9842',
    customer_name: 'Carlos Mendoza',
    customer_phone: '0991234567',
    sector_name: 'Valle de Los Chillos y Conocoto (La Armenia)',
    amount: 4.50,
    bank_name: 'Banco Pichincha',
    reference_number: 'COMP-887412',
    receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
    status: 'pending_verification',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
  },
  {
    id: 'TRF-1002',
    delivery_id: 'DEL-Quito-082',
    order_id: 'ORD-9843',
    customer_name: 'María Fernanda Gómez',
    customer_phone: '0987654321',
    sector_name: 'Norte Urbano (Iñaquito)',
    amount: 3.00,
    bank_name: 'Banco Guayaquil',
    reference_number: 'COMP-992301',
    receipt_url: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=600&q=80',
    status: 'pending_verification',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'TRF-1000',
    delivery_id: 'DEL-Quito-080',
    order_id: 'ORD-9840',
    customer_name: 'Juan Pérez',
    customer_phone: '0995554433',
    sector_name: 'Centro Norte (La Floresta)',
    amount: 2.50,
    bank_name: 'Produbanco',
    reference_number: 'COMP-771204',
    receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
    status: 'approved',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    transfers: mockTransfers,
  });
}

export async function PATCH(request: Request) {
  try {
    const { transfer_id, action } = await request.json(); // action: 'approve' | 'reject'

    const index = mockTransfers.findIndex((t) => t.id === transfer_id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Transferencia no encontrada' }, { status: 404 });
    }

    if (action === 'approve') {
      mockTransfers[index].status = 'approved';
    } else if (action === 'reject') {
      mockTransfers[index].status = 'rejected';
    }

    return NextResponse.json({
      success: true,
      message: `Transferencia ${transfer_id} ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente.`,
      transfer: mockTransfers[index],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
