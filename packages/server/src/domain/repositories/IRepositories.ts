import {
  WorkOrder,
  Technician,
  Client,
  InventoryItem,
  SerialEquipment,
  DashboardMetrics,
  QualityEvidence,
  WorkOrderStatus,
} from '@fiberops/shared';

export interface IWorkOrderRepository {
  findAll(): Promise<WorkOrder[]>;
  findById(id: string): Promise<WorkOrder | null>;
  create(order: Omit<WorkOrder, 'id' | 'createdAt'>): Promise<WorkOrder>;
  updateStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder | null>;
  assignTechnician(id: string, technicianId: string): Promise<WorkOrder | null>;
  submitEvidences(id: string, evidences: QualityEvidence): Promise<WorkOrder | null>;
  getMetrics(): Promise<DashboardMetrics>;
}

export interface ITechnicianRepository {
  findAll(): Promise<Technician[]>;
  findById(id: string): Promise<Technician | null>;
  updateLocation(id: string, lat: number, lng: number): Promise<Technician | null>;
  findNearestAvailable(lat: number, lng: number, requiredSpecialty?: string): Promise<Technician[]>;
}

export interface IInventoryRepository {
  findAllItems(): Promise<InventoryItem[]>;
  findAllSerials(): Promise<SerialEquipment[]>;
  findSerialsByTechnician(technicianId: string): Promise<SerialEquipment[]>;
  assignSerialToTechnician(serialNumber: string, technicianId: string): Promise<boolean>;
  installSerialAtClient(serialNumber: string, clientId: string, otCode: string): Promise<boolean>;
}

export interface IClientRepository {
  findAll(): Promise<Client[]>;
  findById(id: string): Promise<Client | null>;
  create(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client>;
}
