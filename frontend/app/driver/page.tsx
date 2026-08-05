'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../../lib/auth/authStore';
import { generateGoogleMapsUrl } from '../../lib/navigation/mapsUrlGenerator';
import { User } from '../../types/auth';

interface DriverDelivery {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  sector_name: string;
  street_address: string;
  lat: number;
  lng: number;
  origin_hub_name: string;
  delivery_status: string;
  shipping_fee: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-950 text-amber-300 border-amber-800',
  assigned: 'bg-blue-950 text-blue-300 border-blue-800',
  in_transit: 'bg-indigo-950 text-indigo-300 border-indigo-800',
  delivered: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  failed: 'bg-red-950 text-red-300 border-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  assigned: 'Asignado',
  in_transit: 'En Camino',
  delivered: 'Entregado',
  failed: 'Fallido',
};

export default function DriverDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/deliveries');
      const data = await res.json();
      if (data.success) {
        setDeliveries(data.deliveries);
      }
    } catch (err) {
      console.error('Error loading deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (deliveryId: string, newStatus: string) => {
    try {
      await fetch('/api/v1/deliveries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deliveryId, delivery_status: newStatus }),
      });
      setDeliveries((prev) =>
        prev.map((d) => (d.id === deliveryId ? { ...d, delivery_status: newStatus } : d))
      );
    } catch (err) {
      console.error('Error updating delivery status:', err);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-xl text-emerald-400 text-sm">🏍️</span>
          <div>
            <h1 className="text-sm font-extrabold text-slate-100">Panel del Motorizado</h1>
            <p className="text-[10px] text-slate-400">{user?.name || 'Repartidor'} — {user?.phone || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-red-950 hover:border-red-800 text-xs font-bold text-slate-300 hover:text-red-300 transition"
        >
          Cerrar Sesión
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <span>📋</span> Mis Entregas Asignadas
          </h2>
          <button
            onClick={fetchDeliveries}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 transition"
          >
            🔄 Actualizar
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 animate-pulse">Cargando entregas...</p>
        ) : deliveries.length === 0 ? (
          <div className="p-10 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
            <span className="text-4xl mb-3 block">📭</span>
            <p className="text-sm font-bold text-slate-300">Sin entregas asignadas</p>
            <p className="text-xs text-slate-400 mt-1">
              Cuando te asignen paquetes, aparecerán aquí con el botón de navegación.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {delivery.order_id}
                    </span>
                    <span className="font-extrabold text-sm text-slate-100">{delivery.customer_name}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${STATUS_COLORS[delivery.delivery_status] || STATUS_COLORS.pending}`}>
                    {STATUS_LABELS[delivery.delivery_status] || delivery.delivery_status}
                  </span>
                </div>

                {/* Delivery Info */}
                <div className="text-xs text-slate-300 space-y-1">
                  <p>📍 <strong>{delivery.sector_name}:</strong> {delivery.street_address}</p>
                  <p>🏬 <strong>Retiro:</strong> {delivery.origin_hub_name}</p>
                  <p>📱 <strong>Tel:</strong> {delivery.customer_phone}</p>
                  <p>💰 <strong>Tarifa:</strong> <span className="text-emerald-400 font-bold">${delivery.shipping_fee?.toFixed(2)}</span></p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  {/* Google Maps Navigation */}
                  <a
                    href={generateGoogleMapsUrl(delivery.lat, delivery.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-1.5"
                  >
                    🧭 Ir con Google Maps
                  </a>

                  {/* Status Transition Buttons */}
                  {(delivery.delivery_status === 'pending' || delivery.delivery_status === 'assigned') && (
                    <button
                      onClick={() => updateStatus(delivery.id, 'in_transit')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                    >
                      📦 Recogido
                    </button>
                  )}

                  {delivery.delivery_status === 'in_transit' && (
                    <>
                      <button
                        onClick={() => updateStatus(delivery.id, 'delivered')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                      >
                        ✅ Entregado
                      </button>
                      <button
                        onClick={() => updateStatus(delivery.id, 'failed')}
                        className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs transition"
                      >
                        ❌ Fallido
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
