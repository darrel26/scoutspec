import { getEmergencyContacts } from '../../../../../../modules/trips/service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const requestingHikerId = request.headers.get('x-hiker-id') || 'guest';
  const result = getEmergencyContacts(params.id, requestingHikerId);

  if (!result.success) {
    let statusCode = 400;
    if (result.error.code === 'NOT_FOUND') {
      statusCode = 404;
    } else if (
      result.error.code === 'FORBIDDEN' ||
      result.error.code === 'EMERGENCY_CONTACT_LOCKED'
    ) {
      statusCode = 403;
    }
    return Response.json(result, { status: statusCode });
  }

  return Response.json(result, { status: 200 });
}
