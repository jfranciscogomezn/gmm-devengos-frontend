import { businessClient } from './businessClient';
import type { OsiTransportDocument, TransportDocumentType } from '../types';

export interface CreateTransportDocumentRequest {
  type: TransportDocumentType;
  documentNumber?: string;
  documentDate?: string;
  adjunctUri?: string;
  internalNotes?: string;
}

export const osiTransportDocumentsService = {
  findByAssignment: async (
    osiId: number,
    vehicleId: number,
  ): Promise<OsiTransportDocument[]> => {
    const { data } = await businessClient.get<OsiTransportDocument[]>(
      `/operations/osi/${osiId}/vehicles/${vehicleId}/documents`,
    );
    return data;
  },

  create: async (
    osiId: number,
    vehicleId: number,
    request: CreateTransportDocumentRequest,
  ): Promise<OsiTransportDocument> => {
    const { data } = await businessClient.post<OsiTransportDocument>(
      `/operations/osi/${osiId}/vehicles/${vehicleId}/documents`,
      request,
    );
    return data;
  },
};
