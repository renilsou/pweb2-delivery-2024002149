import { prisma } from '../config/database.js';
import { idValido } from '../utils/idValido.js';

export class MotoristasRepositoryPrisma {
  constructor(client = prisma) {
    this.prisma = client;
  }

  async listarTodos() {
    return this.prisma.motorista.findMany({ orderBy: { id: 'asc' } });
  }

  async buscarPorId(id) {
    if (!idValido(id)) return null;
    return this.prisma.motorista.findUnique({ where: { id } });
  }

  async buscarPorCpf(cpf) {
    return this.prisma.motorista.findUnique({ where: { cpf } });
  }

  async criar(dados) {
    return this.prisma.motorista.create({ data: dados });
  }
}
