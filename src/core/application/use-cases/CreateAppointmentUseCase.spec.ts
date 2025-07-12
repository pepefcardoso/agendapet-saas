import { describe, it, expect, beforeEach } from 'vitest';
import { CreateAppointmentUseCase } from './CreateAppointmentUseCase';
import {
  IAppointmentRepository,
  AppointmentWithServices,
} from '@/core/domain/repositories/IAppointmentRepository';
import { IPetShopRepository } from '@/core/domain/repositories/IPetShopRepository';
import { IServiceRepository } from '@/core/domain/repositories/IServiceRepository';
import { PetShop, Service, Prisma } from '@prisma/client';
import { AppointmentOutsideWorkingHoursError } from './errors/AppointmentOutsideWorkingHoursError';
import { ScheduleConflictError } from './errors/ScheduleConflictError';
import { ResourceNotFoundError } from './errors/ResourceNotFoundError';

let appointmentsDatabase: AppointmentWithServices[] = [];
let petShopsDatabase: PetShop[] = [];
let servicesDatabase: Service[] = [];

const inMemoryAppointmentRepository: IAppointmentRepository = {
  async create(data) {
    const services = servicesDatabase.filter((s) => data.serviceIds.includes(s.id));
    const appointment: AppointmentWithServices = {
      id: `apt-${appointmentsDatabase.length + 1}`,
      date: data.date as Date,
      status: 'PENDING',
      paymentType: 'MONETARY',
      clientId: data.clientId,
      petId: data.petId,
      petShopId: data.petShopId,
      services: services,
    };
    appointmentsDatabase.push(appointment);
    return appointment;
  },
  async findManyByPetShopIdOnDate(petShopId, date) {
    return appointmentsDatabase.filter(
      (apt) => apt.petShopId === petShopId && apt.date.toDateString() === date.toDateString(),
    );
  },
  async findById() {
    return null;
  },
  async findByClientId() {
    return [];
  },
};

const inMemoryPetShopRepository: IPetShopRepository = {
  async findById(id) {
    return petShopsDatabase.find((p) => p.id === id) || null;
  },
  async create() {
    return {} as PetShop;
  },
  async update() {
    return {} as PetShop;
  },
};

const inMemoryServiceRepository: IServiceRepository = {
  async findById(id) {
    return servicesDatabase.find((s) => s.id === id) || null;
  },
  async create() {
    return {} as Service;
  },
  async update() {
    return null;
  },
  async delete() {},
  async findByPetShopId() {
    return [];
  },
};

let sut: CreateAppointmentUseCase;

