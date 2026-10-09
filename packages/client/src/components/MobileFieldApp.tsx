import React, { useState, useRef, useEffect } from 'react';
import { WorkOrder, WorkOrderStatus, QualityEvidence } from '@fiberops/shared';
import {
  Smartphone,
  Navigation,
  MapPin,
  CheckCircle2,
  PenTool,
  ArrowRight,
  Wifi,
  WifiOff,
  FileCheck2,
  Trash2,
  Zap,
  Camera,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MobileFieldAppProps {
  order: WorkOrder | null;
  onUpdateStatus: (orderId: string, status: WorkOrderStatus) => Promise<void>;
  onSubmitEvidence: (orderId: string, evidence: QualityEvidence) => Promise<void>;
  isOfflineMode: boolean;
  onSelectAnotherOrder?: () => void;
}

export const MobileFieldApp: React.FC<MobileFieldAppProps> = ({
  order,
  onUpdateStatus,
  onSubmitEvidence,
  isOfflineMode,
  onSelectAnotherOrder,
}) => {
  // Dynamic live clock
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  if (!order) {
    return (
      <div className="glass-panel p-8 text-center max-w-md mx-auto my-6 bg-white">
        <Smartphone className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Ninguna OT seleccionada</h3>
        <p className="text-xs text-slate-500 mt-1">
          Selecciona una orden en el panel de despacho para iniciar la ejecución en campo.
        </p>
      </div>
    );
  }

  // Evidence state (dynamically bound to order)
  const defaultDrop = order.evidences?.dropCableMeters ?? (
    order.estimatedMaterials?.find((m) => m.name.toLowerCase().includes('drop'))?.quantity || 0
  );

  const [napPort, setNapPort] = useState<string>(order.evidences?.napPortAssigned || '');
  const [napPhoto, setNapPhoto] = useState<string>(order.evidences?.napBoxPhotoUrl || '');
  const [dropMeters, setDropMeters] = useState<number>(defaultDrop);
  const [cablePhoto, setCablePhoto] = useState<string>(order.evidences?.cableRoutePhotoUrl || '');
  const [opticalPowerDbm, setOpticalPowerDbm] = useState<number>(
    order.evidences?.opticalPowerDbm ?? -19.5
  );
  const [powerPhoto, setPowerPhoto] = useState<string>(order.evidences?.opticalPowerPhotoUrl || '');
  const [equipmentPhoto, setEquipmentPhoto] = useState<string>(
    order.evidences?.equipmentRunningPhotoUrl || ''
  );

  // Client signature state
  const [signerName, setSignerName] = useState<string>(
    order.evidences?.clientSignerName || order.clientName || ''
  );
  const [signerDoc, setSignerDoc] = useState<string>(order.evidences?.clientSignerDoc || '');
  const [notes, setNotes] = useState<string>(order.evidences?.completedNotes || '');
  const [isSigned, setIsSigned] = useState<boolean>(!!order.evidences?.clientSignatureUrl);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Sync state whenever the selected order changes
  useEffect(() => {
    if (!order) return;
    const initialDrop = order.evidences?.dropCableMeters ?? (
      order.estimatedMaterials?.find((m) => m.name.toLowerCase().includes('drop'))?.quantity || 0
    );
    setNapPort(order.evidences?.napPortAssigned || '');
    setNapPhoto(order.evidences?.napBoxPhotoUrl || '');
    setDropMeters(initialDrop);
    setCablePhoto(order.evidences?.cableRoutePhotoUrl || '');
    setOpticalPowerDbm(order.evidences?.opticalPowerDbm ?? -19.5);
    setPowerPhoto(order.evidences?.opticalPowerPhotoUrl || '');
    setEquipmentPhoto(order.evidences?.equipmentRunningPhotoUrl || '');
    setSignerName(order.evidences?.clientSignerName || order.clientName || '');
    setSignerDoc(order.evidences?.clientSignerDoc || '');
    setNotes(order.evidences?.completedNotes || '');
    setIsSigned(!!order.evidences?.clientSignatureUrl);
  }, [order.id]);

  // Handle photo file selection / camera capture
  const handlePhotoUpload = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setter(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Initialize signature canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  }, [order.id]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setIsSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
  };

  // Optical power validity
  const isPowerOptimal = opticalPowerDbm >= -25.0 && opticalPowerDbm <= -15.0;
  const isPowerWarning =
    (opticalPowerDbm < -25.0 && opticalPowerDbm >= -27.5) ||
    (opticalPowerDbm > -15.0 && opticalPowerDbm <= -12.0);

  // Status transitions
  const handleNextStatus = async () => {
    if (order.status === 'CREATED' || order.status === 'ASSIGNED') {
      await onUpdateStatus(order.id, 'EN_ROUTE');
    } else if (order.status === 'EN_ROUTE') {
      await onUpdateStatus(order.id, 'ON_SITE');
    } else if (order.status === 'ON_SITE') {
      await onUpdateStatus(order.id, 'IN_EXECUTION');
    }
  };

  const handleFinishInstallation = async () => {
    const canvas = canvasRef.current;
    const signatureUrl = canvas ? canvas.toDataURL() : undefined;

    const evidencePayload: QualityEvidence = {
      napBoxPhotoUrl: napPhoto || undefined,
      napPortAssigned: napPort || undefined,
      cableRoutePhotoUrl: cablePhoto || undefined,
      dropCableMeters: Number(dropMeters) || 0,
      opticalPowerPhotoUrl: powerPhoto || undefined,
      opticalPowerDbm: Number(opticalPowerDbm),
      equipmentRunningPhotoUrl: equipmentPhoto || undefined,
      clientSignatureUrl: signatureUrl,
      clientSignerName: signerName,
      clientSignerDoc: signerDoc,
      completedNotes: notes,
    };

    await onSubmitEvidence(order.id, evidencePayload);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
  };

  // Render a clean photo uploader box
  const renderPhotoUploader = (
    photoUrl: string,
    setPhotoUrl: (val: string) => void,
    label: string,
    badgeText?: string
  ) => {
    return (
      <div>
        {photoUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-100 group">
            <img src={photoUrl} alt={label} className="w-full h-full object-cover" />
            {badgeText && (
              <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                {badgeText}
              </span>
            )}
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <label className="btn btn-secondary text-[10px] py-1 px-2 h-6 bg-white/95 hover:bg-white border-slate-200 cursor-pointer shadow-xs">
                <Upload className="w-3 h-3 mr-1 text-slate-500" />
                <span>Cambiar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload(setPhotoUrl)}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setPhotoUrl('')}
                className="p-1 rounded bg-white/95 text-rose-600 hover:bg-white border border-slate-200 shadow-xs"
                title="Quitar foto"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50/70 hover:bg-emerald-50/30 p-4 cursor-pointer transition-all text-center">
            <Camera className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-xs font-semibold text-slate-700">Adjuntar o Tomar Foto</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Cargar archivo desde cámara o dispositivo
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload(setPhotoUrl)}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto my-3 animate-fade-in">
      {/* Mobile Device Frame - Clean Light Edition */}
      <div className="border border-slate-300 rounded-3xl bg-white shadow-xl overflow-hidden">
        {/* Mobile Header / Notch Bar with Live Clock */}
        <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-800">{currentTime}</span>
            <span className="text-[10px] text-slate-500">4G LTE</span>
          </div>

          <div className="flex items-center gap-2">
            {isOfflineMode ? (
              <span className="flex items-center gap-1 text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                <WifiOff className="w-3 h-3 text-amber-600" /> Offline
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                <Wifi className="w-3 h-3 text-emerald-600" /> En Línea
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-600">100%</span>
          </div>
        </div>

        {/* Technician Top Bar */}
        <div className="p-4 bg-gradient-to-r from-emerald-50/50 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
              Técnico en Campo
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              {order.assignedTechnicianName || 'Cuadrilla de Turno'}
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Móvil: {order.assignedVehiclePlate || 'Sin Vehículo Asignado'}
            </span>
          </div>

          {onSelectAnotherOrder && (
            <button
              onClick={onSelectAnotherOrder}
              className="btn btn-secondary text-[11px] py-1 px-2.5 h-7"
            >
              Cambiar OT
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto bg-slate-50/50">
          {/* Active OT Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-emerald-500">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="font-mono font-extrabold text-emerald-700 text-sm">
                  {order.code}
                </span>
                <span className="ml-2 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {order.serviceType}
                </span>
              </div>
              <span className="badge badge-in_execution text-[10px]">
                {order.status}
              </span>
            </div>

            <div className="font-bold text-slate-900 text-base">{order.clientName}</div>
            <div className="text-slate-600 text-xs flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{order.address}</span>
            </div>
            <div className="text-slate-500 text-[11px] mt-1 font-mono">
              Tel: {order.clientPhone} • Franja: {order.timeSlot}
            </div>

            {/* Navigation Button */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${order.coordinates.lat},${order.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary w-full text-xs text-sky-700 hover:text-sky-800 hover:bg-sky-50 border-sky-200"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-600" />
                <span>Navegar con Google Maps / Waze</span>
              </a>
            </div>
          </div>

          {/* Workflow Action Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-slate-600 font-semibold mb-2 flex items-center justify-between text-xs">
              <span>Flujo de Trabajo en Terreno</span>
              <span className="text-[11px] font-mono font-bold text-emerald-700">Etapa 1 a 4</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] mb-3">
              <div
                className={`p-1.5 rounded font-semibold ${
                  order.status === 'ASSIGNED' || order.status === 'CREATED'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                1. Asignada
              </div>
              <div
                className={`p-1.5 rounded font-semibold ${
                  order.status === 'EN_ROUTE'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                2. En Camino
              </div>
              <div
                className={`p-1.5 rounded font-semibold ${
                  order.status === 'ON_SITE'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                3. En Sitio
              </div>
              <div
                className={`p-1.5 rounded font-semibold ${
                  order.status === 'IN_EXECUTION' || order.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                4. Ejecución
              </div>
            </div>

            {order.status !== 'IN_EXECUTION' && order.status !== 'COMPLETED' && (
              <button
                onClick={handleNextStatus}
                className="btn btn-primary w-full text-xs font-bold"
              >
                <span>
                  {order.status === 'ASSIGNED' || order.status === 'CREATED'
                    ? 'Iniciar Desplazamiento (En Camino)'
                    : order.status === 'EN_ROUTE'
                    ? 'Marcar Llegada a Predio (En Sitio)'
                    : 'Iniciar Labores de Instalación'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Formulario de Calidad Obligatorio */}
          {(order.status === 'IN_EXECUTION' || order.status === 'COMPLETED') && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Checklist de Calidad & Evidencias</span>
              </div>

              {/* 1. Foto Caja NAP & Puerto */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    1. Foto Caja NAP y Puerto Asignado
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Requerido
                  </span>
                </div>
                <input
                  type="text"
                  value={napPort}
                  onChange={(e) => setNapPort(e.target.value)}
                  placeholder="Ej: NAP-04 / Puerto 6"
                  className="glass-input text-xs"
                />
                {renderPhotoUploader(
                  napPhoto,
                  setNapPhoto,
                  'Caja NAP',
                  napPort ? `✓ Puerto ${napPort}` : undefined
                )}
              </div>

              {/* 2. Ruta de Acometida y Metros de Drop */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    2. Ruta Cable Drop y Liquidación
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Requerido
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={dropMeters || ''}
                    onChange={(e) => setDropMeters(Number(e.target.value))}
                    placeholder="Metros"
                    className="glass-input text-xs w-28 font-mono"
                  />
                  <span className="text-slate-600 text-xs">metros reales instalados</span>
                </div>
                {renderPhotoUploader(cablePhoto, setCablePhoto, 'Ruta Cable Drop')}
              </div>

              {/* 3. Potencia Óptica con Validación dBm */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3. Potencia Óptica (Power Meter)</span>
                  </span>
                  <span
                    className={`power-indicator text-xs ${
                      isPowerOptimal
                        ? 'power-optimal'
                        : isPowerWarning
                        ? 'power-warning'
                        : 'power-critical'
                    }`}
                  >
                    {isPowerOptimal
                      ? 'Nivel Óptimo'
                      : isPowerWarning
                      ? 'Tolerancia Límite'
                      : 'Potencia Crítica'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Valor Medido (dBm)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={opticalPowerDbm}
                      onChange={(e) => setOpticalPowerDbm(Number(e.target.value))}
                      className="glass-input text-sm font-mono font-bold text-emerald-700"
                    />
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <div>Rango Estándar:</div>
                    <div className="font-mono text-slate-700 font-semibold">-15.00 a -25.00 dBm</div>
                  </div>
                </div>

                {renderPhotoUploader(
                  powerPhoto,
                  setPowerPhoto,
                  'Medidor Óptico',
                  `${opticalPowerDbm} dBm @1490nm`
                )}
              </div>

              {/* 4. Equipo Encendido y Luces */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    4. Foto Equipo Encendido (Luces PON/LAN)
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Requerido
                  </span>
                </div>
                {renderPhotoUploader(
                  equipmentPhoto,
                  setEquipmentPhoto,
                  'Equipo Encendido',
                  '✓ PON Estable'
                )}
              </div>

              {/* 5. Firma Digital del Cliente (Canvas Interactivo) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-purple-600" />
                    <span>5. Firma Digital de Conformidad del Cliente</span>
                  </span>
                  <button
                    onClick={clearSignature}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Limpiar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Nombre de quien recibe"
                    className="glass-input text-xs"
                  />
                  <input
                    type="text"
                    value={signerDoc}
                    onChange={(e) => setSignerDoc(e.target.value)}
                    placeholder="Documento / C.C."
                    className="glass-input text-xs"
                  />
                </div>

                {/* Canvas de Firma */}
                <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50 relative overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={130}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-32 cursor-crosshair touch-none"
                  />
                  {!isSigned && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                      Firme aquí con el dedo o ratón
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 leading-tight">
                  Al firmar, el abonado declara que el servicio de fibra óptica y los equipos quedan
                  instalados a entera satisfacción con pruebas de velocidad aprobadas.
                </p>
              </div>

              {/* Botón de Cierre Definitivo */}
              {order.status !== 'COMPLETED' ? (
                <button
                  onClick={handleFinishInstallation}
                  className="btn btn-primary w-full py-3 text-sm font-bold shadow-md shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Cerrar y Liquidar Instalación (Checklist Completo)</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800 font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Orden Completada y Sincronizada con Central</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
