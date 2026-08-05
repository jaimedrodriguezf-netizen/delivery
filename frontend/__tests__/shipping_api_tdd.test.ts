import { describe, it, expect } from 'vitest';
import { calculateDynamicShippingFee } from '../lib/payments/shippingPaymentHandler';

describe('Strict TDD Headless Shipping API & Distance Fee Calculation', () => {
  it('calculates 3PL shipping rates correctly for 0-3km tier as $2.00', () => {
    const pickup = { lat: -0.1800, lng: -78.4800 };
    const delivery = { lat: -0.1810, lng: -78.4810 }; // ~0.15km

    const result = calculateDynamicShippingFee(pickup.lat, pickup.lng, delivery.lat, delivery.lng);
    expect(result.distanceKm).toBeLessThanOrEqual(3.0);
    expect(result.shippingFee).toBe(2.00);
  });

  it('calculates 3PL shipping rates for >15km long distance tier with extra $0.50/km', () => {
    const pickup = { lat: -0.1800, lng: -78.4800 };
    const delivery = { lat: -0.3500, lng: -78.5500 }; // ~20km

    const result = calculateDynamicShippingFee(pickup.lat, pickup.lng, delivery.lat, delivery.lng);
    expect(result.distanceKm).toBeGreaterThan(15.0);
    expect(result.shippingFee).toBeGreaterThan(4.50);
  });
});
