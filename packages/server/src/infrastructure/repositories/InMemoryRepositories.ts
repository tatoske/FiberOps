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
import {
  IWorkOrderRepository,
  ITechnicianRepository,
  IInventoryRepository,
  IClientRepository,
} from '../../domain/repositories/IRepositories';
import {
  mockClients,
  mockTechnicians,
  mockInventoryItems,
  mockSerialEquipments,
  mockWorkOrders,
} from '../database/mockData';

// Haversine distance in meters (equivalent to ST_Distance(a::geography, b::geography))
function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export class InMemoryWorkOrderRepository implements IWorkOrderRepository {
  private orders: WorkOrder[] = [...mockWorkOrders];

  async findAll(): Promise<WorkOrder[]> {
    return [...this.orders];
  }

  async findById(id: string): Promise<WorkOrder | null> {
    const found = this.orders.find((o) => o.id === id || o.code === id);
    return found ? { ...found } : null;
  }

  async create(orderData: Omit<WorkOrder, 'id' | 'createdAt'>): Promise<WorkOrder> {
    const count = this.orders.length + 1;
    const code = `OT-2026-${String(count).padStart(4, '0')}`;
    const newOrder: WorkOrder = {
      ...orderData,
      id: `ot-${Date.now()}`,
      code,
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  async updateStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder | null> {
    const index = this.orders.findIndex((o) => o.id === id || o.code === id);
    if (index === -1) return null;

    const current = this.orders[index];
    const now = new Date().toISOString();
    const updated: WorkOrder = { ...current, status };

    if (status === 'IN_EXECUTION' && !updated.startedAt) {
      updated.startedAt = now;
    } else if (status === 'ON_SITE' && !updated.arrivedAt) {
      updated.arrivedAt = now;
    } else if (status === 'COMPLETED') {
      updated.completedAt = now;
      if (updated.startedAt) {
        const diffMs = new Date(now).getTime() - new Date(updated.startedAt).getTime();
        updated.totalDurationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
      } else {
        updated.totalDurationMinutes = 65;
      }
    }

    this.orders[index] = updated;
    return updated;
  }

  async assignTechnician(id: string, technicianId: string): Promise<WorkOrder | null> {
    const index = this.orders.findIndex((o) => o.id === id || o.code === id);
    if (index === -1) return null;

    const tech = mockTechnicians.find((t) => t.id === technicianId);
    if (!tech) throw new Error('Technician not found');

    this.orders[index] = {
      ...this.orders[index],
      assignedTechnicianId: tech.id,
      assignedTechnicianName: tech.fullName,
      assignedVehiclePlate: tech.vehiclePlate.split(' ')[0],
      status: 'ASSIGNED',
    };
    return this.orders[index];
  }

  async submitEvidences(id: string, evidences: QualityEvidence): Promise<WorkOrder | null> {
    const index = this.orders.findIndex((o) => o.id === id || o.code === id);
    if (index === -1) return null;

    this.orders[index] = {
      ...this.orders[index],
      evidences: {
        ...this.orders[index].evidences,
        ...evidences,
      },
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    };
    return this.orders[index];
  }

  async getMetrics(): Promise<DashboardMetrics> {
    const total = this.orders.length;
    const pending = this.orders.filter((o) => o.status === 'CREATED' || o.status === 'ASSIGNED').length;
    const inProgress = this.orders.filter((o) => o.status === 'EN_ROUTE' || o.status === 'ON_SITE' || o.status === 'IN_EXECUTION').length;
    const completedOrders = this.orders.filter((o) => o.status === 'COMPLETED');
    const completed = completedOrders.length;

    // Dynamic First Time Fix: percentage of completed orders that were not corrective maintenance
    const firstTimeFixCount = completedOrders.filter((o) => o.serviceType !== 'MAINTENANCE_CORRECTIVE').length;
    const firstTimeFixRate = completed > 0 
      ? Number(((firstTimeFixCount / completed) * 100).toFixed(1)) 
      : 100.0;

    // Dynamic Average Install Time: calculated from real completed orders
    let totalMinutes = 0;
    let countWithTimes = 0;
    for (const order of completedOrders) {
      if (order.totalDurationMinutes) {
        totalMinutes += order.totalDurationMinutes;
        countWithTimes++;
      } else if (order.startedAt && order.completedAt) {
        const diffMs = new Date(order.completedAt).getTime() - new Date(order.startedAt).getTime();
        if (diffMs > 0) {
          totalMinutes += Math.round(diffMs / (1000 * 60));
          countWithTimes++;
        }
      }
    }
    const avgInstallTimeMinutes = countWithTimes > 0 
      ? Math.round(totalMinutes / countWithTimes) 
      : 0;

    // Active technicians count
    const activeTechniciansCount = mockTechnicians.filter(
      (t) => t.isAvailable || this.orders.some((o) => o.assignedTechnicianId === t.id && o.status !== 'COMPLETED')
    ).length;

    // Optical power compliance rate
    const ordersWithOptical = this.orders.filter((o) => o.evidences?.opticalPowerDbm !== undefined);
    const compliantOrders = ordersWithOptical.filter(
      (o) => o.evidences!.opticalPowerDbm! >= -27 && o.evidences!.opticalPowerDbm! <= -15
    );
    const opticalPowerComplianceRate = ordersWithOptical.length > 0 
      ? Number(((compliantOrders.length / ordersWithOptical.length) * 100).toFixed(1)) 
      : 100.0;

    return {
      totalOrdersToday: total,
      pendingOrders: pending,
      inProgressOrders: inProgress,
      completedOrders: completed,
      firstTimeFixRate,
      avgInstallTimeMinutes,
      activeTechniciansCount,
      opticalPowerComplianceRate,
    };
  }
}

export class InMemoryTechnicianRepository implements ITechnicianRepository {
  private technicians: Technician[] = [...mockTechnicians];

  async findAll(): Promise<Technician[]> {
    return [...this.technicians];
  }

  async findById(id: string): Promise<Technician | null> {
    const found = this.technicians.find((t) => t.id === id);
    return found ? { ...found } : null;
  }

  async updateLocation(id: string, lat: number, lng: number): Promise<Technician | null> {
    const tech = this.technicians.find((t) => t.id === id);
    if (!tech) return null;
    tech.currentCoordinates = { lat, lng };
    return { ...tech };
  }

  async findNearestAvailable(lat: number, lng: number, requiredSpecialty?: string): Promise<Technician[]> {
    return this.technicians
      .filter((t) => {
        if (!requiredSpecialty) return true;
        return t.specialties.includes(requiredSpecialty as any);
      })
      .map((t) => ({
        technician: t,
        distanceMeters: calculateDistanceMeters(
          lat,
          lng,
          t.currentCoordinates.lat,
          t.currentCoordinates.lng
        ),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .map((item) => ({
        ...item.technician,
        distanceMeters: Math.round(item.distanceMeters),
      } as any));
  }
}

export class InMemoryInventoryRepository implements IInventoryRepository {
  private items: InventoryItem[] = [...mockInventoryItems];
  private serials: SerialEquipment[] = [...mockSerialEquipments];

  async findAllItems(): Promise<InventoryItem[]> {
    return [...this.items];
  }

  async findAllSerials(): Promise<SerialEquipment[]> {
    return [...this.serials];
  }

  async findSerialsByTechnician(technicianId: string): Promise<SerialEquipment[]> {
    return this.serials.filter(
      (s) => s.assignedTechnicianId === technicianId && s.status === 'MOBILE_WAREHOUSE'
    );
  }

  async assignSerialToTechnician(serialNumber: string, technicianId: string): Promise<boolean> {
    const item = this.serials.find((s) => s.serialNumber === serialNumber);
    if (!item) return false;
    item.assignedTechnicianId = technicianId;
    item.status = 'MOBILE_WAREHOUSE';
    item.updatedAt = new Date().toISOString();
    return true;
  }

  async installSerialAtClient(serialNumber: string, clientId: string, otCode: string): Promise<boolean> {
    const item = this.serials.find((s) => s.serialNumber === serialNumber);
    if (!item) return false;
    item.status = 'INSTALLED_CLIENT';
    item.installedClientId = clientId;
    item.installedOtCode = otCode;
    item.updatedAt = new Date().toISOString();
    return true;
  }
}

export class InMemoryClientRepository implements IClientRepository {
  private clients: Client[] = [...mockClients];

  async findAll(): Promise<Client[]> {
    return [...this.clients];
  }

  async findById(id: string): Promise<Client | null> {
    const found = this.clients.find((c) => c.id === id);
    return found ? { ...found } : null;
  }

  async create(clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.clients.push(newClient);
    return newClient;
  }
}
