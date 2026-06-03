import type { ReactNode } from 'react';
import {
  BoxSeam,
  Building,
  Calendar3,
  CashStack,
  Gear,
  GraphUp,
  JournalText,
  Key,
  People,
  Person,
  PersonBadge,
  ShieldLock,
  Speedometer2,
  UiChecksGrid,
} from 'react-bootstrap-icons';

const ITEM_ICON_MAP: Record<string, ReactNode> = {
  ACCESS_CONTROL: <Speedometer2 size={18} />,
  MENU_CATALOGUE: <UiChecksGrid size={18} />,
  ROLE_MANAGEMENT: <Key size={18} />,
  USER_MANAGEMENT: <People size={18} />,
  PAYROLL_CONFIG: <Gear size={18} />,
  EMPLOYEE_CONFIG: <PersonBadge size={18} />,
  TIME_RECORDS_ADMIN: <Calendar3 size={18} />,
  TIME_RECORD_AUDIT: <JournalText size={18} />,
  REPORTS: <GraphUp size={18} />,
  MY_TIME: <Calendar3 size={18} />,
  MY_PROFILE: <Person size={18} />,
  PLATFORM_TENANTS: <Building size={18} />,
};

const MODULE_ICON_MAP: Record<string, ReactNode> = {
  SECURITY: <ShieldLock size={18} />,
  PAYROLL: <CashStack size={18} />,
  TIME_TRACKING: <Calendar3 size={18} />,
  ACCOUNT: <Person size={18} />,
  PLATFORM: <Building size={18} />,
};

export function menuNodeIcon(code: string, type: 'MODULE' | 'GROUP' | 'ITEM'): ReactNode {
  if (type === 'ITEM') {
    return ITEM_ICON_MAP[code] ?? <BoxSeam size={18} />;
  }
  return MODULE_ICON_MAP[code] ?? <BoxSeam size={18} />;
}
