import test from 'node:test';
import assert from 'node:assert';
import { db } from '../src/db/index.ts';
import { createHubAction, joinHubAction, linkTripToHubAction, getHubDetailQuery } from '../src/modules/hubs/actions.ts';
import { createHub, joinHub, linkTripToHub, getHubDetail } from '../src/modules/hubs/service.ts';

test('Community Hubs & Trip Board Tests', async (t) => {
  t.beforeEach(() => {
    db.clear();
  });

  await t.test('create hub succeeds and assigns owner role', async () => {
    const res = await createHubAction('user_1', {
      name: 'PNW Peak Baggers',
      slug: 'pnw-peak-baggers',
      description: 'Regional outdoor group in the Pacific Northwest',
    });

    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.data.name, 'PNW Peak Baggers');
      assert.strictEqual(res.data.slug, 'pnw-peak-baggers');
      assert.strictEqual(res.data.ownerId, 'user_1');
      assert.strictEqual(res.data.memberCount, 1);

      const members = Array.from(db.communityMembers.values()).filter(m => m.hubId === res.data.id);
      assert.strictEqual(members.length, 1);
      assert.strictEqual(members[0].hikerId, 'user_1');
      assert.strictEqual(members[0].role, 'owner');
    }
  });

  await t.test('duplicate slug is rejected with HUB_SLUG_TAKEN', async () => {
    await createHub('user_1', {
      name: 'PNW Peak Baggers',
      slug: 'pnw-peak-baggers',
    });

    const res = await createHubAction('user_2', {
      name: 'Another PNW Club',
      slug: 'pnw-peak-baggers',
    });

    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.strictEqual(res.error.code, 'HUB_SLUG_TAKEN');
    }
  });

  await t.test('joining a hub updates membership', async () => {
    const hub = await createHub('owner_1', {
      name: 'Alpine Ascents',
      slug: 'alpine-ascents',
    });

    const joinRes = await joinHubAction('hiker_2', { hubId: hub.id });
    assert.strictEqual(joinRes.success, true);
    if (joinRes.success) {
      assert.strictEqual(joinRes.data.hubId, hub.id);
      assert.strictEqual(joinRes.data.hikerId, 'hiker_2');
      assert.strictEqual(joinRes.data.role, 'member');
    }

    const detailRes = await getHubDetailQuery(hub.slug);
    assert.strictEqual(detailRes.success, true);
    if (detailRes.success) {
      assert.strictEqual(detailRes.data.memberCount, 2);
    }
  });

  await t.test('linking trip to hub allows display on hub trip board', async () => {
    const hub = await createHub('admin_1', {
      name: 'Cascade Climbers',
      slug: 'cascade-climbers',
    });

    db.summits.set('summit_1', {
      id: 'summit_1',
      name: 'Mt. Rainier',
      elevationM: 4392,
      difficultyClass: 'Class 4',
      latitude: 46.8523,
      longitude: -121.7603,
      createdAt: new Date().toISOString(),
    });

    db.hikerProfiles.set('organizer_1', {
      id: 'organizer_1',
      fullName: 'Alex Honnold',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    db.trips.set('trip_1', {
      id: 'trip_1',
      organizerId: 'organizer_1',
      summitId: 'summit_1',
      title: 'Rainier Summit Climb',
      startTime: '2026-09-01T06:00:00Z',
      capacity: 6,
      requiredGear: '[]',
      status: 'open',
      createdAt: new Date().toISOString(),
    });

    const linkRes = await linkTripToHubAction('organizer_1', {
      hubId: hub.id,
      tripId: 'trip_1',
    });
    assert.strictEqual(linkRes.success, true);

    const detail = await getHubDetail(hub.slug);
    assert.strictEqual(detail.trips.length, 1);
    assert.strictEqual(detail.trips[0].id, 'trip_1');
    assert.strictEqual(detail.trips[0].title, 'Rainier Summit Climb');
    assert.strictEqual(detail.trips[0].summitName, 'Mt. Rainier');
    assert.strictEqual(detail.trips[0].organizerName, 'Alex Honnold');
  });

  await t.test('unauthorized user cannot link trip to hub', async () => {
    const hub = await createHub('owner_1', {
      name: 'Solo Hub',
      slug: 'solo-hub',
    });

    db.trips.set('trip_2', {
      id: 'trip_2',
      organizerId: 'organizer_2',
      summitId: 'summit_1',
      title: 'Solo Trip',
      startTime: '2026-09-01T06:00:00Z',
      capacity: 4,
      requiredGear: '[]',
      status: 'open',
      createdAt: new Date().toISOString(),
    });

    const linkRes = await linkTripToHubAction('rando_user', {
      hubId: hub.id,
      tripId: 'trip_2',
    });

    assert.strictEqual(linkRes.success, false);
    if (!linkRes.success) {
      assert.strictEqual(linkRes.error.code, 'FORBIDDEN');
    }
  });
});
