import { describe, it, expect, beforeEach } from 'vitest';
import { CreateRatingUseCase } from './CreateRatingUseCase';
import { InMemoryPetShopRepository } from '@/core/domain/repositories/in-memory/InMemoryPetShopRepository';
import { InMemoryAppointmentRepository } from '@/core/domain/repositories/in-memory/InMemoryAppointmentRepository';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';
import { NotAllowedError } from './errors/NotAllowedError';
import { makePetShop } from '@/utils/test/make-pet-shop';
import { makeAppointment } from '@/utils/test/make-appointment';
import { AppointmentStatus } from '@prisma/client';
import { InMemoryRatingRepository } from '@/core/domain/repositories/in-memory/InMemoryRatingRepository';
import { makeClientUser } from '@/utils/test/make-client-user';
import { InMemoryClientUserRepository } from '@/core/domain/repositories/in-memory/InMemoryClientUserRepository';

let ratingsRepository: InMemoryRatingRepository;
let petShopsRepository: InMemoryPetShopRepository;
let clientUsersRepository: InMemoryClientUserRepository;
let appointmentsRepository: InMemoryAppointmentRepository;
let sut: CreateRatingUseCase;

describe('CreateRatingUseCase', () => {
  beforeEach(() => {
    ratingsRepository = new InMemoryRatingRepository();
    petShopsRepository = new InMemoryPetShopRepository();
    clientUsersRepository = new InMemoryClientUserRepository();
    appointmentsRepository = new InMemoryAppointmentRepository();
    sut = new CreateRatingUseCase(
      ratingsRepository,
      petShopsRepository,
      clientUsersRepository,
      appointmentsRepository,
    );
  });

  it('should be able to create a new rating', async () => {
    const petShop = makePetShop();
    await petShopsRepository.create(petShop);

    const client = makeClientUser();
    clientUsersRepository.items.push(client); // Adiciona o cliente ao repositório em memória

    // Garante que o cliente teve um agendamento COMPLETED com o petshop
    const completedAppointment = makeAppointment({
      clientId: client.id,
      petShopId: petShop.id,
      status: AppointmentStatus.COMPLETED,
    });
    appointmentsRepository.items.push(completedAppointment);

    const { rating } = await sut.execute({
      petShopId: petShop.id,
      clientId: client.id,
      score: 5,
      comment: 'Great service!',
    });

    expect(rating.id).toEqual(expect.any(String));
    expect(rating.score).toEqual(5);
    expect(rating.comment).toEqual('Great service!');
    expect(ratingsRepository.items).toHaveLength(1);
  });

  it('should not be able to create a rating if petShop does not exist', async () => {
    const client = makeClientUser();
    clientUsersRepository.items.push(client);

    await expect(
      sut.execute({
        petShopId: 'non-existing-petshop-id',
        clientId: client.id,
        score: 4,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to create a rating if client does not exist', async () => {
    const petShop = makePetShop();
    await petShopsRepository.create(petShop);

    await expect(
      sut.execute({
        petShopId: petShop.id,
        clientId: 'non-existing-client-id',
        score: 4,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to create a rating if client has no completed appointments with the petShop', async () => {
    const petShop = makePetShop();
    await petShopsRepository.create(petShop);

    const client = makeClientUser();
    clientUsersRepository.items.push(client);

    const pendingAppointment = makeAppointment({
      clientId: client.id,
      petShopId: petShop.id,
      status: AppointmentStatus.PENDING,
    });
    appointmentsRepository.items.push(pendingAppointment);

    await expect(
      sut.execute({
        petShopId: petShop.id,
        clientId: client.id,
        score: 3,
        comment: 'Okay, but no completed appointments.',
      }),
    ).rejects.toBeInstanceOf(NotAllowedError);
  });
});
