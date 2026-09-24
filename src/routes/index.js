import express from 'express';
import Database from '../database/Database.js';
import criarRotasDeEntregas from './entregas.routes.js';

/**
 * Monta o router principal servido em /api.
 * A Database é instanciada uma única vez aqui e compartilhada entre
 * todos os módulos de rotas (ex.: entregas, e futuramente motoristas).
 * @returns {import('express').Router}
 */
function criarRoteadorApi() {
  const database = new Database();
  const router = express.Router();

  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.use('/entregas', criarRotasDeEntregas(database));

  return router;
}

export default criarRoteadorApi;
