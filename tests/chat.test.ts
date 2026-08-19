import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db';
import {
  getTripChatHistoryAction,
  pinChatMessageAction,
  sendChatMessageAction,
} from '../src/modules/chat/actions';
import {
  formatChatMessageEvent,
  formatPinMessageEvent,
  getTripChatChannelName,
  realtimeManager,
  subscribeToTripChat,
} from '../src/modules/chat/realtime';

beforeEach(() => {
  db.clear();
  realtimeManager.clear();

  // Setup test data
  db.hikerProfiles.set('hiker_lead', {
    id: 'hiker_lead',
    fullName: 'Summit Lead Alex',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  db.hikerProfiles.set('hiker_approved', {
    id: 'hiker_approved',
    fullName: 'Approved Hiker Bob',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  db.hikerProfiles.set('hiker_unapproved', {
    id: 'hiker_unapproved',
    fullName: 'Unapproved Hiker Charlie',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  db.trips.set('trip_1', {
    id: 'trip_1',
    organizerId: 'hiker_lead',
    summitId: 'summit_1',
    title: 'Mount Rainier Expedition',
    startTime: new Date().toISOString(),
    capacity: 5,
    requiredGear: '[]',
    status: 'open',
    createdAt: new Date().toISOString(),
  });

  db.tripParticipants.set('part_approved', {
    id: 'part_approved',
    tripId: 'trip_1',
    hikerId: 'hiker_approved',
    status: 'approved',
    gearConfirmed: true,
    requestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  db.tripParticipants.set('part_pending', {
    id: 'part_pending',
    tripId: 'trip_1',
    hikerId: 'hiker_unapproved',
    status: 'pending',
    gearConfirmed: false,
    requestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});

test('Roster authorization check for sending chat messages', async () => {
  // Lead can send message
  const leadRes = await sendChatMessageAction('hiker_lead', {
    tripId: 'trip_1',
    messageText: 'Welcome to Mount Rainier expedition!',
  });
  assert.equal(leadRes.success, true);
  if (leadRes.success) {
    assert.equal(leadRes.data.senderName, 'Summit Lead Alex');
  }

  // Approved participant can send message
  const approvedRes = await sendChatMessageAction('hiker_approved', {
    tripId: 'trip_1',
    messageText: 'Excited to join!',
  });
  assert.equal(approvedRes.success, true);

  // Unapproved participant cannot send message
  const unapprovedRes = await sendChatMessageAction('hiker_unapproved', {
    tripId: 'trip_1',
    messageText: 'Can I post here?',
  });
  assert.equal(unapprovedRes.success, false);
  if (!unapprovedRes.success) {
    assert.equal(unapprovedRes.error.code, 'UNAUTHORIZED');
  }

  // Random non-roster hiker cannot send message
  const strangerRes = await sendChatMessageAction('hiker_stranger', {
    tripId: 'trip_1',
    messageText: 'Hello?',
  });
  assert.equal(strangerRes.success, false);
  if (!strangerRes.success) {
    assert.equal(strangerRes.error.code, 'UNAUTHORIZED');
  }
});

test('Roster authorization check for fetching chat history', async () => {
  await sendChatMessageAction('hiker_lead', {
    tripId: 'trip_1',
    messageText: 'Test message 1',
  });

  // Approved participant can view history
  const approvedHistory = await getTripChatHistoryAction('hiker_approved', 'trip_1');
  assert.equal(approvedHistory.success, true);
  if (approvedHistory.success) {
    assert.equal(approvedHistory.data.length, 1);
  }

  // Unapproved participant cannot view history
  const unapprovedHistory = await getTripChatHistoryAction('hiker_unapproved', 'trip_1');
  assert.equal(unapprovedHistory.success, false);
  if (!unapprovedHistory.success) {
    assert.equal(unapprovedHistory.error.code, 'UNAUTHORIZED');
  }
});

test('Pinning announcements restriction to Summit Lead', async () => {
  const msgRes = await sendChatMessageAction('hiker_lead', {
    tripId: 'trip_1',
    messageText: 'Meet at trailhead at 4:30 AM sharp',
  });
  assert.equal(msgRes.success, true);
  const msgId = msgRes.success ? msgRes.data.id : '';

  // Non-lead approved participant cannot pin message
  const approvedPin = await pinChatMessageAction('hiker_approved', {
    tripId: 'trip_1',
    messageId: msgId,
    isPinned: true,
  });
  assert.equal(approvedPin.success, false);
  if (!approvedPin.success) {
    assert.equal(approvedPin.error.code, 'FORBIDDEN');
  }

  // Summit Lead can pin message
  const leadPin = await pinChatMessageAction('hiker_lead', {
    tripId: 'trip_1',
    messageId: msgId,
    isPinned: true,
  });
  assert.equal(leadPin.success, true);
  if (leadPin.success) {
    assert.equal(leadPin.data.isPinned, true);
  }

  // Pinned status reflected in chat history
  const history = await getTripChatHistoryAction('hiker_lead', 'trip_1');
  assert.equal(history.success, true);
  if (history.success) {
    assert.equal(history.data[0].isPinned, true);
  }
});

test('Realtime subscription and broadcast event formatting', async () => {
  const events: any[] = [];
  const unsubscribe = subscribeToTripChat('trip_1', (evt) => {
    events.push(evt);
  });

  assert.equal(getTripChatChannelName('trip_1'), 'trip-chat:trip_1');

  const msgRes = await sendChatMessageAction('hiker_lead', {
    tripId: 'trip_1',
    messageText: 'Check-in required',
  });
  assert.equal(msgRes.success, true);

  assert.equal(events.length, 1);
  assert.equal(events[0].event, 'INSERT');
  assert.equal(events[0].topic, 'trip-chat:trip_1');
  assert.equal(events[0].payload.messageText, 'Check-in required');

  const msgId = msgRes.success ? msgRes.data.id : '';
  await pinChatMessageAction('hiker_lead', {
    tripId: 'trip_1',
    messageId: msgId,
    isPinned: true,
  });

  assert.equal(events.length, 2);
  assert.equal(events[1].event, 'UPDATE');
  assert.equal(events[1].topic, 'trip-chat:trip_1');
  assert.equal(events[1].payload.isPinned, true);

  unsubscribe();
});
