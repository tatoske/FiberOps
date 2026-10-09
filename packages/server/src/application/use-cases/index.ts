import {
  IWorkOrderRepository,
  ITechnicianRepository,
  IInventoryRepository,
  IClientRepository,
} from '../../domain/repositories/IRepositories';
import {
  WorkOrder,
  WorkOrderStatus,
  QualityEvidence,
  DashboardMetrics,
  Technician,
  InventoryItem,
  SerialEquipment,
  Client,
} from '@fiberops/shared';

export class WorkOrderUseCases {
  constructor(
    private workOrderRepo: IWorkOrderRepository,
    private technicianRepo: ITechnicianRepository,
    private inventoryRepo: IInventoryRepository,
    private clientRepo: IClientRepository
  ) {}

  async listOrders(): Promise<WorkOrder[]> {
    return this.workOrderRepo.findAll();
  }

  async getOrder(id: string): Promise<WorkOrder | null> {
    return this.workOrderRepo.findById(id);
  }

  async createOrder(data: Omit<WorkOrder, 'id' | 'createdAt'>): Promise<WorkOrder> {
    return this.workOrderRepo.create(data);
  }

  async updateStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder | null> {
    return this.workOrderRepo.updateStatus(id, status);
  }

  async assignTechnician(id: string, technicianId: string): Promise<WorkOrder | null> {
    return this.workOrderRepo.assignTechnician(id, technicianId);
  }

  async smartDispatch(orderId: string): Promise<{ order: WorkOrder; candidates: Technician[] }> {
    const order = await this.workOrderRepo.findById(orderId);
    if (!order) throw new Error('Order not found');

    // Find nearest technician
    const candidates = await this.technicianRepo.findNearestAvailable(
      order.coordinates.lat,
      order.coordinates.lng
    );

    if (candidates.length > 0) {
      const bestCandidate = candidates[0];
      const updatedOrder = await this.workOrderRepo.assignTechnician(order.id, bestCandidate.id);
      return { order: updatedOrder || order, candidates };
    }

    return { order, candidates: [] };
  }

  async submitEvidence(id: string, evidences: QualityEvidence): Promise<WorkOrder | null> {
    // If optical power is recorded, validate threshold (between -15 and -26 dBm)
    if (evidences.opticalPowerDbm !== undefined) {
      const dbm = evidences.opticalPowerDbm;
      if (dbm > -12 || dbm < -27) {
        console.warn(`[Quality Alert] Optical power ${dbm} dBm is outside standard threshold (-15 to -26 dBm)`);
      }
    }
    return this.workOrderRepo.submitEvidences(id, evidences);
  }

  async getMetrics(): Promise<DashboardMetrics> {
    return this.workOrderRepo.getMetrics();
  }

  async listTechnicians(): Promise<Technician[]> {
    return this.technicianRepo.findAll();
  }

  async listInventory(): Promise<{ items: InventoryItem[]; serials: SerialEquipment[] }> {
    const [items, serials] = await Promise.all([
      this.inventoryRepo.findAllItems(),
      this.inventoryRepo.findAllSerials(),
    ]);
    return { items, serials };
  }

  async listClients(): Promise<Client[]> {
    return this.clientRepo.findAll();
  }

  async createClient(data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    return this.clientRepo.create(data);
  }

  async listSettlements(): Promise<any[]> {
    const { mockContractorSettlements } = await import('../../infrastructure/database/mockData');
    return mockContractorSettlements;
  }

  async listCostAnalyses(): Promise<any[]> {
    const { mockProjectCostAnalyses } = await import('../../infrastructure/database/mockData');
    return mockProjectCostAnalyses;
  }

  async listFleet(): Promise<any[]> {
    const { mockFleetVehicles } = await import('../../infrastructure/database/mockData');
    return mockFleetVehicles;
  }

  async listAttendance(): Promise<any[]> {
    const { mockAttendanceRecords } = await import('../../infrastructure/database/mockData');
    return mockAttendanceRecords;
  }
}
