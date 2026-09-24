/**
 * Traduz requisição/resposta HTTP <-> EntregasService.
 * Não contém regra de negócio — apenas parsing de entrada e status codes de saída.
 * Erros de negócio (AppError e subclasses) são repassados ao middleware
 * central de erros via `next(err)`.
 */
class EntregasController {
  /** @param {import('../services/EntregasService')} service */
  constructor(service) {
    this.service = service;

    // arrow-bound methods para poderem ser usados diretamente como handlers de rota
    this.criar = this.criar.bind(this);
    this.listar = this.listar.bind(this);
    this.buscarPorId = this.buscarPorId.bind(this);
    this.avancar = this.avancar.bind(this);
    this.cancelar = this.cancelar.bind(this);
    this.historico = this.historico.bind(this);
  }

  criar(req, res, next) {
    try {
      const entrega = this.service.criar(req.body);
      res.status(201).json(entrega);
    } catch (err) {
      next(err);
    }
  }

  listar(req, res, next) {
    try {
      const { status } = req.query;
      const entregas = this.service.listar(status);
      res.status(200).json(entregas);
    } catch (err) {
      next(err);
    }
  }

  buscarPorId(req, res, next) {
    try {
      const id = Number(req.params.id);
      const entrega = this.service.buscarPorId(id);
      res.status(200).json(entrega);
    } catch (err) {
      next(err);
    }
  }

  avancar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const entrega = this.service.avancar(id);
      res.status(200).json(entrega);
    } catch (err) {
      next(err);
    }
  }

  cancelar(req, res, next) {
    try {
      const id = Number(req.params.id);
      const entrega = this.service.cancelar(id);
      res.status(200).json(entrega);
    } catch (err) {
      next(err);
    }
  }

  historico(req, res, next) {
    try {
      const id = Number(req.params.id);
      const eventos = this.service.historico(id);
      res.status(200).json(eventos);
    } catch (err) {
      next(err);
    }
  }
}

export default EntregasController;
