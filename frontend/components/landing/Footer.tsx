import React from 'react';

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-slate-800">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-950 border border-emerald-700/60 rounded-lg text-emerald-400 text-sm">📦</span>
            Delivery 3PL — Quito
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Plataforma de envíos inteligentes multi-bodega. © {new Date().getFullYear()}
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <a href="#api-docs" className="hover:text-emerald-400 transition">API Docs</a>
          <a href="/login" className="hover:text-emerald-400 transition">Iniciar Sesión</a>
          <a href="/register" className="hover:text-emerald-400 transition">Registro</a>
        </div>
      </div>
    </footer>
  );
}
