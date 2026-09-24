import { STATUS, PROXIMO_STATUS, STATUS_CANCELAVEIS } from '../utils/statusFlow.js';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
} from '../utils/errors.js';

/**
 * TODA a regra de negócio de Entregas vive aqui.
 * O Controller não valida nada; o Repository só lê/escreve dados.
 */
class EntregasService {
  /** @param {import('../repositories/EntregasRepository').default} repository */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Cria uma nova entrega com status inicial CRIADA e primeiro evento no histórico.
   * @param {{descricao?: string, origem?: string, destino?: string}} payload
   */
  criar(payload = {}) {
    const { descricao, origem, destino } = payload;

    if (!descricao || !origem || !destino) {
      throw new ValidationError('Os campos descricao, origem e destino são obrigatórios.');
    }
    if (origem === destino) {
      throw new ValidationError('origem e destino não podem ser iguais.');
    }

    const duplicada = this.repository.findAtivaByChave(descricao, origem, destino);
    if (duplicada) {
      throw new ConflictError(
        'Já existe uma entrega ativa com a mesma descrição, origem e destino.'
      );
    }

    const novaEntrega = {
      descricao,
      origem,
      destino,
      status: STATUS.CRIADA,
      motoristaId: null,
      historico: [
        {
          data: new Date().toISOString(),
          descricao: `Entrega criada com status ${STATUS.CRIADA}.`,
        },
      ],
    };

    return this.repository.create(novaEntrega);
  }

  /**
   * Lista entregas, opcionalmente filtradas por status.
   * @param {string} [status]
   */
  listar(status) {
    if (status) {
      return this.repository.findByStatus(status);
    }
    return this.repository.findAll();
  }

  /**
   * Busca uma entrega por id, lançando 404 se não existir.
   * @param {number} id
   */
  buscarPorId(id) {
    const entrega = this.repository.findById(id);
    if (!entrega) {
      throw new NotFoundError('Entrega não encontrada.');
    }
    return entrega;
  }

  /**
   * Avança o status: CRIADA -> EM_TRANSITO -> ENTREGUE.
   * Qualquer outra tentativa (ex.: avançar ENTREGUE/CANCELADA) é 422.
   * @param {number} id
   */
  avancar(id) {
    const entrega = this.buscarPorId(id);
    const proximoStatus = PROXIMO_STATUS[entrega.status];

    if (!proximoStatus) {
      throw new BusinessRuleError(
        `Não é possível avançar uma entrega com status ${entrega.status}.`
      );
    }

    const statusAnterior = entrega.status;
    const historico = [
      ...entrega.historico,
      {
        data: new Date().toISOString(),
        descricao: `Status alterado de ${statusAnterior} para ${proximoStatus}.`,
      },
    ];

    return this.repository.update(id, { status: proximoStatus, historico });
  }

  /**
   * Cancela a entrega, se ela ainda não estiver ENTREGUE nem CANCELADA.
   * @param {number} id
   */
  cancelar(id) {
    const entrega = this.buscarPorId(id);

    if (!STATUS_CANCELAVEIS.includes(entrega.status)) {
      throw new BusinessRuleError(
        `Não é possível cancelar uma entrega com status ${entrega.status}.`
      );
    }

    const statusAnterior = entrega.status;
    const historico = [
      ...entrega.historico,
      {
        data: new Date().toISOString(),
        descricao: `Status alterado de ${statusAnterior} para ${STATUS.CANCELADA}.`,
      },
    ];

    return this.repository.update(id, { status: STATUS.CANCELADA, historico });
  }

  /**
   * Devolve o histórico de eventos de uma entrega.
   * @param {number} id
   */
  historico(id) {
    return this.buscarPorId(id).historico;
  }
}

export default EntregasService;
