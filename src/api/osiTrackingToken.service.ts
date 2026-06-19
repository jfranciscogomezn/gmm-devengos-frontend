import { businessClient } from './businessClient';
import type { TrackingToken } from '../types';

export const osiTrackingTokenService = {
  getActive: async (osiId: number): Promise<TrackingToken | null> => {
    try {
      const { data } = await businessClient.get<TrackingToken>(
        `/operations/osi/${osiId}/token`,
      );
      return data;
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  generate: async (osiId: number): Promise<TrackingToken> => {
    const { data } = await businessClient.post<TrackingToken>(
      `/operations/osi/${osiId}/token`,
    );
    return data;
  },

  revoke: async (osiId: number): Promise<void> => {
    await businessClient.delete(`/operations/osi/${osiId}/token`);
  },
};
