import { NextResponse } from 'next/server';
import { exportGpx } from '../../../../../../modules/summits/service';
import { ApiErrorEnvelope } from '../../../../../../types/dtos';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gpxData = exportGpx(params.id);
    if (!gpxData) {
      const errorResponse: ApiErrorEnvelope = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Summit with id ${params.id} not found`,
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    return new Response(gpxData, {
      status: 200,
      headers: {
        'Content-Type': 'application/gpx+xml',
        'Content-Disposition': `attachment; filename="summit-${params.id}.gpx"`,
      },
    });
  } catch (error: any) {
    const errorResponse: ApiErrorEnvelope = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'An error occurred while exporting GPX',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
