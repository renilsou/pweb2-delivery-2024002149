import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export class MotoristasController {
  constructor(service) {
    this.service = service;
  }

  listar = async (req, res, next) => {
    try {
      const motoristas = await this.service.listar();
      res.render('motoristas/index', { motoristas });
    } catch (err) {
      next(err);
    }
  };

  formNovo = (req, res) => {
    res.render('motoristas/novo', { erros: [], dados: {} });
  };

  criar = async (req, res, next) => {
    const resultado = validationResult(req);
    if (!resultado.isEmpty()) {
      const erros = resultado.array().map((e) => e.msg);
      return res.status(400).render('motoristas/novo', { erros, dados: req.body });
    }

    try {
      await this.service.criar(req.body);
      req.flash('sucesso', 'Motorista cadastrado com sucesso!');
      res.redirect('/motoristas');
    } catch (err) {
      if (err instanceof AppError && err.statusCode < 500) {
        return res.status(err.statusCode).render('motoristas/novo', { erros: [err.message], dados: req.body });
      }
      next(err);
    }
  };
}
