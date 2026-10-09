import React, { useState, useEffect } from 'react';
import {
  WorkOrder,
  Technician,
  InventoryItem,
  SerialEquipment,
  DashboardMetrics,
  Client,
  WorkOrderStatus,
  QualityEvidence,
  ContractorSettlement,
  ProjectCostAnalysis,
  FleetVehicle,
  AttendanceRecord,
} from '@fiberops/shared';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { KPICards } from './components/KPICards';
import { WorkOrderList } from './components/WorkOrderList';
import { CreateOTModal } from './components/CreateOTModal';
import { CreateClientModal } from './components/CreateClientModal';
import { MobileFieldApp } from './components/MobileFieldApp';
import { InventoryView } from './components/InventoryView';
import { FleetMapView } from './components/FleetMapView';
import { OrderDetailModal } from './components/OrderDetailModal';
import { FinanceContractorsView } from './components/FinanceContractorsView';
import { FleetVehiclesView } from './components/FleetVehiclesView';
import { HRTechniciansView } from './components/HRTechniciansView';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'DISPATCH' | 'MOBILE_APP' | 'INVENTORY' | 'FINANCE' | 'FLEET' | 'HR' | 'MAP'>('DISPATCH');
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [serials, setSerials] = useState<SerialEquipment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settlements, setSettlements] = useState<ContractorSettlement[]>([]);
  const [costAnalyses, setCostAnalyses] = useState<ProjectCostAnalysis[]>([]);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalOrdersToday: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    firstTimeFixRate: 0,
    avgInstallTimeMinutes: 0,
    activeTechniciansCount: 0,
    opticalPowerComplianceRate: 0,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<WorkOrder | null>(null);
  const [selectedOrderForTech, setSelectedOrderForTech] = useState<WorkOrder | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data
  const fetchData = async () => {
    try {
      const [
        ordersData,
        metricsData,
        techsData,
        invData,
        clientsData,
        settlementsData,
        costsData,
        fleetData,
        attendanceData,
      ] = await Promise.all([
        api.getWorkOrders(),
        api.getMetrics(),
        api.getTechnicians(),
        api.getInventory(),
        api.getClients(),
        api.getSettlements(),
        api.getCostAnalyses(),
        api.getFleet(),
        api.getAttendance(),
      ]);

      setOrders(ordersData);
      setMetrics(metricsData);
      setTechnicians(techsData);
      setInventoryItems(invData.items);
      setSerials(invData.serials);
      setClients(clientsData);
      setSettlements(settlementsData);
      setCostAnalyses(costsData);
      setFleetVehicles(fleetData);
      setAttendance(attendanceData);

      if (!selectedOrderForTech && ordersData.length > 0) {
        setSelectedOrderForTech(ordersData[0]);
      }
    } catch (err) {
      console.error('Failed to load data from server:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Smart dispatch
  const handleSmartDispatch = async (orderId: string) => {
    try {
      const result = await api.smartDispatch(orderId);
      showToast(`⚡ Asignación inteligente: OT asignada a la cuadrilla más cercana`);
      fetchData();
    } catch {
      showToast('Error en despacho inteligente');
    }
  };

  // Status updates from mobile field app
  const handleUpdateStatus = async (orderId: string, status: WorkOrderStatus) => {
    if (isOfflineMode) {
      // Simulate offline local update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      if (selectedOrderForTech && selectedOrderForTech.id === orderId) {
        setSelectedOrderForTech({ ...selectedOrderForTech, status });
      }
      showToast(`📡 [Modo Offline] Estado guardado localmente: ${status}`);
      return;
    }

    try {
      const updated = await api.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrderForTech && selectedOrderForTech.id === orderId) {
        setSelectedOrderForTech(updated);
      }
      showToast(`Estado actualizado en tiempo real: ${status}`);
      fetchData();
    } catch (err) {
      showToast('Error al actualizar estado en el servidor');
    }
  };

  // Submit Evidence
  const handleSubmitEvidence = async (orderId: string, evidence: QualityEvidence) => {
    if (isOfflineMode) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'COMPLETED', evidences: evidence } : o
        )
      );
      if (selectedOrderForTech && selectedOrderForTech.id === orderId) {
        setSelectedOrderForTech({
          ...selectedOrderForTech,
          status: 'COMPLETED',
          evidences: evidence,
        });
      }
      showToast('📦 [Modo Offline] Evidencias y firma guardadas en caché local');
      return;
    }

    try {
      const updated = await api.submitEvidence(orderId, evidence);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrderForTech && selectedOrderForTech.id === orderId) {
        setSelectedOrderForTech(updated);
      }
      showToast('🎉 ¡Orden de trabajo finalizada con evidencias y firma digital!');
      fetchData();
    } catch (err) {
      showToast('Error al registrar evidencias');
    }
  };

  // Create Work Order
  const handleCreateOrder = async (newOrderPayload: any) => {
    try {
      const created = await api.createWorkOrder(newOrderPayload);
      setOrders((prev) => [created, ...prev]);
      showToast(`Orden ${created.code} generada exitosamente`);
      fetchData();
    } catch (err) {
      showToast('Error al crear orden de trabajo');
    }
  };

  // Create Client
  const handleCreateClient = async (clientData: any, andCreateOT: boolean) => {
    try {
      const created = await api.createClient(clientData);
      setClients((prev) => [created, ...prev]);
      showToast(`Cliente ${created.name} registrado en CRM exitosamente`);
      if (andCreateOT) {
        setIsCreateModalOpen(true);
      }
    } catch (err) {
      showToast('Error al registrar cliente');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel-elevated px-4 py-3 border border-emerald-200 text-emerald-800 bg-white font-semibold text-xs shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenCreateOT={() => setIsCreateModalOpen(true)}
        onOpenCreateClient={() => setIsCreateClientModalOpen(true)}
      />

      {/* Main View Shell */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {currentView === 'DISPATCH' && (
          <div>
            <KPICards metrics={metrics} />
            <WorkOrderList
              orders={orders}
              technicians={technicians}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenCreateClientModal={() => setIsCreateClientModalOpen(true)}
              onSmartDispatch={handleSmartDispatch}
              onSelectOrderForTechView={(order) => {
                setSelectedOrderForTech(order);
                setCurrentView('MOBILE_APP');
              }}
              onViewOrderDetail={(order) => setSelectedOrderForDetail(order)}
            />
          </div>
        )}

        {currentView === 'MOBILE_APP' && (
          <div>
            <div className="text-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full shadow-2xs">
                Módulo de Operación en Terreno para Cuadrillas
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Ejecución paso a paso: desplazamiento, checklist de calidad, medición de dBm y acta con firma táctil
              </p>
            </div>
            <MobileFieldApp
              order={selectedOrderForTech}
              onUpdateStatus={handleUpdateStatus}
              onSubmitEvidence={handleSubmitEvidence}
              isOfflineMode={isOfflineMode}
              onSelectAnotherOrder={() => setCurrentView('DISPATCH')}
            />
          </div>
        )}

        {currentView === 'INVENTORY' && (
          <InventoryView
            items={inventoryItems}
            serials={serials}
            technicians={technicians}
          />
        )}

        {currentView === 'FINANCE' && (
          <FinanceContractorsView
            settlements={settlements}
            costAnalyses={costAnalyses}
          />
        )}

        {currentView === 'FLEET' && (
          <FleetVehiclesView vehicles={fleetVehicles} />
        )}

        {currentView === 'HR' && (
          <HRTechniciansView
            technicians={technicians}
            attendance={attendance}
          />
        )}

        {currentView === 'MAP' && (
          <FleetMapView
            technicians={technicians}
            orders={orders}
            onSelectOrder={(order) => setSelectedOrderForDetail(order)}
          />
        )}
      </main>

      {/* Create OT Modal */}
      <CreateOTModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        clients={clients}
        technicians={technicians}
        onSubmit={handleCreateOrder}
      />

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={isCreateClientModalOpen}
        onClose={() => setIsCreateClientModalOpen(false)}
        onSubmit={handleCreateClient}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrderForDetail}
        onClose={() => setSelectedOrderForDetail(null)}
        onOpenMobileView={(order) => {
          setSelectedOrderForTech(order);
          setCurrentView('MOBILE_APP');
        }}
      />
    </div>
  );
};
