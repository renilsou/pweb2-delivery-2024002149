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
  constructor(entregasRepo, motoristasRepo) {
    this.entregasRepo = entregasRepo;
    this.motoristasRepo = motoristasRepo;
  }

  async criar({ descricao, origem, destino }) {
    if (!descricao || !origem || !destino) {
      throw new AppError('Os campos descricao, origem e destino são obrigatórios.', 400);
    }
    if (origem === destino) {
      throw new AppError('origem e destino não podem ser iguais.', 400);
    }

    const existentes = await this.entregasRepo.listarTodos();
    const duplicada = existentes.find(
      (e) =>
        e.descricao === descricao &&
        e.origem === origem &&
        e.destino === destino &&
        e.status !== STATUS.ENTREGUE &&
        e.status !== STATUS.CANCELADA
    );
    if (duplicada) {
      throw new AppError('Já existe uma entrega ativa com a mesma descrição, origem e destino.', 409);
    }

    return this.entregasRepo.criar({
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

  async listar(filtros) {
    return this.entregasRepo.listarTodos(filtros);
  }

  async buscarPorId(id) {
    const entrega = await this.entregasRepo.buscarPorId(id);
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

    return this.entregasRepo.atualizar(id, { status: proximoStatus, historico });
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

    return this.entregasRepo.atualizar(id, { status: STATUS.CANCELADA, historico });
  }

  async historico(id) {
    const entrega = await this.buscarPorId(id);
    return entrega.historico;
  }

  async atribuir(id, motoristaId) {
    const entrega = await this.buscarPorId(id);

    if (entrega.status !== STATUS.CRIADA) {
      throw new AppError('Só é possível atribuir motorista a uma entrega CRIADA.', 422);
    }

    const motorista = await this.motoristasRepo.buscarPorId(motoristaId);
    if (!motorista) {
      throw new AppError('Motorista não encontrado.', 404);
    }
    if (motorista.status !== 'ATIVO') {
      throw new AppError('O motorista precisa estar ATIVO para ser atribuído.', 422);
    }

    const historico = [
      ...entrega.historico,
      { data: new Date().toISOString(), descricao: `Motorista ${motorista.nome} atribuído à entrega.` },
    ];

    return this.entregasRepo.atualizar(id, { motoristaId: motorista.id, historico });
  }
}
