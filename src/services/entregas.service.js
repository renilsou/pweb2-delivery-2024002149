import { AppError } from '../utils/AppError.js';

const STATUS = {
  CRIADA: 'CRIADA',
  EM_TRANSITO: 'EM_TRANSITO',
  ENTREGUE: 'ENTREGUE',
  CANCELADA: 'CANCELADA',
};

const PROXIMO_STATUS = {
  CRIADA: STATUS.EM_TRANSITO,
  EM_TRANSITO: STATUS.ENTREGUE,
};

export class EntregasService {
  constructor(repository) {
    this.repository = repository;
  }

  async criar({ descricao, origem, destino }) {
    if (!descricao || !origem || !destino) {
      throw new AppError('Os campos descricao, origem e destino são obrigatórios.', 400);
    }
    if (origem === destino) {
      throw new AppError('origem e destino não podem ser iguais.', 400);
    }

    const duplicada = await this.repository.buscarAtivaPorChave(descricao, origem, destino);
    if (duplicada) {
      throw new AppError('Já existe uma entrega ativa com a mesma descrição, origem e destino.', 409);
    }

    return this.repository.criar({
      descricao,
      origem,
      destino,
      status: STATUS.CRIADA,
      motoristaId: null,
      historico: [
        { data: new Date().toISOString(), descricao: `Entrega criada com status ${STATUS.CRIADA}.` },
      ],
    });
  }

  async listar(status) {
    if (status) return this.repository.listarPorStatus(status);
    return this.repository.listarTodas();
  }

  async buscarPorId(id) {
    const entrega = await this.repository.buscarPorId(id);
    if (!entrega) throw new AppError('Entrega não encontrada.', 404);
    return entrega;
  }

  async avancar(id) {
    const entrega = await this.buscarPorId(id);
    const proximoStatus = PROXIMO_STATUS[entrega.status];

    if (!proximoStatus) {
      throw new AppError(`Não é possível avançar uma entrega com status ${entrega.status}.`, 422);
    }

    const historico = [
      ...entrega.historico,
      { data: new Date().toISOString(), descricao: `Status alterado de ${entrega.status} para ${proximoStatus}.` },
    ];

    return this.repository.atualizar(id, { status: proximoStatus, historico });
  }

  async cancelar(id) {
    const entrega = await this.buscarPorId(id);

    if (entrega.status === STATUS.ENTREGUE || entrega.status === STATUS.CANCELADA) {
      throw new AppError(`Não é possível cancelar uma entrega com status ${entrega.status}.`, 422);
    }

    const historico = [
      ...entrega.historico,
      { data: new Date().toISOString(), descricao: `Status alterado de ${entrega.status} para ${STATUS.CANCELADA}.` },
    ];

    return this.repository.atualizar(id, { status: STATUS.CANCELADA, historico });
  }

  async historico(id) {
    const entrega = await this.buscarPorId(id);
    return entrega.historico;
  }
}
