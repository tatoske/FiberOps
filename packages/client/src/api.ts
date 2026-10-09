import {
  WorkOrder,
  Technician,
  InventoryItem,
  SerialEquipment,
  DashboardMetrics,
  Client,
  QualityEvidence,
  WorkOrderStatus,
} from '@fiberops/shared';

const API_BASE = '/api';

// Fallback to local storage for offline capability
const STORAGE_KEY_OFFLINE_QUEUE = 'fiberops_offline_actions';

export const api = {
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const res = await fetch(`${API_BASE}/metrics`);
      const data = await res.json();
      return data.data;
    } catch {
      return {
        totalOrdersToday: 4,
        pendingOrders: 2,
        inProgressOrders: 2,
        completedOrders: 1,
        firstTimeFixRate: 96.0,
        avgInstallTimeMinutes: 75,
        activeTechniciansCount: 3,
        opticalPowerComplianceRate: 98.5,
      };
    }
  },

  async getWorkOrders(): Promise<WorkOrder[]> {
    try {
      const res = await fetch(`${API_BASE}/work-orders`);
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('Network offline or error, loading from local cache', err);
      const cached = localStorage.getItem('fiberops_orders_cache');
      return cached ? JSON.parse(cached) : [];
    }
  },

  async createWorkOrder(order: any): Promise<WorkOrder> {
    const res = await fetch(`${API_BASE}/work-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    return data.data;
  },

  async updateStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder> {
    try {
      const res = await fetch(`${API_BASE}/work-orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      return data.data;
    } catch (err) {
      // Save in offline queue
      this.queueOfflineAction({ type: 'STATUS_UPDATE', id, payload: { status } });
      throw err;
    }
  },

  async smartDispatch(id: string): Promise<{ order: WorkOrder; candidates: Technician[] }> {
    const res = await fetch(`${API_BASE}/work-orders/${id}/smart-dispatch`, {
      method: 'POST',
    });
    const data = await res.json();
    return data.data;
  },

  async assignTechnician(id: string, technicianId: string): Promise<WorkOrder> {
    const res = await fetch(`${API_BASE}/work-orders/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ technicianId }),
    });
    const data = await res.json();
    return data.data;
  },

  async submitEvidence(id: string, evidence: QualityEvidence): Promise<WorkOrder> {
    try {
      const res = await fetch(`${API_BASE}/work-orders/${id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidence),
      });
      const data = await res.json();
      return data.data;
    } catch (err) {
      this.queueOfflineAction({ type: 'SUBMIT_EVIDENCE', id, payload: evidence });
      throw err;
    }
  },

  async getTechnicians(): Promise<Technician[]> {
    const res = await fetch(`${API_BASE}/technicians`);
    const data = await res.json();
    return data.data;
  },

  async getInventory(): Promise<{ items: InventoryItem[]; serials: SerialEquipment[] }> {
    const res = await fetch(`${API_BASE}/inventory`);
    const data = await res.json();
    return data.data;
  },

  async getClients(): Promise<Client[]> {
    const res = await fetch(`${API_BASE}/clients`);
    const data = await res.json();
    return data.data;
  },

  async createClient(client: any): Promise<Client> {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    const data = await res.json();
    return data.data;
  },

  async getSettlements(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/settlements`);
    const data = await res.json();
    return data.data;
  },

  async getCostAnalyses(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/cost-analysis`);
    const data = await res.json();
    return data.data;
  },

  async getFleet(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/fleet`);
    const data = await res.json();
    return data.data;
  },

  async getAttendance(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/attendance`);
    const data = await res.json();
    return data.data;
  },

  // Offline queue management
  queueOfflineAction(action: any) {
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE) || '[]');
    queue.push({ ...action, queuedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(queue));
  },

  getOfflineQueue(): any[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE) || '[]');
  },

  clearOfflineQueue() {
    localStorage.removeItem(STORAGE_KEY_OFFLINE_QUEUE);
  },
};
