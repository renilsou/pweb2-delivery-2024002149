import { prisma } from '../config/database.js';
import { idValido } from '../utils/idValido.js';

const include = { historico: { orderBy: { id: 'asc' } } };

const paraEvento = ({ data, descricao }) => ({ data: new Date(data), descricao });

const paraEntrega = (entrega) =>
  entrega && {
    ...entrega,
    historico: entrega.historico.map(({ data, descricao }) => ({
      data: data.toISOString(),
      descricao,
    })),
  };

export class EntregasRepositoryPrisma {
  constructor(client = prisma) {
    this.prisma = client;
  }

  async criar({ historico = [], ...dados }) {
    const entrega = await this.prisma.entrega.create({
      data: { ...dados, historico: { create: historico.map(paraEvento) } },
      include,
    });
    return paraEntrega(entrega);
  }

  async listarTodos(filtros = {}) {
    const { status, motoristaId } = filtros;
    const entregas = await this.prisma.entrega.findMany({
      where: { status: status || undefined, motoristaId },
      include,
      orderBy: { id: 'asc' },
    });
    return entregas.map(paraEntrega);
  }

  async buscarPorId(id) {
    if (!idValido(id)) return null;
    const entrega = await this.prisma.entrega.findUnique({ where: { id }, include });
    return paraEntrega(entrega);
  }

  async atualizar(id, { historico = [], ...dados }) {
    if (!idValido(id)) return null;
    const registrados = await this.prisma.evento.count({ where: { entregaId: id } });
    const entrega = await this.prisma.entrega
      .update({
        where: { id },
        data: { ...dados, historico: { create: historico.slice(registrados).map(paraEvento) } },
        include,
      })
      .catch((erro) => {
        if (erro.code === 'P2025') return null;
        throw erro;
      });
    return paraEntrega(entrega);
  }
}
