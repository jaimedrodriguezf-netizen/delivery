import { describe, it, expect } from 'vitest';
import { calculateDynamicShippingFee, calculateHaversineDistanceKm } from '../lib/payments/shippingPaymentHandler';

describe('Dynamic Origin Hub Pricing Engine', () => {
  it('calculates 0-3km short distance fee as $2.00 from La Magdalena Hub to La Magdalena nearby pin', () => {
    const magdalenaHub = { lat: -0.2350, lng: -78.5200 };
    const nearbyCustomerPin = { lat: -0.2360, lng: -78.5210 }; // ~0.15 km

    const result = calculateDynamicShippingFee(
      magdalenaHub.lat,
      magdalenaHub.lng,
      nearbyCustomerPin.lat,
      nearbyCustomerPin.lng
    );

    expect(result.distanceKm).toBeLessThanOrEqual(3.0);
    expect(result.shippingFee).toBe(2.00);
  });

  it('calculates 3.1-7km standard distance fee as $3.00 from Centro Basilica Hub to Iñaquito pin', () => {
    const basilicaHub = { lat: -0.2170, lng: -78.5070 };
    const inaquitoPin = { lat: -0.1800, lng: -78.4800 }; // ~5 km

    const result = calculateDynamicShippingFee(
      basilicaHub.lat,
      basilicaHub.lng,
      inaquitoPin.lat,
      inaquitoPin.lng
    );

    expect(result.distanceKm).toBeGreaterThan(3.0);
    expect(result.distanceKm).toBeLessThanOrEqual(7.0);
    expect(result.shippingFee).toBe(3.00);
  });

  it('automatically recalculates shipping fee when admin edits hub coordinates from nearby to far away', () => {
    const customerPin = { lat: -0.1800, lng: -78.4800 }; // Iñaquito

    // 1. Initial Hub Location (HCAM - Hospital Andrade Marín: ~3.3 km -> $3.00)
    const initialHubLat = -0.2000;
    const initialHubLng = -78.5020;
    const initialCalc = calculateDynamicShippingFee(initialHubLat, initialHubLng, customerPin.lat, customerPin.lng);
    expect(initialCalc.shippingFee).toBe(3.00);

    // 2. Admin edits Hub location to Conocoto (Valle de Los Chillos: ~13 km -> $4.50)
    const editedHubLat = -0.2950;
    const editedHubLng = -78.4800;
    const updatedCalc = calculateDynamicShippingFee(editedHubLat, editedHubLng, customerPin.lat, customerPin.lng);

    expect(updatedCalc.distanceKm).toBeGreaterThan(10.0);
    expect(updatedCalc.shippingFee).toBe(4.50);
    expect(updatedCalc.shippingFee).not.toBe(initialCalc.shippingFee);
  });
});
