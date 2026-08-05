'use client';

import React, { useState, useEffect } from 'react';

interface DeliveryItem {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  sector_name: string;
  sector_code: string;
  street_address: string;
  lat: number;
  lng: number;
  shipping_fee: number;
  payment_method: string;
  payment_status: string;
  delivery_status: 'pending' | 'dispatched' | 'delivered' | 'cancelled';
  origin_hub_id: string;
  origin_hub_name: string;
  created_at: string;
}

interface OriginHub {
  id: string;
  name: string;
}

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [hubs, setHubs] = useState<OriginHub[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [delRes, hubsRes] = await Promise.all([
        fetch('/api/v1/deliveries'),
        fetch('/api/v1/origin-hubs'),
      ]);

      const delData = await delRes.json();
      const hubsData = await hubsRes.json();

      if (delData.success) setDeliveries(delData.deliveries);
      if (hubsData.success) setHubs(hubsData.hubs);
    } catch (err) {
      console.error('Error al cargar la gestión de envíos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/v1/deliveries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, delivery_status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setDeliveries(data.deliveries);
      }
    } catch (err) {
      alert('Error al actualizar estado del envío.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateHub = async (id: string, newHubId: string) => {
    const selectedHub = hubs.find((h) => h.id === newHubId);
    if (!selectedHub) return;

    setUpdatingId(id);
    try {
      const res = await fetch('/api/v1/deliveries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          origin_hub_id: selectedHub.id,
          origin_hub_name: selectedHub.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDeliveries(data.deliveries);
      }
    } catch (err) {
      alert('Error al reasignar bodega de origen.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesStatus = filterStatus === 'all' || d.delivery_status === filterStatus;
    const matchesSearch =
      d.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.sector_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <span className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-xl text-emerald-400">📦</span>
            Panel de Gestión de Envíos
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Supervisá, asigná bodegas de salida y actualizá los estados de entrega en Quito.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-2 self-start">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Pedido o Cliente..."
            className="px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-slate-100 focus:border-emerald-500 focus:outline-none w-52"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-slate-100 focus:border-emerald-500 focus:outline-none font-bold"
          >
            <option value="all">Todos los Estados</option>
            <option value="pending">⏳ Pendiente</option>
            <option value="dispatched">🚚 En Camino / Despachado</option>
            <option value="delivered">✅ Entregado</option>
            <option value="cancelled">❌ Cancelado</option>
          </select>
        </div>
      </div>

      {/* Deliveries List */}
      {loading ? (
        <p className="text-xs text-slate-400 animate-pulse">Cargando lista de envíos...</p>
      ) : filteredDeliveries.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No se encontraron envíos que coincidan con los filtros.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-700 transition"
            >
              {/* Left Column: Order & Customer Details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-extrabold text-emerald-400 text-sm bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-lg">
                    {delivery.order_id}
                  </span>

                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                      delivery.delivery_status === 'delivered'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : delivery.delivery_status === 'dispatched'
                        ? 'bg-blue-950 text-blue-300 border-blue-800 animate-pulse'
                        : delivery.delivery_status === 'pending'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}
                  >
                    {delivery.delivery_status === 'delivered'
                      ? '✅ Entregado'
                      : delivery.delivery_status === 'dispatched'
                      ? '🚚 En Camino'
                      : delivery.delivery_status === 'pending'
                      ? '⏳ Pendiente'
                      : '❌ Cancelado'}
                  </span>

                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    Cobro Envío: ${delivery.shipping_fee.toFixed(2)} ({delivery.payment_method.toUpperCase()})
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{delivery.customer_name} — {delivery.customer_phone}</h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <span>📍</span> <strong>{delivery.sector_name}:</strong> {delivery.street_address}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    🏬 Bodega Salida: <strong className="text-slate-200">{delivery.origin_hub_name}</strong>
                  </span>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.lat},${delivery.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center gap-1 underline underline-offset-2"
                  >
                    <span>🧭</span> Google Maps NAVEGAR
                  </a>
                </div>
              </div>

              {/* Right Column: Actions (Change Hub & Change Status) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-6">
                {/* Re-assign Origin Hub */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Cambiar Bodega Origen</label>
                  <select
                    value={delivery.origin_hub_id}
                    onChange={(e) => handleUpdateHub(delivery.id, e.target.value)}
                    disabled={updatingId === delivery.id}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Change Status */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Actualizar Estado</label>
                  <select
                    value={delivery.delivery_status}
                    onChange={(e) => handleUpdateStatus(delivery.id, e.target.value)}
                    disabled={updatingId === delivery.id}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="pending">⏳ Pendiente</option>
                    <option value="dispatched">🚚 En Camino / Despachado</option>
                    <option value="delivered">✅ Entregado</option>
                    <option value="cancelled">❌ Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
