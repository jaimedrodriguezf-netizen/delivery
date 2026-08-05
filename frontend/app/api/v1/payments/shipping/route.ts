import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, amount, payment_method, delivery_address, pricing_zone_id } = body;

    // Simulate payment transaction registration for Deuna, Card, or Transfer
    const transactionId = `TX-${payment_method.toUpperCase()}-${Date.now()}`;
    const transactionRef = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      status: 'paid',
      transaction_id: transactionId,
      transaction_ref: transactionRef,
      amount: amount,
      payment_method: payment_method,
      order_id: order_id,
      delivery_address: delivery_address,
      message: `Pago de envío por $${Number(amount).toFixed(2)} registrado exitosamente vía ${payment_method.toUpperCase()}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'failed',
        error: error.message || 'Error interno al procesar el pago del envío.',
      },
      { status: 500 }
    );
  }
}
