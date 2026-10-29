import { Router } from 'express';
import { validarMotorista } from '../middlewares/validators.js';

export function criarRotasMotoristas(controller) {
  const router = Router();

  router.get('/', controller.listar);
  router.get('/novo', controller.formNovo);
  router.post('/', validarMotorista, controller.criar);

  return router;
}
