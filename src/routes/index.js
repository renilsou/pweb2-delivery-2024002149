import { Router } from 'express';
import { EntregasRepositoryPrisma } from '../repositories/entregas.repository.prisma.js';
import { MotoristasRepositoryPrisma } from '../repositories/motoristas.repository.prisma.js';
import { EntregasService } from '../services/entregas.service.js';
import { MotoristasService } from '../services/motoristas.service.js';
import { EntregasController } from '../controllers/entregas.controller.js';
import { MotoristasController } from '../controllers/motoristas.controller.js';
import { criarRotasEntregas } from './entregas.routes.js';
import { criarRotasMotoristas } from './motoristas.routes.js';

// composition root: único lugar do projeto onde as camadas são instanciadas e ligadas
const entregasRepo = new EntregasRepositoryPrisma();
const motoristasRepo = new MotoristasRepositoryPrisma();

const entregasService = new EntregasService(entregasRepo, motoristasRepo);
const motoristasService = new MotoristasService(motoristasRepo, entregasRepo);

const entregasController = new EntregasController(entregasService, motoristasService);
const motoristasController = new MotoristasController(motoristasService);

const router = Router();

router.get('/', (req, res) => {
  res.redirect('/entregas');
});

router.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/entregas', criarRotasEntregas(entregasController));
router.use('/motoristas', criarRotasMotoristas(motoristasController));

export default router;
