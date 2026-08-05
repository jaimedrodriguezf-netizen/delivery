import { NextResponse } from 'next/server';

let originHubsStore = [
  {
    id: 'hub-1',
    code: 'hub_magdalena',
    name: 'Bodega La Magdalena (Sur)',
    address: 'Av. Rodrigo de Chávez y 5 de Junio, La Magdalena, Quito',
    lat: -0.2350,
    lng: -78.5200,
    is_active: true,
    is_primary: true,
  },
  {
    id: 'hub-2',
    code: 'hub_basilica',
    name: 'Bodega Centro Basílica',
    address: 'Calle Carchi y Venezuela, junto a la Basílica del Voto Nacional',
    lat: -0.2170,
    lng: -78.5070,
    is_active: true,
    is_primary: false,
  },
  {
    id: 'hub-3',
    code: 'hub_conocoto',
    name: 'Bodega Conocoto (Valle de Los Chillos)',
    address: 'Av. Ilaló y Calle Bolívar, Parque Central de Conocoto',
    lat: -0.2950,
    lng: -78.4800,
    is_active: true,
    is_primary: false,
  },
  {
    id: 'hub-4',
    code: 'hub_andrade_marin',
    name: 'Hub Hospital Andrade Marín (HCAM)',
    address: 'Av. 18 de Septiembre y Ayacucho / Versalles, sector HCAM',
    lat: -0.2000,
    lng: -78.5020,
    is_active: true,
    is_primary: false,
  },
  {
    id: 'hub-5',
    code: 'hub_cotocollao',
    name: 'Bodega Cotocollao (Norte)',
    address: 'Av. Prensa N62-100 y Lizardo Ruiz, Cotocollao',
    lat: -0.1100,
    lng: -78.4900,
    is_active: true,
    is_primary: false,
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    hubs: originHubsStore,
  });
}

export async function POST(request: Request) {
  try {
    const { hubs } = await request.json();

    if (Array.isArray(hubs)) {
      originHubsStore = hubs.map((h) => ({
        ...h,
        lat: Number(h.lat) || -0.1800,
        lng: Number(h.lng) || -78.4800,
      }));
    }

    return NextResponse.json({
      success: true,
      message: 'Puntos de Origen / Bodegas actualizados exitosamente.',
      hubs: originHubsStore,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
