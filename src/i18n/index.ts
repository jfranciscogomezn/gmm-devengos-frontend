import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, getStoredLocale } from './locale';

import esCommon from './locales/es-CO/common.json';
import esAuth from './locales/es-CO/auth.json';
import esMenu from './locales/es-CO/menu.json';
import esDashboard from './locales/es-CO/dashboard.json';
import esErrors from './locales/es-CO/errors.json';
import esTime from './locales/es-CO/time.json';
import esReports from './locales/es-CO/reports.json';
import esPayroll from './locales/es-CO/payroll.json';
import esEmployees from './locales/es-CO/employees.json';
import esAccess from './locales/es-CO/access.json';
import esPlatform from './locales/es-CO/platform.json';
import esProfile from './locales/es-CO/profile.json';

import enCommon from './locales/en-US/common.json';
import enAuth from './locales/en-US/auth.json';
import enMenu from './locales/en-US/menu.json';
import enDashboard from './locales/en-US/dashboard.json';
import enErrors from './locales/en-US/errors.json';
import enTime from './locales/en-US/time.json';
import enReports from './locales/en-US/reports.json';
import enPayroll from './locales/en-US/payroll.json';
import enEmployees from './locales/en-US/employees.json';
import enAccess from './locales/en-US/access.json';
import enPlatform from './locales/en-US/platform.json';
import enProfile from './locales/en-US/profile.json';

void i18n.use(initReactI18next).init({
  resources: {
    'es-CO': {
      common: esCommon,
      auth: esAuth,
      menu: esMenu,
      dashboard: esDashboard,
      errors: esErrors,
      time: esTime,
      reports: esReports,
      payroll: esPayroll,
      employees: esEmployees,
      access: esAccess,
      platform: esPlatform,
      profile: esProfile,
    },
    'en-US': {
      common: enCommon,
      auth: enAuth,
      menu: enMenu,
      dashboard: enDashboard,
      errors: enErrors,
      time: enTime,
      reports: enReports,
      payroll: enPayroll,
      employees: enEmployees,
      access: enAccess,
      platform: enPlatform,
      profile: enProfile,
    },
  },
  lng: getStoredLocale(),
  fallbackLng: DEFAULT_LOCALE === 'es-CO' ? 'en-US' : 'es-CO',
  defaultNS: 'common',
  ns: ['common', 'auth', 'menu', 'dashboard', 'errors', 'time', 'reports', 'payroll', 'employees', 'access', 'platform', 'profile'],
  interpolation: { escapeValue: false },
});

export default i18n;
