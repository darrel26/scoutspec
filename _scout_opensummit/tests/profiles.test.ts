import test from 'node:test';
import assert from 'node:assert';
import { db } from '../src/db/index.ts';
import {
  getHikerProfile,
  updateHikerProfile,
  logSummit,
  getCompletedPeaks
} from '../src/modules/profiles/service.ts';
import {
  updateProfileInfoAction,
  logSummitAction,
  getHikerProfileQuery,
  getHikerSummitLogsQuery
} from '../src/modules/profiles/actions.ts';

test('Hiker Profile & Peak Summit Logging', async (t) => {
  db.clear();

  await t.test('create and update profile', () => {
    const hikerId = 'hiker_1';

    // Initial fetch should be null
    const initial = getHikerProfile(hikerId);
    assert.strictEqual(initial, null);

    // Create profile
    const created = updateHikerProfile(hikerId, {
      fullName: 'Alex Honnold',
      bio: 'Free solo climber',
      fitnessAttestation: 'Advanced',
      emergencyContact: 'Contact Info 123'
    });

    assert.strictEqual(created.id, hikerId);
    assert.strictEqual(created.fullName, 'Alex Honnold');
    assert.strictEqual(created.bio, 'Free solo climber');
    assert.strictEqual(created.fitnessAttestation, 'Advanced');

    // Verify DB record encrypted field
    const dbRecord = db.hikerProfiles.get(hikerId);
    assert.strictEqual(dbRecord?.emergencyContactEncrypted, 'enc_Contact Info 123');

    // Update profile
    const updated = updateHikerProfile(hikerId, {
      bio: 'Updated bio'
    });

    assert.strictEqual(updated.fullName, 'Alex Honnold');
    assert.strictEqual(updated.bio, 'Updated bio');
  });

  await t.test('summit logging & peak history calculation', () => {
    const hikerId = 'hiker_1';
    const summit1Id = 'summit_rainier';
    const summit2Id = 'summit_hood';

    // Seed summits
    db.summits.set(summit1Id, {
      id: summit1Id,
      name: 'Mt. Rainier',
      elevationM: 4392,
      difficultyClass: 'Class 3',
      latitude: 46.8523,
      longitude: -121.7603,
      createdAt: new Date().toISOString()
    });

    db.summits.set(summit2Id, {
      id: summit2Id,
      name: 'Mt. Hood',
      elevationM: 3429,
      difficultyClass: 'Class 2',
      latitude: 45.3736,
      longitude: -121.6959,
      createdAt: new Date().toISOString()
    });

    // Log summits
    const log1 = logSummit(hikerId, {
      summitId: summit1Id,
      loggedAt: '2026-06-01T10:00:00Z',
      notes: 'Sunny day climb via Disappointment Cleaver'
    });

    assert.strictEqual(log1.hikerId, hikerId);
    assert.strictEqual(log1.summitId, summit1Id);
    assert.strictEqual(log1.summitName, 'Mt. Rainier');

    const log2 = logSummit(hikerId, {
      summitId: summit2Id,
      loggedAt: '2026-07-15T12:00:00Z',
      notes: 'South Side route'
    });

    assert.strictEqual(log2.summitName, 'Mt. Hood');

    // Fetch completed peaks (should be sorted by date desc)
    const history = getCompletedPeaks(hikerId);
    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0].summitId, summit2Id);
    assert.strictEqual(history[1].summitId, summit1Id);
  });

  await t.test('actions and queries', async () => {
    const hikerId = 'hiker_2';

    // Query non-existent profile
    const notFoundRes = await getHikerProfileQuery(hikerId);
    assert.strictEqual(notFoundRes.success, false);

    // Update via action
    const updateRes = await updateProfileInfoAction(hikerId, {
      fullName: 'John Doe',
      fitnessAttestation: 'Intermediate'
    });

    assert.strictEqual(updateRes.success, true);
    if (updateRes.success) {
      assert.strictEqual(updateRes.data.fullName, 'John Doe');
    }

    // Query profile
    const profileRes = await getHikerProfileQuery(hikerId);
    assert.strictEqual(profileRes.success, true);

    // Log summit action
    const logRes = await logSummitAction(hikerId, {
      summitId: 'summit_rainier',
      notes: 'Great hike'
    });
    assert.strictEqual(logRes.success, true);

    // Query summit logs
    const logsRes = await getHikerSummitLogsQuery(hikerId);
    assert.strictEqual(logsRes.success, true);
    if (logsRes.success) {
      assert.strictEqual(logsRes.data.length, 1);
    }
  });
});
