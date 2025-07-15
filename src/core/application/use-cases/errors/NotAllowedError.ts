export class NotAllowedError extends Error {
  constructor(message = 'Acesso não permitido.') {
    super(message);
    this.name = 'NotAllowedError';
  }
}
