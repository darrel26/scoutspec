import { NextResponse } from 'next/server';
import { searchSummits } from '../../../../modules/summits/service';
import { ApiEnvelope, ApiErrorEnvelope } from '../../../../types/dtos';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || undefined;
    const minElevationRaw =
      searchParams.get('min_elevation') || searchParams.get('minElevation');
    const maxElevationRaw =
      searchParams.get('max_elevation') || searchParams.get('maxElevation');
    const difficulty = searchParams.get('difficulty') || undefined;
    const nearLatRaw =
      searchParams.get('near_lat') || searchParams.get('nearLat');
    const nearLngRaw =
      searchParams.get('near_lng') || searchParams.get('nearLng');
    const radiusKmRaw =
      searchParams.get('radius_km') || searchParams.get('radiusKm');
    const limitRaw = searchParams.get('limit');
    const offsetRaw = searchParams.get('offset');

    const minElevation = minElevationRaw ? Number(minElevationRaw) : undefined;
    const maxElevation = maxElevationRaw ? Number(maxElevationRaw) : undefined;
    const nearLat = nearLatRaw ? Number(nearLatRaw) : undefined;
    const nearLng = nearLngRaw ? Number(nearLngRaw) : undefined;
    const radiusKm = radiusKmRaw ? Number(radiusKmRaw) : undefined;
    const limit = limitRaw ? Number(limitRaw) : undefined;
    const offset = offsetRaw ? Number(offsetRaw) : undefined;

    const result = searchSummits({
      q,
      minElevation,
      maxElevation,
      difficulty,
      nearLat,
      nearLng,
      radiusKm,
      limit,
      offset,
    });

    const response: ApiEnvelope<typeof result.summits> = {
      success: true,
      data: result.summits,
      meta: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const errorResponse: ApiErrorEnvelope = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'An error occurred while fetching summits',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
