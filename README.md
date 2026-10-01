# Delivery Tracker API — Atividades 05 e 06 (Arquitetura em Camadas + Repository/DI)

API de rastreamento de entregas, construída em camadas (**Controller → Service → Repository**),
com persistência simulada em memória. Projeto do semestre da disciplina Programação Web II — IFAL/Maceió.

Desde a Atividade 06, entregas também podem ser **atribuídas a um motorista**, e toda a composição
de dependências passou a acontecer em um **único ponto** (`src/routes/index.js`).

## Arquitetura

```
src/
├── controllers/
│   ├── entregas.controller.js    # traduz HTTP ↔ service (sem regra de negócio)
│   └── motoristas.controller.js
├── services/
│   ├── entregas.service.js       # TODA a regra de negócio de Entregas
│   └── motoristas.service.js     # TODA a regra de negócio de Motoristas
├── repositories/
│   ├── entregas.repository.js    # só acesso a dados — contrato IEntregasRepository
│   └── motoristas.repository.js  # só acesso a dados — contrato IMotoristasRepository
├── database/
│   └── database.js               # persistência SIMULADA em memória (sem banco real, sem ORM)
├── routes/
│   ├── index.js                  # composition root: instancia e liga TODAS as camadas
│   ├── entregas.routes.js        # só define as rotas de /api/entregas
│   └── motoristas.routes.js      # só define as rotas de /api/motoristas
└── utils/
    └── AppError.js                # erro de aplicação com mensagem + status HTTP
server.js                          # configura o app Express e o middleware central de erros
```

O projeto usa **ES Modules** (`import`/`export`), conforme `"type": "module"` no `package.json`.

### Contratos de Repository

```js
// IEntregasRepository
listarTodos(filtros?)  -> Entrega[]
buscarPorId(id)        -> Entrega | null
criar(dados)           -> Entrega
atualizar(id, dados)   -> Entrega

// IMotoristasRepository
listarTodos()          -> Motorista[]
buscarPorId(id)        -> Motorista | null
buscarPorCpf(cpf)      -> Motorista | null
criar(dados)           -> Motorista
```

Os services (`EntregasService`, `MotoristasService`) só chamam esses métodos — nunca `new` um
repository, e nunca acessam `Database` diretamente. Por isso dá para trocar qualquer repository por
um Mock (objeto com os mesmos métodos) sem alterar o service, como mostrado abaixo:

```js
const motoristasRepoFalso = {
  async buscarPorId(id) {
    return { id, nome: 'Teste', status: 'INATIVO' };
  },
};

const service = new EntregasService(entregasRepoReal, motoristasRepoFalso);
// continua funcionando normalmente — o service não sabe que o repository é falso
```

### Composição de dependências (composition root)

Todo o `new` do projeto vive em um único lugar, `src/routes/index.js`:

```
                              ┌────────────────┐
                              │    Database    │
                              └───────┬────────┘
                   ┌──────────────────┴──────────────────┐
                   │                                      │
          ┌────────▼────────┐                   ┌─────────▼─────────┐
          │ EntregasRepository│                 │ MotoristasRepository│
          └────────┬────────┘                   └─────────┬─────────┘
                   │                                      │
                   └─────────────────┬────────────────────┘
                                      │ (injetados nos dois services)
                   ┌──────────────────┴──────────────────┐
          ┌────────▼────────┐                   ┌─────────▼─────────┐
          │  EntregasService  │ (precisa dos     │  MotoristasService  │
          │ (entregasRepo,    │  dois repos p/   │ (motoristasRepo,    │
          │  motoristasRepo)  │  validar/listar) │  entregasRepo)      │
          └────────┬────────┘                   └─────────┬─────────┘
                   │                                      │
          ┌────────▼────────┐                   ┌─────────▼─────────┐
          │ EntregasController│                 │ MotoristasController│
          └────────┬────────┘                   └─────────┬─────────┘
                   │                                      │
            /api/entregas                           /api/motoristas
```

