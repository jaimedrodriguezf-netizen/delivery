'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../../lib/auth/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = register({ name, email, phone, password });
    if (result.success) {
      router.push('/driver');
    } else {
      setError(result.error || 'Error al registrar.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <a href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-xs font-bold mb-6 transition">
            ← Volver al Inicio
          </a>
          <h1 className="text-3xl font-black text-slate-50">Crear Cuenta</h1>
          <p className="text-sm text-slate-400 mt-2">
            Registrate como <span className="text-emerald-400 font-bold">Motorizado / Repartidor</span> para empezar a recibir entregas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold">
              ❌ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos Mendoza"
              required
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@ejemplo.com"
              required
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Teléfono Móvil (Ecuador)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+593 99 123 4567"
              required
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300">
            🏍️ Tu cuenta será creada con el rol <strong>Motorizado</strong> por defecto.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950/40 transition-all disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse como Motorizado'}
          </button>

          <p className="text-center text-xs text-slate-400">
            ¿Ya tenés cuenta?{' '}
            <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
              Iniciá sesión
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
