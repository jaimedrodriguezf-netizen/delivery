'use client';

import React, { useState, useEffect } from 'react';

interface PaymentMethodItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/settings/payment-methods');
      const data = await res.json();
      if (data.success) {
        setMethods(data.payment_methods);
      }
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleToggle = (id: string) => {
    setMethods(
      methods.map((m) => (m.id === id ? { ...m, is_active: !m.is_active } : m))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/settings/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_methods: methods }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('¡Canales de pago actualizados exitosamente!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <span className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-xl text-emerald-400">💳</span>
            Gestión de Métodos de Pago Activos
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Habilitá o desactivá en tiempo real las opciones disponibles para el cliente en el checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 flex items-center gap-2 self-start"
        >
          <span>💾</span> {saving ? 'Guardando...' : 'Guardar Estado'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Payment Methods Toggle List */}
      {loading ? (
        <p className="text-xs text-slate-400 animate-pulse">Cargando métodos de pago...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${
                method.is_active
                  ? 'bg-slate-900/80 border-slate-700'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl p-2.5 bg-slate-800 rounded-xl border border-slate-700/80 shrink-0">
                  {method.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-100 text-base">{method.name}</h3>
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                        method.is_active
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {method.is_active ? 'Activo en Checkout' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{method.description}</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => handleToggle(method.id)}
                className={`w-36 py-2.5 px-4 rounded-xl text-xs font-extrabold transition border flex items-center justify-center gap-2 shrink-0 ${
                  method.is_active
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{method.is_active ? '🟢 Habilitado' : '⚪ Deshabilitado'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
