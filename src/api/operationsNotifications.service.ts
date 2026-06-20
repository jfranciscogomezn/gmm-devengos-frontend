import { businessClient } from './businessClient';
import type { OsiNotificationItem } from '../types';

export const operationsNotificationsService = {
  listRecent: async (): Promise<OsiNotificationItem[]> => {
    const { data } = await businessClient.get<OsiNotificationItem[]>('/operations/notifications');
    return data;
  },
};
