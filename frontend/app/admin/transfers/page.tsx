'use client';

import React, { useState, useEffect } from 'react';

interface TransferItem {
  id: string;
  delivery_id: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  sector_name: string;
  amount: number;
  bank_name: string;
  reference_number: string;
  receipt_url: string;
  status: 'pending_verification' | 'approved' | 'rejected';
  created_at: string;
}

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/transfers');
      const data = await res.json();
      if (data.success) {
        setTransfers(data.transfers);
      }
    } catch (err) {
      console.error('Error al cargar transferencias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleAction = async (transferId: string, action: 'approve' | 'reject') => {
    setProcessingId(transferId);
    try {
      const res = await fetch('/api/v1/transfers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transfer_id: transferId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setTransfers((prev) =>
          prev.map((t) =>
            t.id === transferId
              ? { ...t, status: action === 'approve' ? 'approved' : 'rejected' }
              : t
          )
        );
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error al procesar la solicitud: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    if (filter === 'pending') return t.status === 'pending_verification';
    if (filter === 'approved') return t.status === 'approved';
    if (filter === 'rejected') return t.status === 'rejected';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <span className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-xl text-emerald-400">💳</span>
            Validación de Transferencias Bancarias
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Auditoría y aprobación independiente de comprobantes de pago de envío.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pendientes ({transfers.filter((t) => t.status === 'pending_verification').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aprobadas ({transfers.filter((t) => t.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({transfers.length})
          </button>
        </div>
      </div>

      {/* Transfers List / Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse bg-slate-900/50 rounded-2xl border border-slate-800">
          Cargando comprobantes pendientes...
        </div>
      ) : filteredTransfers.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
          No hay transferencias en estado <span className="font-bold text-slate-200">{filter}</span>.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTransfers.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-700 transition"
            >
              {/* Left Column: Transfer Info */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                    {item.id}
                  </span>
                  <span className="text-xs text-slate-400">Orden: {item.order_id}</span>
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                      item.status === 'pending_verification'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                        : item.status === 'approved'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                        : 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                    }`}
                  >
                    {item.status === 'pending_verification' ? 'Pendiente Revisión' : item.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Cliente</span>
                    <span className="text-sm font-semibold text-slate-100">{item.customer_name}</span>
                    <span className="text-xs text-slate-400 block">{item.customer_phone}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Sector / Destino</span>
                    <span className="text-xs font-medium text-emerald-300">{item.sector_name}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Datos Comprobante</span>
                    <span className="text-xs font-semibold text-slate-200 block">{item.bank_name}</span>
                    <span className="text-xs font-mono text-emerald-400">Ref: {item.reference_number}</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Amount Badge */}
              <div className="text-left lg:text-right shrink-0 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Monto Envío</span>
                <span className="text-2xl font-black text-emerald-400">${item.amount.toFixed(2)}</span>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(item.receipt_url)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  👁️ Ver Comprobante
                </button>

                {item.status === 'pending_verification' && (
                  <>
                    <button
                      type="button"
                      disabled={processingId === item.id}
                      onClick={() => handleAction(item.id, 'approve')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
                    >
                      {processingId === item.id ? 'Aprobando...' : '✓ Aprobar'}
                    </button>

                    <button
                      type="button"
                      disabled={processingId === item.id}
                      onClick={() => handleAction(item.id, 'reject')}
                      className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition disabled:opacity-50"
                    >
                      ✕ Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Image Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Vista de Comprobante Bancario</h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
              <img
                src={selectedReceipt}
                alt="Comprobante Bancario"
                className="w-full h-72 object-cover rounded-lg"
              />
            </div>
            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
