import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeliveryCheckoutForm from '../components/checkout/DeliveryCheckoutForm';
import SectorSelector from '../components/checkout/SectorSelector';
import { PricingZone } from '../types/delivery';

describe('Integration & Flow Tests', () => {
  it('renders read-only SectorSelector with auto-assigned zone details', () => {
    const mockZone: PricingZone = {
      id: '4',
      code: 'valle_chillos_conocoto',
      name: 'Valle de Los Chillos y Conocoto (La Armenia)',
      flat_rate: 4.50,
      is_active: true,
      description: 'Cobertura Valle 24-48h',
    };

    render(
      <SectorSelector
        zones={[mockZone]}
        selectedZoneCode="valle_chillos_conocoto"
      />
    );

    expect(screen.getByText('Valle de Los Chillos y Conocoto (La Armenia)')).toBeDefined();
    expect(screen.getByText('$4.50')).toBeDefined();
    expect(screen.getByText('🔒 Calculado por GPS')).toBeDefined();
  });

  it('renders DeliveryCheckoutForm, auto-detects sector, and submits transfer payment', async () => {
    const handleSubmitSuccess = vi.fn();

    render(
      <DeliveryCheckoutForm
        orderId="ORD-TEST-100"
        itemSubtotal={25.00}
        onSubmitSuccess={handleSubmitSuccess}
      />
    );

    // 1. Verify header and auto GPS badge
    expect(screen.getByText('Detalles de Envío')).toBeDefined();
    expect(screen.getByText('Pin GPS Directo 📍')).toBeDefined();

    // 2. Select Payment Method: Transferencia
    const transferOption = screen.getByText('Transferencia');
    fireEvent.click(transferOption);

    // 3. Fill bank transfer reference number
    const refInput = screen.getByPlaceholderText(/COMP-887412/i);
    fireEvent.change(refInput, { target: { value: 'COMP-887412' } });

    // 4. Fill optional location reference
    const referenceInput = screen.getByPlaceholderText(/Conjunto San José/i);
    fireEvent.change(referenceInput, { target: { value: 'Casa de 2 pisos junto al parque de Conocoto' } });

    // 5. Submit shipping payment
    const submitBtn = screen.getByText(/Confirmar y Registrar Envío/i);
    fireEvent.click(submitBtn);

    // 6. Wait for submission success handler
    await waitFor(() => {
      expect(handleSubmitSuccess).toHaveBeenCalled();
    });
  });
});
