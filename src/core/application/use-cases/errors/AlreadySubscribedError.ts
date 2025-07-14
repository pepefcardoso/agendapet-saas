export class AlreadySubscribedError extends Error {
  constructor() {
    super('O cliente já possui uma assinatura ativa para este plano.');
  }
}
