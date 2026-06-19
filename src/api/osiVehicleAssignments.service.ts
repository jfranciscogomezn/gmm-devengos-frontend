import { businessClient } from './businessClient';
import type { OsiVehicleAssignment } from '../types';

export const osiVehicleAssignmentsService = {
  list: async (osiId: number): Promise<OsiVehicleAssignment[]> => {
    const { data } = await businessClient.get<OsiVehicleAssignment[]>(
      `/operations/osi/${osiId}/vehicles`,
    );
    return data;
  },

  assign: async (
    osiId: number,
    vehicleId: number,
    assignedUserIds?: number[],
  ): Promise<OsiVehicleAssignment> => {
    const { data } = await businessClient.post<OsiVehicleAssignment>(
      `/operations/osi/${osiId}/vehicles`,
      { vehicleId, assignedUserIds: assignedUserIds ?? [] },
    );
    return data;
  },

  transitionState: async (
    osiId: number,
    assignmentId: number,
    targetState: string,
  ): Promise<OsiVehicleAssignment> => {
    const { data } = await businessClient.patch<OsiVehicleAssignment>(
      `/operations/osi/${osiId}/vehicles/${assignmentId}/state`,
      { targetState },
    );
    return data;
  },

  addPersonnel: async (
    osiId: number,
    assignmentId: number,
    userIds: number[],
  ): Promise<OsiVehicleAssignment> => {
    const { data } = await businessClient.post<OsiVehicleAssignment>(
      `/operations/osi/${osiId}/vehicles/${assignmentId}/personnel`,
      { userIds },
    );
    return data;
  },

  updateGps: async (
    osiId: number,
    assignmentId: number,
    gpsProvider: string | null,
    gpsReferenceUrl: string | null,
  ): Promise<OsiVehicleAssignment> => {
    const { data } = await businessClient.patch<OsiVehicleAssignment>(
      `/operations/osi/${osiId}/vehicles/${assignmentId}/gps`,
      { gpsProvider, gpsReferenceUrl },
    );
    return data;
  },
};
