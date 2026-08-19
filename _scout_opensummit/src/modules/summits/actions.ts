'use server';

import { ActionResult, SummitDTO, SummitSearchQueryParams } from '../../types/dtos';
import { exportGpx, getSummitById, searchSummits } from './service';

export async function getSummitsAction(
  params?: SummitSearchQueryParams
): Promise<ActionResult<SummitDTO[]>> {
  try {
    const result = searchSummits(params);
    return { success: true, data: result.summits };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to fetch summits',
      },
    };
  }
}

export async function getSummitByIdAction(
  id: string
): Promise<ActionResult<SummitDTO>> {
  try {
    const summit = getSummitById(id);
    if (!summit) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Summit with id ${id} not found`,
        },
      };
    }
    return { success: true, data: summit };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to fetch summit',
      },
    };
  }
}

export async function exportGpxAction(
  id: string
): Promise<ActionResult<string>> {
  try {
    const gpx = exportGpx(id);
    if (!gpx) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Summit with id ${id} not found`,
        },
      };
    }
    return { success: true, data: gpx };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to export GPX',
      },
    };
  }
}
