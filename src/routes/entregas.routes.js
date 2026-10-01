import { Router } from 'express';

export function criarRotasEntregas(controller) {
  const router = Router();

  router.post('/', controller.criar);
  router.get('/', controller.listar);
  router.get('/:id/historico', controller.historico);
  router.get('/:id', controller.buscarPorId);
  router.patch('/:id/avancar', controller.avancar);
  router.patch('/:id/cancelar', controller.cancelar);
  router.patch('/:id/atribuir', controller.atribuir);

  return router;
}
