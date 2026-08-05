import { describe, it, expect } from 'vitest';
import {
  generateGoogleMapsUrl,
  generateGoogleMapsUrlFromAddress,
  generateMultiStopNavigationUrl
} from '../lib/navigation/mapsUrlGenerator';

describe('mapsUrlGenerator', () => {
  it('generates single destination navigation URL with precise lat and lng', () => {
    const url = generateGoogleMapsUrl(-0.180653, -78.467838);
    expect(url).toBe('https://www.google.com/maps/dir/?api=1&destination=-0.180653,-78.467838&travelmode=driving');
  });

  it('generates fallback search URL when coordinates are omitted', () => {
    const url = generateGoogleMapsUrlFromAddress({
      street_address: 'Av. Amazonas y Colón',
      sector_code: 'centro_norte',
      lat: 0,
      lng: 0,
    });
    expect(url).toBe('https://www.google.com/maps/dir/?api=1&destination=Av.%20Amazonas%20y%20Col%C3%B3n%2C%20Quito%2C%20Ecuador&travelmode=driving');
  });

  it('generates multi-stop route URL for courier dispatches', () => {
    const origin = { lat: -0.180000, lng: -78.467000 };
    const stops = [
      { lat: -0.180653, lng: -78.467838 },
      { lat: -0.220100, lng: -78.512300 }
    ];
    const url = generateMultiStopNavigationUrl(origin, stops);
    expect(url).toContain('https://www.google.com/maps/dir/?api=1&origin=-0.18%2C-78.467&destination=-0.2201%2C-78.5123');
    expect(url).toContain('waypoints=-0.180653%2C-78.467838');
  });
});
