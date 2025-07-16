import { CreateAppointmentUseCase } from './CreateAppointmentUseCase';
import { AppointmentOutsideWorkingHoursError } from './errors/AppointmentOutsideWorkingHoursError';
import { ScheduleConflictError } from './errors/ScheduleConflictError';
import { InsufficientPointsError } from './errors/InsufficientPointsError';
import { InMemoryAppointmentRepository } from '@/core/domain/repositories/in-memory/InMemoryAppointmentRepository';
import { InMemoryPetShopRepository } from '@/core/domain/repositories/in-memory/InMemoryPetShopRepository';
import { InMemoryServiceRepository } from '@/core/domain/repositories/in-memory/InMemoryServiceRepository';
import { InMemoryPetRepository } from '@/core/domain/repositories/in-memory/InMemoryPetRepository';
import { InMemoryClientSubscriptionCreditRepository } from '@/core/domain/repositories/in-memory/InMemoryClientSubscriptionCreditRepository';
import { InMemoryClientLoyaltyPointsRepository } from '@/core/domain/repositories/in-memory/InMemoryClientLoyaltyPointsRepository';
import { InMemoryLoyaltyPromotionRepository } from '@/core/domain/repositories/in-memory/InMemoryLoyaltyPromotionRepository';
import { beforeEach, describe, expect, it } from 'vitest';
import { makePetShop } from '@/utils/test/make-pet-shop';
import { makeService } from '@/utils/test/make-service';
import { makePet } from '@/utils/test/make-pet';
import { makeLoyaltyPromotion } from '@/utils/test/make-loyalty-promotion';
import { makeAppointment } from '@/utils/test/make-appointment';

let inMemoryAppointmentRepository: InMemoryAppointmentRepository;
let inMemoryPetShopRepository: InMemoryPetShopRepository;
let inMemoryServiceRepository: InMemoryServiceRepository;
let inMemoryPetRepository: InMemoryPetRepository;
let inMemoryClientCreditRepository: InMemoryClientSubscriptionCreditRepository;
let inMemoryClientLoyaltyPointsRepository: InMemoryClientLoyaltyPointsRepository;
let inMemoryLoyaltyPromotionRepository: InMemoryLoyaltyPromotionRepository;
let sut: CreateAppointmentUseCase;

