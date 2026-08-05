'use client';

import React, { useState, useEffect } from 'react';

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

export default function AdminOriginHubsPage() {
  const [hubs, setHubs] = useState<OriginHub[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Hub Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newLat, setNewLat] = useState<number>(-0.1800);
  const [newLng, setNewLng] = useState<number>(-78.4800);

  // Edit Hub Modal State
  const [editingHub, setEditingHub] = useState<OriginHub | null>(null);

  const fetchHubs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/origin-hubs');
      const data = await res.json();
      if (data.success) {
        setHubs(data.hubs);
      }
    } catch (err) {
      console.error('Error al cargar puntos de origen:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  const handleSaveHubs = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/origin-hubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hubs }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('¡Puntos de origen de despacho actualizados exitosamente!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert(`Error al guardar puntos de origen: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newHub: OriginHub = {
      id: `hub-${Date.now()}`,
      code: `hub_${newName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: newName.trim(),
      address: newAddress.trim() || 'Quito, Ecuador',
      lat: newLat,
      lng: newLng,
      is_active: true,
      is_primary: hubs.length === 0,
    };

    setHubs([...hubs, newHub]);
    setShowAddModal(false);
    setNewName('');
    setNewAddress('');
  };

  const handleUpdateHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHub || !editingHub.name.trim()) return;

    setHubs(hubs.map((h) => (h.id === editingHub.id ? editingHub : h)));
    setEditingHub(null);
  };

  const handleToggleActive = (id: string) => {
    setHubs(
      hubs.map((h) => (h.id === id ? { ...h, is_active: !h.is_active } : h))
    );
  };

  const handleSetPrimary = (id: string) => {
    setHubs(
      hubs.map((h) => ({ ...h, is_primary: h.id === id }))
    );
  };

  const handleDeleteHub = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este punto de origen/bodega?')) {
      setHubs(hubs.filter((h) => h.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <span className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-xl text-emerald-400">🏬</span>
            Gestión de Puntos de Origen / Bodegas (5 Hubs CRUD)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Creá, editá, activá y administrá las bodegas de despacho desde donde salen los pedidos.
          </p>
        </div>

        <div className="flex gap-2 self-start">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>➕</span> Agregar Bodega / Hub
          </button>

          <button
            type="button"
            onClick={handleSaveHubs}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 flex items-center gap-2"
          >
            <span>💾</span> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Hubs Grid */}
      {loading ? (
        <p className="text-xs text-slate-400 animate-pulse">Cargando puntos de origen...</p>
      ) : hubs.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No hay puntos de origen registrados.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {hubs.map((hub) => (
            <div
              key={hub.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl ${
                hub.is_active
                  ? 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-100 text-base">{hub.name}</h3>
                  {hub.is_primary && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      Bodega Principal ⭐
                    </span>
                  )}
                  {!hub.is_active && (
                    <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
                      Inactiva
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="text-emerald-400">📍</span> {hub.address}
                </p>
                <span className="text-[11px] font-mono text-slate-400 block bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
                  GPS Hub Origen: {hub.lat.toFixed(4)}, {hub.lng.toFixed(4)}
                </span>
              </div>

              {/* Action Buttons: Full CRUD controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingHub({ ...hub })}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                >
                  <span>✏️</span> Editar
                </button>

                {!hub.is_primary && hub.is_active && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(hub.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition"
                  >
                    Principal
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleToggleActive(hub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    hub.is_active
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  {hub.is_active ? 'Desactivar' : 'Activar'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteHub(hub.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900 text-xs font-bold transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Hub Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddHub} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Agregar Nuevo Punto de Origen / Bodega</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Bodega / Hub</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Bodega Cumbayá / Hub Sur"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección Exacta / Referencia</label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Ej. Av. Interoceánica Km 10.5"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Latitud GPS Origen</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newLat}
                  onChange={(e) => setNewLat(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Longitud GPS Origen</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newLng}
                  onChange={(e) => setNewLng(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg transition"
              >
                Guardar Hub
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Hub Modal */}
      {editingHub && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateHub} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Editar Datos de la Bodega</h3>
              <button
                type="button"
                onClick={() => setEditingHub(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Bodega / Hub</label>
              <input
                type="text"
                value={editingHub.name}
                onChange={(e) => setEditingHub({ ...editingHub, name: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección Exacta / Referencia</label>
              <input
                type="text"
                value={editingHub.address}
                onChange={(e) => setEditingHub({ ...editingHub, address: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Latitud GPS Origen</label>
                <input
                  type="number"
                  step="0.0001"
                  value={editingHub.lat}
                  onChange={(e) => setEditingHub({ ...editingHub, lat: parseFloat(e.target.value) || 0 })}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Longitud GPS Origen</label>
                <input
                  type="number"
                  step="0.0001"
                  value={editingHub.lng}
                  onChange={(e) => setEditingHub({ ...editingHub, lng: parseFloat(e.target.value) || 0 })}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingHub(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg transition"
              >
                Actualizar Bodega
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
