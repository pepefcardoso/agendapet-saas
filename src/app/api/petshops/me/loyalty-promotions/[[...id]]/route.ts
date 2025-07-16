import { makeLoyaltyController } from '@/main/factories/controllers/makeLoyaltyController';
import { NextRequest } from 'next/server';

const loyaltyController = makeLoyaltyController();

export async function POST(request: NextRequest) {
  return loyaltyController.createPromotion(request);
}

export async function GET(request: NextRequest) {
  return loyaltyController.listPromotions(request);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return loyaltyController.updatePromotion(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return loyaltyController.deletePromotion(req, { params });
}
