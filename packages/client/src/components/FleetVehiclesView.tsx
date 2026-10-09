import React, { useState } from 'react';
import { FleetVehicle } from '@fiberops/shared';
import {
  Truck,
  Gauge,
  Fuel,
  ShieldAlert,
  Calendar,
  Wrench,
} from 'lucide-react';

interface FleetVehiclesViewProps {
  vehicles: FleetVehicle[];
}

export const FleetVehiclesView: React.FC<FleetVehiclesViewProps> = ({ vehicles }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredVehicles = vehicles.filter(
    (v) => filterStatus === 'ALL' || v.status === filterStatus
  );

  return (
    <div className="glass-panel p-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Módulo 4: Operaciones & Flotilla</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Control de Vehículos, Combustible & Mantenimiento
          </h2>
          <p className="text-xs text-slate-500">
            Seguimiento de kilometraje por jornada, consumo de combustible y alertas de SOAT y RTM
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-input text-xs max-w-[180px]"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="OPERATIONAL">Operativos</option>
            <option value="MAINTENANCE_DUE">Mantenimiento Requerido</option>
            <option value="IN_SHOP">En Taller</option>
          </select>
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredVehicles.map((v) => {
          const isOilDue = v.currentKm >= v.nextOilChangeKm - 1000;
          return (
            <div
              key={v.id}
              className={`bg-white rounded-xl p-4 border border-slate-200 shadow-xs border-t-4 transition-all ${
                v.status === 'OPERATIONAL'
                  ? 'border-t-emerald-500'
                  : v.status === 'MAINTENANCE_DUE'
                  ? 'border-t-amber-500'
                  : 'border-t-rose-500'
              }`}
            >
              {/* Placa & Modelo */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-mono font-extrabold text-lg text-slate-900">
                    {v.plate}
                  </div>
                  <div className="text-xs text-slate-700 font-semibold">{v.vehicleModel}</div>
                  <span className="text-[10px] text-slate-500">Modelo {v.year}</span>
                </div>
                <span
                  className={`badge text-[10px] ${
                    v.status === 'OPERATIONAL'
                      ? 'badge-completed'
                      : v.status === 'MAINTENANCE_DUE'
                      ? 'badge-en_route'
                      : 'badge-danger'
                  }`}
                >
                  {v.status === 'OPERATIONAL'
                    ? 'Operativo'
                    : v.status === 'MAINTENANCE_DUE'
                    ? 'Mantenimiento'
                    : 'En Taller'}
                </span>
              </div>

              {/* Conductor Asignado */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-3">
                <span className="text-[10px] text-slate-500 block">Conductor / Cuadrilla:</span>
                <span className="font-semibold text-emerald-800">
                  {v.assignedTechnicianName}
                </span>
              </div>

              {/* Odómetro & Combustible */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                    <Gauge className="w-3 h-3 text-sky-600" /> Odómetro
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {v.currentKm.toLocaleString()} km
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 mb-0.5">
                    <Fuel className="w-3 h-3 text-amber-600" /> Rendimiento
                  </span>
                  <span className="font-mono font-bold text-amber-800">
                    {v.fuelEfficiencyKmPerGal} km/gal
                  </span>
                </div>
              </div>

              {/* Alertas Preventivas */}
              <div className="space-y-1.5 text-[11px] pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-slate-400" /> Próximo Aceite:
                  </span>
                  <span
                    className={`font-mono font-semibold ${
                      isOilDue ? 'text-amber-800' : 'text-slate-700'
                    }`}
                  >
                    {v.nextOilChangeKm.toLocaleString()} km {isOilDue && '(¡Pronto!)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-slate-400" /> Vencimiento SOAT:
                  </span>
                  <span className="font-mono text-slate-700">{v.soatExpiresAt}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Revisión RTM:
                  </span>
                  <span className="font-mono text-slate-700">
                    {v.technicalReviewExpiresAt}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
