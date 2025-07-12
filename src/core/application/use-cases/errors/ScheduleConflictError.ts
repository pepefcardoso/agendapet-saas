export class ScheduleConflictError extends Error {
  constructor() {
    super('The requested time is already booked.');
    this.name = 'ScheduleConflictError';
  }
}
