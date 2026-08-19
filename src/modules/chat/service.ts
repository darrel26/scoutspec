import { db, TripChatMessageTable } from '../../db';
import { ChatMessageDTO, SendChatMessageInput, PinChatMessageInput } from '../../types';
import { formatChatMessageEvent, formatPinMessageEvent, realtimeManager } from './realtime';

export function isApprovedParticipantOrLead(tripId: string, hikerId: string): boolean {
  const trip = db.trips.get(tripId);
  if (!trip) return false;

  if (trip.organizerId === hikerId) return true;

  for (const participant of db.tripParticipants.values()) {
    if (
      participant.tripId === tripId &&
      participant.hikerId === hikerId &&
      participant.status === 'approved'
    ) {
      return true;
    }
  }

  return false;
}

export function isSummitLead(tripId: string, hikerId: string): boolean {
  const trip = db.trips.get(tripId);
  if (!trip) return false;
  return trip.organizerId === hikerId;
}

function toChatMessageDTO(msg: TripChatMessageTable): ChatMessageDTO {
  const profile = db.hikerProfiles.get(msg.senderId);
  return {
    id: msg.id,
    tripId: msg.tripId,
    senderId: msg.senderId,
    senderName: profile ? profile.fullName : 'Unknown Hiker',
    senderAvatarUrl: profile?.avatarUrl ?? null,
    messageText: msg.messageText,
    isPinned: msg.isPinned,
    createdAt: msg.createdAt,
  };
}

export async function sendChatMessage(
  senderId: string,
  input: SendChatMessageInput
): Promise<ChatMessageDTO> {
  if (!isApprovedParticipantOrLead(input.tripId, senderId)) {
    throw new Error('UNAUTHORIZED: Access restricted to approved participants and Summit Lead.');
  }

  if (!input.messageText || input.messageText.trim().length === 0) {
    throw new Error('INVALID_INPUT: Message text cannot be empty.');
  }

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const chatTable: TripChatMessageTable = {
    id: messageId,
    tripId: input.tripId,
    senderId,
    messageText: input.messageText,
    isPinned: false,
    createdAt: new Date().toISOString(),
  };

  db.tripChatMessages.set(messageId, chatTable);

  const dto = toChatMessageDTO(chatTable);
  const event = formatChatMessageEvent(dto);
  realtimeManager.broadcast(event);

  return dto;
}

export async function pinChatMessage(
  hikerId: string,
  input: PinChatMessageInput
): Promise<ChatMessageDTO> {
  if (!isSummitLead(input.tripId, hikerId)) {
    throw new Error('FORBIDDEN: Only Summit Lead can pin or unpin messages.');
  }

  const msg = db.tripChatMessages.get(input.messageId);
  if (!msg || msg.tripId !== input.tripId) {
    throw new Error('NOT_FOUND: Message not found.');
  }

  msg.isPinned = input.isPinned;
  db.tripChatMessages.set(msg.id, msg);

  const dto = toChatMessageDTO(msg);
  const event = formatPinMessageEvent(dto);
  realtimeManager.broadcast(event);

  return dto;
}

export async function getTripChatHistory(
  hikerId: string,
  tripId: string
): Promise<ChatMessageDTO[]> {
  if (!isApprovedParticipantOrLead(tripId, hikerId)) {
    throw new Error('UNAUTHORIZED: Access restricted to approved participants and Summit Lead.');
  }

  const messages: ChatMessageDTO[] = [];
  for (const msg of db.tripChatMessages.values()) {
    if (msg.tripId === tripId) {
      messages.push(toChatMessageDTO(msg));
    }
  }

  messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return messages;
}
