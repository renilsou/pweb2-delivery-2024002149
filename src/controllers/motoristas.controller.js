export class MotoristasController {
  constructor(service) {
    this.service = service;
  }

  criar = async (req, res, next) => {
    try {
      const motorista = await this.service.criar(req.body);
      res.status(201).json(motorista);
    } catch (err) {
      next(err);
    }
  };

  listar = async (req, res, next) => {
    try {
      const motoristas = await this.service.listar();
      res.json(motoristas);
    } catch (err) {
      next(err);
    }
  };

  buscarPorId = async (req, res, next) => {
    try {
      const motorista = await this.service.buscarPorId(Number(req.params.id));
      res.json(motorista);
    } catch (err) {
      next(err);
    }
  };

  listarEntregas = async (req, res, next) => {
    try {
      const { status } = req.query;
      const entregas = await this.service.listarEntregas(Number(req.params.id), status);
      res.json(entregas);
    } catch (err) {
      next(err);
    }
  };
}
