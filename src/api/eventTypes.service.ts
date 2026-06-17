import { businessClient } from './businessClient';
import type { EventType } from '../types';

export interface CreateEventTypeRequest {
  name: string;
  description?: string;
  defaultVisibility?: string;
  minAttachments?: number;
  maxAttachments?: number;
  hasMeasurementForm?: boolean;
}

export const eventTypesService = {
  findAll: async (activeOnly = false): Promise<EventType[]> => {
    const { data } = await businessClient.get<EventType[]>('/operations/event-types', {
      params: { activeOnly },
    });
    return data;
  },

  create: async (request: CreateEventTypeRequest): Promise<EventType> => {
    const { data } = await businessClient.post<EventType>('/operations/event-types', request);
    return data;
  },

  update: async (
    id: number,
    request: Partial<CreateEventTypeRequest & { active: boolean }>,
  ): Promise<EventType> => {
    const { data } = await businessClient.patch<EventType>(
      `/operations/event-types/${id}`,
      request,
    );
    return data;
  },
};
