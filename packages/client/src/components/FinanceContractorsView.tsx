import React, { useState } from 'react';
import { ContractorSettlement, ProjectCostAnalysis } from '@fiberops/shared';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';

interface FinanceContractorsViewProps {
  settlements: ContractorSettlement[];
  costAnalyses: ProjectCostAnalysis[];
}

export const FinanceContractorsView: React.FC<FinanceContractorsViewProps> = ({
  settlements,
  costAnalyses,
}) => {
  const [activeTab, setActiveTab] = useState<'SETTLEMENTS' | 'COST_ANALYSIS'>('SETTLEMENTS');
  const [expandedSettlementId, setExpandedSettlementId] = useState<string | null>(
    settlements[0]?.id || null
  );

  const totalPayable = settlements.reduce((acc, s) => acc + s.grandTotalPayable, 0);
  const totalBilled = costAnalyses.reduce((acc, c) => acc + c.clientBilledAmount, 0);
  const totalDirectCosts = costAnalyses.reduce((acc, c) => acc + c.totalDirectCost, 0);
  const totalGrossMargin = totalBilled - totalDirectCosts;
  const avgMarginPercent = totalBilled > 0 ? ((totalGrossMargin / totalBilled) * 100).toFixed(1) : '0';

  return (
    <div className="glass-panel p-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Módulo 4: Facturación, Contabilidad & Costos</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Liquidación de Contratistas & Rentabilidad por OT
          </h2>
          <p className="text-xs text-slate-500">
            Cálculo automático de mano de obra por tarifario, metros de cable drop y margen de proyecto
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('SETTLEMENTS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'SETTLEMENTS'
                ? 'bg-white text-emerald-800 shadow-sm font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Liquidación Contratistas
          </button>
          <button
            onClick={() => setActiveTab('COST_ANALYSIS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'COST_ANALYSIS'
                ? 'bg-white text-emerald-800 shadow-sm font-bold border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rentabilidad por Instalación
          </button>
        </div>
      </div>

      {/* Financial Summary KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 mb-6">
        <div className="glass-panel p-4 border-l-4 border-l-emerald-500 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] uppercase font-bold text-emerald-800">Total Facturado</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-mono font-extrabold text-slate-900">
            ${totalBilled.toLocaleString('es-CO')}
          </div>
          <p className="text-[10px] text-emerald-700 mt-0.5">Ingresos por OTs</p>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-sky-500 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] uppercase font-bold text-sky-800">Costos Directos</span>
            <DollarSign className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-mono font-extrabold text-slate-900">
            ${totalDirectCosts.toLocaleString('es-CO')}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Materiales + Cuadrillas</p>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-purple-500 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] uppercase font-bold text-purple-800">Margen Bruto</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-mono font-extrabold text-purple-800">
            ${totalGrossMargin.toLocaleString('es-CO')}
          </div>
          <p className="text-[10px] text-purple-700 mt-0.5">Rentabilidad ({avgMarginPercent}%)</p>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-amber-500 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] uppercase font-bold text-amber-800">Por Pagar</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-mono font-extrabold text-amber-900">
            ${totalPayable.toLocaleString('es-CO')}
          </div>
          <p className="text-[10px] text-amber-700 mt-0.5">
            {settlements[0]?.period ? `Periodo: ${settlements[0].period}` : 'Periodo en curso'}
          </p>
        </div>
      </div>

      {/* Tab 1: Liquidación de Contratistas */}
      {activeTab === 'SETTLEMENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Nómina y Liquidación de Cuadrillas Externas</span>
              <span className="text-xs font-mono font-normal text-slate-500">
                ({settlements.length} contratistas activos)
              </span>
            </h3>
            <button className="btn btn-secondary text-xs">
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar Reporte</span>
            </button>
          </div>

          <div className="space-y-3">
            {settlements.map((s) => {
              const isExpanded = expandedSettlementId === s.id;
              return (
                <div
                  key={s.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs"
                >
                  <div
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                    onClick={() =>
                      setExpandedSettlementId(isExpanded ? null : s.id)
                    }
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {s.contractorName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {s.technicianCode}
                        </span>
                        <span
                          className={`badge text-[10px] ${
                            s.status === 'APPROVED' ? 'badge-completed' : 'badge-assigned'
                          }`}
                        >
                          {s.status === 'APPROVED' ? 'Aprobada' : 'Borrador'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Periodo: <strong className="text-slate-700">{s.period}</strong> • OTs
                        Cerradas: <strong className="text-emerald-700">{s.completedOrdersCount}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">
                          Total Liquidado
                        </div>
                        <div className="font-mono text-base font-extrabold text-emerald-700">
                          ${s.grandTotalPayable.toLocaleString('es-CO')}
                        </div>
                      </div>

                      <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs animate-fade-in">
                      {/* Breakdown Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Mano de Obra Base</span>
                          <span className="font-mono font-bold text-slate-800">
                            ${s.baseLaborTotal.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className="p-2.5 bg-sky-50/50 rounded-lg border border-sky-200">
                          <span className="text-[10px] text-sky-800 block">Metros Drop Extra</span>
                          <span className="font-mono font-bold text-sky-800">
                            +${s.extraDropLaborTotal.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-emerald-800 block">Bono Calidad (&gt;95%)</span>
                          <span className="font-mono font-bold text-emerald-800">
                            +${s.qualityBonus.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <div className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-200">
                          <span className="text-[10px] text-rose-800 block">Deducciones (Merma)</span>
                          <span className="font-mono font-bold text-rose-700">
                            -${s.deductionsForMermas.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>

                      {/* Detail Table of OTs */}
                      {s.items.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-slate-700 mb-2">
                            Detalle por Orden de Trabajo Liquidada
                          </div>
                          <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-xs bg-white">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-slate-600 text-[10px]">
                                  <th className="py-2 pl-2">OT</th>
                                  <th className="py-2">Cliente</th>
                                  <th className="py-2">Tarifa Base</th>
                                  <th className="py-2">Metros Reales</th>
                                  <th className="py-2">Metros Extra</th>
                                  <th className="py-2 text-right pr-2">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {s.items.map((it) => (
                                  <tr key={it.otId}>
                                    <td className="py-2 pl-2 font-mono text-emerald-700 font-bold">
                                      {it.otCode}
                                    </td>
                                    <td className="py-2 text-slate-900">{it.clientName}</td>
                                    <td className="py-2 font-mono text-slate-700">
                                      ${it.baseLaborRate.toLocaleString('es-CO')}
                                    </td>
                                    <td className="py-2 font-mono text-slate-600">
                                      {it.dropMetersUsed} m
                                    </td>
                                    <td className="py-2 font-mono text-sky-700">
                                      +{it.extraMeters} m (${(it.extraMeters * it.extraMeterRate).toLocaleString('es-CO')})
                                    </td>
                                    <td className="py-2 pr-2 text-right font-mono font-bold text-emerald-700">
                                      ${it.totalSubtotal.toLocaleString('es-CO')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Control de Costos y Rentabilidad */}
      {activeTab === 'COST_ANALYSIS' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs bg-white">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-600 uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-3">OT & Cliente</th>
                <th className="py-3">Tipo Servicio</th>
                <th className="py-3">Facturado Cliente</th>
                <th className="py-3">Costo Materiales</th>
                <th className="py-3">Costo Cuadrilla</th>
                <th className="py-3">Costo Flota/Comb</th>
                <th className="py-3 font-bold text-purple-800">Margen Bruto ($)</th>
                <th className="py-3 pr-3 text-right font-bold text-emerald-800">Margen (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {costAnalyses.map((c) => (
                <tr key={c.otId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-3">
                    <div className="font-mono font-bold text-emerald-700">{c.otCode}</div>
                    <div className="text-[11px] text-slate-900 font-semibold">{c.clientName}</div>
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {c.serviceType}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-900">
                    ${c.clientBilledAmount.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 font-mono text-rose-700">
                    ${c.materialsCost.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 font-mono text-amber-700">
                    ${c.contractorLaborCost.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 font-mono text-sky-700">
                    ${c.logisticsVehicleCost.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 font-mono font-bold text-purple-800">
                    ${c.grossMarginAmount.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <span className="font-mono font-extrabold text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {c.grossMarginPercent}%
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
