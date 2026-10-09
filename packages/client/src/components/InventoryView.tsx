import React, { useState } from 'react';
import { InventoryItem, SerialEquipment, Technician } from '@fiberops/shared';
import {
  Box,
  Truck,
  Search,
  Barcode,
  Layers,
} from 'lucide-react';

interface InventoryViewProps {
  items: InventoryItem[];
  serials: SerialEquipment[];
  technicians: Technician[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  serials,
  technicians,
}) => {
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'SERIALS' | 'MOBILE_WAREHOUSE'>('CATALOG');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechId, setSelectedTechId] = useState<string>(technicians[0]?.id || '');

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSerials = serials.filter(
    (s) =>
      s.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTech = technicians.find((t) => t.id === selectedTechId) || technicians[0];
  const techSerials = serials.filter((s) => s.assignedTechnicianId === selectedTech?.id);
  const dropCableItem = items.find((i) => i.code.includes('DROP') || i.category === 'CABLE');
  const mobileCableStock = dropCableItem ? Math.round(dropCableItem.centralStock / Math.max(1, technicians.length)) : 0;

  return (
    <div className="glass-panel p-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Box className="w-4 h-4" />
            <span>Módulo 2: Logística & Inventarios</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Control de Bodega Central & Bodegas Móviles
          </h2>
          <p className="text-xs text-slate-500">
            Trazabilidad estricta de seriales (ONUs/Routers), consumibles y stock de cuadrillas
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('CATALOG')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'CATALOG'
                ? 'bg-white text-emerald-800 shadow-sm font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Catálogo & Stock
          </button>
          <button
            onClick={() => setActiveTab('SERIALS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'SERIALS'
                ? 'bg-white text-emerald-800 shadow-sm font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trazabilidad Seriales
          </button>
          <button
            onClick={() => setActiveTab('MOBILE_WAREHOUSE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'MOBILE_WAREHOUSE'
                ? 'bg-white text-emerald-800 shadow-sm font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bodega Móvil (Vehículos)
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Buscar por código, descripción, serial o MAC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input pl-9 text-xs"
        />
      </div>

      {/* Tab 1: Catálogo de Materiales */}
      {activeTab === 'CATALOG' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs bg-white">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-3">Código Item</th>
                <th className="py-3">Descripción</th>
                <th className="py-3">Categoría</th>
                <th className="py-3">Control Serial</th>
                <th className="py-3">Stock Central</th>
                <th className="py-3">Costo Unitario</th>
                <th className="py-3 pr-3 text-right">Estado Alerta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-3 font-mono font-bold text-emerald-700">
                    {item.code}
                  </td>
                  <td className="py-3 font-semibold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3">
                    {item.isSerialTracked ? (
                      <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                        Serial / QR
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Por Metraje / Lote</span>
                    )}
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-800">
                    {item.centralStock} {item.unit}
                  </td>
                  <td className="py-3 font-mono text-slate-700">
                    ${item.unitCost.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {item.centralStock <= item.minAlertThreshold ? (
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        Stock Bajo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Disponible
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Trazabilidad de Seriales */}
      {activeTab === 'SERIALS' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs bg-white">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-3">Serial Number (SN)</th>
                <th className="py-3">MAC Address</th>
                <th className="py-3">Marca / Modelo</th>
                <th className="py-3">Ubicación / Estado</th>
                <th className="py-3">Asignado a Cuadrilla</th>
                <th className="py-3 pr-3 text-right">Último Movimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSerials.map((s) => (
                <tr key={s.serialNumber} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-3 font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                    <Barcode className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.serialNumber}</span>
                  </td>
                  <td className="py-3 font-mono text-slate-700">{s.macAddress}</td>
                  <td className="py-3 font-semibold text-slate-900">
                    {s.brand} {s.model}
                  </td>
                  <td className="py-3">
                    <span
                      className={`badge text-[10px] ${
                        s.status === 'MOBILE_WAREHOUSE'
                          ? 'badge-en_route'
                          : s.status === 'INSTALLED_CLIENT'
                          ? 'badge-completed'
                          : 'badge-created'
                      }`}
                    >
                      {s.status === 'MOBILE_WAREHOUSE'
                        ? 'En Bodega Móvil'
                        : s.status === 'INSTALLED_CLIENT'
                        ? 'Instalado en Cliente'
                        : 'En Bodega Central'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-700">
                    {s.assignedTechnicianId ? (
                      <span className="font-semibold text-emerald-700">
                        {technicians.find((t) => t.id === s.assignedTechnicianId)?.fullName ||
                          s.assignedTechnicianId}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Bodega Central</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-right text-slate-500 font-mono text-[11px]">
                    {new Date(s.updatedAt).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Bodega Móvil por Cuadrilla */}
      {activeTab === 'MOBILE_WAREHOUSE' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-700 font-semibold text-xs">Seleccionar Cuadrilla:</span>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="glass-input max-w-xs text-xs"
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} — {t.vehiclePlate}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-4 border-l-4 border-l-sky-500 bg-white">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs uppercase font-bold text-sky-800">Vehículo Asignado</span>
                <Truck className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-lg font-bold text-slate-900">{selectedTech?.vehiclePlate}</div>
              <p className="text-[11px] text-slate-500">Bodega Móvil Activa</p>
            </div>

            <div className="glass-panel p-4 border-l-4 border-l-emerald-500 bg-white">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs uppercase font-bold text-emerald-800">Equipos con Serial (ONUs)</span>
                <Barcode className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-emerald-700">{techSerials.length} unidades</div>
              <p className="text-[11px] text-slate-500">En posesión del técnico</p>
            </div>

            <div className="glass-panel p-4 border-l-4 border-l-purple-500 bg-white">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs uppercase font-bold text-purple-800">Bobina de Drop Móvil</span>
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">
                {mobileCableStock.toLocaleString()} metros
              </div>
              <p className="text-[11px] text-slate-500">Cable disponible para OTs</p>
            </div>
          </div>

          <div className="glass-panel p-4 mt-4 bg-white">
            <h4 className="font-bold text-slate-900 text-xs mb-3">
              Seriales Activos en el Vehículo {selectedTech?.vehiclePlate}
            </h4>
            <div className="space-y-2">
              {techSerials.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No hay seriales asignados en esta cuadrilla.</p>
              ) : (
                techSerials.map((s) => (
                  <div
                    key={s.serialNumber}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-emerald-700">{s.serialNumber}</div>
                      <div className="text-[11px] text-slate-600">
                        {s.brand} {s.model} • MAC: {s.macAddress}
                      </div>
                    </div>
                    <span className="badge badge-assigned text-[10px]">Listo para instalar</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
