export class SubscriptionFailedError extends Error {
  constructor() {
    super(
      'The subscription failed due to an existing active subscription or invalid plan credits.',
    );
    this.name = 'SubscriptionFailedError';
  }
}
