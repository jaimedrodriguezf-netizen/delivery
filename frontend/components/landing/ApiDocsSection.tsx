import React from 'react';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  exampleRequest?: string;
  exampleResponse: string;
}

const endpoints: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/api/v1/deliveries/create',
    description: 'Create a new 3PL delivery order with dynamic Haversine distance pricing.',
    exampleRequest: JSON.stringify(
      {
        order_reference: 'ORD-TIENDA-8841',
        customer_name: 'Juan Pérez',
        customer_phone: '+593 99 123 4567',
        pickup: { hub_id: 'hub-1' },
        delivery: { lat: -0.18, lng: -78.48, street_address: 'Av. República y Pradera' },
      },
      null,
      2
    ),
    exampleResponse: JSON.stringify(
      {
        success: true,
        tracking_id: 'TRK-884192',
        shipping_fee: 3.0,
        distance_km: 5.42,
        status: 'pending_pickup',
      },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/api/v1/routes/sort',
    description: 'Optimize delivery route sequence from an origin hub using nearest-neighbor spatial sorting.',
    exampleRequest: JSON.stringify(
      {
        hub_id: 'hub-1',
        hub_lat: -0.235,
        hub_lng: -78.52,
        deliveries: [
          { id: 'del-1', lat: -0.217, lng: -78.507, customer_name: 'Cliente A' },
          { id: 'del-2', lat: -0.295, lng: -78.48, customer_name: 'Cliente B' },
        ],
      },
      null,
      2
    ),
    exampleResponse: JSON.stringify(
      {
        success: true,
        total_stops: 2,
        total_distance_km: 8.74,
        estimated_time_minutes: 31,
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/v1/origin-hubs',
    description: 'List all active origin warehouses (bodegas) with GPS coordinates.',
    exampleResponse: JSON.stringify(
      {
        success: true,
        hubs: [
          { id: 'hub-1', name: 'Bodega La Magdalena (Sur)', lat: -0.235, lng: -78.52, is_primary: true },
        ],
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/v1/deliveries',
    description: 'List all delivery orders with status, origin hub, and destination.',
    exampleResponse: JSON.stringify(
      {
        success: true,
        deliveries: [
          {
            id: 'del-001',
            order_id: 'ORD-001',
            delivery_status: 'pending',
            origin_hub_name: 'Bodega La Magdalena',
          },
        ],
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/api/v1/pricing-zones',
    description: 'List pricing zone configurations and flat rates.',
    exampleResponse: JSON.stringify(
      {
        success: true,
        zones: [{ code: 'QUI-SUR', name: 'Quito Sur', flat_rate: 2.5, is_active: true }],
      },
      null,
      2
    ),
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-950 text-blue-300 border-blue-800',
  POST: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  PATCH: 'bg-amber-950 text-amber-300 border-amber-800',
  DELETE: 'bg-red-950 text-red-300 border-red-800',
};

export default function ApiDocsSection() {
  return (
    <section id="api-docs" className="py-20 px-6 bg-slate-950/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            🔌 Developer API Reference
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-100 mt-3">
            REST API Endpoints
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Integrá tu e-commerce, app móvil o ERP con nuestra API. Base URL: <code className="text-emerald-400 font-mono text-xs">https://tu-dominio.com</code>
          </p>
        </div>

        <div className="space-y-6">
          {endpoints.map((ep, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg overflow-hidden"
            >
              <summary className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-800/50 transition">
                <span
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${METHOD_COLORS[ep.method]}`}
                >
                  {ep.method}
                </span>
                <code className="text-sm font-mono font-bold text-slate-200">{ep.path}</code>
                <span className="text-xs text-slate-400 ml-auto hidden sm:inline">{ep.description}</span>
              </summary>

              <div className="px-6 pb-6 pt-2 space-y-4 border-t border-slate-800">
                <p className="text-xs text-slate-300">{ep.description}</p>

                {ep.exampleRequest && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Request Body</span>
                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto">
                      {ep.exampleRequest}
                    </pre>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Response</span>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-teal-300 font-mono overflow-x-auto">
                    {ep.exampleResponse}
                  </pre>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
