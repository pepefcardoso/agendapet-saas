import { Appointment, AppointmentStatus, PaymentType } from '@prisma/client';
import { randomUUID } from 'crypto';

export function makeAppointment(override: Partial<Appointment> = {}): Appointment {
  return {
    id: randomUUID(),
    date: new Date(),
    status: AppointmentStatus.PENDING,
    paymentType: PaymentType.MONETARY,
    clientId: randomUUID(),
    petId: randomUUID(),
    petShopId: randomUUID(),
    ...override,
  };
}
