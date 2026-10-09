import React, { useState } from 'react';
import { Technician, AttendanceRecord } from '@fiberops/shared';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Mail,
} from 'lucide-react';

interface HRTechniciansViewProps {
  technicians: Technician[];
  attendance: AttendanceRecord[];
}

export const HRTechniciansView: React.FC<HRTechniciansViewProps> = ({
  technicians,
  attendance,
}) => {
  const [activeTab, setActiveTab] = useState<'CERTIFICATIONS' | 'ATTENDANCE'>('CERTIFICATIONS');

  return (
    <div className="glass-panel p-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Módulo 5: Recursos Humanos & Seguridad en el Trabajo</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Legajo de Cuadrillas, Certificaciones & Asistencia
          </h2>
          <p className="text-xs text-slate-500">
            Control de habilitaciones de alturas, espacios confinados y jornada laboral
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('CERTIFICATIONS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'CERTIFICATIONS'
                ? 'bg-white text-emerald-800 shadow-sm font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Habilitaciones & Carnets
          </button>
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'ATTENDANCE'
                ? 'bg-white text-emerald-800 shadow-sm font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Control de Asistencia
          </button>
        </div>
      </div>

      {/* Tab 1: Certificaciones y Carnets */}
      {activeTab === 'CERTIFICATIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {technicians.map((t) => {
            const hasWarning = t.certifications.some((c) => c.status === 'WARNING');
            const hasExpired = t.certifications.some((c) => c.status === 'EXPIRED');

            return (
              <div
                key={t.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all"
              >
                <div>
                  {/* Avatar & Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={t.avatarUrl}
                      alt={t.fullName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.fullName}</h4>
                      <span className="text-[11px] font-mono text-emerald-700 font-semibold">{t.code}</span>
                      <div className="text-[10px] text-slate-500">{t.vehiclePlate}</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-slate-600 mb-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.email}</span>
                    </div>
                  </div>

                  {/* Specialties Pills */}
                  <div className="mb-3">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                      Especialidades:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {t.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {spec === 'FIBER_FUSION'
                            ? 'Fusión Óptica'
                            : spec === 'HEIGHT_CERTIFIED'
                            ? 'Alturas Avanzado'
                            : spec === 'CONFINED_SPACES'
                            ? 'Espacios Confinados'
                            : 'Configuración Red'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certificaciones y Carnets */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Carnets y Habilitaciones Obligatorias:
                    </span>
                    {t.certifications.map((cert, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">{cert.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Vence: {cert.expiresAt}
                          </div>
                        </div>
                        <span
                          className={`badge text-[9px] ${
                            cert.status === 'VALID'
                              ? 'badge-completed'
                              : cert.status === 'WARNING'
                              ? 'badge-en_route'
                              : 'badge-danger'
                          }`}
                        >
                          {cert.status === 'VALID'
                            ? 'Vigente'
                            : cert.status === 'WARNING'
                            ? 'Por Vencer'
                            : 'Vencido'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Estado de Despacho:</span>
                  {hasExpired ? (
                    <span className="text-rose-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Bloqueado para Campo
                    </span>
                  ) : hasWarning ? (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Habilitado (Alerta)
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 100% Habilitado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Control de Asistencia */}
      {activeTab === 'ATTENDANCE' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs bg-white">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-3">Técnico / Cuadrilla</th>
                <th className="py-3">Fecha</th>
                <th className="py-3">Hora Entrada (Check-In)</th>
                <th className="py-3">Hora Salida (Check-Out)</th>
                <th className="py-3">Base / Ubicación</th>
                <th className="py-3 pr-3 text-right">Puntualidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.map((a, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-3 font-semibold text-slate-900">{a.technicianName}</td>
                  <td className="py-3 font-mono text-slate-600">{a.date}</td>
                  <td className="py-3 font-mono font-bold text-emerald-700">{a.checkInTime}</td>
                  <td className="py-3 font-mono text-slate-500">
                    {a.checkOutTime || 'En jornada activa'}
                  </td>
                  <td className="py-3 text-slate-700">{a.location}</td>
                  <td className="py-3 pr-3 text-right">
                    <span
                      className={`badge text-[10px] ${
                        a.status === 'ON_TIME' ? 'badge-completed' : 'badge-en_route'
                      }`}
                    >
                      {a.status === 'ON_TIME' ? 'A Tiempo' : 'Retardo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
