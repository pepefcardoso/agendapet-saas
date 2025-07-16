import { makeLoyaltyController } from '@/main/factories/controllers/makeLoyaltyController';
import { NextRequest } from 'next/server';

const loyaltyController = makeLoyaltyController();

export async function PUT(request: NextRequest) {
  return loyaltyController.createOrUpdatePlan(request);
}
