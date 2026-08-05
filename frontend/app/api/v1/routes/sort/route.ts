import { NextResponse } from 'next/server';

let originHubsPreset: Record<string, { lat: number; lng: number; name: string }> = {
  'hub-1': { lat: -0.2350, lng: -78.5200, name: 'Bodega La Magdalena (Sur)' },
  'hub-2': { lat: -0.2170, lng: -78.5070, name: 'Bodega Centro Basílica' },
  'hub-3': { lat: -0.2950, lng: -78.4800, name: 'Bodega Conocoto (Valle de Los Chillos)' },
  'hub-4': { lat: -0.2000, lng: -78.5020, name: 'Hub Hospital Andrade Marín (HCAM)' },
  'hub-5': { lat: -0.1100, lng: -78.4900, name: 'Bodega Cotocollao (Norte)' },
};

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hub_id, hub_lat, hub_lng, delivery_ids, deliveries } = body;

    let originLat = Number(hub_lat) || -0.1800;
    let originLng = Number(hub_lng) || -78.4800;
    let hubName = 'Punto de Origen';

    if (hub_id && originHubsPreset[hub_id]) {
      originLat = originHubsPreset[hub_id].lat;
      originLng = originHubsPreset[hub_id].lng;
      hubName = originHubsPreset[hub_id].name;
    }

    let candidateDeliveries = Array.isArray(deliveries) ? [...deliveries] : [];

    if (candidateDeliveries.length === 0) {
      return NextResponse.json({
        success: true,
        sorted_deliveries: [],
        hub: { id: hub_id || 'hub-default', name: hubName, lat: originLat, lng: originLng },
        total_stops: 0,
        total_distance_km: 0,
        estimated_time_minutes: 0,
      });
    }

    // Nearest Neighbor Greedy Spatial Sort starting from origin hub
    let currentLat = originLat;
    let currentLng = originLng;
    let unvisited = [...candidateDeliveries];
    let sortedStops = [];
    let cumulativeDistance = 0;
    let sequence = 1;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const dist = calculateHaversineKm(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = i;
        }
      }

      const nextItem = unvisited.splice(nearestIndex, 1)[0];
      cumulativeDistance += minDistance;

      sortedStops.push({
        sequence,
        delivery_id: nextItem.id || `del-${sequence}`,
        order_id: nextItem.order_id || `ORD-${sequence}`,
        customer_name: nextItem.customer_name || 'Cliente',
        customer_phone: nextItem.customer_phone || '+593 99 000 0000',
        sector_name: nextItem.sector_name || 'Quito',
        street_address: nextItem.street_address || 'Dirección de Entrega',
        lat: nextItem.lat,
        lng: nextItem.lng,
        distance_from_prev_km: Number(minDistance.toFixed(2)),
        cumulative_distance_km: Number(cumulativeDistance.toFixed(2)),
      });

      currentLat = nextItem.lat;
      currentLng = nextItem.lng;
      sequence++;
    }

    // Estimate driving duration assuming average urban velocity of 25 km/h + 5 min per stop
    const estimatedDrivingMinutes = Math.round((cumulativeDistance / 25) * 60) + (sortedStops.length * 5);

    return NextResponse.json({
      success: true,
      sorted_deliveries: sortedStops,
      hub: { id: hub_id || 'hub-default', name: hubName, lat: originLat, lng: originLng },
      total_stops: sortedStops.length,
      total_distance_km: Number(cumulativeDistance.toFixed(2)),
      estimated_time_minutes: estimatedDrivingMinutes,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
