export class Database {
  constructor() {
    this.collections = {};
    this.sequences = {};
  }

  nextId(collection) {
    this.sequences[collection] = (this.sequences[collection] ?? 0) + 1;
    return this.sequences[collection];
  }

  insert(collection, record) {
    if (!this.collections[collection]) this.collections[collection] = [];
    this.collections[collection].push(record);
    return record;
  }

  findAll(collection) {
    return this.collections[collection] ?? [];
  }

  findById(collection, id) {
    return this.findAll(collection).find((item) => item.id === id) ?? null;
  }

  findOne(collection, predicate) {
    return this.findAll(collection).find(predicate) ?? null;
  }

  update(collection, id, dados) {
    const registro = this.findById(collection, id);
    if (!registro) return null;
    Object.assign(registro, dados);
    return registro;
  }
}
