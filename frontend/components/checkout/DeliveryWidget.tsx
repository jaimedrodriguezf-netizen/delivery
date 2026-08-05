'use client';

import React, { useState } from 'react';
import LocationPinPicker from './LocationPinPicker';
import { calculateDynamicShippingFee } from '../../lib/payments/shippingPaymentHandler';

export interface DeliveryWidgetProps {
  apiKey?: string;
  storeName?: string;
  pickupLat?: number;
  pickupLng?: number;
  onQuoteCalculated?: (fee: number, distanceKm: number) => void;
  onOrderCreated?: (trackingId: string, fee: number) => void;
}

export const DeliveryWidget: React.FC<DeliveryWidgetProps> = ({
  apiKey = 'demo_key_123',
  storeName = 'Mi Tienda Online',
  pickupLat = -0.1800,
  pickupLng = -78.4800,
  onQuoteCalculated,
  onOrderCreated,
}) => {
  const [destLat, setDestLat] = useState<number>(-0.180653);
  const [destLng, setDestLng] = useState<number>(-78.467838);
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successTracking, setSuccessTracking] = useState<string | null>(null);

  const calcResult = calculateDynamicShippingFee(pickupLat, pickupLng, destLat, destLng);

  const handleLocationSelect = (newLat: number, newLng: number) => {
    setDestLat(newLat);
    setDestLng(newLng);
    const newCalc = calculateDynamicShippingFee(pickupLat, pickupLng, newLat, newLng);
    if (onQuoteCalculated) {
      onQuoteCalculated(newCalc.shippingFee, newCalc.distanceKm);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/deliveries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          order_reference: `ORD-${Date.now()}`,
          customer_name: customerName,
          customer_phone: customerPhone,
          pickup: { lat: pickupLat, lng: pickupLng },
          delivery: {
            street_address: streetAddress || 'Pin GPS Seleccionado',
            lat: destLat,
            lng: destLng,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessTracking(data.tracking_id);
        if (onOrderCreated) {
          onOrderCreated(data.tracking_id, data.shipping_fee);
        }
      }
    } catch (err: any) {
      alert(`Error al crear envío: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="delivery-widget bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-2xl max-w-lg mx-auto font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Widget Integrable 3PL</span>
          <h3 className="font-extrabold text-base text-slate-100">{storeName} — Cotizador de Envío</h3>
        </div>
        <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full font-mono font-bold">
          ${calcResult.shippingFee.toFixed(2)} ({calcResult.distanceKm} km)
        </span>
      </div>

      {successTracking ? (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-xl text-center space-y-2">
          <span className="text-2xl">🎉</span>
          <h4 className="font-bold text-emerald-300 text-sm">¡Envío Registrado Exitosamente!</h4>
          <p className="text-xs text-slate-300 font-mono">Código de Rastreo: <strong>{successTracking}</strong></p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <LocationPinPicker
            initialLat={destLat}
            initialLng={destLng}
            onLocationSelect={handleLocationSelect}
            readOnly={isSubmitting}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Móvil (Ecuador)</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+593 99 123 4567"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección / Referencia (Opcional)</label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="Ej. Casa blanca junto al parque"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg transition disabled:opacity-50"
          >
            {isSubmitting ? 'Procesando Envío...' : `Solicitar Envío ($${calcResult.shippingFee.toFixed(2)})`}
          </button>
        </form>
      )}
    </div>
  );
};

export default DeliveryWidget;
