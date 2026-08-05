'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LocationPinPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

const DEFAULT_QUITO_LAT = -0.180653;
const DEFAULT_QUITO_LNG = -78.467838;

export const LocationPinPicker: React.FC<LocationPinPickerProps> = ({
  initialLat = DEFAULT_QUITO_LAT,
  initialLng = DEFAULT_QUITO_LNG,
  onLocationSelect,
  readOnly = false,
}) => {
  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [error, setError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    setLat(initialLat);
    setLng(initialLng);
  }, [initialLat, initialLng]);

  // Load Leaflet CSS & JS dynamically if not already loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeafletScript = () => {
      if ((window as any).L) {
        initMap();
        return;
      }

      const jsId = 'leaflet-js';
      if (!document.getElementById(jsId)) {
        const script = document.createElement('script');
        script.id = jsId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initMap();
        document.body.appendChild(script);
      } else {
        const existingScript = document.getElementById(jsId);
        if (existingScript) {
          existingScript.addEventListener('load', initMap);
        }
      }
    };

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current || leafletMapRef.current) return;

      // Fix default marker icon issues with Leaflet in React
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize Leaflet map with touch gestures & pinch-to-zoom (Uber style)
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 16,
        zoomControl: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: !readOnly,
      });

      leafletMapRef.current = map;

      // OpenStreetMap tile layer (Free, fast, detailed for Quito)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create draggable pin marker (Uber style)
      const marker = L.marker([initialLat, initialLng], {
        draggable: !readOnly,
      }).addTo(map);

      markerRef.current = marker;

      // Update position on pin drag end
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const newLat = Number(pos.lat.toFixed(6));
        const newLng = Number(pos.lng.toFixed(6));
        setLat(newLat);
        setLng(newLng);
        onLocationSelect(newLat, newLng);
      });

      // Tap / Click anywhere on map to move pin instantly (Uber style)
      map.on('click', (e: any) => {
        if (readOnly) return;
        const newLat = Number(e.latlng.lat.toFixed(6));
        const newLng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        setLat(newLat);
        setLng(newLng);
        onLocationSelect(newLat, newLng);
      });
    };

    loadLeafletScript();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update marker position when lat/lng change from GPS button
  const updateMapMarker = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    onLocationSelect(newLat, newLng);

    if (markerRef.current && leafletMapRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      leafletMapRef.current.setView([newLat, newLng], 16);
    }
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = Number(position.coords.latitude.toFixed(6));
          const newLng = Number(position.coords.longitude.toFixed(6));
          updateMapMarker(newLat, newLng);
          setError(null);
        },
        (err) => {
          setError(`No se pudo obtener tu ubicación actual: ${err.message}`);
        }
      );
    } else {
      setError('La geolocalización no está soportada en tu navegador.');
    }
  };

  return (
    <div className="location-pin-picker border border-slate-700/80 rounded-xl p-4 bg-slate-800/60 my-4 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="text-emerald-400">📍</span> Selecciona tu Ubicación en el Mapa
          </h4>
          <p className="text-[11px] text-slate-400">
            Pellizca para zoom, arrastra el mapa o toca en cualquier punto para fijar el pin (Estilo Uber)
          </p>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-xs bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 px-3 py-1.5 rounded-lg transition font-semibold shrink-0"
          >
            🎯 Mi GPS
          </button>
        )}
      </div>

      {/* Interactive Leaflet Uber-Style Map */}
      <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-700 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Read-Only Reference Coordinates Badge */}
      <div className="mt-3 p-2.5 bg-slate-900/90 rounded-lg border border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-400">📍</span> Referencia GPS:
        </span>
        <span className="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </span>
      </div>

      {error && (
        <p className="text-xs text-rose-400 mt-2 font-medium bg-rose-950/40 p-2 rounded border border-rose-900/50">
          {error}
        </p>
      )}
    </div>
  );
};

export default LocationPinPicker;
