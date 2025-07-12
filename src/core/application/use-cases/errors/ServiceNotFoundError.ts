export class ServiceNotFoundError extends Error {
  constructor() {
    super('Service not found.');
    this.name = 'ServiceNotFoundError';
  }
}
