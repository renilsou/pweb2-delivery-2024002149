const COLLECTION = 'motoristas';

/**
 * IMotoristasRepository
 * listarTodos()       -> Motorista[]
 * buscarPorId(id)      -> Motorista | null
 * buscarPorCpf(cpf)    -> Motorista | null
 * criar(dados)         -> Motorista
 */
export class MotoristasRepository {
  constructor(database) {
    this.database = database;
  }

  async listarTodos() {
    return this.database.findAll(COLLECTION);
  }

  async buscarPorId(id) {
    return this.database.findById(COLLECTION, id);
  }

  async buscarPorCpf(cpf) {
    return this.database.findOne(COLLECTION, (motorista) => motorista.cpf === cpf);
  }

  async criar(dados) {
    const id = this.database.nextId(COLLECTION);
    return this.database.insert(COLLECTION, { ...dados, id });
  }
}
