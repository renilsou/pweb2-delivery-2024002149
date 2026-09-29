const COLLECTION = 'entregas';

export class EntregasRepository {
  constructor(database) {
    this.database = database;
  }

  async criar(dados) {
    const id = this.database.nextId(COLLECTION);
    return this.database.insert(COLLECTION, { ...dados, id });
  }

  async listarTodas() {
    return this.database.findAll(COLLECTION);
  }

  async listarPorStatus(status) {
    return this.database.findAll(COLLECTION).filter((entrega) => entrega.status === status);
  }

  async buscarPorId(id) {
    return this.database.findById(COLLECTION, id);
  }

  async buscarAtivaPorChave(descricao, origem, destino) {
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

  async atualizar(id, dados) {
    return this.database.update(COLLECTION, id, dados);
  }
}
