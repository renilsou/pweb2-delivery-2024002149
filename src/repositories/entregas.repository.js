const COLLECTION = 'entregas';

/**
 * IEntregasRepository
 * listarTodos(filtros?) -> Entrega[]
 * buscarPorId(id)       -> Entrega | null
 * criar(dados)          -> Entrega
 * atualizar(id, dados)  -> Entrega
 */
export class EntregasRepository {
  constructor(database) {
    this.database = database;
  }

  async criar(dados) {
    const id = this.database.nextId(COLLECTION);
    return this.database.insert(COLLECTION, { ...dados, id });
  }

  async listarTodos(filtros = {}) {
    const { status, motoristaId } = filtros;
    return this.database.findAll(COLLECTION).filter((entrega) => {
      if (status && entrega.status !== status) return false;
      if (motoristaId !== undefined && entrega.motoristaId !== motoristaId) return false;
      return true;
    });
  }

  async buscarPorId(id) {
    return this.database.findById(COLLECTION, id);
  }

  async atualizar(id, dados) {
    return this.database.update(COLLECTION, id, dados);
  }
}
