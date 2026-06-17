import { businessClient } from './businessClient';
import type { OsiEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface CreateOsiEventRequest {
  eventTypeId: number;
  text: string;
  capturedAtLocal?: string;
  geoLat?: number;
  geoLng?: number;
  externalPartyName?: string;
  externalPartyDocument?: string;
  attachments?: Array<{
    filename: string;
    uri: string;
    mimeType?: string;
    fileSizeBytes?: number;
  }>;
}

export interface CreateCorrectiveEventRequest {
  eventTypeId: number;
  text: string;
  correctionReason: string;
}

export const osiEventsService = {
  list: async (osiId: number, vehicleId: number): Promise<OsiEvent[]> => {
    const { data } = await businessClient.get<OsiEvent[]>(
      `/operations/osi/${osiId}/vehicles/${vehicleId}/events`,
    );
    return data;
  },

  create: async (
    osiId: number,
    vehicleId: number,
    request: CreateOsiEventRequest,
  ): Promise<OsiEvent> => {
    const { data } = await businessClient.post<OsiEvent>(
      `/operations/osi/${osiId}/vehicles/${vehicleId}/events`,
      request,
      { headers: { 'Idempotency-Key': uuidv4() } },
    );
    return data;
  },

  createCorrective: async (
    osiId: number,
    vehicleId: number,
    parentEventId: number,
    request: CreateCorrectiveEventRequest,
  ): Promise<OsiEvent> => {
    const { data } = await businessClient.post<OsiEvent>(
      `/operations/osi/${osiId}/vehicles/${vehicleId}/events/${parentEventId}/correct`,
      request,
    );
    return data;
  },

  approve: async (
    osiId: number,
    vehicleId: number,
    eventId: number,
  ): Promise<OsiEvent> => {
    const { data } = await businessClient.post<OsiEvent>(
      `/operations/osi/${osiId}/vehicles/${vehicleId}/events/${eventId}/approve`,
    );
    return data;
  },

  addComment: async (
    osiId: number,
    vehicleId: number,
    eventId: number,
    text: string,
  ): Promise<OsiEvent> => {
    const { data } = await businessClient.post<OsiEvent>(
      `/operations/osi/${osiId}/vehicles/${vehicleId}/events/${eventId}/comments`,
      { text },
    );
    return data;
  },
};