describe('Create Appointment Use Case', () => {
  const petShopId = 'petshop-01';
  const today = new Date('2025-07-12T00:00:00.000Z');

  beforeEach(() => {
    appointmentsDatabase = [];
    petShopsDatabase = [
      {
        id: petShopId,
        name: 'Test PetShop',
        address: null,
        phone: null,
        activeSubscriptionId: null,
        workingHours: {
          [today.getDay()]: [{ start: '09:00', end: '18:00' }],
        },
      } as PetShop,
    ];
    servicesDatabase = [
      { id: 'service-01', name: 'Banho', duration: 30, price: new Prisma.Decimal(50) } as Service,
      { id: 'service-02', name: 'Tosa', duration: 60, price: new Prisma.Decimal(70) } as Service,
    ];

    sut = new CreateAppointmentUseCase(
      inMemoryAppointmentRepository,
      inMemoryPetShopRepository,
      inMemoryServiceRepository,
    );
  });

  it('should be able to create a new appointment', async () => {
    const appointmentTime = new Date(new Date(today).setUTCHours(10, 0, 0, 0));

    const { appointment } = await sut.execute({
      clientId: 'client-01',
      petId: 'pet-01',
      petShopId: petShopId,
      serviceIds: ['service-01'],
      startTime: appointmentTime,
    });

    expect(appointment.id).toEqual(expect.any(String));
    expect(appointmentsDatabase.length).toBe(1);
  });

  it('should fail if scheduling outside working hours', async () => {
    const appointmentTime = new Date(new Date(today).setUTCHours(8, 0, 0, 0));

    await expect(
      sut.execute({
        clientId: 'client-01',
        petId: 'pet-01',
        petShopId: petShopId,
        serviceIds: ['service-01'],
        startTime: appointmentTime,
      }),
    ).rejects.toBeInstanceOf(AppointmentOutsideWorkingHoursError);
  });

  it('should fail if scheduling on a day the petshop is closed', async () => {
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);
    const appointmentTime = new Date(tomorrow.setUTCHours(10, 0, 0, 0));

    await expect(
      sut.execute({
        clientId: 'client-01',
        petId: 'pet-01',
        petShopId: petShopId,
        serviceIds: ['service-01'],
        startTime: appointmentTime,
      }),
    ).rejects.toBeInstanceOf(AppointmentOutsideWorkingHoursError);
  });

  it('should fail if a new appointment starts during an existing one', async () => {
    await sut.execute({
      clientId: 'client-01',
      petId: 'pet-01',
      petShopId,
      serviceIds: ['service-02'],
      startTime: new Date(new Date(today).setUTCHours(14, 0, 0, 0)),
    });

    await expect(
      sut.execute({
        clientId: 'client-02',
        petId: 'pet-02',
        petShopId,
        serviceIds: ['service-01'],
        startTime: new Date(new Date(today).setUTCHours(14, 30, 0, 0)),
      }),
    ).rejects.toBeInstanceOf(ScheduleConflictError);
  });

  it('should fail if a new appointment ends during an existing one', async () => {
    await sut.execute({
      clientId: 'client-01',
      petId: 'pet-01',
      petShopId,
      serviceIds: ['service-02'],
      startTime: new Date(new Date(today).setUTCHours(14, 0, 0, 0)),
    });

    await expect(
      sut.execute({
        clientId: 'client-02',
        petId: 'pet-02',
        petShopId,
        serviceIds: ['service-02'],
        startTime: new Date(new Date(today).setUTCHours(13, 30, 0, 0)),
      }),
    ).rejects.toBeInstanceOf(ScheduleConflictError);
  });

  it('should fail if a new appointment envelops an existing one', async () => {
    await sut.execute({
      clientId: 'client-01',
      petId: 'pet-01',
      petShopId,
      serviceIds: ['service-01'],
      startTime: new Date(new Date(today).setUTCHours(14, 0, 0, 0)),
    });

    await expect(
      sut.execute({
        clientId: 'client-02',
        petId: 'pet-02',
        petShopId,
        serviceIds: ['service-01', 'service-02'],
        startTime: new Date(new Date(today).setUTCHours(13, 30, 0, 0)),
      }),
    ).rejects.toBeInstanceOf(ScheduleConflictError);
  });

  it('should succeed if an appointment starts exactly when another ends', async () => {
    await sut.execute({
      clientId: 'client-01',
      petId: 'pet-01',
      petShopId,
      serviceIds: ['service-02'],
      startTime: new Date(new Date(today).setUTCHours(10, 0, 0, 0)),
    });

    await expect(
      sut.execute({
        clientId: 'client-02',
        petId: 'pet-02',
        petShopId,
        serviceIds: ['service-01'],
        startTime: new Date(new Date(today).setUTCHours(11, 0, 0, 0)),
      }),
    ).resolves.toBeTruthy();

    expect(appointmentsDatabase.length).toBe(2);
  });

  it('should throw an error if one of the service IDs does not exist', async () => {
    const appointmentTime = new Date(new Date(today).setUTCHours(10, 0, 0, 0));

    await expect(
      sut.execute({
        clientId: 'client-01',
        petId: 'pet-01',
        petShopId: petShopId,
        serviceIds: ['service-01', 'non-existent-service'],
        startTime: appointmentTime,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
