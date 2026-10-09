export type ClientType = 'RESIDENTIAL' | 'CORPORATE' | 'B2B';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Client {
  id: string;
  name: string;
  documentId: string;
  phone: string;
  email: string;
  type: ClientType;
  address: string;
  neighborhood: string;
  city: string;
  coordinates: Coordinates;
  contractNumber: string;
  planName: string;
  planSpeedMbps: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'PROSPECT';
  createdAt: string;
}

export type ServiceType =
  | 'NEW_INSTALL'
  | 'MIGRATION'
  | 'MAINTENANCE_CORRECTIVE'
  | 'EQUIPMENT_RETRIEVAL';

export type WorkOrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'ON_SITE'
  | 'IN_EXECUTION'
  | 'COMPLETED'
  | 'CANCELLED';

export interface MaterialRequirement {
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
  serialNumber?: string;
}

export interface QualityEvidence {
  napBoxPhotoUrl?: string;
  napPortAssigned?: string;
  cableRoutePhotoUrl?: string;
  dropCableMeters?: number;
  opticalPowerPhotoUrl?: string;
  opticalPowerDbm?: number; // e.g. -19.5 dBm (optimal between -15.0 and -25.0)
  equipmentRunningPhotoUrl?: string;
  clientSignatureUrl?: string;
  clientSignerName?: string;
  clientSignerDoc?: string;
  completedNotes?: string;
}

export interface WorkOrder {
  id: string;
  code: string; // e.g. OT-2026-0842
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientType: ClientType;
  serviceType: ServiceType;
  status: WorkOrderStatus;
  scheduledDate: string;
  timeSlot: '08:00 - 12:00' | '13:00 - 17:00' | '17:00 - 20:00';
  planSpeedMbps: number;
  address: string;
  city: string;
  coordinates: Coordinates;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  assignedVehiclePlate?: string;
  estimatedMaterials: MaterialRequirement[];
  installedMaterials?: MaterialRequirement[];
  returnedSurplusMaterials?: MaterialRequirement[];
  wasteDefectiveMaterials?: MaterialRequirement[];
  evidences?: QualityEvidence;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  totalDurationMinutes?: number;
  costEstimate?: number;
  createdAt: string;
}

export interface Technician {
  id: string;
  fullName: string;
  code: string;
  phone: string;
  email: string;
  avatarUrl: string;
  vehiclePlate: string;
  specialties: ('FIBER_FUSION' | 'HEIGHT_CERTIFIED' | 'CONFINED_SPACES' | 'NETWORK_CONFIG')[];
  certifications: {
    name: string;
    expiresAt: string;
    status: 'VALID' | 'WARNING' | 'EXPIRED';
  }[];
  isAvailable: boolean;
  currentCoordinates: Coordinates;
  activeWorkOrderId?: string;
  completedTodayCount: number;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'EQUIPMENT' | 'OPTICAL_PASSIVE' | 'CABLE' | 'CONSUMABLE';
  unit: 'UND' | 'METROS' | 'ROLLO' | 'PAQUETE';
  isSerialTracked: boolean;
  centralStock: number;
  minAlertThreshold: number;
  unitCost: number;
}

export interface SerialEquipment {
  serialNumber: string;
  macAddress: string;
  model: string;
  brand: string;
  type: 'ONU_GPON' | 'WIFI6_ROUTER' | 'MEDIA_CONVERTER';
  status: 'CENTRAL_WAREHOUSE' | 'MOBILE_WAREHOUSE' | 'INSTALLED_CLIENT' | 'RMA_DEFECTIVE';
  assignedTechnicianId?: string;
  installedClientId?: string;
  installedOtCode?: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalOrdersToday: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  firstTimeFixRate: number; // e.g. 94.2%
  avgInstallTimeMinutes: number; // e.g. 82 mins
  activeTechniciansCount: number;
  opticalPowerComplianceRate: number; // e.g. 98% within -15 to -25 dBm
}

export interface ContractorSettlementItem {
  otId: string;
  otCode: string;
  clientName: string;
  serviceType: ServiceType;
  baseLaborRate: number;
  dropMetersUsed: number;
  extraMeters: number;
  extraMeterRate: number;
  totalSubtotal: number;
}

export interface ContractorSettlement {
  id: string;
  contractorName: string;
  period: string; // ej. "01 - 15 Octubre 2026"
  technicianCode: string;
  completedOrdersCount: number;
  baseLaborTotal: number;
  extraDropLaborTotal: number;
  qualityBonus: number;
  deductionsForMermas: number;
  grandTotalPayable: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  items: ContractorSettlementItem[];
}

export interface ProjectCostAnalysis {
  otId: string;
  otCode: string;
  clientName: string;
  serviceType: ServiceType;
  clientBilledAmount: number; // Ingreso cobrado
  materialsCost: number; // Costo materiales gastados
  contractorLaborCost: number; // Pago a la cuadrilla
  logisticsVehicleCost: number; // Combustible y desgaste
  totalDirectCost: number;
  grossMarginAmount: number; // Margen bruto ($)
  grossMarginPercent: number; // Margen bruto (%)
}

export interface FleetVehicle {
  id: string;
  plate: string;
  vehicleModel: string;
  year: number;
  assignedTechnicianName: string;
  currentKm: number;
  fuelEfficiencyKmPerGal: number;
  fuelTodayLiters: number;
  soatExpiresAt: string;
  technicalReviewExpiresAt: string;
  nextOilChangeKm: number;
  status: 'OPERATIONAL' | 'MAINTENANCE_DUE' | 'IN_SHOP';
}

export interface AttendanceRecord {
  technicianId: string;
  technicianName: string;
  date: string;
  checkInTime: string; // ej. "06:55 AM"
  checkOutTime?: string; // ej. "18:10 PM"
  location: string;
  status: 'ON_TIME' | 'LATE' | 'ABSENT';
}

