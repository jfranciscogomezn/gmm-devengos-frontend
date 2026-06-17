import { businessClient } from './businessClient';

export interface IncompleteRecordNotificationItem {
  employeeId: number;
  employeeName: string;
  workDate: string;
}

export interface AdminNotification {
  id: number;
  notificationType: string;
  title: string;
  message: string;
  items: IncompleteRecordNotificationItem[];
  createdAt: string;
}

export interface EmployeeNotification {
  id: number;
  notificationType: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const notificationsService = {
  listRecent: async (): Promise<AdminNotification[]> => {
    const { data } = await businessClient.get<AdminNotification[]>('/notifications');
    return data;
  },

  listMine: async (): Promise<EmployeeNotification[]> => {
    const { data } = await businessClient.get<EmployeeNotification[]>('/notifications/my');
    return data;
  },
};
