export interface MenuOption {
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
  menuOptions?: MenuOption[];
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  roleName: string;
  enabled: boolean;
  mustChangePassword: boolean;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  roleName: string;
  menuOptions: MenuOption[];
  mustChangePassword: boolean;
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
