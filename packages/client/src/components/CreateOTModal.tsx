import React, { useState } from 'react';
import { Client, Technician, ServiceType } from '@fiberops/shared';
import { X, Sparkles, MapPin, Box, Calendar, Clock, Gauge, User, UserPlus, Users } from 'lucide-react';

interface CreateOTModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  technicians: Technician[];
  onSubmit: (newOrder: any) => Promise<void>;
  onClientCreated?: (newClient: any) => void;
}

export const CreateOTModal: React.FC<CreateOTModalProps> = ({
  isOpen,
  onClose,
  clients,
  technicians,
  onSubmit,
}) => {
  const [clientMode, setClientMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  
  // New client fields
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientDoc, setNewClientDoc] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientAddress, setNewClientAddress] = useState<string>('');

  const [serviceType, setServiceType] = useState<ServiceType>('NEW_INSTALL');
  const [planSpeedMbps, setPlanSpeedMbps] = useState<number>(500);
  const [timeSlot, setTimeSlot] = useState<'08:00 - 12:00' | '13:00 - 17:00' | '17:00 - 20:00'>('08:00 - 12:00');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>('');
  const [customAddress, setCustomAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const assignedTech = technicians.find((t) => t.id === assignedTechnicianId);

    const isNew = clientMode === 'NEW';
    const clientId = isNew ? `cli-${Date.now()}` : (currentClient?.id || 'cli-001');
    const clientName = isNew ? newClientName : (currentClient?.name || 'Cliente Particular');
    const clientPhone = isNew ? newClientPhone : (currentClient?.phone || '+57 310 000 0000');
    const clientAddress = isNew ? newClientAddress : (customAddress || currentClient?.address || '');

    const orderPayload = {
      clientId,
      clientName,
      clientPhone,
      clientType: isNew ? 'RESIDENTIAL' : (currentClient?.type || 'RESIDENTIAL'),
      serviceType,
      status: assignedTech ? 'ASSIGNED' : 'CREATED',
      scheduledDate,
      timeSlot,
      planSpeedMbps,
      address: clientAddress,
      city: isNew ? 'Bogotá' : (currentClient?.city || 'Bogotá'),
      coordinates: currentClient?.coordinates || { lat: 4.69 + (Math.random() - 0.5) * 0.05, lng: -74.05 + (Math.random() - 0.5) * 0.05 },
      assignedTechnicianId: assignedTech?.id,
      assignedTechnicianName: assignedTech?.fullName,
      assignedVehiclePlate: assignedTech?.vehiclePlate.split(' ')[0],
      estimatedMaterials: [
        { itemId: 'item-001', name: 'ONU Huawei GPON HG8145V5', quantity: 1, unit: 'UND' },
        { itemId: 'item-003', name: 'Cable Fibra Óptica Drop G.657.A2', quantity: 70, unit: 'METROS' },
        { itemId: 'item-004', name: 'Roseta Óptica Terminal 2 Puertos', quantity: 1, unit: 'UND' },
        { itemId: 'item-005', name: 'Conector Mecánico SC/APC', quantity: 2, unit: 'UND' },
        { itemId: 'item-006', name: 'Herraje Tensor Tipo Pez', quantity: 2, unit: 'UND' },
      ],
      notes,
    };

    try {
      await onSubmit(orderPayload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Módulo 1: Despacho & CRM</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Crear Nueva Orden de Trabajo (OT)</h2>
          <p className="text-xs text-slate-500">
            Asignación de instalación, migración o avería con kit de materiales y geolocalización
          </p>
        </div>

        {/* Client Selector Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setClientMode('EXISTING')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              clientMode === 'EXISTING'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Seleccionar Cliente de Base CRM</span>
          </button>
          <button
            type="button"
            onClick={() => setClientMode('NEW')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              clientMode === 'NEW'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Registrar Nuevo Cliente Aquí</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {clientMode === 'EXISTING' ? (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Cliente Registrado en CRM
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  const found = clients.find((c) => c.id === e.target.value);
                  if (found) setCustomAddress(found.address);
                }}
                className="glass-input"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — [{c.type}] — {c.address} ({c.contractNumber})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2.5">
              <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-emerald-700" /> Datos del Nuevo Abonado
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Nombre Completo</label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ej: Andrés Felipe Silva"
                    className="glass-input"
                    required={clientMode === 'NEW'}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Cédula / Documento</label>
                  <input
                    type="text"
                    value={newClientDoc}
                    onChange={(e) => setNewClientDoc(e.target.value)}
                    placeholder="CC 101928374"
                    className="glass-input"
                    required={clientMode === 'NEW'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+57 310 000 0000"
                    className="glass-input"
                    required={clientMode === 'NEW'}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">Dirección del Predio</label>
                  <input
                    type="text"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    placeholder="Carrera 15 # 85-30 Apto 502"
                    className="glass-input"
                    required={clientMode === 'NEW'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dirección estructurada si es cliente existente */}
          {clientMode === 'EXISTING' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Dirección Estructurada de Instalación
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={customAddress || currentClient?.address || ''}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="Dirección del predio"
                  className="glass-input pl-8"
                  required
                />
              </div>
            </div>
          )}

          {/* Tipo de Servicio & Velocidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tipo de Servicio
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
                className="glass-input"
              >
                <option value="NEW_INSTALL">Instalación Nueva FTTH</option>
                <option value="MAINTENANCE_CORRECTIVE">Mantenimiento Correctivo (Avería)</option>
                <option value="MIGRATION">Migración de Tecnología</option>
                <option value="EQUIPMENT_RETRIEVAL">Retiro de Equipos</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Velocidad Contratada
              </label>
              <div className="relative">
                <Gauge className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <select
                  value={planSpeedMbps}
                  onChange={(e) => setPlanSpeedMbps(Number(e.target.value))}
                  className="glass-input pl-8"
                >
                  <option value={300}>300 Mbps Simétrico</option>
                  <option value={500}>500 Mbps Simétrico</option>
                  <option value={1000}>1 Gbps Dedicado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fecha y Franja */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Fecha Programada
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="glass-input pl-8"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Franja Horaria
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value as any)}
                  className="glass-input pl-8"
                >
                  <option value="08:00 - 12:00">08:00 - 12:00 (Mañana)</option>
                  <option value="13:00 - 17:00">13:00 - 17:00 (Tarde)</option>
                  <option value="17:00 - 20:00">17:00 - 20:00 (Vespertina)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Asignación de Cuadrilla */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Cuadrilla / Técnico (Opcional - Dejar vacío para Auto-Despacho)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <select
                value={assignedTechnicianId}
                onChange={(e) => setAssignedTechnicianId(e.target.value)}
                className="glass-input pl-8"
              >
                <option value="">Auto-Despacho Geográfico Inteligente (Recomendado)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} — {t.vehiclePlate} ({t.specialties.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kit de Materiales Estándar */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1.5">
              <Box className="w-3.5 h-3.5 text-emerald-700" />
              <span>Kit de Instalación Estándar Precargado</span>
            </div>
            <ul className="text-[11px] text-emerald-800 grid grid-cols-2 gap-1 font-mono">
              <li>• 1x ONU GPON Dual Band</li>
              <li>• 70m Cable Drop Figura 8</li>
              <li>• 1x Roseta Óptica de pared 2P SC/APC</li>
              <li>• 2x Conectores Mecánicos SC/APC verdes</li>
            </ul>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Observaciones de Acceso / Notas Técnicas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Anunciarse en portería torre 3. Requiere escalera."
              className="glass-input h-14 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Generando...' : 'Crear y Despachar OT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
