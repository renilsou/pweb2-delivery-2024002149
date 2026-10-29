import { Router } from 'express';
import { validarEntrega, validarAtribuicao } from '../middlewares/validators.js';

export function criarRotasEntregas(controller) {
  const router = Router();

  router.get('/', controller.listar);
  router.get('/nova', controller.formNova);
  router.post('/', validarEntrega, controller.criar);
  router.get('/:id', controller.detalhe);
  router.patch('/:id/avancar', controller.avancar);
  router.patch('/:id/cancelar', controller.cancelar);
  router.patch('/:id/atribuir', validarAtribuicao, controller.atribuir);

  return router;
}
