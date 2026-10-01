import { Router } from 'express';

export function criarRotasMotoristas(controller) {
  const router = Router();

  router.post('/', controller.criar);
  router.get('/', controller.listar);
  router.get('/:id/entregas', controller.listarEntregas);
  router.get('/:id', controller.buscarPorId);

  return router;
}
