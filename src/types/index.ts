export type MenuNodeType = 'MODULE' | 'GROUP' | 'ITEM';

export interface MenuTreeNode {
  id: number | null;
  code: string;
  label: string;
  type: MenuNodeType;
  route: string | null;
  icon: string | null;
  children: MenuTreeNode[];
}

export interface MenuNode {
  id: number;
  code: string;
  label: string;
  route: string;
  sortOrder: number;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  menuNodes?: MenuNode[];
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  roleId?: number;
  roleName: string;
  enabled: boolean;
  mustChangePassword: boolean;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  roleName: string;
  menu: MenuTreeNode[];
  permissions: string[];
  mustChangePassword: boolean;
  tenantSlug: string;
  tenantName: string;
  tenantPlan: string;
}

export type TenantPlan = 'STANDARD' | 'PREMIUM';
export type TenantStatus = 'PROVISIONING' | 'ACTIVE' | 'SUSPENDED';

export interface TenantSummary {
  slug: string;
  name: string;
  plan: string;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  plan: TenantPlan;
  maxUsers: number;
  currentUsers: number;
  status: TenantStatus;
  platform: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  plan: TenantPlan;
  maxUsers?: number;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface UpdateTenantRequest {
  plan?: TenantPlan;
  maxUsers?: number;
  status?: TenantStatus;
}

export interface ProvisionTenantResponse {
  tenant: Tenant;
  adminEmail: string;
  temporaryPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  roleId: number;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
}

export type IdType = 'CC' | 'CE' | 'TI' | 'PASSPORT' | 'NIT';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  idType: IdType;
  idNumber: string;
  email: string;
  phone: string | null;
  monthlySalary: number;
  userId: number | null;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  idType: IdType;
  idNumber: string;
  email: string;
  phone?: string;
  monthlySalary: number;
  userId?: number | null;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  idType: IdType;
  idNumber: string;
  email: string;
  phone?: string;
  monthlySalary: number;
  userId?: number | null;
}
