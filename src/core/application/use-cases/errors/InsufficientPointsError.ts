export class InsufficientPointsError extends Error {
  constructor() {
    super('Insufficient loyalty points.');
    this.name = 'InsufficientPointsError';
  }
}
