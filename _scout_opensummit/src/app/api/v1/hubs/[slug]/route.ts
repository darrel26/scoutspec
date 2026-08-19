import { NextResponse } from 'next/server';
import { getHubDetail } from '../../../../../modules/hubs/service.ts';
import type { ApiEnvelope, ApiErrorEnvelope } from '../../../../../types/dtos.ts';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const hubDetail = await getHubDetail(params.slug);
    const envelope: ApiEnvelope<typeof hubDetail> = {
      success: true,
      data: hubDetail,
    };
    return NextResponse.json(envelope, { status: 200 });
  } catch (err: any) {
    const errorEnvelope: ApiErrorEnvelope = {
      success: false,
      error: {
        code: err.code || 'NOT_FOUND',
        message: err.message || 'Community hub not found',
      },
    };
    return NextResponse.json(errorEnvelope, { status: err.status || 404 });
  }
}
