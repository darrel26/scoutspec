import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { db } from '../src/db/index.ts';
import {
  createTripAction,
  requestJoinTripAction,
  updateParticipantStatusAction,
} from '../src/modules/trips/actions.ts';
import {
  decryptEmergencyContact,
  encryptEmergencyContact,
  isWithinEmergencyAccessWindow,
} from '../src/modules/trips/emergency.ts';
import {
  getEmergencyContacts,
  getTripDetail,
  listTrips,
} from '../src/modules/trips/service.ts';

describe('Trip Expedition & Roster Approval Queue', () => {
  const TEST_SUMMIT_ID = 'summit-rainier-123';
  const ORGANIZER_ID = 'hiker-organizer-001';
  const HIKER_1_ID = 'hiker-applicant-002';
  const HIKER_2_ID = 'hiker-applicant-003';
  const HIKER_3_ID = 'hiker-applicant-004';

  beforeEach(() => {
    db.clear();

    // Seed mock summits
    db.summits.set(TEST_SUMMIT_ID, {
      id: TEST_SUMMIT_ID,
      name: 'Mount Rainier',
      elevationM: 4392,
      difficultyClass: 'Class 3',
      latitude: 46.8523,
      longitude: -121.7603,
      gpxTrackUrl: 'https://example.com/rainier.gpx',
      createdAt: new Date().toISOString(),
    });

    // Seed mock hiker profiles with encrypted emergency contacts
    db.hikerProfiles.set(ORGANIZER_ID, {
      id: ORGANIZER_ID,
      fullName: 'Sarah Lead',
      avatarUrl: 'https://example.com/sarah.jpg',
      bio: 'Experienced mountaineer',
      fitnessAttestation: 'Advanced',
      emergencyContactEncrypted: encryptEmergencyContact('John Lead (Spouse): 555-0199'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    db.hikerProfiles.set(HIKER_1_ID, {
      id: HIKER_1_ID,
      fullName: 'Alice Walker',
      avatarUrl: 'https://example.com/alice.jpg',
      fitnessAttestation: 'Intermediate',
      emergencyContactEncrypted: encryptEmergencyContact('Bob Walker (Father): 555-0101'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    db.hikerProfiles.set(HIKER_2_ID, {
      id: HIKER_2_ID,
      fullName: 'Charlie Hiker',
      fitnessAttestation: 'Advanced',
      emergencyContactEncrypted: encryptEmergencyContact('Dave Hiker (Brother): 555-0102'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    db.hikerProfiles.set(HIKER_3_ID, {
      id: HIKER_3_ID,
      fullName: 'Dana Hiker',
      fitnessAttestation: 'Beginner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  describe('1. Expedition Creation', () => {
    it('creates a new trip expedition record with status open and assigns Summit Lead', async () => {
      const startTime = new Date(Date.now() + 86400000).toISOString(); // +24h
      const result = await createTripAction(
        {
          summitId: TEST_SUMMIT_ID,
          title: 'Rainier DC Route Climb',
          routeSummary: 'Disappointment Cleaver route via Paradise',
          startTime,
          capacity: 6,
          requiredGear: [
            { id: '1', name: 'Microspikes', mandatory: true },
            { id: '2', name: 'Ice Axe', mandatory: true },
          ],
        },
        ORGANIZER_ID
      );

      assert.equal(result.success, true);
      if (!result.success) return;

      assert.equal(result.data.title, 'Rainier DC Route Climb');
      assert.equal(result.data.organizerId, ORGANIZER_ID);
      assert.equal(result.data.summitId, TEST_SUMMIT_ID);
      assert.equal(result.data.summitName, 'Mount Rainier');
      assert.equal(result.data.status, 'open');
      assert.equal(result.data.capacity, 6);
      assert.equal(result.data.approvedCount, 1); // Organizer automatically approved
      assert.equal(result.data.requiredGear.length, 2);
    });

    it('rejects creation if summit does not exist', async () => {
      const result = await createTripAction(
        {
          summitId: 'non-existent-summit',
          title: 'Phantom Climb',
          startTime: new Date().toISOString(),
          capacity: 4,
          requiredGear: [],
        },
        ORGANIZER_ID
      );

      assert.equal(result.success, false);
      if (result.success) return;
      assert.equal(result.error.code, 'NOT_FOUND');
    });

    it('lists created trips', async () => {
      const startTime = new Date(Date.now() + 86400000).toISOString();
      await createTripAction(
        {
          summitId: TEST_SUMMIT_ID,
          title: 'Rainier Trip 1',
          startTime,
          capacity: 5,
          requiredGear: [],
        },
        ORGANIZER_ID
      );

      const listRes = listTrips({ summitId: TEST_SUMMIT_ID });
      assert.equal(listRes.success, true);
      if (!listRes.success) return;
      assert.equal(listRes.data.length, 1);
      assert.equal(listRes.data[0].title, 'Rainier Trip 1');
    });
  });

  describe('2. Join Request Validation', () => {
    let tripId: string;

    beforeEach(async () => {
      const startTime = new Date(Date.now() + 86400000).toISOString();
      const res = await createTripAction(
        {
          summitId: TEST_SUMMIT_ID,
          title: 'Southside Couloir Expedition',
          startTime,
          capacity: 4,
          requiredGear: [{ id: '1', name: 'Crampons', mandatory: true }],
        },
        ORGANIZER_ID
      );
      assert.equal(res.success, true);
      if (res.success) tripId = res.data.id;
    });

    it('stores participant status as pending when gearConfirmed is true', async () => {
      const res = await requestJoinTripAction(
        {
          tripId,
          experienceNote: 'Climbed Hood last year',
          gearConfirmed: true,
        },
        HIKER_1_ID
      );

      assert.equal(res.success, true);
      if (!res.success) return;
      assert.equal(res.data.status, 'pending');
      assert.equal(res.data.hikerId, HIKER_1_ID);
      assert.equal(res.data.gearConfirmed, true);
      assert.equal(res.data.experienceNote, 'Climbed Hood last year');
    });

    it('rejects join request if gearConfirmed is false', async () => {
      const res = await requestJoinTripAction(
        {
          tripId,
          experienceNote: 'No crampons yet',
          gearConfirmed: false,
        },
        HIKER_1_ID
      );

      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'GEAR_NOT_CONFIRMED');
    });

    it('prevents duplicate join requests from same hiker', async () => {
      await requestJoinTripAction(
        { tripId, gearConfirmed: true },
        HIKER_1_ID
      );

      const duplicateRes = await requestJoinTripAction(
        { tripId, gearConfirmed: true },
        HIKER_1_ID
      );

      assert.equal(duplicateRes.success, false);
      if (duplicateRes.success) return;
      assert.equal(duplicateRes.error.code, 'ALREADY_REQUESTED');
    });

    it('prevents organizer from requesting to join own trip', async () => {
      const res = await requestJoinTripAction(
        { tripId, gearConfirmed: true },
        ORGANIZER_ID
      );

      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'ALREADY_REQUESTED');
    });
  });

  describe('3. Organizer Approval Queue', () => {
    let tripId: string;

    beforeEach(async () => {
      const startTime = new Date(Date.now() + 86400000).toISOString();
      const res = await createTripAction(
        {
          summitId: TEST_SUMMIT_ID,
          title: 'Summit Expedition',
          startTime,
          capacity: 4,
          requiredGear: [],
        },
        ORGANIZER_ID
      );
      assert.equal(res.success, true);
      if (res.success) tripId = res.data.id;

      await requestJoinTripAction({ tripId, gearConfirmed: true }, HIKER_1_ID);
      await requestJoinTripAction({ tripId, gearConfirmed: true }, HIKER_2_ID);
    });

    it('allows trip organizer to approve pending participant', async () => {
      const approveRes = await updateParticipantStatusAction(
        {
          tripId,
          hikerId: HIKER_1_ID,
          status: 'approved',
        },
        ORGANIZER_ID
      );

      assert.equal(approveRes.success, true);
      if (!approveRes.success) return;
      assert.equal(approveRes.data.status, 'approved');

      const detail = getTripDetail(tripId);
      assert.equal(detail.success, true);
      if (!detail.success) return;
      assert.equal(detail.data.approvedCount, 2); // Organizer (1) + Hiker 1 (1)
    });

    it('allows trip organizer to reject pending participant', async () => {
      const rejectRes = await updateParticipantStatusAction(
        {
          tripId,
          hikerId: HIKER_2_ID,
          status: 'rejected',
        },
        ORGANIZER_ID
      );

      assert.equal(rejectRes.success, true);
      if (!rejectRes.success) return;
      assert.equal(rejectRes.data.status, 'rejected');
    });

    it('allows participant to withdraw from roster', async () => {
      await updateParticipantStatusAction(
        { tripId, hikerId: HIKER_1_ID, status: 'approved' },
        ORGANIZER_ID
      );

      const withdrawRes = await updateParticipantStatusAction(
        { tripId, hikerId: HIKER_1_ID, status: 'withdrawn' },
        HIKER_1_ID
      );

      assert.equal(withdrawRes.success, true);
      if (!withdrawRes.success) return;
      assert.equal(withdrawRes.data.status, 'withdrawn');
    });

    it('rejects approval attempt from non-organizer with FORBIDDEN', async () => {
      const res = await updateParticipantStatusAction(
        {
          tripId,
          hikerId: HIKER_2_ID,
          status: 'approved',
        },
        HIKER_1_ID
      );

      assert.equal(res.success, false);
      if (res.success) return;
      assert.equal(res.error.code, 'FORBIDDEN');
    });
  });

  describe('4. Capacity Limit Enforcement', () => {
    let tripId: string;

    beforeEach(async () => {
      const startTime = new Date(Date.now() + 86400000).toISOString();
      // Capacity = 2 (Organizer takes 1 spot, leaving 1 open spot)
      const res = await createTripAction(
        {
          summitId: TEST_SUMMIT_ID,
          title: 'Small Team Climb',
          startTime,
          capacity: 2,
          requiredGear: [],
        },
        ORGANIZER_ID
      );
      assert.equal(res.success, true);
      if (res.success) tripId = res.data.id;
    });

    it('marks trip as full when capacity is reached and blocks further approvals', async () => {
      await requestJoinTripAction({ tripId, gearConfirmed: true }, HIKER_1_ID);
      await requestJoinTripAction({ tripId, gearConfirmed: true }, HIKER_2_ID);

      // Approve Hiker 1 -> Reaches capacity (2/2)
      const app1 = await updateParticipantStatusAction(
        { tripId, hikerId: HIKER_1_ID, status: 'approved' },
        ORGANIZER_ID
      );
      assert.equal(app1.success, true);

      const detail = getTripDetail(tripId);
      assert.equal(detail.success, true);
      if (detail.success) {
        assert.equal(detail.data.status, 'full');
        assert.equal(detail.data.approvedCount, 2);
      }

      // Try approving Hiker 2 -> rejected with TRIP_FULL
      const app2 = await updateParticipantStatusAction(
        { tripId, hikerId: HIKER_2_ID, status: 'approved' },
        ORGANIZER_ID
      );
      assert.equal(app2.success, false);
      if (!app2.success) {
        assert.equal(app2.error.code, 'TRIP_FULL');
      }

      // Try requesting join when full -> rejected with TRIP_FULL
      const joinReq = await requestJoinTripAction(
        { tripId, gearConfirmed: true },
        HIKER_3_ID
      );
      assert.equal(joinReq.success, false);
      if (!joinReq.success) {
        assert.equal(joinReq.error.code, 'TRIP_FULL');
      }
    });

    it('re-opens trip status when an approved participant withdraws', async () => {
      await requestJoinTripAction({ tripId, gearConfirmed: true }, HIKER_1_ID);
      await updateParticipantStatusAction(
        { tripId, hikerId: HIKER_1_ID, status: 'approved' },
        ORGANIZER_ID
      );

      let detail = getTripDetail(tripId);
      assert.equal(detail.success && detail.data.status, 'full');

      // Hiker 1 withdraws
      await updateParticipantStatusAction(
        { tripId, hikerId: HIKER_1_ID, status: 'withdrawn' },
        HIKER_1_ID
      );

      detail = getTripDetail(tripId);
      assert.equal(detail.success && detail.data.status, 'open');
      assert.equal(detail.success && detail.data.approvedCount, 1);
    });
  });

  describe('5. Time-Bounded Emergency Contact Decryption', () => {
    let tripId: string;
    let startTimeDate: Date;
    let endTimeDate: Date;

    beforeEach(async () => {
      startTimeDate = new Date('2026-06-01T10:00:00Z');
      endTimeDate = new Date('2026-06-02T18:00:00Z');

      const res = await createTripAction(
        {
          summitId: TEST_SUMMIT_ID,
          title: 'Expedition Rainier',
          startTime: startTimeDate.toISOString(),
          endTime: endTimeDate.toISOString(),
          capacity: 5,
          requiredGear: [],
        },
        ORGANIZER_ID
      );
      assert.equal(res.success, true);
      if (res.success) tripId = res.data.id;

      // Approve Hiker 1
      await requestJoinTripAction({ tripId, gearConfirmed: true }, HIKER_1_ID);
      await updateParticipantStatusAction(
        { tripId, hikerId: HIKER_1_ID, status: 'approved' },
        ORGANIZER_ID
      );
    });

    it('encrypts and decrypts emergency contact with AES-256-GCM', () => {
      const original = 'Mom: 555-0999 (Blood type O+)';
      const encrypted = encryptEmergencyContact(original);
      const decrypted = decryptEmergencyContact(encrypted);
      assert.equal(decrypted, original);
    });

    it('validates active trip window boundary [startTime - 24h, endTime + 12h]', () => {
      const windowStart = new Date(startTimeDate.getTime() - 24 * 60 * 60 * 1000);
      const windowEnd = new Date(endTimeDate.getTime() + 12 * 60 * 60 * 1000);

      // 1 hour before window start -> false
      assert.equal(
        isWithinEmergencyAccessWindow(startTimeDate, endTimeDate, new Date(windowStart.getTime() - 3600000)),
        false
      );

      // Exactly at window start -> true
      assert.equal(
        isWithinEmergencyAccessWindow(startTimeDate, endTimeDate, windowStart),
        true
      );

      // During active trip -> true
      assert.equal(
        isWithinEmergencyAccessWindow(startTimeDate, endTimeDate, new Date('2026-06-01T14:00:00Z')),
        true
      );

      // Exactly at window end -> true
      assert.equal(
        isWithinEmergencyAccessWindow(startTimeDate, endTimeDate, windowEnd),
        true
      );

      // 1 hour after window end -> false
      assert.equal(
        isWithinEmergencyAccessWindow(startTimeDate, endTimeDate, new Date(windowEnd.getTime() + 3600000)),
        false
      );
    });

    it('allows Summit Lead to retrieve decrypted emergency contacts during active trip window', () => {
      const activeTime = new Date('2026-06-01T12:00:00Z');
      const res = getEmergencyContacts(tripId, ORGANIZER_ID, activeTime);

      assert.equal(res.success, true);
      if (!res.success) return;
      assert.equal(res.data.length, 2); // Organizer + Hiker 1

      const hiker1Contact = res.data.find((c) => c.hikerId === HIKER_1_ID);
      assert.ok(hiker1Contact);
      assert.equal(hiker1Contact.emergencyContactDecrypted, 'Bob Walker (Father): 555-0101');
    });

    it('locks emergency contacts outside active trip window with EMERGENCY_CONTACT_LOCKED', () => {
      // 30 hours before trip start
      const earlyTime = new Date(startTimeDate.getTime() - 30 * 60 * 60 * 1000);
      const earlyRes = getEmergencyContacts(tripId, ORGANIZER_ID, earlyTime);

      assert.equal(earlyRes.success, false);
      if (!earlyRes.success) {
        assert.equal(earlyRes.error.code, 'EMERGENCY_CONTACT_LOCKED');
      }

      // 20 hours after trip end
      const lateTime = new Date(endTimeDate.getTime() + 20 * 60 * 60 * 1000);
      const lateRes = getEmergencyContacts(tripId, ORGANIZER_ID, lateTime);

      assert.equal(lateRes.success, false);
      if (!lateRes.success) {
        assert.equal(lateRes.error.code, 'EMERGENCY_CONTACT_LOCKED');
      }
    });

    it('denies access to non-approved hikers with FORBIDDEN', () => {
      const activeTime = new Date('2026-06-01T12:00:00Z');
      const res = getEmergencyContacts(tripId, HIKER_2_ID, activeTime);

      assert.equal(res.success, false);
      if (!res.success) {
        assert.equal(res.error.code, 'FORBIDDEN');
      }
    });
  });
});
