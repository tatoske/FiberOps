import React, { useEffect, useRef } from 'react';
import { Technician, WorkOrder } from '@fiberops/shared';
import { Radio, RefreshCw } from 'lucide-react';

interface FleetMapViewProps {
  technicians: Technician[];
  orders: WorkOrder[];
  onSelectOrder?: (order: WorkOrder) => void;
}

export const FleetMapView: React.FC<FleetMapViewProps> = ({
  technicians,
  orders,
  onSelectOrder,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let timer: any;

    async function initMap() {
      if (!mapContainerRef.current) return;

      // Clean up previous Leaflet instance if present
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      const L = (window as any).L || (await import('leaflet')).default;

      // Initialize map centered in Bogotá
      const map = L.map(mapContainerRef.current, {
        center: [4.685, -74.06],
        zoom: 12,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // Standard, ultra-reliable OpenStreetMap tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add Technician markers
      technicians.forEach((tech) => {
        const techIcon = L.divIcon({
          className: 'custom-tech-pin',
          html: `
            <div style="
              background: #10b981;
              color: white;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 15px;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(16,185,129,0.5);
            ">
              🚐
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([tech.currentCoordinates.lat, tech.currentCoordinates.lng], {
          icon: techIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; padding: 2px;">
            <strong style="color: #0f172a; font-size: 13px;">${tech.fullName}</strong><br/>
            <span>🚗 <strong>Vehículo:</strong> ${tech.vehiclePlate}</span><br/>
            <span>⚡ <strong>Especialidad:</strong> ${tech.specialties.join(', ')}</span><br/>
            <span style="color: #059669; font-weight: bold;">● ${
              tech.isAvailable ? 'Disponible para Despacho' : 'En Servicio'
            }</span>
          </div>
        `);
      });

      // Add Work Order markers
      orders.forEach((o) => {
        const isCompleted = o.status === 'COMPLETED';
        const color = isCompleted ? '#059669' : o.status === 'IN_EXECUTION' ? '#0284c7' : '#d97706';

        const orderIcon = L.divIcon({
          className: 'custom-order-pin',
          html: `
            <div style="
              background: ${color};
              color: white;
              width: 28px;
              height: 28px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 12px;
              border: 2px solid #ffffff;
              box-shadow: 0 3px 8px rgba(0,0,0,0.25);
            ">
              ${isCompleted ? '✓' : '📍'}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([o.coordinates.lat, o.coordinates.lng], {
          icon: orderIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; padding: 2px;">
            <strong style="color: #0369a1; font-size: 13px;">${o.code}</strong> — ${o.clientName}<br/>
            <span>📍 ${o.address}</span><br/>
            <span>⚡ ${o.planSpeedMbps} Mbps (${o.serviceType})</span><br/>
            <strong>Estado:</strong> <span style="font-weight: bold; color: ${color};">${o.status}</span>
          </div>
        `);
      });

      // Invalidate map size after DOM settles so tiles render without gray blanks
      timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    }

    initMap();

    return () => {
      if (timer) clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [technicians, orders]);

  const handleForceRecalculate = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  };

  return (
    <div className="glass-panel p-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Módulo 6: Dashboard Gerencial & BI</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Monitoreo en Tiempo Real de Cuadrillas & Órdenes FTTH
          </h2>
          <p className="text-xs text-slate-500">
            Geolocalización satelital de vehículos y dispersión geográfica de instalaciones
          </p>
        </div>

        {/* Legend & Refresh button */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-white shadow-xs"></span>
              <span className="text-slate-700 font-medium">Cuadrilla</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block border border-white shadow-xs"></span>
              <span className="text-slate-700 font-medium">OT Asignada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-600 inline-block border border-white shadow-xs"></span>
              <span className="text-slate-700 font-medium">En Ejecución</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block border border-white shadow-xs"></span>
              <span className="text-slate-700 font-medium">Completada</span>
            </div>
          </div>

          <button
            onClick={handleForceRecalculate}
            title="Centrar y reajustar mapa"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Element with explicit height */}
      <div
        ref={mapContainerRef}
        style={{ minHeight: '560px', height: '65vh', width: '100%' }}
        className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0 bg-slate-100"
      />
    </div>
  );
};
