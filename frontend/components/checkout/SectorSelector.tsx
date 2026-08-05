'use client';

import React from 'react';
import { PricingZone } from '../../types/delivery';

interface SectorSelectorProps {
  zones: PricingZone[];
  selectedZoneCode: string | null;
  onSelectZone?: (zone: PricingZone) => void;
  disabled?: boolean;
}

export const SectorSelector: React.FC<SectorSelectorProps> = ({
  zones,
  selectedZoneCode,
}) => {
  const activeZones = zones.filter((z) => z.is_active);
  const selectedZone = activeZones.find((z) => z.code === selectedZoneCode);

  return (
    <div className="sector-selector-container w-full my-4">
      <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
        <span>Sector de Entrega Asignado</span>
        <span className="text-[11px] bg-slate-700/60 text-emerald-400 px-2 py-0.5 rounded font-normal border border-slate-600/50">
          🔒 Calculado por GPS
        </span>
      </label>

      {selectedZone ? (
        <div className="p-3.5 bg-slate-900/90 rounded-xl text-xs text-emerald-300 border border-emerald-800/60 flex justify-between items-center backdrop-blur-sm shadow-md">
          <div className="flex items-start gap-2.5">
            <span className="text-lg">📍</span>
            <div>
              <span className="font-extrabold text-emerald-400 text-sm block mb-0.5">
                {selectedZone.name}
              </span>
              {selectedZone.description && (
                <p className="text-slate-300 text-xs">{selectedZone.description}</p>
              )}
            </div>
          </div>
          <div className="text-right ml-4 shrink-0 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">Tarifa Envío</span>
            <span className="text-lg font-black text-emerald-300">
              ${Number(selectedZone.flat_rate).toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-slate-900/60 rounded-xl text-xs text-slate-400 border border-slate-700/80 animate-pulse">
          Detectando sector por ubicación GPS...
        </div>
      )}
    </div>
  );
};

export default SectorSelector;
