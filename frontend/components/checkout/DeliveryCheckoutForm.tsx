'use client';

import React, { useState, useEffect } from 'react';
import { PricingZone, DeliveryAddress, PaymentMethod, ShippingPaymentResponse } from '../../types/delivery';
import SectorSelector from './SectorSelector';
import LocationPinPicker from './LocationPinPicker';
import { processShippingPayment, calculateTotalAmount, calculateDynamicShippingFee } from '../../lib/payments/shippingPaymentHandler';

interface OriginHubItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  is_active: boolean;
  is_primary: boolean;
}

const DEFAULT_QUITO_ZONES: PricingZone[] = [
  { id: '1', code: 'quito_norte', name: 'Norte Urbano (Carcelén, Cotocollao, Iñaquito)', flat_rate: 3.00, is_active: true, description: 'Cobertura estándar 24h' },
  { id: '2', code: 'quito_centro', name: 'Centro Norte / Comercial (La Floresta, Mariscal)', flat_rate: 2.50, is_active: true, description: 'Cobertura rápida 24h' },
  { id: '3', code: 'quito_sur', name: 'Sur Urbano (Villa Flora, Recreo, Quitumbe)', flat_rate: 3.50, is_active: true, description: 'Cobertura estándar 24-48h' },
  { id: '4', code: 'valle_chillos_conocoto', name: 'Valle de Los Chillos y Conocoto (La Armenia, San Rafael)', flat_rate: 4.50, is_active: true, description: 'Valle de Los Chillos 24-48h' },
  { id: '5', code: 'valle_tumbaco', name: 'Valle de Tumbaco y Cumbayá (Puembo, Nayón)', flat_rate: 4.50, is_active: true, description: 'Valle de Tumbaco 24-48h' },
  { id: '6', code: 'calderon', name: 'Calderón y Carapungo', flat_rate: 4.00, is_active: true, description: 'Norte Extremo 24-48h' },
  { id: '7', code: 'mitad_del_mundo', name: 'Mitad del Mundo y Pomasqui', flat_rate: 5.00, is_active: true, description: 'Periferia Norte 48h' }
];

const ZONE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  quito_centro: { lat: -0.1800, lng: -78.4800 },
  quito_norte: { lat: -0.1300, lng: -78.4750 },
  quito_sur: { lat: -0.2600, lng: -78.5200 },
  valle_chillos_conocoto: { lat: -0.2950, lng: -78.4800 },
  valle_tumbaco: { lat: -0.2100, lng: -78.4000 },
  calderon: { lat: -0.0900, lng: -78.4500 },
  mitad_del_mundo: { lat: -0.0050, lng: -78.4550 },
};

function findNearestZone(lat: number, lng: number, zones: PricingZone[]): PricingZone | null {
  let closestZone: PricingZone | null = null;
  let minDistance = Infinity;

  for (const zone of zones) {
    const centroid = ZONE_CENTROIDS[zone.code];
    if (!centroid) continue;

    const dLat = lat - centroid.lat;
    const dLng = lng - centroid.lng;
    const distSq = dLat * dLat + dLng * dLng;

    if (distSq < minDistance) {
      minDistance = distSq;
      closestZone = zone;
    }
  }

  return closestZone || zones[0] || null;
}

interface DeliveryCheckoutFormProps {
  orderId?: string;
  itemSubtotal?: number;
  availableZones?: PricingZone[];
  onSubmitSuccess?: (deliveryAddress: DeliveryAddress, paymentResult: ShippingPaymentResponse) => void;
  onCancel?: () => void;
}

