import express from 'express';
import EntregasRepository from '../repositories/EntregasRepository.js';
import EntregasService from '../services/EntregasService.js';
import EntregasController from '../controllers/EntregasController.js';

/**
 * Composition root das Entregas: aqui — e só aqui — as camadas são
 * instanciadas e conectadas por injeção de dependência.
 * @param {import('../database/Database').default} database instância única, compartilhada entre routers
 * @returns {import('express').Router}
 */
function criarRotasDeEntregas(database) {
  const repository = new EntregasRepository(database);
  const service = new EntregasService(repository);
  const controller = new EntregasController(service);

  const router = express.Router();

  router.post('/', controller.criar);
  router.get('/', controller.listar);
  router.get('/:id/historico', controller.historico);
  router.get('/:id', controller.buscarPorId);
  router.patch('/:id/avancar', controller.avancar);
  router.patch('/:id/cancelar', controller.cancelar);

  return router;
}

export default criarRotasDeEntregas;
