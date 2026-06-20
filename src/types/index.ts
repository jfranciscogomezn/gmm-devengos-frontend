export type MenuNodeType = 'MODULE' | 'GROUP' | 'ITEM';

export interface MenuTreeNode {
  id: number | null;
  code: string;
  label: string;
  type: MenuNodeType;
  route: string | null;
  icon: string | null;
  enabled: boolean;
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

export interface CreateMenuNodeRequest {
  code: string;
  label: string;
  nodeType: MenuNodeType;
  route?: string;
  icon?: string;
  parentId?: number | null;
  sortOrder: number;
  enabled: boolean;
}

export interface UpdateMenuNodeRequest {
  label: string;
  route?: string;
  icon?: string;
  sortOrder: number;
  enabled: boolean;
}

export interface MenuNodeAdminResponse {
  id: number;
  code: string;
  label: string;
  nodeType: MenuNodeType;
  route: string | null;
  icon: string | null;
  parentId: number | null;
  sortOrder: number;
  enabled: boolean;
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

export type TimeRecordStatus = 'OPEN' | 'CLOSED' | 'INCOMPLETE';

export interface TimeRecord {
  id: number;
  employeeId: number;
  workDate: string;
  clockIn: string;
  clockOut: string | null;
  status: TimeRecordStatus;
  corrected: boolean;
}

export interface PayrollConfigResponse {
  year: number;
  minimumWage: number;
  transportSubsidy: number;
  monthlyWorkHours: number;
  normalDailyHours: number;
  maxDailyExtraHours: number;
  daytimeStart: string;
  daytimeEnd: string;
  daytimeOtStart: string;
  daytimeOtEnd: string;
  nightSurchargeStart: string;
  nightSurchargeEnd: string;
  nocturnalOtStart: string;
  nocturnalOtEnd: string;
  sundayOtStart: string;
  sundayOtEnd: string;
  daytimeOtFactor: number;
  nocturnalOtFactor: number;
  nightSurchargeFactor: number;
  sundayHolidayDaytimeOtFactor: number;
  sundayHolidayNocturnalOtFactor: number;
  sundayHolidayNormalFactor: number;
  nonBillableRestMinutes: number;
}

export type PayrollConfigRequest = Omit<PayrollConfigResponse, 'year'>;

export interface Holiday {
  id: number;
  date: string;
  description: string | null;
}

export interface CreateHolidayRequest {
  date: string;
  description?: string;
}

// ─── Operations Domain ────────────────────────────────────────────────────────

export type ClientStatus = 'ACTIVE' | 'INACTIVE';
export interface Client {
  id: number;
  name: string;
  taxId: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  internalNotes: string | null;
  status: ClientStatus;
  createdAt: string;
}

export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
export type VehicleType = 'CAMION' | 'TRACTOMULA' | 'FURGON' | 'VAN' | 'OTRO';
export interface Vehicle {
  id: number;
  plate: string;
  type: VehicleType;
  brand: string | null;
  model: string | null;
  year: number | null;
  status: VehicleStatus;
  internalNotes: string | null;
  createdAt: string;
}

export type OsiStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export interface OsiSummary {
  id: number;
  osiNumber: string;
  clientId: number;
  clientName: string;
  origin: string;
  destination: string;
  status: OsiStatus;
  createdAt: string;
  vehicleCount: number;
}

export type OsiVehicleState = 'PLANNED' | 'EN_RUTA' | 'EN_DESTINO' | 'DESCARGANDO' | 'CERRADO_TRACKING' | 'INCIDENTE';
export type HcValidationStatus = 'PENDIENTE' | 'VALIDADO' | 'RECHAZADO';

export interface OsiVehicleAssignment {
  id: number;
  vehicleId: number;
  vehiclePlate: string;
  state: OsiVehicleState;
  assignedUserIds: number[];
  gpsProvider: string | null;
  gpsReferenceUrl: string | null;
  hcValidationStatus: HcValidationStatus;
  hcValidationNotes: string | null;
  hcValidatedByUserId: number | null;
  hcValidatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Client Portal ────────────────────────────────────────────────────────────

export interface TrackingToken {
  id: number;
  osiId: number;
  token: string;
  createdByUserId: number | null;
  createdAt: string;
  revokedAt: string | null;
}

export interface PortalAttachment {
  id: number;
  filename: string;
  uri: string;
  mimeType: string | null;
}

export interface PortalEvent {
  id: number;
  eventTypeName: string;
  text: string;
  capturedAtLocal: string | null;
  receivedAt: string;
  geoLat: number | null;
  geoLng: number | null;
  attachments: PortalAttachment[];
}

export interface PortalOsiData {
  osiNumber: string;
  clientName: string;
  origin: string;
  destination: string;
  aggregatedState: string;
  events: PortalEvent[];
}

// ─── Transport Documents ─────────────────────────────────────────────────────

export type TransportDocumentType = 'PEDIDO' | 'MANIFIESTO' | 'REMISION' | 'OTRO';
export interface OsiTransportDocument {
  id: number;
  osiId: number;
  vehicleId: number;
  type: TransportDocumentType;
  documentNumber: string | null;
  documentDate: string | null;
  adjunctUri: string | null;
  internalNotes: string | null;
  createdAt: string;
}

export interface Osi {
  id: number;
  osiNumber: string;
  clientId: number;
  clientName: string;
  origin: string;
  destination: string;
  loadWindowStart: string | null;
  loadWindowEnd: string | null;
  deliveryWindowStart: string | null;
  deliveryWindowEnd: string | null;
  commercialReference: string | null;
  internalNotes: string | null;
  status: OsiStatus;
  coordinatorUserId: number | null;
  createdAt: string;
  closedAt: string | null;
  assignments: OsiVehicleAssignment[];
}

export type EventDefaultVisibility = 'INTERNO' | 'CLIENTE' | 'CLIENTE_CON_APROBACION';
export type EventVisibility = EventDefaultVisibility | 'PENDIENTE_APROBACION';
export interface EventType {
  id: number;
  name: string;
  description: string | null;
  defaultVisibility: EventDefaultVisibility;
  minAttachments: number;
  maxAttachments: number;
  hasMeasurementForm: boolean;
  active: boolean;
  createdAt: string;
}

export interface OsiEventAttachment {
  id: number;
  filename: string;
  uri: string;
  mimeType: string | null;
  fileSizeBytes: number | null;
  createdAt: string;
}

export interface OsiEvent {
  id: number;
  osiId: number;
  vehicleId: number;
  eventTypeId: number;
  eventTypeName: string;
  authorUserId: number;
  text: string;
  capturedAtLocal: string | null;
  receivedAt: string;
  geoLat: number | null;
  geoLng: number | null;
  effectiveVisibility: EventVisibility;
  parentEventId: number | null;
  correctionReason: string | null;
  idempotencyKey: string;
  externalPartyName: string | null;
  externalPartyDocument: string | null;
  attachments: OsiEventAttachment[];
}
