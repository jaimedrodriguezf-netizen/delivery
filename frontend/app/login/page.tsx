'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, seedAdminUser } from '../../lib/auth/authStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    seedAdminUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = login({ email, password });
    if (result.success && result.user) {
      if (result.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/driver');
      }
    } else {
      setError(result.error || 'Error al iniciar sesión.');
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
          <h1 className="text-3xl font-black text-slate-50">Iniciar Sesión</h1>
          <p className="text-sm text-slate-400 mt-2">
            Accedé a tu panel de entregas o administración.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold">
              ❌ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950/40 transition-all disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-slate-300">🔑 Credenciales de Prueba (Admin):</p>
            <p>Email: <code className="text-emerald-400 font-mono">admin@delivery.ec</code></p>
            <p>Password: <code className="text-emerald-400 font-mono">admin123</code></p>
          </div>

          <p className="text-center text-xs text-slate-400">
            ¿No tenés cuenta?{' '}
            <a href="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition">
              Registrate como Motorizado
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
