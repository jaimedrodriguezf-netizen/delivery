'use client';

import React, { useState, useEffect } from 'react';
import { generateMultiStopNavigationUrl } from '../../../lib/navigation/mapsUrlGenerator';

interface OriginHub {
  id: string;
  code: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  is_active: boolean;
  is_primary: boolean;
}

interface DeliveryItem {
  id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  sector_name: string;
  street_address: string;
  lat: number;
  lng: number;
  origin_hub_id: string;
  origin_hub_name: string;
  delivery_status: string;
}

interface OptimizedStop {
  sequence: number;
  delivery_id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  sector_name: string;
  street_address: string;
  lat: number;
  lng: number;
  distance_from_prev_km: number;
  cumulative_distance_km: number;
}

export default function AdminRoutesPage() {
  const [hubs, setHubs] = useState<OriginHub[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [optimizedStops, setOptimizedStops] = useState<OptimizedStop[]>([]);
  const [routeMetrics, setRouteMetrics] = useState<{ totalStops: number; totalKm: number; estimatedMinutes: number } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hubsRes, delRes] = await Promise.all([
        fetch('/api/v1/origin-hubs'),
        fetch('/api/v1/deliveries'),
      ]);

      const hubsData = await hubsRes.json();
      const delData = await delRes.json();

      if (hubsData.success) setHubs(hubsData.hubs);
      if (delData.success) setDeliveries(delData.deliveries);
    } catch (err) {
      console.error('Error al cargar datos para optimización de rutas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOptimizeRoute = async () => {
    setOptimizing(true);
    try {
      let targetHub = hubs.find((h) => h.id === selectedHubId) || hubs.find((h) => h.is_primary) || hubs[0];
      let targetDeliveries = selectedHubId === 'all'
        ? deliveries
        : deliveries.filter((d) => d.origin_hub_id === selectedHubId);

      if (targetDeliveries.length === 0) {
        alert('No hay envíos disponibles para la bodega seleccionada.');
        setOptimizedStops([]);
        setRouteMetrics(null);
        return;
      }

      const res = await fetch('/api/v1/routes/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hub_id: targetHub.id,
          hub_lat: targetHub.lat,
          hub_lng: targetHub.lng,
          deliveries: targetDeliveries,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOptimizedStops(data.sorted_deliveries);
        setRouteMetrics({
          totalStops: data.total_stops,
          totalKm: data.total_distance_km,
          estimatedMinutes: data.estimated_time_minutes,
        });
      }
    } catch (err: any) {
      alert(`Error al optimizar la ruta: ${err.message}`);
    } finally {
      setOptimizing(false);
    }
  };

  const currentSelectedHub = hubs.find((h) => h.id === selectedHubId);

  const googleMapsUrl = routeMetrics && optimizedStops.length > 0 && currentSelectedHub
    ? generateMultiStopNavigationUrl(
        { lat: currentSelectedHub.lat, lng: currentSelectedHub.lng },
        optimizedStops.map((s) => ({ lat: s.lat, lng: s.lng, address: s.street_address }))
      )
    : '#';

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <span className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-xl text-emerald-400">🗺️</span>
            Optimización de Rutas de Despacho (Multi-Bodega)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Calculá la secuencia óptima paso a paso desde el punto de retiro hasta la entrega al cliente final.
          </p>
        </div>

        {/* Origin Hub Selector & Trigger Button */}
        <div className="flex flex-wrap items-center gap-3 self-start">
          <select
            value={selectedHubId}
            onChange={(e) => setSelectedHubId(e.target.value)}
            disabled={loading}
            className="px-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-900 text-slate-100 font-extrabold focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">🌐 Todas las Bodegas (Global)</option>
            {hubs.map((hub) => (
              <option key={hub.id} value={hub.id}>
                🏬 {hub.name} {hub.is_primary ? '⭐' : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleOptimizeRoute}
            disabled={optimizing || loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 flex items-center gap-2"
          >
            <span>⚡</span> {optimizing ? 'Calculando Ruta Óptima...' : 'Generar Rutas Óptimas por Bodega'}
          </button>
        </div>
      </div>

      {/* Metrics Summary Banner */}
      {routeMetrics && (
        <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950/80 border border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Paradas de Entrega</span>
              <span className="text-2xl font-black text-emerald-400">{routeMetrics.totalStops} Paradas</span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Distancia Recorrido</span>
              <span className="text-2xl font-black text-slate-100">{routeMetrics.totalKm} km</span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tiempo Est. Conducción</span>
              <span className="text-2xl font-black text-emerald-300">~{routeMetrics.estimatedMinutes} min</span>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition shrink-0"
          >
            <span>🧭</span> Abrir Navegación Google Maps Multi-Stop
          </a>
        </div>
      )}

      {/* Optimized Route Sequence List */}
      {loading ? (
        <p className="text-xs text-slate-400 animate-pulse">Cargando envíos y bodegas...</p>
      ) : optimizedStops.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <p className="text-sm text-slate-300 font-bold">Sin secuencia optimizada generada</p>
          <p className="text-xs text-slate-400 mt-1">
            Seleccioná una bodega de origen y hace clic en <strong>"⚡ Generar Rutas Óptimas por Bodega"</strong> para ordenar las entregas del día.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>🏁</span> Secuencia Óptima de Recorrido para el Motorizado:
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {optimizedStops.map((stop) => (
              <div
                key={stop.delivery_id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-md flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {/* Sequence Badge */}
                  <span className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700/80 text-emerald-300 font-black text-base flex items-center justify-center shrink-0">
                    #{stop.sequence}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-100 text-sm">{stop.customer_name}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {stop.order_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      📍 <strong>{stop.sector_name}:</strong> {stop.street_address}
                    </p>
                  </div>
                </div>

                {/* Leg Metrics */}
                <div className="text-right shrink-0 font-mono">
                  <span className="text-xs text-emerald-400 font-bold block">
                    +{stop.distance_from_prev_km} km
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Acumulado: {stop.cumulative_distance_km} km
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
