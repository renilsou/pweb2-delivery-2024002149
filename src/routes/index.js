import { Router } from 'express';
import { Database } from '../database/database.js';
import { EntregasRepository } from '../repositories/entregas.repository.js';
import { MotoristasRepository } from '../repositories/motoristas.repository.js';
import { EntregasService } from '../services/entregas.service.js';
import { MotoristasService } from '../services/motoristas.service.js';
import { EntregasController } from '../controllers/entregas.controller.js';
import { MotoristasController } from '../controllers/motoristas.controller.js';
import { criarRotasEntregas } from './entregas.routes.js';
import { criarRotasMotoristas } from './motoristas.routes.js';

// composition root: único lugar do projeto onde as camadas são instanciadas e ligadas
const database = new Database();

const entregasRepo = new EntregasRepository(database);
const motoristasRepo = new MotoristasRepository(database);

const entregasService = new EntregasService(entregasRepo, motoristasRepo);
const motoristasService = new MotoristasService(motoristasRepo, entregasRepo);

const entregasController = new EntregasController(entregasService);
const motoristasController = new MotoristasController(motoristasService);

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/entregas', criarRotasEntregas(entregasController));
router.use('/motoristas', criarRotasMotoristas(motoristasController));

export default router;
