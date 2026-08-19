import { ChatMessageDTO } from '../../types';

export interface RealtimeBroadcastEvent<T = ChatMessageDTO> {
  event: 'INSERT' | 'UPDATE';
  topic: string;
  payload: T;
  timestamp: string;
}

export function getTripChatChannelName(tripId: string): string {
  return `trip-chat:${tripId}`;
}

export function formatChatMessageEvent(message: ChatMessageDTO): RealtimeBroadcastEvent<ChatMessageDTO> {
  return {
    event: 'INSERT',
    topic: getTripChatChannelName(message.tripId),
    payload: message,
    timestamp: new Date().toISOString(),
  };
}

export function formatPinMessageEvent(message: ChatMessageDTO): RealtimeBroadcastEvent<ChatMessageDTO> {
  return {
    event: 'UPDATE',
    topic: getTripChatChannelName(message.tripId),
    payload: message,
    timestamp: new Date().toISOString(),
  };
}

type RealtimeCallback = (event: RealtimeBroadcastEvent) => void;

class RealtimeChannelManager {
  private subscriptions: Map<string, Set<RealtimeCallback>> = new Map();

  subscribe(channelName: string, callback: RealtimeCallback): () => void {
    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, new Set());
    }
    this.subscriptions.get(channelName)!.add(callback);

    return () => {
      const subs = this.subscriptions.get(channelName);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscriptions.delete(channelName);
        }
      }
    };
  }

  broadcast(event: RealtimeBroadcastEvent): void {
    const subs = this.subscriptions.get(event.topic);
    if (subs) {
      subs.forEach((cb) => cb(event));
    }
  }

  clear(): void {
    this.subscriptions.clear();
  }
}

export const realtimeManager = new RealtimeChannelManager();

export function subscribeToTripChat(tripId: string, callback: RealtimeCallback): () => void {
  const channelName = getTripChatChannelName(tripId);
  return realtimeManager.subscribe(channelName, callback);
}
