import { Request, Response } from 'express';
import { WorkOrderUseCases } from '../../application/use-cases';

export class WorkOrderController {
  constructor(private useCases: WorkOrderUseCases) {}

  getWorkOrders = async (_req: Request, res: Response) => {
    try {
      const orders = await this.useCases.listOrders();
      res.json({ success: true, data: orders });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getWorkOrderById = async (req: Request, res: Response) => {
    try {
      const order = await this.useCases.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      res.json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  createWorkOrder = async (req: Request, res: Response) => {
    try {
      const newOrder = await this.useCases.createOrder(req.body);
      res.status(201).json({ success: true, data: newOrder });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const updated = await this.useCases.updateStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  assignTechnician = async (req: Request, res: Response) => {
    try {
      const { technicianId } = req.body;
      const updated = await this.useCases.assignTechnician(req.params.id, technicianId);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  smartDispatch = async (req: Request, res: Response) => {
    try {
      const result = await this.useCases.smartDispatch(req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  submitEvidence = async (req: Request, res: Response) => {
    try {
      const updated = await this.useCases.submitEvidence(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getMetrics = async (_req: Request, res: Response) => {
    try {
      const metrics = await this.useCases.getMetrics();
      res.json({ success: true, data: metrics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getTechnicians = async (_req: Request, res: Response) => {
    try {
      const technicians = await this.useCases.listTechnicians();
      res.json({ success: true, data: technicians });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getInventory = async (_req: Request, res: Response) => {
    try {
      const inventory = await this.useCases.listInventory();
      res.json({ success: true, data: inventory });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getClients = async (_req: Request, res: Response) => {
    try {
      const clients = await this.useCases.listClients();
      res.json({ success: true, data: clients });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  createClient = async (req: Request, res: Response) => {
    try {
      const client = await this.useCases.createClient(req.body);
      res.status(201).json({ success: true, data: client });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  };

  getSettlements = async (_req: Request, res: Response) => {
    try {
      const settlements = await this.useCases.listSettlements();
      res.json({ success: true, data: settlements });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getCostAnalyses = async (_req: Request, res: Response) => {
    try {
      const costs = await this.useCases.listCostAnalyses();
      res.json({ success: true, data: costs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getFleet = async (_req: Request, res: Response) => {
    try {
      const fleet = await this.useCases.listFleet();
      res.json({ success: true, data: fleet });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getAttendance = async (_req: Request, res: Response) => {
    try {
      const attendance = await this.useCases.listAttendance();
      res.json({ success: true, data: attendance });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
}
