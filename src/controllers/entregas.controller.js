import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

const STATUS = ['CRIADA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADA'];
const ATIVAS = ['CRIADA', 'EM_TRANSITO'];

export class EntregasController {
  constructor(service, motoristasService) {
    this.service = service;
    this.motoristasService = motoristasService;
  }

  listar = async (req, res, next) => {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : '';
      const [entregas, motoristas] = await Promise.all([
        this.service.listar({ status }),
        this.motoristasService.listar(),
      ]);
      const nomes = Object.fromEntries(motoristas.map((m) => [m.id, m.nome]));
      res.render('entregas/index', { entregas, nomes, status, statusLista: STATUS });
    } catch (err) {
      next(err);
    }
  };

  formNova = (req, res) => {
    res.render('entregas/nova', { erros: [], dados: {} });
  };

  criar = async (req, res, next) => {
    const resultado = validationResult(req);
    if (!resultado.isEmpty()) {
      const erros = resultado.array().map((e) => e.msg);
      return res.status(400).render('entregas/nova', { erros, dados: req.body });
    }

    try {
      await this.service.criar(req.body);
      req.flash('sucesso', 'Entrega criada com sucesso!');
      res.redirect('/entregas');
    } catch (err) {
      if (err instanceof AppError && err.statusCode < 500) {
        return res.status(err.statusCode).render('entregas/nova', { erros: [err.message], dados: req.body });
      }
      next(err);
    }
  };

  detalhe = async (req, res, next) => {
    try {
      const entrega = await this.service.buscarPorId(Number(req.params.id));
      const todos = await this.motoristasService.listar();
      const motorista = todos.find((m) => m.id === entrega.motoristaId);
      const motoristas = todos.filter((m) => m.status === 'ATIVO');
      res.render('entregas/detalhe', { entrega, motorista, motoristas, ativa: ATIVAS.includes(entrega.status) });
    } catch (err) {
      next(err);
    }
  };

  acao = async (req, res, next, executar, mensagem) => {
    const id = Number(req.params.id);

    try {
      await this.service.buscarPorId(id);
    } catch (err) {
      return next(err);
    }

    try {
      await executar(id);
      req.flash('sucesso', mensagem);
    } catch (err) {
      if (!(err instanceof AppError)) return next(err);
      req.flash('erro', err.message);
    }
    res.redirect(`/entregas/${id}`);
  };

  avancar = (req, res, next) =>
    this.acao(req, res, next, (id) => this.service.avancar(id), 'Status avançado com sucesso!');

  cancelar = (req, res, next) =>
    this.acao(req, res, next, (id) => this.service.cancelar(id), 'Entrega cancelada com sucesso!');

  atribuir = (req, res, next) =>
    this.acao(
      req,
      res,
      next,
      async (id) => {
        const resultado = validationResult(req);
        if (!resultado.isEmpty()) {
          throw new AppError(resultado.array()[0].msg, 400);
        }
        await this.service.atribuir(id, Number(req.body.motoristaId));
      },
      'Motorista atribuído com sucesso!'
    );
}