`EntregasService` precisa do `motoristasRepo` para checar se o motorista está `ATIVO` na hora de
atribuir. `MotoristasService` precisa do `entregasRepo` para listar as entregas de um motorista.
A regra "motorista `INATIVO` não pode ser atribuído" mora no `EntregasService` (é regra da
atribuição da entrega), não no `MotoristasService`.

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

## Rotas de Entregas

**Health check**
```bash
curl http://localhost:3000/api/health
```

**Criar entrega**
```bash
curl -X POST http://localhost:3000/api/entregas \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Pacote livros","origem":"Maceió","destino":"Recife"}'
# 201 -> { id, descricao, origem, destino, status: "CRIADA", motoristaId: null, historico: [...] }
```

**Listar (com filtro opcional por status)**
```bash
curl http://localhost:3000/api/entregas
curl "http://localhost:3000/api/entregas?status=EM_TRANSITO"
```

**Buscar por id**
```bash
curl http://localhost:3000/api/entregas/1
```

**Avançar status (CRIADA → EM_TRANSITO → ENTREGUE)**
```bash
curl -X PATCH http://localhost:3000/api/entregas/1/avancar
```

**Cancelar**
```bash
curl -X PATCH http://localhost:3000/api/entregas/1/cancelar
```

**Histórico de eventos**
```bash
curl http://localhost:3000/api/entregas/1/historico
```

**Atribuir motorista (novo — Atividade 06)**
```bash
curl -X PATCH http://localhost:3000/api/entregas/1/atribuir \
  -H "Content-Type: application/json" \
  -d '{"motoristaId": 1}'
# 200 se a entrega estiver CRIADA e o motorista ATIVO
# 422 se a entrega não estiver CRIADA, ou o motorista não estiver ATIVO
# 404 se a entrega ou o motorista não existirem
```

## Rotas de Motoristas (novo — Atividade 06)

**Cadastrar motorista**
```bash
curl -X POST http://localhost:3000/api/motoristas \
  -H "Content-Type: application/json" \
  -d '{"nome":"Carlos Souza","cpf":"11122233344","placaVeiculo":"ABC1D23"}'
# 201 -> { id, nome, cpf, placaVeiculo, status: "ATIVO" }
# 409 se o CPF já estiver cadastrado
```

**Listar motoristas**
```bash
curl http://localhost:3000/api/motoristas
```

**Buscar motorista por id**
```bash
curl http://localhost:3000/api/motoristas/1
```

**Entregas de um motorista (com filtro opcional por status)**
```bash
curl http://localhost:3000/api/motoristas/1/entregas
curl "http://localhost:3000/api/motoristas/1/entregas?status=CRIADA"
```

## Regras de negócio implementadas

**Entregas**
- Criação exige `descricao`, `origem` e `destino`; `origem` não pode ser igual a `destino` (`400`).
- Não é permitido ter duas entregas **ativas** (status diferente de `ENTREGUE`/`CANCELADA`) com a
  mesma `descricao` + `origem` + `destino` (`409`).
- Transições de status só podem seguir `CRIADA → EM_TRANSITO → ENTREGUE`; qualquer outra tentativa
  de avanço resulta em `422`.
- Cancelamento só é permitido enquanto a entrega não estiver `ENTREGUE` nem já `CANCELADA` (`422`
  caso contrário).
- Atribuir motorista só é permitido se a entrega estiver `CRIADA` e o motorista estiver `ATIVO`
  (`422` caso contrário); motorista ou entrega inexistentes retornam `404`.
- Toda mudança de status (e a atribuição de motorista) gera um novo evento no `historico`.
- Buscas por `id` inexistente retornam `404`.

**Motoristas**
- Criação exige `nome` e `cpf` (`400` se faltar); `placaVeiculo` é opcional.
- CPF duplicado retorna `409`.
- Todo motorista nasce com `status: "ATIVO"`.

Erros sempre no formato `{ "erro": "mensagem" }`.
