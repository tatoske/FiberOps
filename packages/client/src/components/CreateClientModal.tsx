import React, { useState } from 'react';
import { Client, ClientType } from '@fiberops/shared';
import { X, UserPlus, MapPin, Phone, Mail, Building, ShieldCheck, Check } from 'lucide-react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: any, andCreateOT: boolean) => Promise<void>;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<ClientType>('RESIDENTIAL');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Bogotá');
  const [planName, setPlanName] = useState('Plan Fibra Pro 500 Mbps Simétrico');
  const [planSpeedMbps, setPlanSpeedMbps] = useState(500);
  const [andCreateOT, setAndCreateOT] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const clientPayload = {
      name,
      documentId,
      phone,
      email,
      type,
      address,
      neighborhood: neighborhood || 'Zona Norte',
      city,
      coordinates: { lat: 4.69 + (Math.random() - 0.5) * 0.05, lng: -74.05 + (Math.random() - 0.5) * 0.05 },
      contractNumber: `CT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      planName,
      planSpeedMbps,
      status: 'ACTIVE',
    };

    try {
      await onSubmit(clientPayload, andCreateOT);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Registro Rápido de Clientes (CRM)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Registrar Nuevo Cliente</h2>
          <p className="text-xs text-slate-500">
            Ingreso de abonado residencial, corporativo o B2B con contrato y asignación inmediata de OT
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tipo de Cliente */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('RESIDENTIAL')}
              className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                type === 'RESIDENTIAL'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              Hogar / Residencial
            </button>
            <button
              type="button"
              onClick={() => setType('CORPORATE')}
              className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                type === 'CORPORATE'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              Empresarial / Corp
            </button>
            <button
              type="button"
              onClick={() => setType('B2B')}
              className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                type === 'B2B'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              Enlace B2B / Pyme
            </button>
          </div>

          {/* Nombre y Documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Nombre Completo o Razón Social
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Laura Sofía Restrepo"
                className="glass-input"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Documento de Identidad / NIT
              </label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="CC 1029384920 o NIT"
                className="glass-input"
                required
              />
            </div>
          </div>

          {/* Teléfono y Correo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Teléfono de Contacto / Móvil
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 312 000 0000"
                  className="glass-input pl-8"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@correo.com"
                  className="glass-input pl-8"
                />
              </div>
            </div>
          </div>

          {/* Dirección y Barrio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Dirección del Predio
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle 100 # 15-20 Apto 301"
                  className="glass-input pl-8"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Barrio / Sector
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Chicó / Usaquén / Cedritos"
                className="glass-input"
              />
            </div>
          </div>

          {/* Plan de Velocidad */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Plan de Fibra Óptica a Contratar
            </label>
            <select
              value={planSpeedMbps}
              onChange={(e) => {
                const speed = Number(e.target.value);
                setPlanSpeedMbps(speed);
                setPlanName(`Plan Fibra ${speed} Mbps Simétrico`);
              }}
              className="glass-input"
            >
              <option value={300}>Plan 300 Mbps Simétrico (Residencial Estándar)</option>
              <option value={500}>Plan 500 Mbps Simétrico (Pro Streaming & Gaming)</option>
              <option value={1000}>Plan 1 Gbps Dedicado (Ultra Corporativo)</option>
            </select>
          </div>

          {/* Checkbox: Crear OT de inmediato */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between cursor-pointer"
               onClick={() => setAndCreateOT(!andCreateOT)}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                andCreateOT ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
              }`}>
                {andCreateOT && <Check className="w-3 h-3" />}
              </div>
              <span className="font-semibold text-slate-800">
                Crear Orden de Trabajo (OT) inmediatamente para este cliente
              </span>
            </div>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
              Recomendado
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Registrando...' : andCreateOT ? 'Registrar y Despachar OT' : 'Registrar Cliente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
