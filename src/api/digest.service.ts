import { businessClient } from './businessClient';

export const digestService = {
  getDigest: async (osiId: number): Promise<string> => {
    const { data } = await businessClient.get<string>(`/operations/osi/${osiId}/digest`, {
      headers: { Accept: 'text/plain' },
      responseType: 'text',
    });
    return data;
  },
};
