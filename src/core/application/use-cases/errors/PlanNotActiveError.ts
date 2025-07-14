export class PlanNotActiveError extends Error {
  constructor() {
    super('O plano de assinatura não está ativo.');
  }
}
