import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { db } from '../../src/db/index';
import { createTrip, requestJoinTrip, updateParticipantStatus } from '../../src/modules/trips/service';
import { sendChatMessage, getTripChatHistory, pinChatMessage } from '../../src/modules/chat/service';
import { logSummit } from '../../src/modules/profiles/service';
import { createHub, linkTripToHub, getHubDetail } from '../../src/modules/hubs/service';
import { encryptEmergencyContact, decryptEmergencyContact } from '../../src/modules/trips/emergency';

describe('End-to-End Expedition Integration Flow', () => {
  beforeEach(() => {
    db.clear();

    // Seed Summit Lead profile
    db.hikerProfiles.set('lead-1', {
      id: 'lead-1',
      fullName: 'Alex Summit Lead',
      avatarUrl: 'https://example.com/lead.jpg',
      bio: 'Experienced 14er lead',
      fitnessAttestation: 'Advanced',
      emergencyContactEncrypted: encryptEmergencyContact('Spouse: 555-0199'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Seed Summit Seeker participant profile
    db.hikerProfiles.set('seeker-1', {
      id: 'seeker-1',
      fullName: 'Sam Seeker',
      avatarUrl: 'https://example.com/seeker.jpg',
      bio: 'Avid weekend hiker',
      fitnessAttestation: 'Intermediate',
      emergencyContactEncrypted: encryptEmergencyContact('Parent: 555-0188'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Seed Summit
    db.summits.set('summit-1', {
      id: 'summit-1',
      name: 'Mount Rainier',
      elevationM: 4392,
      difficultyClass: 'Class 4',
      latitude: 46.8523,
      longitude: -121.7603,
      gpxTrackUrl: 'https://example.com/rainier.gpx',
      createdAt: new Date().toISOString()
    });
  });

  it('executes full expedition lifecycle: create trip -> join request -> approval -> chat -> emergency contact -> summit log -> hub linking', async () => {
    // 1. Create Trip Expedition
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 3600 * 1000).toISOString(); // 2 hours from now
    const endTime = new Date(now.getTime() + 10 * 3600 * 1000).toISOString();

    const tripRes = createTrip('lead-1', {
      summitId: 'summit-1',
      title: 'Rainier Sunrise Expedition',
      routeSummary: 'Disappointment Cleaver Route',
      startTime,
      endTime,
      capacity: 4,
      requiredGear: [{ id: 'g1', name: 'Crampons', mandatory: true }]
    });
    assert.strictEqual(tripRes.success, true);
    const trip = tripRes.data!;
    assert.strictEqual(trip.status, 'open');

    // 2. Submit Join Request with Gear Attestation
    const joinRes = requestJoinTrip('seeker-1', {
      tripId: trip.id,
      experienceNote: 'Climbed Mt Hood last year',
      gearConfirmed: true
    });
    assert.strictEqual(joinRes.success, true);
    assert.strictEqual(joinRes.data!.status, 'pending');

    // 3. Organizer Approves Participant
    const approveRes = updateParticipantStatus('lead-1', {
      tripId: trip.id,
      hikerId: 'seeker-1',
      status: 'approved'
    });
    assert.strictEqual(approveRes.success, true);
    assert.strictEqual(approveRes.data!.status, 'approved');

    // 4. Approved Hiker Posts in Native Trip Chat
    const chatRes = sendChatMessage('seeker-1', {
      tripId: trip.id,
      messageText: 'Super excited! What time are we carpooling?'
    });
    assert.strictEqual(chatRes.success, true);

    // 5. Organizer Pins Critical Announcement Banner
    const leadMessageRes = sendChatMessage('lead-1', {
      tripId: trip.id,
      messageText: 'Meet at Paradise Parking Lot at 3:00 AM sharp'
    });
    const pinRes = pinChatMessage('lead-1', {
      messageId: leadMessageRes.data!.id,
      tripId: trip.id,
      isPinned: true
    });
    assert.strictEqual(pinRes.success, true);

    // Verify Chat History & Pinned Banner
    const historyRes = getTripChatHistory('seeker-1', trip.id);
    assert.strictEqual(historyRes.success, true);
    assert.strictEqual(historyRes.data!.length, 2);
    assert.strictEqual(historyRes.data![1].isPinned, true);

    // 6. Access Time-Bounded Encrypted Emergency Contact (Active Window)
    const encryptedContact = db.hikerProfiles.get('seeker-1')?.emergencyContactEncrypted;
    assert.ok(encryptedContact);
    const decrypted = decryptEmergencyContact(encryptedContact!, startTime, endTime, now);
    assert.strictEqual(decrypted, 'Parent: 555-0188');

    // 7. Log Completed Peak Summit
    const logResult = logSummit('seeker-1', {
      summitId: 'summit-1',
      tripId: trip.id,
      notes: 'Reached summit at 8:15 AM! Clear skies.'
    });
    assert.strictEqual(logResult.summitName, 'Mount Rainier');

    // 8. Create Community Hub & Link Expedition
    const hubDTO = await createHub('lead-1', {
      name: 'Cascades Mountaineering Club',
      slug: 'cascades-climbers',
      description: 'Pacific Northwest summit community'
    });
    assert.strictEqual(hubDTO.name, 'Cascades Mountaineering Club');

    const linkResult = await linkTripToHub('lead-1', {
      hubId: hubDTO.id,
      tripId: trip.id
    });
    assert.strictEqual(linkResult.tripId, trip.id);

    // Verify Hub Detail Board
    const hubDetail = await getHubDetail('cascades-climbers');
    assert.strictEqual(hubDetail.name, 'Cascades Mountaineering Club');
    assert.strictEqual(hubDetail.trips.length, 1);
    assert.strictEqual(hubDetail.trips[0].id, trip.id);
  });
});
