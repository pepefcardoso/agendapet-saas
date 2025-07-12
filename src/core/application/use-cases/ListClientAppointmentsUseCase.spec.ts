import { describe, it, expect, beforeEach } from 'vitest';
import { ListClientAppointmentsUseCase } from './ListClientAppointmentsUseCase';
import { IAppointmentRepository } from '@/core/domain/repositories/IAppointmentRepository';
import { Appointment } from '@prisma/client';

let appointmentsDatabase: Appointment[] = [];
const inMemoryAppointmentRepository: IAppointmentRepository = {
  async findByClientId(clientId) {
    return appointmentsDatabase.filter((a) => a.clientId === clientId);
  },
  // Métodos não utilizados
  async create() {
    return {} as Appointment;
  },
  async findById() {
    return null;
  },
  async findManyByPetShopIdOnDate() {
    return [];
  },
};

let sut: ListClientAppointmentsUseCase;

describe('List Client Appointments Use Case', () => {
  beforeEach(() => {
    appointmentsDatabase = [
      { id: 'apt-1', clientId: 'client-A' } as Appointment,
      { id: 'apt-2', clientId: 'client-B' } as Appointment,
      { id: 'apt-3', clientId: 'client-A' } as Appointment,
    ];
    sut = new ListClientAppointmentsUseCase(inMemoryAppointmentRepository);
  });

  it('should be able to list all appointments from a specific client', async () => {
    const { appointments } = await sut.execute({ clientId: 'client-A' });
    expect(appointments.length).toBe(2);
  });
});
