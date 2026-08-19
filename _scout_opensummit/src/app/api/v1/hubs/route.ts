import { NextResponse } from 'next/server';
import { createHub, listHubs } from '../../../../modules/hubs/service.ts';
import type { ApiEnvelope, ApiErrorEnvelope } from '../../../../types/dtos.ts';

export async function GET() {
  try {
    const hubs = await listHubs();
    const envelope: ApiEnvelope<typeof hubs> = {
      success: true,
      data: hubs,
    };
    return NextResponse.json(envelope, { status: 200 });
  } catch (err: any) {
    const errorEnvelope: ApiErrorEnvelope = {
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'An unexpected error occurred',
      },
    };
    return NextResponse.json(errorEnvelope, { status: err.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || body.userId;
    if (!userId) {
      const errorEnvelope: ApiErrorEnvelope = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required',
        },
      };
      return NextResponse.json(errorEnvelope, { status: 401 });
    }

    const hub = await createHub(userId, {
      name: body.name,
      slug: body.slug,
      description: body.description,
    });

    const envelope: ApiEnvelope<typeof hub> = {
      success: true,
      data: hub,
    };
    return NextResponse.json(envelope, { status: 201 });
  } catch (err: any) {
    const errorEnvelope: ApiErrorEnvelope = {
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'An unexpected error occurred',
      },
    };
    return NextResponse.json(errorEnvelope, { status: err.status || 500 });
  }
}
