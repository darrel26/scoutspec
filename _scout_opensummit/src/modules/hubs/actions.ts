import type {
  ActionResult,
  CommunityHubDTO,
  CommunityHubDetailDTO,
  CreateHubInput,
  HubMemberDTO,
  JoinHubInput,
  LinkTripToHubInput,
} from '../../types/dtos.ts';
import * as hubService from './service.ts';

export async function createHubAction(
  userId: string,
  input: CreateHubInput
): Promise<ActionResult<CommunityHubDTO>> {
  try {
    const data = await hubService.createHub(userId, input);
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'Failed to create community hub',
      },
    };
  }
}

export async function joinHubAction(
  userId: string,
  input: JoinHubInput
): Promise<ActionResult<HubMemberDTO>> {
  try {
    const data = await hubService.joinHub(userId, input);
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'Failed to join community hub',
      },
    };
  }
}

export async function linkTripToHubAction(
  userId: string,
  input: LinkTripToHubInput
): Promise<ActionResult<{ hubId: string; tripId: string }>> {
  try {
    const data = await hubService.linkTripToHub(userId, input);
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'Failed to link trip to hub',
      },
    };
  }
}

export async function getHubDetailQuery(
  slugOrId: string
): Promise<ActionResult<CommunityHubDetailDTO>> {
  try {
    const data = await hubService.getHubDetail(slugOrId);
    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: err.code || 'NOT_FOUND',
        message: err.message || 'Hub not found',
      },
    };
  }
}
