import { LoyaltyPlan } from '@prisma/client';

export interface ILoyaltyPlanRepository {
  /**
   * Encontra um plano de fidelidade pelo ID do petshop.
   * @param petShopId O ID do petshop.
   * @returns O plano de fidelidade ou null se não encontrado.
   */
  findByPetShopId(petShopId: string): Promise<LoyaltyPlan | null>;

  /**
   * Cria ou atualiza um plano de fidelidade para um petshop.
   * @param data - Dados para criar ou atualizar o plano.
   * @returns O plano de fidelidade criado ou atualizado.
   */
  upsert(data: { petShopId: string; pointsPerReal: number }): Promise<LoyaltyPlan>;
}
