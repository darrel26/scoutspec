import { db, TripChatMessageTable } from '../../db/index';
import { ChatMessageDTO, SendChatMessageInput, PinChatMessageInput, ActionResult } from '../../types/index';

export function sendChatMessage(
  senderId: string,
  input: SendChatMessageInput
): ActionResult<ChatMessageDTO> {
  const sender = db.hikerProfiles.get(senderId);
  if (!sender) {
    return {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Sender profile not found' }
    };
  }

  const trip = db.trips.get(input.tripId);
  if (!trip) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Trip not found' }
    };
  }

  // Authorization: must be approved participant or organizer
  let isAuthorized = trip.organizerId === senderId;
  if (!isAuthorized) {
    for (const part of db.tripParticipants.values()) {
      if (part.tripId === input.tripId && part.hikerId === senderId && part.status === 'approved') {
        isAuthorized = true;
        break;
      }
    }
  }

  if (!isAuthorized) {
    return {
      success: false,
      error: { code: 'FORBIDDEN', message: 'Must be an approved trip member to post messages' }
    };
  }

  const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const message: TripChatMessageTable = {
    id,
    tripId: input.tripId,
    senderId,
    messageText: input.messageText,
    isPinned: false,
    createdAt: new Date().toISOString()
  };

  db.tripChatMessages.set(id, message);

  return {
    success: true,
    data: {
      id,
      tripId: input.tripId,
      senderId,
      senderName: sender.fullName,
      senderAvatarUrl: sender.avatarUrl,
      messageText: input.messageText,
      isPinned: false,
      createdAt: message.createdAt
    }
  };
}

export function pinChatMessage(
  actorId: string,
  input: PinChatMessageInput
): ActionResult<ChatMessageDTO> {
  const trip = db.trips.get(input.tripId);
  if (!trip) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Trip not found' }
    };
  }

  if (trip.organizerId !== actorId) {
    return {
      success: false,
      error: { code: 'FORBIDDEN', message: 'Only trip organizer can pin announcements' }
    };
  }

  const msg = db.tripChatMessages.get(input.messageId);
  if (!msg || msg.tripId !== input.tripId) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Chat message not found' }
    };
  }

  msg.isPinned = input.isPinned;
  db.tripChatMessages.set(msg.id, msg);

  const sender = db.hikerProfiles.get(msg.senderId);

  return {
    success: true,
    data: {
      id: msg.id,
      tripId: msg.tripId,
      senderId: msg.senderId,
      senderName: sender?.fullName || 'Unknown',
      senderAvatarUrl: sender?.avatarUrl,
      messageText: msg.messageText,
      isPinned: msg.isPinned,
      createdAt: msg.createdAt
    }
  };
}

export function getTripChatHistory(
  hikerId: string,
  tripId: string
): ActionResult<ChatMessageDTO[]> {
  const trip = db.trips.get(tripId);
  if (!trip) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Trip not found' }
    };
  }

  let isAuthorized = trip.organizerId === hikerId;
  if (!isAuthorized) {
    for (const part of db.tripParticipants.values()) {
      if (part.tripId === tripId && part.hikerId === hikerId && part.status === 'approved') {
        isAuthorized = true;
        break;
      }
    }
  }

  if (!isAuthorized) {
    return {
      success: false,
      error: { code: 'FORBIDDEN', message: 'Must be an approved trip member to view chat history' }
    };
  }

  const messages: ChatMessageDTO[] = [];
  for (const msg of db.tripChatMessages.values()) {
    if (msg.tripId === tripId) {
      const sender = db.hikerProfiles.get(msg.senderId);
      messages.push({
        id: msg.id,
        tripId: msg.tripId,
        senderId: msg.senderId,
        senderName: sender?.fullName || 'Unknown',
        senderAvatarUrl: sender?.avatarUrl,
        messageText: msg.messageText,
        isPinned: msg.isPinned,
        createdAt: msg.createdAt
      });
    }
  }

  messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return {
    success: true,
    data: messages
  };
}
