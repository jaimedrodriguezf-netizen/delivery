import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 px-6 text-center">
      {/* Gradient Background Orbs */}
      <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <span>🚀</span> Plataforma 3PL de Envíos — Quito, Ecuador
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-50 leading-tight">
          Envíos Inteligentes
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Multi-Bodega en Quito
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Calculá tarifas por distancia GPS en tiempo real, optimizá rutas de despacho desde 5 bodegas estratégicas, 
          e integrá tu tienda online con nuestra API REST en minutos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="/register"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950/40 transition-all hover:scale-105"
          >
            🏍️ Registrarse como Motorizado
          </a>
          <a
            href="/login"
            className="px-8 py-4 rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm transition-all hover:scale-105"
          >
            Iniciar Sesión →
          </a>
        </div>
      </div>
    </section>
  );
}
