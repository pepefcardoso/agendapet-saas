export class InsufficientCreditsError extends Error {
  constructor(message = 'Insufficient credits for this service') {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}
