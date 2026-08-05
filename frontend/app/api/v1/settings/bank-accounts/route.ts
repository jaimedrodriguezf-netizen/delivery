import { NextResponse } from 'next/server';

// In-memory demo store for business settings & bank accounts
let settingsStore = {
  whatsapp_number: '593991234567',
  whatsapp_display: '+593 99 123 4567',
  bank_accounts: [
    {
      id: 'acc-1',
      bank_name: 'Banco Pichincha',
      account_type: 'Cuenta Corriente',
      account_number: '2100849201',
      account_holder: 'Logística Quito S.A.',
      tax_id: '1792837492001',
      is_active: true,
    },
    {
      id: 'acc-2',
      bank_name: 'Banco Guayaquil',
      account_type: 'Cuenta de Ahorros',
      account_number: '1209384756',
      account_holder: 'Logística Quito S.A.',
      tax_id: '1792837492001',
      is_active: true,
    },
  ],
};

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: settingsStore,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { whatsapp_number, whatsapp_display, bank_accounts } = body;

    if (whatsapp_number) settingsStore.whatsapp_number = whatsapp_number;
    if (whatsapp_display) settingsStore.whatsapp_display = whatsapp_display;
    if (Array.isArray(bank_accounts)) settingsStore.bank_accounts = bank_accounts;

    return NextResponse.json({
      success: true,
      message: 'Configuración bancaria y WhatsApp actualizada exitosamente.',
      settings: settingsStore,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
