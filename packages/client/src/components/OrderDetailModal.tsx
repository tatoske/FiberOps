import React from 'react';
import { WorkOrder } from '@fiberops/shared';
import {
  X,
  MapPin,
  FileCheck2,
  PenTool,
  Box,
} from 'lucide-react';

interface OrderDetailModalProps {
  order: WorkOrder | null;
  onClose: () => void;
  onOpenMobileView: (order: WorkOrder) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onOpenMobileView,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 pb-3 border-b border-slate-200 flex items-start justify-between pr-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-emerald-700">{order.code}</span>
              <span className="badge badge-in_execution">{order.status}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{order.clientName}</h2>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {order.address} ({order.city})
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenMobileView(order);
            }}
            className="btn btn-primary text-xs"
          >
            Abrir en App Móvil
          </button>
        </div>

        {/* Service Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5">Tipo de Servicio</span>
            <span className="font-bold text-slate-900">{order.serviceType}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5">Velocidad Contratada</span>
            <span className="font-bold text-emerald-700 font-mono">
              {order.planSpeedMbps} Mbps Simétrico
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5">Franja Horaria</span>
            <span className="font-bold text-slate-900 font-mono">{order.timeSlot}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5">Cuadrilla Asignada</span>
            <span className="font-bold text-slate-900">{order.assignedTechnicianName || 'Pendiente'}</span>
          </div>
        </div>

        {/* Quality Evidences */}
        {order.evidences && (
          <div className="space-y-4 mb-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Evidencias Fotográficas de Calidad & Potencia Óptica</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Caja NAP */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">Caja NAP & Puerto</span>
                <div className="font-mono text-[11px] text-emerald-700 font-bold">
                  {order.evidences.napPortAssigned}
                </div>
                {order.evidences.napBoxPhotoUrl && (
                  <img
                    src={order.evidences.napBoxPhotoUrl}
                    alt="Caja NAP"
                    className="w-full h-28 object-cover rounded-lg border border-slate-200"
                  />
                )}
              </div>

              {/* Potencia Óptica */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Potencia Óptica</span>
                  <span className="font-mono font-bold text-emerald-700 text-xs">
                    {order.evidences.opticalPowerDbm} dBm
                  </span>
                </div>
                <div className="text-[10px] text-emerald-800 font-mono">Calidad Óptima (1490nm)</div>
                {order.evidences.opticalPowerPhotoUrl && (
                  <img
                    src={order.evidences.opticalPowerPhotoUrl}
                    alt="Potencia Óptica"
                    className="w-full h-28 object-cover rounded-lg border border-slate-200"
                  />
                )}
              </div>

              {/* Acometida */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Cable Drop</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {order.evidences.dropCableMeters} m
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">Ruta de acometida</div>
                {order.evidences.cableRoutePhotoUrl && (
                  <img
                    src={order.evidences.cableRoutePhotoUrl}
                    alt="Ruta Cable"
                    className="w-full h-28 object-cover rounded-lg border border-slate-200"
                  />
                )}
              </div>
            </div>

            {/* Firma Cliente */}
            {order.evidences.clientSignatureUrl && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-purple-600" />
                    <span>Firma Digital del Cliente</span>
                  </span>
                  <div className="font-bold text-slate-900 text-xs mt-1">
                    {order.evidences.clientSignerName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Doc: {order.evidences.clientSignerDoc}
                  </div>
                </div>
                <img
                  src={order.evidences.clientSignatureUrl}
                  alt="Firma Digital"
                  className="h-16 border border-slate-200 rounded-lg bg-white px-3 shadow-2xs"
                />
              </div>
            )}
          </div>
        )}

        {/* Estimated Materials Kit */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-emerald-700" />
            <span>Materiales Asociados a la OT (Módulo 2: Bodega)</span>
          </h4>
          <div className="space-y-1.5">
            {order.estimatedMaterials.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1 border-b border-slate-200 last:border-none"
              >
                <span className="text-slate-700">{m.name}</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {m.quantity} {m.unit} {m.serialNumber && `(SN: ${m.serialNumber})`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