export const DeliveryCheckoutForm: React.FC<DeliveryCheckoutFormProps> = ({
  orderId = 'ORD-DEMO-001',
  itemSubtotal = 25.00,
  availableZones = DEFAULT_QUITO_ZONES,
  onSubmitSuccess = (addr, res) => alert(`¡Envío Registrado! ID Referencia: ${res.transaction_id || 'OK'}`),
  onCancel,
}) => {
  const [lat, setLat] = useState<number>(-0.180653);
  const [lng, setLng] = useState<number>(-78.467838);
  const [selectedZone, setSelectedZone] = useState<PricingZone | null>(() =>
    findNearestZone(-0.180653, -78.467838, availableZones)
  );
  const [referenceNotes, setReferenceNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('deuna');
  const [transferReference, setTransferReference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [zonesList, setZonesList] = useState<PricingZone[]>(availableZones);
  const [activePaymentMethods, setActivePaymentMethods] = useState<PaymentMethod[]>(['deuna', 'card', 'transfer']);
  const [originHubs, setOriginHubs] = useState<OriginHubItem[]>([]);
  const [selectedHub, setSelectedHub] = useState<OriginHubItem | null>(null);

  useEffect(() => {
    fetch('/api/v1/origin-hubs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.hubs)) {
          const activeHubs = data.hubs.filter((h: any) => h.is_active);
          setOriginHubs(activeHubs);
          const primary = activeHubs.find((h: any) => h.is_primary) || activeHubs[0] || null;
          setSelectedHub(primary);
        }
      })
      .catch((err) => console.error('Error al obtener bodegas de origen:', err));

    fetch('/api/v1/pricing-zones')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.zones)) {
          setZonesList(data.zones);
        }
      })
      .catch((err) => console.error('Error al cargar zonas de tarifas:', err));

    fetch('/api/v1/settings/payment-methods')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.payment_methods)) {
          const activeCodes = data.payment_methods
            .filter((m: any) => m.is_active)
            .map((m: any) => m.code as PaymentMethod);
          if (activeCodes.length > 0) {
            setActivePaymentMethods(activeCodes);
            if (!activeCodes.includes(paymentMethod)) {
              setPaymentMethod(activeCodes[0]);
            }
          }
        }
      })
      .catch((err) => console.error('Error al obtener métodos de pago activos:', err));
  }, []);

  const dynamicPricing = selectedHub
    ? calculateDynamicShippingFee(selectedHub.lat, selectedHub.lng, lat, lng)
    : { distanceKm: 0, shippingFee: selectedZone ? Number(selectedZone.flat_rate) : 0 };

  const shippingFee = dynamicPricing.shippingFee;
  const totals = calculateTotalAmount(itemSubtotal, shippingFee);

  const handleLocationSelect = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    const autoDetected = findNearestZone(newLat, newLng, zonesList);
    if (autoDetected) {
      setSelectedZone(autoDetected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedZone) {
      setErrorMessage('Por favor selecciona o marca en el mapa tu ubicación.');
      return;
    }

    const deliveryAddress: DeliveryAddress = {
      street_address: referenceNotes.trim() || 'Ubicación seleccionada en Mapa GPS',
      sector_code: selectedZone.code,
      lat,
      lng,
      reference_notes: referenceNotes.trim() || undefined,
    };

    setIsSubmitting(true);

    try {
      const paymentResponse = await processShippingPayment({
        order_id: orderId,
        amount: shippingFee,
        payment_method: paymentMethod,
        delivery_address: deliveryAddress,
        pricing_zone_id: selectedZone.id,
      });

      if (paymentResponse.success) {
        onSubmitSuccess(deliveryAddress, paymentResponse);
      } else {
        setErrorMessage(paymentResponse.error || 'Error al procesar la confirmación del envío.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error inesperado al procesar la entrega.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="delivery-checkout-form bg-slate-800/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-slate-700/80 max-w-2xl mx-auto text-slate-100">
      <h3 className="text-xl font-extrabold text-slate-100 mb-5 pb-3 border-b border-slate-700/80 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-emerald-400 rounded-full inline-block"></span>
          Detalles de Envío
        </span>
        <span className="text-xs bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-3 py-1 rounded-full font-medium">
          Pin GPS Directo 📍
        </span>
      </h3>

      {/* Dynamic Origin Dispatch Hub Selector */}
      <div className="mb-5 p-4 bg-slate-900/90 rounded-xl border border-slate-700 space-y-2">
        <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
          <span>🏬 Bodega de Origen (Despacho del Producto)</span>
          <span className="text-[10px] text-slate-300 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Distancia: <strong className="text-emerald-300">{dynamicPricing.distanceKm} km</strong>
          </span>
        </label>
        <select
          value={selectedHub?.id || ''}
          onChange={(e) => {
            const h = originHubs.find((item) => item.id === e.target.value);
            if (h) setSelectedHub(h);
          }}
          disabled={isSubmitting || originHubs.length === 0}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none"
        >
          {originHubs.map((hub) => (
            <option key={hub.id} value={hub.id}>
              {hub.name} — {hub.address} {hub.is_primary ? '⭐ Principal' : ''}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-slate-400 italic">
          💡 La tarifa de envío se calcula dinámicamente según la distancia en KM desde la bodega seleccionada hasta tu pin GPS.
        </p>
      </div>

      {/* Map Pin Picker - Primary Location Input */}
      <LocationPinPicker
        initialLat={lat}
        initialLng={lng}
        onLocationSelect={handleLocationSelect}
        readOnly={isSubmitting}
      />

      {/* Sector Selection (Auto-filled by Map Pin) */}
      <SectorSelector
        zones={zonesList}
        selectedZoneCode={selectedZone?.code || null}
        onSelectZone={setSelectedZone}
        disabled={isSubmitting}
      />

      {/* Optional Location Reference / House / Apt Details Input */}
      <div className="mb-4">
        <label htmlFor="reference_notes" className="block text-sm font-semibold text-slate-200 mb-1.5">
          Detalle Adicional / Nro. Casa / Depto (Opcional)
        </label>
        <textarea
          id="reference_notes"
          value={referenceNotes}
          onChange={(e) => setReferenceNotes(e.target.value)}
          placeholder="Ej. Conjunto San José, Apto 3B / Casa blanca de 2 pisos junto al parque."
          rows={2}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-900 disabled:text-slate-500 transition"
        />
      </div>

      {/* Payment Method Selector (Dynamically filtered by Admin configuration) */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Método de Pago para el Envío <span className="text-emerald-400">*</span>
        </label>
        <div className={`grid gap-3 ${activePaymentMethods.length === 1 ? 'grid-cols-1' : activePaymentMethods.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {activePaymentMethods.map((method) => (
            <label
              key={method}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border cursor-pointer text-center text-xs font-bold uppercase tracking-wider transition-all ${
                paymentMethod === method
                  ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                  : 'border-slate-700/80 bg-slate-900/60 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value={method}
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
                disabled={isSubmitting}
                className="sr-only"
              />
              <span>{method === 'deuna' ? 'Deuna QR' : method === 'card' ? 'Tarjeta' : 'Transferencia'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bank Account Info Box (Visible when Transfer is selected) */}
      {paymentMethod === 'transfer' && (
        <div className="mb-6 p-4 bg-slate-900/90 rounded-xl border border-emerald-800/60 backdrop-blur-sm text-xs text-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
              <span>🏦</span> Datos para Transferencia del Envío
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700/60 font-mono font-bold">
              Monto exacto: ${shippingFee.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px] block">BANCO:</span>
              <span className="font-bold text-slate-100">Banco Pichincha</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">CUENTA CORRIENTE:</span>
              <span className="font-bold text-emerald-300">2100849201</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">TITULAR:</span>
              <span className="font-bold text-slate-100">Logística Quito S.A.</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">RUC:</span>
              <span className="font-bold text-slate-100">1792837492001</span>
            </div>
          </div>

          {/* Explicit 2-Option Verification Banner */}
          <div className="space-y-3 pt-1">
            <span className="block text-xs font-bold text-slate-200 uppercase tracking-wider text-center text-emerald-400">
              Elegí cómo querés confirmar tu comprobante (2 Opciones):
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Option A: Reference Code */}
              <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-200 block mb-1 flex items-center gap-1">
                    <span>1️⃣</span> Opción A: Escribir Referencia
                  </span>
                  <p className="text-[10px] text-slate-400 mb-2">Ingresá el nro. de documento o comprobante impreso.</p>
                </div>
                <input
                  type="text"
                  id="transfer_reference"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder="Ej. COMP-887412"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition font-mono"
                />
              </div>

              {/* Option B: WhatsApp Receipt Dispatch */}
              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-300 block mb-1 flex items-center gap-1">
                    <span>2️⃣</span> Opción B: Foto por WhatsApp
                  </span>
                  <p className="text-[10px] text-slate-300 mb-2">Enviá la captura directamente a nuestro celular en Ecuador.</p>
                </div>
                <a
                  href={`https://wa.me/593991234567?text=${encodeURIComponent(
                    `Hola! Acabo de realizar el pago del envío de mi pedido ${orderId}.\n\n` +
                    `📍 Sector: ${selectedZone?.name || 'Quito'}\n` +
                    `💵 Monto Envío: $${shippingFee.toFixed(2)}\n` +
                    `📄 Comprobante Ref: ${transferReference || 'Pendiente'}\n\n` +
                    `Adjunto la captura del comprobante bancario.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow"
                >
                  <span>📲</span> WhatsApp (+593 99 123 4567)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary - Shipping Fee Only */}
      <div className="bg-slate-900/90 p-4.5 rounded-xl border border-slate-700/80 mb-6 backdrop-blur-sm">
        <div className="flex justify-between items-center text-sm text-slate-300">
          <div>
            <span className="font-semibold text-slate-100 block">Cobro de Envío Logístico</span>
            <span className="text-xs text-slate-400">
              {selectedZone ? selectedZone.name : 'Detectando ubicación...'}
            </span>
          </div>
          <span className="text-2xl font-black text-emerald-400">
            ${shippingFee.toFixed(2)}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Form Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-1/3 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-700/60 transition"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !selectedZone}
          className={`py-3.5 px-5 rounded-xl text-white text-sm font-extrabold tracking-wide shadow-xl transition-all flex-1 ${
            isSubmitting || !selectedZone
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-950/60 active:scale-[0.99]'
          }`}
        >
          {isSubmitting ? 'Procesando Envío...' : `Confirmar y Registrar Envío ($${totals.shippingFee.toFixed(2)})`}
        </button>
      </div>
    </form>
  );
};

export default DeliveryCheckoutForm;
