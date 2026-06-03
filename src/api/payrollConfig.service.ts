import axios from 'axios';
import { businessClient } from './businessClient';
import type {
  CreateHolidayRequest,
  Holiday,
  PayrollConfigRequest,
  PayrollConfigResponse,
} from '../types';

export const payrollConfigService = {
  getByYear: async (year: number): Promise<PayrollConfigResponse> => {
    const { data } = await businessClient.get<PayrollConfigResponse>(`/config/payroll/${year}`);
    return data;
  },

  upsert: async (year: number, request: PayrollConfigRequest): Promise<PayrollConfigResponse> => {
    const { data } = await businessClient.put<PayrollConfigResponse>(`/config/payroll/${year}`, request);
    return data;
  },

  listHolidays: async (year: number): Promise<Holiday[]> => {
    const { data } = await businessClient.get<Holiday[]>(`/config/holidays/${year}`);
    return data;
  },

  createHoliday: async (request: CreateHolidayRequest): Promise<Holiday> => {
    const { data } = await businessClient.post<Holiday>('/config/holidays', request);
    return data;
  },

  deleteHoliday: async (id: number): Promise<void> => {
    await businessClient.delete(`/config/holidays/${id}`);
  },

  async getByYearOrNull(year: number): Promise<PayrollConfigResponse | null> {
    try {
      return await this.getByYear(year);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
