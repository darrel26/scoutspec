import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';
import { GET as getSummitByIdRoute } from '../src/app/api/v1/summits/[id]/route';
import { GET as getSummitGpxRoute } from '../src/app/api/v1/summits/[id]/gpx/route';
import { GET as getSummitsRoute } from '../src/app/api/v1/summits/route';
import { db } from '../src/db/schema';
import {
  exportGpxAction,
  getSummitByIdAction,
  getSummitsAction,
} from '../src/modules/summits/actions';
import {
  circuitBreakerTileFallback,
  exportGpx,
  getSummitById,
  haversineDistance,
  MapTileCircuitBreaker,
  searchSummits,
} from '../src/modules/summits/service';

const sampleSummits = [
  {
    id: 'summit-1',
    name: 'Mount Elbert',
    elevationM: 4401,
    difficultyClass: 'Class 1',
    latitude: 39.1178,
    longitude: -106.4454,
    gpxTrackUrl: 'https://example.com/elbert.gpx',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'summit-2',
    name: 'Longs Peak',
    elevationM: 4346,
    difficultyClass: 'Class 3',
    latitude: 40.255,
    longitude: -105.6151,
    gpxTrackUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'summit-3',
    name: 'Pikes Peak',
    elevationM: 4302,
    difficultyClass: 'Class 1',
    latitude: 38.8405,
    longitude: -105.0442,
    gpxTrackUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'summit-4',
    name: 'Capitol Peak',
    elevationM: 4307,
    difficultyClass: 'Class 4',
    latitude: 39.1503,
    longitude: -106.9631,
    gpxTrackUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'summit-5',
    name: 'Mount Massive',
    elevationM: 4398,
    difficultyClass: 'Class 2',
    latitude: 39.1875,
    longitude: -106.4757,
    gpxTrackUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

describe('Summit Discovery Service', () => {
  beforeEach(() => {
    db.clear();
    for (const summit of sampleSummits) {
      db.summits.set(summit.id, summit);
    }
  });

  describe('Haversine Distance Formula', () => {
    it('calculates 0 km distance for identical coordinates', () => {
      const dist = haversineDistance(39.1178, -106.4454, 39.1178, -106.4454);
      assert.strictEqual(Math.round(dist), 0);
    });

    it('calculates correct distance between Mount Elbert and Mount Massive', () => {
      const dist = haversineDistance(39.1178, -106.4454, 39.1875, -106.4757);
      assert.ok(dist > 7 && dist < 10, `Expected distance ~8km, got ${dist}`);
    });
  });

  describe('searchSummits Filtering & Spatial Query', () => {
    it('returns all summits when no filters are provided', () => {
      const res = searchSummits();
      assert.strictEqual(res.total, 5);
      assert.strictEqual(res.summits.length, 5);
    });

    it('filters by text search q (case insensitive)', () => {
      const res = searchSummits({ q: 'massive' });
      assert.strictEqual(res.total, 1);
      assert.strictEqual(res.summits[0].name, 'Mount Massive');
    });

    it('filters by elevation range (minElevation & maxElevation)', () => {
      const res = searchSummits({ minElevation: 4350 });
      assert.strictEqual(res.total, 2);
      const names = res.summits.map((s) => s.name);
      assert.ok(names.includes('Mount Elbert'));
      assert.ok(names.includes('Mount Massive'));

      const res2 = searchSummits({ maxElevation: 4310 });
      assert.strictEqual(res2.total, 2);
      const names2 = res2.summits.map((s) => s.name);
      assert.ok(names2.includes('Pikes Peak'));
      assert.ok(names2.includes('Capitol Peak'));
    });

    it('filters by difficulty class', () => {
      const res = searchSummits({ difficulty: 'Class 3' });
      assert.strictEqual(res.total, 1);
      assert.strictEqual(res.summits[0].name, 'Longs Peak');
    });

    it('filters by spatial radius and sorts by distance ascending', () => {
      const res = searchSummits({
        nearLat: 39.1178,
        nearLng: -106.4454,
        radiusKm: 20,
      });
      assert.strictEqual(res.total, 2);
      assert.strictEqual(res.summits[0].name, 'Mount Elbert'); // 0 km
      assert.strictEqual(res.summits[1].name, 'Mount Massive'); // ~8 km
    });

    it('supports pagination limit and offset', () => {
      const page1 = searchSummits({ limit: 2, offset: 0 });
      assert.strictEqual(page1.summits.length, 2);
      assert.strictEqual(page1.total, 5);

      const page2 = searchSummits({ limit: 2, offset: 2 });
      assert.strictEqual(page2.summits.length, 2);
      assert.notStrictEqual(page1.summits[0].id, page2.summits[0].id);
    });
  });

  describe('getSummitById & exportGpx', () => {
    it('returns summit by id', () => {
      const s = getSummitById('summit-1');
      assert.ok(s);
      assert.strictEqual(s.name, 'Mount Elbert');
    });

    it('returns null for non-existent summit id', () => {
      const s = getSummitById('non-existent');
      assert.strictEqual(s, null);
    });

    it('exports GPX XML for valid summit', () => {
      const gpx = exportGpx('summit-1');
      assert.ok(gpx);
      assert.ok(gpx.includes('<?xml version="1.0"'));
      assert.ok(gpx.includes('<name>Mount Elbert</name>'));
      assert.ok(gpx.includes('<ele>4401</ele>'));
    });

    it('returns null when exporting GPX for non-existent summit', () => {
      const gpx = exportGpx('non-existent');
      assert.strictEqual(gpx, null);
    });
  });

  describe('Server Actions', () => {
    it('getSummitsAction returns success result', async () => {
      const result = await getSummitsAction({ q: 'Elbert' });
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.length, 1);
        assert.strictEqual(result.data[0].name, 'Mount Elbert');
      }
    });

    it('getSummitByIdAction handles found and not found', async () => {
      const res1 = await getSummitByIdAction('summit-1');
      assert.strictEqual(res1.success, true);

      const res2 = await getSummitByIdAction('invalid');
      assert.strictEqual(res2.success, false);
      if (!res2.success) {
        assert.strictEqual(res2.error.code, 'NOT_FOUND');
      }
    });

    it('exportGpxAction handles found and not found', async () => {
      const res1 = await exportGpxAction('summit-1');
      assert.strictEqual(res1.success, true);
      if (res1.success) {
        assert.ok(res1.data.includes('<gpx'));
      }

      const res2 = await exportGpxAction('invalid');
      assert.strictEqual(res2.success, false);
      if (!res2.success) {
        assert.strictEqual(res2.error.code, 'NOT_FOUND');
      }
    });
  });

  describe('Route Handlers', () => {
    it('GET /api/v1/summits returns envelope with filtered summits', async () => {
      const req = new Request(
        'http://localhost:3000/api/v1/summits?min_elevation=4350'
      );
      const res = await getSummitsRoute(req);
      const body = await res.json();

      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.length, 2);
      assert.strictEqual(body.meta.total, 2);
    });

    it('GET /api/v1/summits/[id] returns summit details or 404', async () => {
      const req1 = new Request('http://localhost:3000/api/v1/summits/summit-1');
      const res1 = await getSummitByIdRoute(req1, {
        params: { id: 'summit-1' },
      });
      const body1 = await res1.json();

      assert.strictEqual(res1.status, 200);
      assert.strictEqual(body1.success, true);
      assert.strictEqual(body1.data.name, 'Mount Elbert');

      const req2 = new Request('http://localhost:3000/api/v1/summits/missing');
      const res2 = await getSummitByIdRoute(req2, {
        params: { id: 'missing' },
      });
      const body2 = await res2.json();

      assert.strictEqual(res2.status, 404);
      assert.strictEqual(body2.success, false);
      assert.strictEqual(body2.error.code, 'NOT_FOUND');
    });

    it('GET /api/v1/summits/[id]/gpx returns GPX download file', async () => {
      const req = new Request(
        'http://localhost:3000/api/v1/summits/summit-1/gpx'
      );
      const res = await getSummitGpxRoute(req, {
        params: { id: 'summit-1' },
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(
        res.headers.get('Content-Type'),
        'application/gpx+xml'
      );
      const content = await res.text();
      assert.ok(content.includes('<gpx'));
    });
  });

  describe('Map Tile Circuit Breaker Fallback', () => {
    it('circuitBreakerTileFallback returns primary tile when successful', async () => {
      const result = await circuitBreakerTileFallback(async () => {
        return 'https://vector.tiles.com/10/100/200.pbf';
      });

      assert.strictEqual(result.isDegraded, false);
      assert.strictEqual(result.tileUrl, 'https://vector.tiles.com/10/100/200.pbf');
    });

    it('circuitBreakerTileFallback returns raster tile fallback on primary error', async () => {
      const result = await circuitBreakerTileFallback(async () => {
        throw new Error('Vector tile server 503');
      });

      assert.strictEqual(result.isDegraded, true);
      assert.strictEqual(
        result.tileUrl,
        'https://tile.openstreetmap.org/0/0/0.png'
      );
      assert.ok(result.statusNotice);
    });

    it('MapTileCircuitBreaker transitions state and returns raster tiles when open', async () => {
      const cb = new MapTileCircuitBreaker({ failureThreshold: 2 });
      assert.strictEqual(cb.getState(), 'CLOSED');

      // Fail 1
      await cb.getTileUrl(10, 100, 200, async () => {
        throw new Error('500 Internal Error');
      });
      assert.strictEqual(cb.getState(), 'CLOSED');

      // Fail 2 -> Trips open
      await cb.getTileUrl(10, 100, 200, async () => {
        throw new Error('500 Internal Error');
      });
      assert.strictEqual(cb.getState(), 'OPEN');

      // In OPEN state, immediately returns raster fallback without calling primary
      let called = false;
      const res = await cb.getTileUrl(10, 100, 200, async () => {
        called = true;
        return 'http://vector.com';
      });

      assert.strictEqual(called, false);
      assert.strictEqual(res.isDegraded, true);
      assert.strictEqual(
        res.tileUrl,
        'https://tile.openstreetmap.org/10/100/200.png'
      );
    });
  });
});
