import React from 'react';
import { DashboardMetrics } from '@fiberops/shared';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Zap,
  Gauge,
  Radio,
} from 'lucide-react';

interface KPICardsProps {
  metrics: DashboardMetrics;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {/* 1. Total OTs */}
      <div className="glass-panel p-4 flex flex-col justify-between border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total OTs Hoy</span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <ClipboardList className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-slate-900">{metrics.totalOrdersToday}</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Programadas del día</p>
        </div>
      </div>

      {/* 2. En Proceso */}
      <div className="glass-panel p-4 flex flex-col justify-between border-amber-200/80 bg-amber-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">En Ejecución</span>
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-amber-900">{metrics.inProgressOrders}</span>
          <p className="text-[11px] text-amber-700 mt-0.5">Cuadrillas activas</p>
        </div>
      </div>

      {/* 3. Completadas */}
      <div className="glass-panel p-4 flex flex-col justify-between border-emerald-200/80 bg-emerald-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Cerradas</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-emerald-700">{metrics.completedOrders}</span>
          <p className="text-[11px] text-emerald-600 mt-0.5">Con firma del cliente</p>
        </div>
      </div>

      {/* 4. First Time Fix Rate */}
      <div className="glass-panel p-4 flex flex-col justify-between border-purple-200/80 bg-purple-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">First Time Fix</span>
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-purple-900">{metrics.firstTimeFixRate}%</span>
          <p className="text-[11px] text-purple-700 mt-0.5">Cierre al 1er intento</p>
        </div>
      </div>

      {/* 5. MTTR / Promedio Instalación */}
      <div className="glass-panel p-4 flex flex-col justify-between border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tiempo Medio</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-slate-900">{metrics.avgInstallTimeMinutes} <span className="text-xs font-normal text-slate-500">min</span></span>
          <p className="text-[11px] text-slate-500 mt-0.5">Meta: &lt; 90 min</p>
        </div>
      </div>

      {/* 6. Potencia Óptica OK */}
      <div className="glass-panel p-4 flex flex-col justify-between border-teal-200/80 bg-teal-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Potencia Óptica</span>
          <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">dBm</span>
        </div>
        <div>
          <span className="text-2xl font-extrabold text-teal-800">{metrics.opticalPowerComplianceRate}%</span>
          <p className="text-[11px] text-teal-600 mt-0.5">-15 a -25 dBm OK</p>
        </div>
      </div>
    </div>
  );
};
