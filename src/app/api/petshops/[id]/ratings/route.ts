import { NextRequest } from 'next/server';
import { RatingController } from '@/infra/http/controllers/RatingController';

const ratingController = new RatingController();

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  return ratingController.create(request, context);
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  return ratingController.list(request, context);
}
