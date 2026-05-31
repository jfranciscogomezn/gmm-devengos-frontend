import { businessClient } from './businessClient';
import type { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from '../types';

export const employeesService = {
  findAll: async (): Promise<Employee[]> => {
    const { data } = await businessClient.get<Employee[]>('/employees');
    return data;
  },

  findById: async (id: number): Promise<Employee> => {
    const { data } = await businessClient.get<Employee>(`/employees/${id}`);
    return data;
  },

  create: async (request: CreateEmployeeRequest): Promise<Employee> => {
    const { data } = await businessClient.post<Employee>('/employees', request);
    return data;
  },

  update: async (id: number, request: UpdateEmployeeRequest): Promise<Employee> => {
    const { data } = await businessClient.put<Employee>(`/employees/${id}`, request);
    return data;
  },
};
