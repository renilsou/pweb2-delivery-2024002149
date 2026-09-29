import { Router } from 'express';
import { Database } from '../database/database.js';
import { criarRotasEntregas } from './entregas.routes.js';

const database = new Database();

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/entregas', criarRotasEntregas(database));

export default router;
