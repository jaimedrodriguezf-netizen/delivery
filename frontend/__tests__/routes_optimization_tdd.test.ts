import { describe, it, expect } from 'vitest';
import { generateMultiStopNavigationUrl } from '../lib/navigation/mapsUrlGenerator';

describe('Strict TDD & Route Optimization Engine Tests', () => {
  it('correctly constructs Google Maps multi-stop navigation URL with origin, waypoints, and final destination', () => {
    const originHub = { lat: -0.2350, lng: -78.5200 }; // La Magdalena
    const stops = [
      { lat: -0.2170, lng: -78.5070, address: 'Centro Basílica' },
      { lat: -0.2000, lng: -78.5020, address: 'HCAM' },
      { lat: -0.1800, lng: -78.4800, address: 'Iñaquito' },
    ];

    const url = generateMultiStopNavigationUrl(originHub, stops);

    expect(url).toContain('https://www.google.com/maps/dir/?api=1');
    expect(url).toContain('origin=-0.235%2C-78.52');
    expect(url).toContain('destination=-0.18%2C-78.48');
    expect(url).toContain('waypoints=-0.217%2C-78.507%7C-0.2\n'.trim().split('\n')[0]);
    expect(url).toContain('travelmode=driving');
  });

  it('handles single stop navigation gracefully by omitting waypoints parameter', () => {
    const originHub = { lat: -0.2350, lng: -78.5200 };
    const singleStop = [{ lat: -0.1800, lng: -78.4800, address: 'Iñaquito' }];

    const url = generateMultiStopNavigationUrl(originHub, singleStop);

    expect(url).toContain('origin=-0.235%2C-78.52');
    expect(url).toContain('destination=-0.18%2C-78.48');
    expect(url).not.toContain('waypoints=');
  });
});
