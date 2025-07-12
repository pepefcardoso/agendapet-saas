export class ClientAlreadyLinkedError extends Error {
  constructor() {
    super('Client is already linked to this pet shop.');
    this.name = 'ClientAlreadyLinkedError';
  }
}
