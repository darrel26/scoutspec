import { NextResponse } from 'next/server';
import { getSummitById } from '../../../../../modules/summits/service';
import { ApiEnvelope, ApiErrorEnvelope } from '../../../../../types/dtos';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const summit = getSummitById(params.id);
    if (!summit) {
      const errorResponse: ApiErrorEnvelope = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Summit with id ${params.id} not found`,
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: ApiEnvelope<typeof summit> = {
      success: true,
      data: summit,
    };
    return NextResponse.json(response);
  } catch (error: any) {
    const errorResponse: ApiErrorEnvelope = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'An error occurred while fetching summit',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
