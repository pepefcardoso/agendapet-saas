export interface IClientSubscriptionCreditRepository {
  // Neste momento, não precisamos de métodos explícitos aqui, pois a criação
  // será gerenciada pela transação no IClientSubscriptionRepository.
  // Métodos como `findBySubscription` ou `updateRemainingCredits` seriam adicionados aqui no futuro.
  // Por exemplo:
  // findBySubscription(subscriptionId: string): Promise<ClientSubscriptionCredit[]>;
}
