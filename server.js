import express from 'express';
import { fileURLToPath } from 'url';
import criarRoteadorApi from './src/routes/index.js';
import { AppError } from './src/utils/errors.js';

function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/api', criarRoteadorApi());

  // 404 para qualquer rota fora de /api
  app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
  });

  // Middleware central de erros: converte AppError em { erro, status } previsível
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ erro: err.message });
    }

    if (err.type === 'entity.parse.failed') {
      // JSON malformado no corpo da requisição
      return res.status(400).json({ erro: 'Corpo da requisição inválido (JSON malformado).' });
    }

    console.error(err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  });

  return app;
}

const app = createApp();
const PORT = process.env.PORT || 3000;

// Equivalente ESM de `require.main === module`: só sobe o servidor
// quando o arquivo é executado diretamente (node server.js),
// não quando é importado (ex.: em testes).
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Delivery Tracker API rodando em http://localhost:${PORT}`);
  });
}

export default app;
