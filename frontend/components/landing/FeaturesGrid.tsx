import React from 'react';

const features = [
  {
    icon: '🏬',
    title: '5 Bodegas Estratégicas',
    description:
      'Puntos de retiro en La Magdalena, Centro Basílica, Conocoto, HCAM y Cotocollao para cobertura total de Quito.',
  },
  {
    icon: '📐',
    title: 'Cálculo Haversine por Distancia',
    description:
      'Tarifa de envío calculada automáticamente por GPS usando la fórmula de distancia esférica entre bodega y destino.',
  },
  {
    icon: '🗺️',
    title: 'Optimización de Rutas Multi-Bodega',
    description:
      'Algoritmo de vecino más cercano que ordena las entregas para minimizar kilómetros y tiempo de recorrido.',
  },
  {
    icon: '🧭',
    title: 'Navegación Google Maps 1-Click',
    description:
      'Generación automática de enlaces multi-parada para que el motorizado solo siga la ruta en su celular.',
  },
  {
    icon: '🔌',
    title: 'API REST Headless',
    description:
      'Endpoint POST /api/v1/deliveries/create para integrar tu tienda online y crear envíos programáticamente.',
  },
  {
    icon: '🧩',
    title: 'Widget Embeddable',
    description:
      'Componente React <DeliveryWidget /> listo para insertar en cualquier checkout de Next.js o Supabase.',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Capacidades de la Plataforma</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-100 mt-3">
            Todo lo que necesitás para operar envíos 3PL
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-700/60 shadow-lg hover:shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-base font-extrabold text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
