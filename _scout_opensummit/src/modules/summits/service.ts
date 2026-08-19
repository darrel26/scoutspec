import { db, SummitTable } from '../../db/schema';
import { SummitDTO, SummitSearchQueryParams } from '../../types/dtos';

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toSummitDTO(s: SummitTable): SummitDTO {
  return {
    id: s.id,
    name: s.name,
    elevationM: s.elevationM,
    difficultyClass: s.difficultyClass as SummitDTO['difficultyClass'],
    latitude: s.latitude,
    longitude: s.longitude,
    gpxTrackUrl: s.gpxTrackUrl ?? null,
    createdAt: s.createdAt,
  };
}

export interface SummitSearchResult {
  summits: SummitDTO[];
  total: number;
  limit: number;
  offset: number;
}

export function searchSummits(
  params: SummitSearchQueryParams = {}
): SummitSearchResult {
  const allSummits = Array.from(db.summits.values()).map(toSummitDTO);

  let filtered = allSummits;

  if (params.q && params.q.trim() !== '') {
    const qLower = params.q.trim().toLowerCase();
    filtered = filtered.filter((s) => s.name.toLowerCase().includes(qLower));
  }

  if (params.minElevation !== undefined && !isNaN(params.minElevation)) {
    filtered = filtered.filter((s) => s.elevationM >= params.minElevation!);
  }

  if (params.maxElevation !== undefined && !isNaN(params.maxElevation)) {
    filtered = filtered.filter((s) => s.elevationM <= params.maxElevation!);
  }

  if (params.difficulty && params.difficulty.trim() !== '') {
    filtered = filtered.filter((s) => s.difficultyClass === params.difficulty);
  }

  if (
    params.nearLat !== undefined &&
    !isNaN(params.nearLat) &&
    params.nearLng !== undefined &&
    !isNaN(params.nearLng)
  ) {
    const radiusKm = params.radiusKm ?? 50;
    const nearLat = params.nearLat;
    const nearLng = params.nearLng;

    const withDistance = filtered
      .map((s) => ({
        summit: s,
        distance: haversineDistance(nearLat, nearLng, s.latitude, s.longitude),
      }))
      .filter((item) => item.distance <= radiusKm);

    withDistance.sort((a, b) => a.distance - b.distance);

    filtered = withDistance.map((item) => item.summit);
  }

  const total = filtered.length;
  const limit = Math.max(1, Math.min(params.limit ?? 20, 100));
  const offset = Math.max(0, params.offset ?? 0);

  const paginated = filtered.slice(offset, offset + limit);

  return {
    summits: paginated,
    total,
    limit,
    offset,
  };
}

export function getSummitById(id: string): SummitDTO | null {
  const summit = db.summits.get(id);
  return summit ? toSummitDTO(summit) : null;
}

export function exportGpx(id: string): string | null {
  const summit = db.summits.get(id);
  if (!summit) return null;

  const name = escapeXml(summit.name);
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Open Summit">
  <wpt lat="${summit.latitude}" lon="${summit.longitude}">
    <name>${name}</name>
    <ele>${summit.elevationM}</ele>
  </wpt>
</gpx>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface TileFetchResult {
  tileUrl: string;
  isDegraded: boolean;
  statusNotice?: string;
}

export class MapTileCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private failureThreshold: number;
  private fallbackUrlTemplate: string;

  constructor(
    options: {
      failureThreshold?: number;
      fallbackUrlTemplate?: string;
    } = {}
  ) {
    this.failureThreshold = options.failureThreshold ?? 3;
    this.fallbackUrlTemplate =
      options.fallbackUrlTemplate ??
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  }

  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  async getTileUrl(
    z: number,
    x: number,
    y: number,
    primaryFetcher?: () => Promise<string>
  ): Promise<TileFetchResult> {
    const fallbackUrl = this.fallbackUrlTemplate
      .replace('{z}', String(z))
      .replace('{x}', String(x))
      .replace('{y}', String(y));

    if (this.state === 'OPEN') {
      return {
        tileUrl: fallbackUrl,
        isDegraded: true,
        statusNotice:
          'Primary vector tile server unavailable. Using raster tile fallback.',
      };
    }

    if (!primaryFetcher) {
      return {
        tileUrl: fallbackUrl,
        isDegraded: true,
        statusNotice: 'No primary tile fetcher configured.',
      };
    }

    try {
      const url = await primaryFetcher();
      this.recordSuccess();
      return { tileUrl: url, isDegraded: false };
    } catch (error) {
      this.recordFailure();
      return {
        tileUrl: fallbackUrl,
        isDegraded: true,
        statusNotice:
          'Primary vector tile server error. Using raster tile fallback.',
      };
    }
  }
}

export async function circuitBreakerTileFallback(
  primaryFetcher: () => Promise<string>,
  fallbackUrl: string = 'https://tile.openstreetmap.org/0/0/0.png'
): Promise<TileFetchResult> {
  try {
    const url = await primaryFetcher();
    return { tileUrl: url, isDegraded: false };
  } catch {
    return {
      tileUrl: fallbackUrl,
      isDegraded: true,
      statusNotice:
        'Primary vector tile server error. Using raster tile fallback.',
    };
  }
}
