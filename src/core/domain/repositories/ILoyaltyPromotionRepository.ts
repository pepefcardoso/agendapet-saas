import { LoyaltyPromotion } from '@prisma/client';

export interface ILoyaltyPromotionRepository {
  /**
   * Cria uma nova promoção de fidelidade.
   * @param data Dados da promoção a ser criada.
   * @returns A promoção criada.
   */
  create(data: {
    loyaltyPlanId: string;
    description: string;
    pointsNeeded: number;
    serviceCredits: { serviceId: string; quantity: number }[];
  }): Promise<LoyaltyPromotion>;

  /**
   * Encontra uma promoção pelo seu ID.
   * @param id O ID da promoção.
   * @returns A promoção com o plano de fidelidade relacionado, ou null.
   */
  findById(id: string): Promise<(LoyaltyPromotion & { loyaltyPlan: { petShopId: string } }) | null>;

  /**
   * Lista todas as promoções de um determinado plano de fidelidade.
   * @param loyaltyPlanId O ID do plano de fidelidade.
   * @returns Uma lista de promoções.
   */
  listByLoyaltyPlanId(loyaltyPlanId: string): Promise<LoyaltyPromotion[]>;

  /**
   * Atualiza os dados de uma promoção.
   * @param id O ID da promoção a ser atualizada.
   * @param data Dados a serem atualizados.
   * @returns A promoção atualizada.
   */
  update(
    id: string,
    data: {
      description?: string;
      pointsNeeded?: number;
      serviceCredits?: { serviceId: string; quantity: number }[];
    },
  ): Promise<LoyaltyPromotion>;

  /**
   * Deleta uma promoção.
   * @param id O ID da promoção a ser deletada.
   */
  delete(id: string): Promise<void>;
}
