const COLLECTION = 'entregas';

/**
 * Contrato do repository de Entregas.
 *
 * O Service só deve depender destes métodos (nunca do Database diretamente),
 * de forma que — como exigido pelo Cap. 6 — esta implementação possa ser
 * substituída por um Mock que respeite o mesmo contrato, sem quebrar o Service.
 *
 * @typedef {Object} EntregasRepositoryContract
 * @property {(dados: Object) => Object} create
 *   Persiste uma nova entrega (já com status/histórico definidos pelo Service) e devolve o registro com id.
 * @property {() => Object[]} findAll
 *   Retorna todas as entregas.
 * @property {(status: string) => Object[]} findByStatus
 *   Retorna as entregas cujo status é exatamente o informado.
 * @property {(id: number) => (Object|null)} findById
 *   Retorna uma entrega pelo id, ou null se não existir.
 * @property {(descricao: string, origem: string, destino: string) => (Object|null)} findAtivaByChave
 *   Retorna uma entrega ATIVA (status != ENTREGUE e != CANCELADA) que já tenha
 *   a mesma descricao+origem+destino, usada para checagem de duplicidade (409).
 * @property {(id: number, dadosAtualizados: Object) => (Object|null)} update
 *   Sobrescreve os campos da entrega de id informado e devolve o registro atualizado.
 */

/** @implements {EntregasRepositoryContract} */
class EntregasRepository {
  /** @param {import('../database/Database').default} database */
  constructor(database) {
    this.database = database;
  }

  create(dados) {
    const id = this.database.nextId(COLLECTION);
    const entrega = { ...dados, id };
    return this.database.insert(COLLECTION, entrega);
  }

  findAll() {
    return this.database.findAll(COLLECTION);
  }

  findByStatus(status) {
    return this.database.findAll(COLLECTION).filter((entrega) => entrega.status === status);
  }

  findById(id) {
    return this.database.findById(COLLECTION, id);
  }

  findAtivaByChave(descricao, origem, destino) {
    return this.database.findOne(
      COLLECTION,
      (entrega) =>
        entrega.descricao === descricao &&
        entrega.origem === origem &&
        entrega.destino === destino &&
        entrega.status !== 'ENTREGUE' &&
        entrega.status !== 'CANCELADA'
    );
  }

  update(id, dadosAtualizados) {
    return this.database.update(COLLECTION, id, (registro) => {
      Object.assign(registro, dadosAtualizados);
    });
  }
}

export default EntregasRepository;
