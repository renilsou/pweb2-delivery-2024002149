/**
 * Persistência SIMULADA em memória (sem banco real, sem ORM).
 * Organiza os dados em "coleções" nomeadas (ex.: "entregas", "motoristas"),
 * cada uma com sua própria sequência de ids autoincrementais.
 *
 * Esta classe é agnóstica de domínio: quem conhece o formato dos registros
 * são os repositories, que ficam em src/repositories/.
 */
class Database {
  constructor() {
    this._collections = {};
    this._sequences = {};
  }

  _ensureCollection(name) {
    if (!this._collections[name]) {
      this._collections[name] = [];
      this._sequences[name] = 0;
    }
  }

  /**
   * Gera o próximo id autoincremental de uma coleção.
   * @param {string} collection
   * @returns {number}
   */
  nextId(collection) {
    this._ensureCollection(collection);
    this._sequences[collection] += 1;
    return this._sequences[collection];
  }

  /**
   * Insere um registro já com id definido na coleção.
   * @param {string} collection
   * @param {Object} record
   * @returns {Object} o próprio registro inserido
   */
  insert(collection, record) {
    this._ensureCollection(collection);
    this._collections[collection].push(record);
    return record;
  }

  /**
   * Retorna uma cópia rasa de todos os registros da coleção.
   * @param {string} collection
   * @returns {Object[]}
   */
  findAll(collection) {
    this._ensureCollection(collection);
    return [...this._collections[collection]];
  }

  /**
   * Busca um registro pelo id.
   * @param {string} collection
   * @param {number} id
   * @returns {Object|null}
   */
  findById(collection, id) {
    this._ensureCollection(collection);
    return this._collections[collection].find((item) => item.id === id) || null;
  }

  /**
   * Busca o primeiro registro que satisfaz o predicado informado.
   * @param {string} collection
   * @param {(item: Object) => boolean} predicate
   * @returns {Object|null}
   */
  findOne(collection, predicate) {
    this._ensureCollection(collection);
    return this._collections[collection].find(predicate) || null;
  }

  /**
   * Atualiza um registro existente in-place, aplicando `updater` sobre ele.
   * @param {string} collection
   * @param {number} id
   * @param {(item: Object) => void} updater
   * @returns {Object|null} o registro atualizado, ou null se não encontrado
   */
  update(collection, id, updater) {
    this._ensureCollection(collection);
    const record = this.findById(collection, id);
    if (!record) return null;
    updater(record);
    return record;
  }
}

export default Database;
