import { AppError } from '../utils/AppError.js';

export class MotoristasService {
  constructor(motoristasRepo, entregasRepo) {
    this.motoristasRepo = motoristasRepo;
    this.entregasRepo = entregasRepo;
  }

  async criar({ nome, cpf, placaVeiculo }) {
    if (!nome || !cpf) {
      throw new AppError('Os campos nome e cpf são obrigatórios.', 400);
    }

    const existente = await this.motoristasRepo.buscarPorCpf(cpf);
    if (existente) {
      throw new AppError('Já existe um motorista cadastrado com esse CPF.', 409);
    }

    return this.motoristasRepo.criar({
      nome,
      cpf,
      placaVeiculo: placaVeiculo ?? null,
      status: 'ATIVO',
    });
  }

  async listar() {
    return this.motoristasRepo.listarTodos();
  }

  async buscarPorId(id) {
    const motorista = await this.motoristasRepo.buscarPorId(id);
    if (!motorista) {
      throw new AppError('Motorista não encontrado.', 404);
    }
    return motorista;
  }

  async listarEntregas(id, status) {
    await this.buscarPorId(id);
    return this.entregasRepo.listarTodos({ motoristaId: id, status });
  }
}
