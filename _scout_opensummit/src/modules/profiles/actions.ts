import type {
  HikerProfileDTO,
  UpdateProfileInput,
  SummitLogDTO,
  LogSummitInput,
  ActionResult
} from '../../types/dtos.ts';
import {
  getHikerProfile,
  updateHikerProfile,
  logSummit,
  getCompletedPeaks
} from './service.ts';

export async function updateProfileInfoAction(
  hikerId: string,
  input: UpdateProfileInput
): Promise<ActionResult<HikerProfileDTO>> {
  try {
    const updated = updateHikerProfile(hikerId, input);
    return { success: true, data: updated };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'UPDATE_PROFILE_FAILED', message: err?.message || 'Failed to update profile' }
    };
  }
}

export async function logSummitAction(
  hikerId: string,
  input: LogSummitInput
): Promise<ActionResult<SummitLogDTO>> {
  try {
    const log = logSummit(hikerId, input);
    return { success: true, data: log };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'LOG_SUMMIT_FAILED', message: err?.message || 'Failed to log summit' }
    };
  }
}

export async function getHikerProfileQuery(
  hikerId: string
): Promise<ActionResult<HikerProfileDTO>> {
  try {
    const profile = getHikerProfile(hikerId);
    if (!profile) {
      return {
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: `Profile for hiker ${hikerId} not found` }
      };
    }
    return { success: true, data: profile };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'GET_PROFILE_FAILED', message: err?.message || 'Failed to get profile' }
    };
  }
}

export async function getHikerSummitLogsQuery(
  hikerId: string
): Promise<ActionResult<SummitLogDTO[]>> {
  try {
    const logs = getCompletedPeaks(hikerId);
    return { success: true, data: logs };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'GET_SUMMIT_LOGS_FAILED', message: err?.message || 'Failed to get summit logs' }
    };
  }
}
