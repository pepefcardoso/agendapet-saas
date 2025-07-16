import { IClientSubscriptionCreditRepository } from '@/core/domain/repositories/IClientSubscriptionCreditRepository';
import { ClientSubscriptionCredit } from '@prisma/client';
import { randomUUID } from 'crypto';

export class InMemoryClientSubscriptionCreditRepository
  implements IClientSubscriptionCreditRepository
{
  public items: ClientSubscriptionCredit[] = [];

  async createMany(
    credits: Array<{ subscriptionId: string; serviceId: string; remainingCredits: number }>, // prepare credits array
  ): Promise<void> {
    for (const c of credits) {
      const credit: ClientSubscriptionCredit = {
        id: randomUUID(),
        subscriptionId: c.subscriptionId,
        serviceId: c.serviceId,
        remainingCredits: c.remainingCredits,
      };
      this.items.push(credit);
    }
  }

  async findByClientAndService(
    clientId: string,
    serviceId: string,
  ): Promise<ClientSubscriptionCredit | null> {
    return (
      this.items.find((item) => item.subscriptionId === clientId && item.serviceId === serviceId) ??
      null
    );
  }

  async debit(creditId: string, amount: number): Promise<void> {
    const index = this.items.findIndex((item) => item.id === creditId);
    if (index === -1) {
      throw new Error(`Credit with id ${creditId} not found`);
    }
    const credit = this.items[index];
    if (credit.remainingCredits < amount) {
      throw new Error(
        `Insufficient credits: requested ${amount}, available ${credit.remainingCredits}`,
      );
    }
    credit.remainingCredits -= amount;
    this.items[index] = credit;
  }
}
