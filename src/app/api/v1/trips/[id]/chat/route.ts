import { getTripChatHistoryAction, pinChatMessageAction, sendChatMessageAction } from '../../../../../../modules/chat';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const hikerId = searchParams.get('hikerId');

  if (!hikerId) {
    return Response.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'hikerId query param required' } },
      { status: 400 }
    );
  }

  const result = await getTripChatHistoryAction(hikerId, params.id);
  if (!result.success) {
    const status = result.error.code === 'UNAUTHORIZED' ? 403 : 400;
    return Response.json(result, { status });
  }

  return Response.json(result);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json()) as any;
    const { action, senderId, hikerId, messageText, messageId, isPinned } = body;

    if (action === 'pin') {
      const result = await pinChatMessageAction(hikerId || senderId, {
        tripId: params.id,
        messageId,
        isPinned,
      });
      if (!result.success) {
        const status = result.error.code === 'FORBIDDEN' ? 403 : 400;
        return Response.json(result, { status });
      }
      return Response.json(result);
    }

    const result = await sendChatMessageAction(senderId, {
      tripId: params.id,
      messageText,
    });
    if (!result.success) {
      const status = result.error.code === 'UNAUTHORIZED' ? 403 : 400;
      return Response.json(result, { status });
    }
    return Response.json(result);
  } catch (err: any) {
    return Response.json(
      { success: false, error: { code: 'BAD_REQUEST', message: err.message || 'Invalid JSON body' } },
      { status: 400 }
    );
  }
}
