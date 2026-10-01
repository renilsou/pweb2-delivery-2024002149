export class EntregasController {
  constructor(service) {
    this.service = service;
  }

  criar = async (req, res, next) => {
    try {
      const entrega = await this.service.criar(req.body);
      res.status(201).json(entrega);
    } catch (err) {
      next(err);
    }
  };

  listar = async (req, res, next) => {
    try {
      const { status } = req.query;
      const entregas = await this.service.listar({ status });
      res.json(entregas);
    } catch (err) {
      next(err);
    }
  };

  buscarPorId = async (req, res, next) => {
    try {
      const entrega = await this.service.buscarPorId(Number(req.params.id));
      res.json(entrega);
    } catch (err) {
      next(err);
    }
  };

  avancar = async (req, res, next) => {
    try {
      const entrega = await this.service.avancar(Number(req.params.id));
      res.json(entrega);
    } catch (err) {
      next(err);
    }
  };

  cancelar = async (req, res, next) => {
    try {
      const entrega = await this.service.cancelar(Number(req.params.id));
      res.json(entrega);
    } catch (err) {
      next(err);
    }
  };

  historico = async (req, res, next) => {
    try {
      const historico = await this.service.historico(Number(req.params.id));
      res.json(historico);
    } catch (err) {
      next(err);
    }
  };

  atribuir = async (req, res, next) => {
    try {
      const entrega = await this.service.atribuir(Number(req.params.id), Number(req.body.motoristaId));
      res.json(entrega);
    } catch (err) {
      next(err);
    }
  };
}
