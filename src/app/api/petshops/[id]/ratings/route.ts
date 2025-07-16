import { NextRequest } from 'next/server';
import { makeRatingController } from '@/main/factories/controllers/makeRatingController';

const ratingController = makeRatingController();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return ratingController.create(request, { params });
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return ratingController.list(request, { params });
}
