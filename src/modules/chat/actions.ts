import { ActionResult, ChatMessageDTO, PinChatMessageInput, SendChatMessageInput } from '../../types';
import { getTripChatHistory, pinChatMessage, sendChatMessage } from './service';

export async function sendChatMessageAction(
  senderId: string,
  input: SendChatMessageInput
): Promise<ActionResult<ChatMessageDTO>> {
  try {
    const data = await sendChatMessage(senderId, input);
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: err.message?.startsWith('UNAUTHORIZED') ? 'UNAUTHORIZED' : 'BAD_REQUEST',
        message: err.message || 'Failed to send chat message',
      },
    };
  }
}

export async function pinChatMessageAction(
  hikerId: string,
  input: PinChatMessageInput
): Promise<ActionResult<ChatMessageDTO>> {
  try {
    const data = await pinChatMessage(hikerId, input);
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: err.message?.startsWith('FORBIDDEN') ? 'FORBIDDEN' : 'BAD_REQUEST',
        message: err.message || 'Failed to pin chat message',
      },
    };
  }
}

export async function getTripChatHistoryAction(
  hikerId: string,
  tripId: string
): Promise<ActionResult<ChatMessageDTO[]>> {
  try {
    const data = await getTripChatHistory(hikerId, tripId);
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: err.message?.startsWith('UNAUTHORIZED') ? 'UNAUTHORIZED' : 'BAD_REQUEST',
        message: err.message || 'Failed to fetch chat history',
      },
    };
  }
}
