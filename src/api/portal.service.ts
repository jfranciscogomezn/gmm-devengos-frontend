import axios from 'axios';
import type { PortalOsiData } from '../types';

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_BUSINESS_API_URL?.replace('/api/v1', '') ?? 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' },
});

export const portalService = {
  getPortalData: async (token: string): Promise<PortalOsiData> => {
    const { data } = await publicClient.get<PortalOsiData>(`/public/osi/${token}`);
    return data;
  },
};
