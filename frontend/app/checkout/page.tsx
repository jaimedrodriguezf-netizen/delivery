import React from 'react';
import DeliveryCheckoutForm from '../../components/checkout/DeliveryCheckoutForm';

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
        <h1 className="text-2xl font-bold text-emerald-400 mb-2">
          Módulo de Envíos Logísticos - Quito (Fase 1)
        </h1>
        <p className="text-slate-400 mb-6 text-sm">
          Cotización en tiempo real por sector, pin en mapa GPS y cobro independiente del envío.
        </p>

        <DeliveryCheckoutForm />
      </div>
    </main>
  );
}
