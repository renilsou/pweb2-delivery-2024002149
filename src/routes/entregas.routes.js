import { Router } from 'express';
import { EntregasRepository } from '../repositories/entregas.repository.js';
import { EntregasService } from '../services/entregas.service.js';
import { EntregasController } from '../controllers/entregas.controller.js';

export function criarRotasEntregas(database) {
  const repository = new EntregasRepository(database);
  const service = new EntregasService(repository);
  const controller = new EntregasController(service);

  const router = Router();

  router.post('/', controller.criar);
  router.get('/', controller.listar);
  router.get('/:id/historico', controller.historico);
  router.get('/:id', controller.buscarPorId);
  router.patch('/:id/avancar', controller.avancar);
  router.patch('/:id/cancelar', controller.cancelar);

  return router;
}
