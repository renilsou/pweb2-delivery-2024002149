# Delivery Tracker API — Atividade 05 (Arquitetura em Camadas)

API de rastreamento de entregas, construída em camadas (**Controller → Service → Repository**),
com persistência simulada em memória. Projeto do semestre da disciplina Programação Web II — IFAL/Maceió.

## Arquitetura

```
src/
├── controllers/   # traduz HTTP ↔ service (sem regra de negócio)
│   └── EntregasController.js
├── services/       # TODA a regra de negócio
│   └── EntregasService.js
├── repositories/   # só acesso a dados (contrato documentado via JSDoc)
│   └── EntregasRepository.js
├── database/       # persistência SIMULADA em memória (sem banco real, sem ORM)
│   └── Database.js
├── routes/         # composição das dependências (injeção) + monta em /api
│   ├── index.js
│   └── entregas.routes.js
└── utils/
    ├── errors.js       # AppError e subclasses (ValidationError, NotFoundError, ConflictError, BusinessRuleError)
    └── statusFlow.js    # enum de status e mapa de transições válidas
server.js               # configura o app Express e o middleware central de erros
```

O projeto usa **ES Modules** (`import`/`export`), conforme `"type": "module"` no `package.json` —
por isso todos os arquivos usam `import`/`export` em vez de `require`/`module.exports`, e os imports
locais incluem a extensão `.js` (exigida pelo Node em ESM).

A injeção de dependência acontece no **composition root** (`src/routes/entregas.routes.js`):

```js
const repository = new EntregasRepository(database);
const service = new EntregasService(repository);
const controller = new EntregasController(service);
```

O Service depende apenas do **contrato** do Repository (documentado via JSDoc em
`EntregasRepository.js`), nunca do `Database` diretamente — preparando o terreno para a
Atividade 06, quando o repository poderá ser substituído por um Mock nos testes.

## Como rodar

```bash
npm install
npm start
# API disponível em http://localhost:3000
```

Em outro terminal, rodar o autograder:

```bash
npm run check
# = BASE_URL=http://localhost:3000 node autograder/check.mjs
```

A porta respeita `process.env.PORT` (padrão `3000`).

## Exemplos de requisição (curl)

**Health check**
```bash
curl http://localhost:3000/api/health
# {"status":"ok"}
```

**Criar entrega**
```bash
curl -X POST http://localhost:3000/api/entregas \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Pacote livros","origem":"Maceió","destino":"Recife"}'
# 201 -> { id, descricao, origem, destino, status: "CRIADA", motoristaId: null, historico: [...] }
```

**Listar entregas (com filtro opcional por status)**
```bash
curl http://localhost:3000/api/entregas
curl "http://localhost:3000/api/entregas?status=EM_TRANSITO"
```

**Buscar entrega por id**
```bash
curl http://localhost:3000/api/entregas/1
```

**Avançar status (CRIADA → EM_TRANSITO → ENTREGUE)**
```bash
curl -X PATCH http://localhost:3000/api/entregas/1/avancar
```

**Cancelar entrega**
```bash
curl -X PATCH http://localhost:3000/api/entregas/1/cancelar
```

**Histórico de eventos**
```bash
curl http://localhost:3000/api/entregas/1/historico
```

## Regras de negócio implementadas

- Criação exige `descricao`, `origem` e `destino`; `origem` não pode ser igual a `destino` (`400`).
- Não é permitido ter duas entregas **ativas** (status diferente de `ENTREGUE`/`CANCELADA`) com a
  mesma `descricao` + `origem` + `destino` (`409`).
- Transições de status só podem seguir `CRIADA → EM_TRANSITO → ENTREGUE`; qualquer outra tentativa
  de avanço resulta em `422`.
- Cancelamento só é permitido enquanto a entrega não estiver `ENTREGUE` nem já `CANCELADA` (`422`
  caso contrário).
- Toda mudança de status gera um novo evento no `historico` da entrega.
- Buscas por `id` inexistente retornam `404`.
- Erros sempre no formato `{ "erro": "mensagem" }`.
