export class UserAlreadyExistsError extends Error {
  constructor() {
    super('E-mail already exists.');
    this.name = 'UserAlreadyExistsError';
  }
}
