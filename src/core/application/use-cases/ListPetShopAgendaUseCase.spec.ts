import { describe, it, expect, beforeEach } from 'vitest';
import { ListPetShopAgendaUseCase } from './ListPetShopAgendaUseCase';
import {
  IAppointmentRepository,
  AppointmentWithServices,
} from '@/core/domain/repositories/IAppointmentRepository';
import { Appointment, AppointmentStatus, PaymentType } from '@prisma/client';

let appointmentsDatabase: AppointmentWithServices[] = [];
const inMemoryAppointmentRepository: IAppointmentRepository = {
  async findManyByPetShopIdOnDate(petShopId, date) {
    return appointmentsDatabase.filter(
      (a) => a.petShopId === petShopId && a.date.toDateString() === date.toDateString(),
    );
  },
  async create() {
    return {} as Appointment;
  },
  async findById() {
    return null;
  },
  async findByClientId() {
    return [];
  },
};

let sut: ListPetShopAgendaUseCase;

describe('List PetShop Agenda Use Case', () => {
  const petShopA_Id = 'petshop-A';
  const petShopB_Id = 'petshop-B';
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  beforeEach(() => {
    appointmentsDatabase = [
      {
        id: 'apt-1',
        petShopId: petShopA_Id,
        date: today,
        services: [],
        clientId: 'client-1',
        petId: 'pet-1',
        status: AppointmentStatus.CONFIRMED,
        paymentType: PaymentType.MONETARY,
      },
      {
        id: 'apt-2',
        petShopId: petShopB_Id,
        date: today,
        services: [],
        clientId: 'client-2',
        petId: 'pet-2',
        status: AppointmentStatus.CONFIRMED,
        paymentType: PaymentType.MONETARY,
      },
      {
        id: 'apt-3',
        petShopId: petShopA_Id,
        date: today,
        services: [],
        clientId: 'client-3',
        petId: 'pet-3',
        status: AppointmentStatus.PENDING,
        paymentType: PaymentType.MONETARY,
      },
      {
        id: 'apt-4',
        petShopId: petShopA_Id,
        date: tomorrow,
        services: [],
        clientId: 'client-4',
        petId: 'pet-4',
        status: AppointmentStatus.COMPLETED,
        paymentType: PaymentType.MONETARY,
      },
    ];
    sut = new ListPetShopAgendaUseCase(inMemoryAppointmentRepository);
  });

  it('should list all appointments for a specific petshop on a given date', async () => {
    const { appointments } = await sut.execute({
      petShopId: petShopA_Id,
      date: today,
    });
    expect(appointments.length).toBe(2);
    expect(appointments[0].id).toBe('apt-1');
    expect(appointments[1].id).toBe('apt-3');
  });

  it('should return an empty array for a date with no appointments', async () => {
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 5);
    const { appointments } = await sut.execute({
      petShopId: petShopA_Id,
      date: futureDate,
    });
    expect(appointments.length).toBe(0);
  });
});
