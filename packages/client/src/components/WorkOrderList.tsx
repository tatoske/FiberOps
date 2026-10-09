import React, { useState } from 'react';
import { WorkOrder, ServiceType, WorkOrderStatus, Technician } from '@fiberops/shared';
import {
  Search,
  Sparkles,
  MapPin,
  Calendar,
  User,
  Navigation,
  ChevronRight,
  Plus,
  UserPlus,
} from 'lucide-react';

interface WorkOrderListProps {
  orders: WorkOrder[];
  technicians: Technician[];
  onOpenCreateModal: () => void;
  onOpenCreateClientModal: () => void;
  onSmartDispatch: (orderId: string) => Promise<void>;
  onSelectOrderForTechView: (order: WorkOrder) => void;
  onViewOrderDetail: (order: WorkOrder) => void;
}

export const WorkOrderList: React.FC<WorkOrderListProps> = ({
  orders,
  technicians,
  onOpenCreateModal,
  onOpenCreateClientModal,
  onSmartDispatch,
  onSelectOrderForTechView,
  onViewOrderDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesType = filterType === 'ALL' || o.serviceType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSmartDispatchClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDispatchingId(id);
    try {
      await onSmartDispatch(id);
    } finally {
      setDispatchingId(null);
    }
  };

  const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
      case 'CREATED':
        return <span className="badge badge-created">Creada</span>;
      case 'ASSIGNED':
        return <span className="badge badge-assigned">Asignada</span>;
      case 'EN_ROUTE':
        return <span className="badge badge-en_route">En Camino</span>;
      case 'ON_SITE':
        return <span className="badge badge-on_site">En Sitio</span>;
      case 'IN_EXECUTION':
        return <span className="badge badge-in_execution">En Ejecución</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">Completada</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getServiceTypeBadge = (type: ServiceType) => {
    switch (type) {
      case 'NEW_INSTALL':
        return (
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            Instalación Nueva
          </span>
        );
      case 'MAINTENANCE_CORRECTIVE':
        return (
          <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
            Avería / Correctivo
          </span>
        );
      case 'MIGRATION':
        return (
          <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
            Migración
          </span>
        );
      case 'EQUIPMENT_RETRIEVAL':
        return (
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Retiro Equipos
          </span>
        );
    }
  };

  return (
    <div className="glass-panel p-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Órdenes de Trabajo (OTs) & Despacho</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {filteredOrders.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Control de cuadrillas, asignación geográfica y trazabilidad en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onOpenCreateClientModal} className="btn btn-secondary text-xs">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Registrar Cliente (CRM)</span>
          </button>
          <button onClick={onOpenCreateModal} className="btn btn-primary text-xs">
            <Plus className="w-4 h-4" />
            <span>Nueva Orden de Trabajo</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código OT, cliente o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-9 text-xs"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-input text-xs"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="CREATED">Creada (Sin Asignar)</option>
            <option value="ASSIGNED">Asignada</option>
            <option value="EN_ROUTE">En Camino</option>
            <option value="ON_SITE">En Sitio</option>
            <option value="IN_EXECUTION">En Ejecución</option>
            <option value="COMPLETED">Completada</option>
          </select>
        </div>

        <div className="md:col-span-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="glass-input text-xs"
          >
            <option value="ALL">Todos los Tipos de Servicio</option>
            <option value="NEW_INSTALL">Instalación Nueva FTTH</option>
            <option value="MAINTENANCE_CORRECTIVE">Mantenimiento Correctivo / Avería</option>
            <option value="MIGRATION">Migración de Tecnología</option>
            <option value="EQUIPMENT_RETRIEVAL">Retiro de Equipos</option>
          </select>
        </div>
      </div>

      {/* Table list */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs bg-white">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-600 uppercase text-[10px] tracking-wider">
              <th className="py-3 pl-3">Código OT</th>
              <th className="py-3">Tipo / Velocidad</th>
              <th className="py-3">Cliente & Dirección</th>
              <th className="py-3">Franja / Fecha</th>
              <th className="py-3">Cuadrilla Asignada</th>
              <th className="py-3">Estado</th>
              <th className="py-3 text-right pr-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No se encontraron órdenes de trabajo con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onViewOrderDetail(order)}
                >
                  {/* Código */}
                  <td className="py-3 pl-3">
                    <span className="font-mono font-bold text-emerald-700">{order.code}</span>
                    <div className="text-[10px] text-slate-500">{order.city}</div>
                  </td>

                  {/* Tipo */}
                  <td className="py-3">
                    <div className="space-y-1">
                      {getServiceTypeBadge(order.serviceType)}
                      <div className="text-[11px] text-slate-600 font-mono">
                        {order.planSpeedMbps} Mbps
                      </div>
                    </div>
                  </td>

                  {/* Cliente */}
                  <td className="py-3">
                    <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {order.clientName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{order.address}</span>
                    </div>
                  </td>

                  {/* Franja */}
                  <td className="py-3 text-slate-700">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{order.scheduledDate}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      {order.timeSlot}
                    </div>
                  </td>

                  {/* Cuadrilla */}
                  <td className="py-3">
                    {order.assignedTechnicianName ? (
                      <div>
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-emerald-600" />
                          <span>{order.assignedTechnicianName}</span>
                        </div>
                        {order.assignedVehiclePlate && (
                          <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {order.assignedVehiclePlate}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-amber-700 italic font-medium text-[11px]">
                        Sin Cuadrilla
                      </span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="py-3">{getStatusBadge(order.status)}</td>

                  {/* Acciones */}
                  <td className="py-3 pr-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Botón Asignación Inteligente */}
                      {order.status === 'CREATED' && (
                        <button
                          onClick={(e) => handleSmartDispatchClick(order.id, e)}
                          disabled={dispatchingId === order.id}
                          title="Asignación Inteligente por Proximidad Geográfica"
                          className="btn btn-outline text-[11px] py-1 px-2.5 h-7"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{dispatchingId === order.id ? 'Calculando...' : 'Auto-Despacho'}</span>
                        </button>
                      )}

                      {/* Abrir en Modo Técnico */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrderForTechView(order);
                        }}
                        title="Ver ejecución en App de Campo Móvil"
                        className="btn btn-secondary text-[11px] py-1 px-2 h-7 text-sky-700 hover:text-sky-800 hover:bg-sky-50"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ver en Móvil</span>
                      </button>

                      {/* Ver Detalles */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOrderDetail(order);
                        }}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
