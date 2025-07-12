export class AppointmentOutsideWorkingHoursError extends Error {
  constructor() {
    super('The requested time is outside of the pet shop working hours.');
    this.name = 'AppointmentOutsideWorkingHoursError';
  }
}
