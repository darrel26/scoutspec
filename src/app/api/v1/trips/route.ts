import { createTrip, listTrips } from '../../../../modules/trips/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const summitId = searchParams.get('summit_id') || undefined;
  const status = (searchParams.get('status') as any) || undefined;
  const startAfter = searchParams.get('start_after') || undefined;
  const startBefore = searchParams.get('start_before') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined;

  const result = listTrips({ summitId, status, startAfter, startBefore, limit, offset });
  return Response.json(result, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requestingHikerId = request.headers.get('x-hiker-id') || 'guest';
    const result = createTrip(requestingHikerId, body);
    if (!result.success) {
      const statusCode = result.error.code === 'NOT_FOUND' ? 404 : 400;
      return Response.json(result, { status: statusCode });
    }
    return Response.json(result, { status: 201 });
  } catch {
    return Response.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON payload' } },
      { status: 400 }
    );
  }
}
