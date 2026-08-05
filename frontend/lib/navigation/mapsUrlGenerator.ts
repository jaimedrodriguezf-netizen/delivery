import { DeliveryAddress } from '../../types/delivery';

export type TravelMode = 'driving' | 'bicycling' | 'walking' | 'transit';

/**
 * Generates a one-click Google Maps navigation direction URL.
 * Format: https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode={mode}
 */
export function generateGoogleMapsUrl(
  lat: number,
  lng: number,
  travelMode: TravelMode = 'driving'
): string {
  const encodedLat = encodeURIComponent(lat.toString());
  const encodedLng = encodeURIComponent(lng.toString());
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedLat},${encodedLng}&travelmode=${travelMode}`;
}

/**
 * Generates navigation URL directly from a DeliveryAddress object.
 */
export function generateGoogleMapsUrlFromAddress(
  address: DeliveryAddress,
  travelMode: TravelMode = 'driving'
): string {
  if (address.lat && address.lng) {
    return generateGoogleMapsUrl(address.lat, address.lng, travelMode);
  }
  const query = encodeURIComponent(`${address.street_address}, Quito, Ecuador`);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=${travelMode}`;
}

/**
 * Generates a multi-stop route navigation URL with hub origin, waypoints, and final destination.
 */
export function generateMultiStopNavigationUrl(
  origin: { lat: number; lng: number },
  stops: Array<{ lat: number; lng: number }>
): string {
  if (stops.length === 0) {
    return generateGoogleMapsUrl(origin.lat, origin.lng);
  }

  const originStr = `${origin.lat},${origin.lng}`;
  const destinationStop = stops[stops.length - 1];
  const destinationStr = `${destinationStop.lat},${destinationStop.lng}`;

  const waypoints = stops
    .slice(0, -1)
    .map((s) => `${s.lat},${s.lng}`)
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destinationStr)}`;
  if (waypoints) {
    url += `&waypoints=${encodeURIComponent(waypoints)}`;
  }
  url += '&travelmode=driving';

  return url;
}
