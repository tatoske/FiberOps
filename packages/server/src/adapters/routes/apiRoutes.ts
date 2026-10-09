import { Router } from 'express';
import { WorkOrderController } from '../controllers/WorkOrderController';

export function createApiRouter(controller: WorkOrderController): Router {
  const router = Router();

  // Metrics & KPIs
  router.get('/metrics', controller.getMetrics);

  // Work Orders (OTs)
  router.get('/work-orders', controller.getWorkOrders);
  router.post('/work-orders', controller.createWorkOrder);
  router.get('/work-orders/:id', controller.getWorkOrderById);
  router.patch('/work-orders/:id/status', controller.updateStatus);
  router.post('/work-orders/:id/assign', controller.assignTechnician);
  router.post('/work-orders/:id/smart-dispatch', controller.smartDispatch);
  router.post('/work-orders/:id/evidence', controller.submitEvidence);

  // Technicians & Crews
  router.get('/technicians', controller.getTechnicians);

  // Inventory & Mobile Warehouses
  router.get('/inventory', controller.getInventory);

  // Clients & CRM
  router.get('/clients', controller.getClients);
  router.post('/clients', controller.createClient);

  // Módulo 4: Facturación, Contratistas y Rentabilidad
  router.get('/settlements', controller.getSettlements);
  router.get('/cost-analysis', controller.getCostAnalyses);
  router.get('/fleet', controller.getFleet);

  // Módulo 5: Asistencia y Personal
  router.get('/attendance', controller.getAttendance);

  return router;
}
