import { NextResponse } from 'next/server';

// In-memory store for active payment channels
let paymentMethodsStore = [
  {
    id: 'deuna',
    code: 'deuna',
    name: 'Deuna QR',
    description: 'Pago instantáneo escaneando código QR Deuna (Ecuador)',
    icon: '⚡',
    is_active: true,
  },
  {
    id: 'card',
    code: 'card',
    name: 'Tarjeta de Crédito / Débito',
    description: 'Acepta Visa, Mastercard y tarjetas locales',
    icon: '💳',
    is_active: true,
  },
  {
    id: 'transfer',
    code: 'transfer',
    name: 'Transferencia Bancaria',
    description: 'Transferencia directa a cuentas locales (Pichincha, Guayaquil, etc.)',
    icon: '🏦',
    is_active: true,
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    payment_methods: paymentMethodsStore,
  });
}

export async function POST(request: Request) {
  try {
    const { payment_methods } = await request.json();

    if (Array.isArray(payment_methods)) {
      paymentMethodsStore = payment_methods;
    }

    return NextResponse.json({
      success: true,
      message: 'Canales de pago actualizados exitosamente.',
      payment_methods: paymentMethodsStore,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
