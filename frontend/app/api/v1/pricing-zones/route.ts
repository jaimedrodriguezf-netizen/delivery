import { NextResponse } from 'next/server';

let pricingZonesStore = [
  { id: '1', code: 'quito_norte', name: 'Norte Urbano (Carcelén, Cotocollao, Iñaquito)', flat_rate: 3.00, is_active: true, description: 'Cobertura estándar 24h' },
  { id: '2', code: 'quito_centro', name: 'Centro Norte / Comercial (La Floresta, Mariscal)', flat_rate: 2.50, is_active: true, description: 'Cobertura rápida 24h' },
  { id: '3', code: 'quito_sur', name: 'Sur Urbano (Villa Flora, Recreo, Quitumbe)', flat_rate: 3.50, is_active: true, description: 'Cobertura estándar 24-48h' },
  { id: '4', code: 'valle_chillos_conocoto', name: 'Valle de Los Chillos y Conocoto (La Armenia, San Rafael)', flat_rate: 4.50, is_active: true, description: 'Valle de Los Chillos 24-48h' },
  { id: '5', code: 'valle_tumbaco', name: 'Valle de Tumbaco y Cumbayá (Puembo, Nayón)', flat_rate: 4.50, is_active: true, description: 'Valle de Tumbaco 24-48h' },
  { id: '6', code: 'calderon', name: 'Calderón y Carapungo', flat_rate: 4.00, is_active: true, description: 'Norte Extremo 24-48h' },
  { id: '7', code: 'mitad_del_mundo', name: 'Mitad del Mundo y Pomasqui', flat_rate: 5.00, is_active: true, description: 'Periferia Norte 48h' }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    zones: pricingZonesStore,
  });
}

export async function POST(request: Request) {
  try {
    const { zones } = await request.json();

    if (Array.isArray(zones)) {
      pricingZonesStore = zones.map((z) => ({
        ...z,
        flat_rate: Number(z.flat_rate) || 0,
      }));
    }

    return NextResponse.json({
      success: true,
      message: 'Tarifas por zona actualizadas exitosamente.',
      zones: pricingZonesStore,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
