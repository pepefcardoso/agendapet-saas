import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClientSubscriptionPlanRepository } from '@/infra/database/prisma/repositories/PrismaClientSubscriptionPlanRepository';
import {
  createClientSubscriptionPlanDTO,
  updateClientSubscriptionPlanDTO,
} from '../dtos/ClientSubscriptionPlanDTO';
import { CreateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/CreateClientSubscriptionPlanUseCase';
import { UpdateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/UpdateClientSubscriptionPlanUseCase';
import { ResourceNotFoundError } from '@/core/application/use-cases/errors/ResourceNotFoundError';
import { ListClientSubscriptionPlansUseCase } from '@/core/application/use-cases/ListClientSubscriptionPlansUseCase';
import { DeactivateClientSubscriptionPlanUseCase } from '@/core/application/use-cases/DeactivateClientSubscriptionPlanUseCase';

export class ClientSubscriptionPlanController {
  private planRepository = new PrismaClientSubscriptionPlanRepository();

  async create(req: FastifyRequest, reply: FastifyReply) {
    const data = createClientSubscriptionPlanDTO.parse(req.body);
    const { sub: petShopId } = req.user;

    const useCase = new CreateClientSubscriptionPlanUseCase(this.planRepository);
    const plan = await useCase.execute({ ...data, petShopId });

    return reply.status(201).send(plan);
  }

  async update(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().cuid() }).parse(req.params);
    const data = updateClientSubscriptionPlanDTO.parse(req.body);
    const { sub: petShopId } = req.user;

    const useCase = new UpdateClientSubscriptionPlanUseCase(this.planRepository);

    try {
      const plan = await useCase.execute({ planId: id, petShopId, data });
      return reply.status(200).send(plan);
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return reply.status(404).send({ message: error.message });
      }
      throw error;
    }
  }

  async list(req: FastifyRequest, reply: FastifyReply) {
    const { sub: petShopId } = req.user;

    const useCase = new ListClientSubscriptionPlansUseCase(this.planRepository);
    const plans = await useCase.execute({ petShopId });

    return reply.status(200).send(plans);
  }

  async deactivate(req: FastifyRequest, reply: FastifyReply) {
    const { id } = z.object({ id: z.string().cuid() }).parse(req.params);
    const { sub: petShopId } = req.user;

    const useCase = new DeactivateClientSubscriptionPlanUseCase(this.planRepository);

    try {
      await useCase.execute({ planId: id, petShopId });
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return reply.status(404).send({ message: error.message });
      }
      throw error;
    }
  }
}
