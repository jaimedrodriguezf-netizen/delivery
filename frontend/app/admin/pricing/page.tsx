'use client';

import React, { useState, useEffect } from 'react';

interface PricingZoneItem {
  id: string;
  code: string;
  name: string;
  flat_rate: number;
  is_active: boolean;
  description: string;
}

export default function AdminPricingPage() {
  const [zones, setZones] = useState<PricingZoneItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/pricing-zones');
      const data = await res.json();
      if (data.success) {
        setZones(data.zones);
      }
    } catch (err) {
      console.error('Error al cargar tarifas por zona:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleRateChange = (id: string, newRate: number) => {
    setZones(
      zones.map((z) => (z.id === id ? { ...z, flat_rate: newRate } : z))
    );
  };

  const handleToggleActive = (id: string) => {
    setZones(
      zones.map((z) => (z.id === id ? { ...z, is_active: !z.is_active } : z))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/pricing-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('¡Tarifas de envío actualizadas exitosamente!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert(`Error al guardar tarifas: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <span className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-xl text-emerald-400">🗺️</span>
            Tarifas por Sector y Zona (Quito y Valles)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Ajustá las tarifas fijas de envío por sector urbano y valles de Quito.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 flex items-center gap-2 self-start"
        >
          <span>💾</span> {saving ? 'Guardando...' : 'Guardar Tarifas'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Pricing Zones Table / Grid */}
      {loading ? (
        <p className="text-xs text-slate-400 animate-pulse">Cargando tarifas por sector...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl ${
                zone.is_active
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              {/* Zone Details */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-100 text-sm">{zone.name}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    {zone.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{zone.description}</p>
              </div>

              {/* Price Rate Input */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-700">
                  <span className="text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={zone.flat_rate}
                    onChange={(e) => handleRateChange(zone.id, parseFloat(e.target.value) || 0)}
                    disabled={!zone.is_active}
                    className="w-20 bg-transparent text-sm font-black text-emerald-400 focus:outline-none disabled:text-slate-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 uppercase font-bold">USD</span>
                </div>

                {/* Active Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(zone.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition border ${
                    zone.is_active
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {zone.is_active ? '🟢 Activa' : '⚪ Inactiva'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
