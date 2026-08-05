'use client';

import React, { useState, useEffect } from 'react';

interface BankAccount {
  id: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  account_holder: string;
  tax_id: string;
  is_active: boolean;
}

export default function AdminSettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState<string>('593991234567');
  const [whatsappDisplay, setWhatsappDisplay] = useState<string>('+593 99 123 4567');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New account form modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newBank, setNewBank] = useState<string>('Banco Pichincha');
  const [newAccountType, setNewAccountType] = useState<string>('Cuenta Corriente');
  const [newAccountNumber, setNewAccountNumber] = useState<string>('');
  const [newAccountHolder, setNewAccountHolder] = useState<string>('Logística Quito S.A.');
  const [newTaxId, setNewTaxId] = useState<string>('1792837492001');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/settings/bank-accounts');
      const data = await res.json();
      if (data.success) {
        setWhatsappNumber(data.settings.whatsapp_number);
        setWhatsappDisplay(data.settings.whatsapp_display);
        setBankAccounts(data.settings.bank_accounts);
      }
    } catch (err) {
      console.error('Error al cargar configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/settings/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_number: whatsappNumber,
          whatsapp_display: whatsappDisplay,
          bank_accounts: bankAccounts,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('¡Configuración guardada exitosamente!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountNumber.trim()) return;

    const newAcc: BankAccount = {
      id: `acc-${Date.now()}`,
      bank_name: newBank,
      account_type: newAccountType,
      account_number: newAccountNumber.trim(),
      account_holder: newAccountHolder.trim(),
      tax_id: newTaxId.trim(),
      is_active: true,
    };

    setBankAccounts([...bankAccounts, newAcc]);
    setShowAddModal(false);
    setNewAccountNumber('');
  };

  const handleToggleAccount = (id: string) => {
    setBankAccounts(
      bankAccounts.map((acc) =>
        acc.id === id ? { ...acc, is_active: !acc.is_active } : acc
      )
    );
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta cuenta bancaria?')) {
      setBankAccounts(bankAccounts.filter((acc) => acc.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <span className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-xl text-emerald-400">⚙️</span>
            Configuración de WhatsApp y Cuentas Bancarias
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Administrá los datos bancarios y números de contacto mostrados al cliente en el checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 flex items-center gap-2 self-start"
        >
          <span>💾</span> {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold animate-pulse">
          {successMsg}
        </div>
      )}

      {/* WhatsApp Configuration Section */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
          <span className="text-emerald-400">📲</span> Celular WhatsApp para Recepción de Comprobantes (Ecuador)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Número Internacional WhatsApp (sin signo +)
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="Ej. 593991234567"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Formato wa.me: 593 + 9 dígitos de celular (sin el 0 inicial).
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Texto Visible para el Cliente
            </label>
            <input
              type="text"
              value={whatsappDisplay}
              onChange={(e) => setWhatsappDisplay(e.target.value)}
              placeholder="Ej. +593 99 123 4567"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Bank Accounts Management Section */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="text-emerald-400">🏦</span> Cuentas Bancarias de Transferencia (Múltiples Bancos)
          </h3>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>➕</span> Agregar Cuenta Bancaria
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 animate-pulse">Cargando cuentas bancarias...</p>
        ) : bankAccounts.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay cuentas bancarias registradas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  acc.is_active
                    ? 'bg-slate-950/80 border-slate-700'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-100">{acc.bank_name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                      {acc.account_type}
                    </span>
                    {!acc.is_active && (
                      <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                        Inactiva
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-emerald-400">
                    Cta: {acc.account_number} | Titular: {acc.account_holder} | RUC/CI: {acc.tax_id}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleAccount(acc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      acc.is_active
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900'
                        : 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                    }`}
                  >
                    {acc.is_active ? 'Desactivar' : 'Activar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900 text-xs font-bold transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Bank Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddAccount} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Agregar Nueva Cuenta Bancaria</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Banco</label>
              <select
                value={newBank}
                onChange={(e) => setNewBank(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Banco Pichincha">Banco Pichincha</option>
                <option value="Banco Guayaquil">Banco Guayaquil</option>
                <option value="Produbanco">Produbanco</option>
                <option value="Banco del Pacífico">Banco del Pacífico</option>
                <option value="Banco Internacional">Banco Internacional</option>
                <option value="Cooperativa JEP">Cooperativa JEP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Cuenta</label>
              <select
                value={newAccountType}
                onChange={(e) => setNewAccountType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Cuenta Corriente">Cuenta Corriente</option>
                <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Número de Cuenta</label>
              <input
                type="text"
                value={newAccountNumber}
                onChange={(e) => setNewAccountNumber(e.target.value)}
                placeholder="Ej. 2100849201"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Titular de la Cuenta</label>
              <input
                type="text"
                value={newAccountHolder}
                onChange={(e) => setNewAccountHolder(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">RUC o Cédula</label>
              <input
                type="text"
                value={newTaxId}
                onChange={(e) => setNewTaxId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
              />
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
                Guardar Cuenta
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
