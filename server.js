import express from 'express';
import { fileURLToPath } from 'url';
import apiRouter from './src/routes/index.js';
import { AppError } from './src/utils/AppError.js';

const app = express();

app.use(express.json());
app.use('/api', apiRouter);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ erro: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'Corpo da requisição inválido (JSON malformado).' });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Delivery Tracker API rodando em http://localhost:${PORT}`);
  });
}

export default app;
