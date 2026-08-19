import { db } from '../../db/index.ts';
import type {
  HikerProfileDTO,
  UpdateProfileInput,
  SummitLogDTO,
  LogSummitInput,
} from '../../types/dtos.ts';

export function getHikerProfile(hikerId: string): HikerProfileDTO | null {
  const profile = db.hikerProfiles.get(hikerId);
  if (!profile) return null;
  return {
    id: profile.id,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    fitnessAttestation: profile.fitnessAttestation,
    createdAt: profile.createdAt,
  };
}

export function updateHikerProfile(
  hikerId: string,
  input: UpdateProfileInput
): HikerProfileDTO {
  let profile = db.hikerProfiles.get(hikerId);
  const now = new Date().toISOString();

  if (!profile) {
    profile = {
      id: hikerId,
      fullName: input.fullName || 'Anonymous Hiker',
      avatarUrl: input.avatarUrl ?? null,
      bio: input.bio ?? null,
      fitnessAttestation: input.fitnessAttestation ?? null,
      emergencyContactEncrypted: input.emergencyContact ? `enc_${input.emergencyContact}` : null,
      createdAt: now,
      updatedAt: now,
    };
  } else {
    if (input.fullName !== undefined) profile.fullName = input.fullName;
    if (input.avatarUrl !== undefined) profile.avatarUrl = input.avatarUrl;
    if (input.bio !== undefined) profile.bio = input.bio;
    if (input.fitnessAttestation !== undefined) profile.fitnessAttestation = input.fitnessAttestation;
    if (input.emergencyContact !== undefined) {
      profile.emergencyContactEncrypted = input.emergencyContact ? `enc_${input.emergencyContact}` : null;
    }
    profile.updatedAt = now;
  }

  db.hikerProfiles.set(hikerId, profile);

  return {
    id: profile.id,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    fitnessAttestation: profile.fitnessAttestation,
    createdAt: profile.createdAt,
  };
}

export function logSummit(
  hikerId: string,
  input: LogSummitInput
): SummitLogDTO {
  const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  const loggedAt = input.loggedAt || now;

  const summit = db.summits.get(input.summitId);
  const summitName = summit ? summit.name : 'Unknown Peak';

  const logRecord = {
    id,
    hikerId,
    summitId: input.summitId,
    tripId: input.tripId ?? null,
    loggedAt,
    notes: input.notes ?? null,
  };

  db.hikerSummitLogs.set(id, logRecord);

  return {
    id: logRecord.id,
    hikerId: logRecord.hikerId,
    summitId: logRecord.summitId,
    summitName,
    tripId: logRecord.tripId,
    loggedAt: logRecord.loggedAt,
    notes: logRecord.notes,
  };
}

export function getCompletedPeaks(hikerId: string): SummitLogDTO[] {
  const logs: SummitLogDTO[] = [];

  for (const log of db.hikerSummitLogs.values()) {
    if (log.hikerId === hikerId) {
      const summit = db.summits.get(log.summitId);
      logs.push({
        id: log.id,
        hikerId: log.hikerId,
        summitId: log.summitId,
        summitName: summit ? summit.name : 'Unknown Peak',
        tripId: log.tripId,
        loggedAt: log.loggedAt,
        notes: log.notes,
      });
    }
  }

  return logs.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
}
