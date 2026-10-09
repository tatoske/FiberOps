import React from 'react';
import {
  Layers,
  Smartphone,
  MapPin,
  Box,
  Radio,
  DollarSign,
  Truck,
  Users,
  Plus,
  UserPlus,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'DISPATCH' | 'MOBILE_APP' | 'INVENTORY' | 'FINANCE' | 'FLEET' | 'HR' | 'MAP';
  onSelectView: (view: 'DISPATCH' | 'MOBILE_APP' | 'INVENTORY' | 'FINANCE' | 'FLEET' | 'HR' | 'MAP') => void;
  onOpenCreateOT: () => void;
  onOpenCreateClient: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenCreateOT,
  onOpenCreateClient,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => onSelectView('DISPATCH')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
            <Radio className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">FiberOps</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                ERP FTTH
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Suite Operativa Telecom</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 text-xs">
          <button
            onClick={() => onSelectView('DISPATCH')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              currentView === 'DISPATCH'
                ? 'bg-white text-emerald-800 shadow-xs font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>M1: Despacho</span>
          </button>

          <button
            onClick={() => onSelectView('MOBILE_APP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              currentView === 'MOBILE_APP'
                ? 'bg-white text-emerald-800 shadow-xs font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-600" />
            <span>M3: App Campo</span>
          </button>

          <button
            onClick={() => onSelectView('INVENTORY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              currentView === 'INVENTORY'
                ? 'bg-white text-emerald-800 shadow-xs font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-amber-600" />
            <span>M2: Bodega</span>
          </button>

          <button
            onClick={() => onSelectView('FINANCE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              currentView === 'FINANCE'
                ? 'bg-white text-emerald-800 shadow-xs font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-purple-600" />
            <span>M4: Costos</span>
          </button>

          <button
            onClick={() => onSelectView('FLEET')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              currentView === 'FLEET'
                ? 'bg-white text-emerald-800 shadow-xs font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>M4: Flotilla</span>
          </button>

          <button
            onClick={() => onSelectView('HR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              currentView === 'HR'
                ? 'bg-white text-emerald-800 shadow-xs font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-rose-600" />
            <span>M5: RRHH</span>
          </button>

          <button
            onClick={() => onSelectView('MAP')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              currentView === 'MAP'
                ? 'bg-white text-emerald-800 shadow-xs font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>M6: Mapa GPS</span>
          </button>
        </nav>

        {/* Action Controls - Prominent Registration Flow */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateClient}
            className="btn btn-secondary text-xs py-1.5 px-3"
            title="Registrar nuevo cliente en CRM"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
          </button>

          <button
            onClick={onOpenCreateOT}
            className="btn btn-primary text-xs py-1.5 px-3.5"
            title="Crear nueva orden de trabajo"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva OT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
