import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  InMemoryWorkOrderRepository,
  InMemoryTechnicianRepository,
  InMemoryInventoryRepository,
  InMemoryClientRepository,
} from './infrastructure/repositories/InMemoryRepositories';
import { WorkOrderUseCases } from './application/use-cases';
import { WorkOrderController } from './adapters/controllers/WorkOrderController';
import { createApiRouter } from './adapters/routes/apiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// 1. Instanciar Infraestructura (Repositories)
const workOrderRepo = new InMemoryWorkOrderRepository();
const technicianRepo = new InMemoryTechnicianRepository();
const inventoryRepo = new InMemoryInventoryRepository();
const clientRepo = new InMemoryClientRepository();

// 2. Instanciar Capa de Aplicación (Use Cases)
const workOrderUseCases = new WorkOrderUseCases(
  workOrderRepo,
  technicianRepo,
  inventoryRepo,
  clientRepo
);

// 3. Instanciar Adaptadores (Controllers & Routes)
const workOrderController = new WorkOrderController(workOrderUseCases);
const apiRouter = createApiRouter(workOrderController);

app.use('/api', apiRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'FiberOps ERP Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[FiberOps ERP] Backend server running on http://localhost:${PORT}`);
  console.log(`[FiberOps ERP] API documentation & endpoints active at http://localhost:${PORT}/api/work-orders`);
});