describe('Create Appointment Use Case', () => {
  beforeEach(() => {
    inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
    inMemoryPetShopRepository = new InMemoryPetShopRepository();
    inMemoryServiceRepository = new InMemoryServiceRepository();
    inMemoryPetRepository = new InMemoryPetRepository();
    inMemoryClientCreditRepository = new InMemoryClientSubscriptionCreditRepository();
    inMemoryClientLoyaltyPointsRepository = new InMemoryClientLoyaltyPointsRepository();
    inMemoryLoyaltyPromotionRepository = new InMemoryLoyaltyPromotionRepository();

    sut = new CreateAppointmentUseCase(
      inMemoryAppointmentRepository,
      inMemoryPetShopRepository,
      inMemoryServiceRepository,
      inMemoryPetRepository,
      inMemoryClientCreditRepository,
      inMemoryClientLoyaltyPointsRepository,
      inMemoryLoyaltyPromotionRepository,
    );
  });

  it('should be able to create an appointment with monetary payment', async () => {
    const petShop = makePetShop({
      workingHours: { '2': [{ start: '09:00', end: '18:00' }] },
    });
    inMemoryPetShopRepository.items.push(petShop);

    const service = makeService({ petShopId: petShop.id });
    inMemoryServiceRepository.items.push(service);

    const pet = makePet();
    inMemoryPetRepository.items.push(pet);

    const result = await sut.execute({
      clientId: pet.ownerId.toString(),
      petShopId: petShop.id.toString(),
      petId: pet.id.toString(),
      serviceIds: [service.id.toString()],
      startTime: new Date('2025-07-22T14:00:00.000Z'),
      paymentType: 'MONETARY',
    });

    expect(result.appointment.id).toBeTruthy();
    expect(result.appointment.status).toEqual('CONFIRMED');
    expect(inMemoryAppointmentRepository.items).toHaveLength(1);
  });

  it('should be able to create an appointment using loyalty points', async () => {
    const petShop = makePetShop({
      workingHours: { '2': [{ start: '09:00', end: '18:00' }] },
    });
    inMemoryPetShopRepository.items.push(petShop);
    const service = makeService({ petShopId: petShop.id });
    inMemoryServiceRepository.items.push(service);
    const pet = makePet();
    inMemoryPetRepository.items.push(pet);
    const promotion = makeLoyaltyPromotion({ petShopId: petShop.id, pointsNeeded: 100 });
    inMemoryLoyaltyPromotionRepository.items.push(promotion);
    await inMemoryClientLoyaltyPointsRepository.credit({
      clientId: pet.ownerId.toString(),
      petShopId: petShop.id.toString(),
      points: 200,
    });

    await sut.execute({
      clientId: pet.ownerId.toString(),
      petShopId: petShop.id.toString(),
      petId: pet.id.toString(),
      serviceIds: [service.id.toString()],
      startTime: new Date('2025-07-22T14:00:00.000Z'),
      paymentType: 'LOYALTY_CREDIT',
      loyaltyPromotionId: promotion.id.toString(),
    });

    expect(inMemoryAppointmentRepository.items).toHaveLength(1);
    const clientPoints = await inMemoryClientLoyaltyPointsRepository.findByClientIdAndPetShopId(
      pet.ownerId.toString(),
      petShop.id.toString(),
    );
    expect(clientPoints?.points).toBe(100);
  });

  it('should not be able to create an appointment with insufficient loyalty points', async () => {
    const petShop = makePetShop({
      workingHours: { '2': [{ start: '09:00', end: '18:00' }] },
    });
    inMemoryPetShopRepository.items.push(petShop);
    const service = makeService({ petShopId: petShop.id });
    inMemoryServiceRepository.items.push(service);
    const pet = makePet();
    inMemoryPetRepository.items.push(pet);
    const promotion = makeLoyaltyPromotion({ petShopId: petShop.id, pointsNeeded: 100 });
    inMemoryLoyaltyPromotionRepository.items.push(promotion);
    await inMemoryClientLoyaltyPointsRepository.credit({
      clientId: pet.ownerId.toString(),
      petShopId: petShop.id.toString(),
      points: 50,
    });

    await expect(
      sut.execute({
        clientId: pet.ownerId.toString(),
        petShopId: petShop.id.toString(),
        petId: pet.id.toString(),
        serviceIds: [service.id.toString()],
        startTime: new Date('2025-07-22T14:00:00.000Z'),
        paymentType: 'LOYALTY_CREDIT',
        loyaltyPromotionId: promotion.id.toString(),
      }),
    ).rejects.toBeInstanceOf(InsufficientPointsError);
  });

  it('should not be able to create an appointment outside working hours', async () => {
    const petShop = makePetShop({
      workingHours: { '2': [{ start: '09:00', end: '18:00' }] },
    });
    inMemoryPetShopRepository.items.push(petShop);
    const service = makeService({ petShopId: petShop.id });
    inMemoryServiceRepository.items.push(service);
    const pet = makePet();
    inMemoryPetRepository.items.push(pet);

    await expect(
      sut.execute({
        clientId: pet.ownerId.toString(),
        petShopId: petShop.id.toString(),
        petId: pet.id.toString(),
        serviceIds: [service.id.toString()],
        startTime: new Date('2025-07-22T22:00:00.000Z'), // Fora do horário
        paymentType: 'MONETARY',
      }),
    ).rejects.toBeInstanceOf(AppointmentOutsideWorkingHoursError);
  });

  it('should not be able to create an appointment that conflicts with another one', async () => {
    const petShop = makePetShop({
      workingHours: { '2': [{ start: '09:00', end: '18:00' }] },
    });
    inMemoryPetShopRepository.items.push(petShop);
    const service = makeService({ petShopId: petShop.id, duration: 60 });
    inMemoryServiceRepository.items.push(service);
    const pet = makePet();
    inMemoryPetRepository.items.push(pet);

    // Agendamento pré-existente
    await inMemoryAppointmentRepository.create(
      makeAppointment({
        petShopId: petShop.id,
        date: new Date('2025-07-22T17:00:00.000Z'), // 14:00 Brasília
        services: [service],
      }),
    );

    await expect(
      sut.execute({
        clientId: pet.ownerId.toString(),
        petShopId: petShop.id.toString(),
        petId: pet.id.toString(),
        serviceIds: [service.id.toString()],
        startTime: new Date('2025-07-22T17:30:00.000Z'), // 14:30 Brasília (conflito)
        paymentType: 'MONETARY',
      }),
    ).rejects.toBeInstanceOf(ScheduleConflictError);
  });
});
