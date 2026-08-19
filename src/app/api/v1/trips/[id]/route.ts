import { getTripDetail } from '../../../../../modules/trips/service';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const result = getTripDetail(params.id);
  if (!result.success) {
    return Response.json(result, { status: 404 });
  }
  return Response.json(result, { status: 200 });
}
