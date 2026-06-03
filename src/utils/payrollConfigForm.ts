import type { PayrollConfigRequest, PayrollConfigResponse } from '../types';

export interface PayrollConfigFormValues {
  minimumWage: string;
  transportSubsidy: string;
  monthlyWorkHours: string;
  normalDailyHours: string;
  maxDailyExtraHours: string;
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
  daytimeOtFactor: string;
  nocturnalOtFactor: string;
  nightSurchargeFactor: string;
  sundayHolidayDaytimeOtFactor: string;
  sundayHolidayNocturnalOtFactor: string;
  sundayHolidayNormalFactor: string;
  nonBillableRestMinutes: string;
}

export function toTimeInputValue(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export function defaultPayrollConfigFormValues(): PayrollConfigFormValues {
  return {
    minimumWage: '1423500',
    transportSubsidy: '200000',
    monthlyWorkHours: '240',
    normalDailyHours: '8',
    maxDailyExtraHours: '2',
    daytimeStart: '06:00',
    daytimeEnd: '21:00',
    daytimeOtStart: '06:00',
    daytimeOtEnd: '21:00',
    nightSurchargeStart: '21:00',
    nightSurchargeEnd: '06:00',
    nocturnalOtStart: '21:00',
    nocturnalOtEnd: '06:00',
    sundayOtStart: '06:00',
    sundayOtEnd: '21:00',
    daytimeOtFactor: '1.25',
    nocturnalOtFactor: '1.75',
    nightSurchargeFactor: '1.35',
    sundayHolidayDaytimeOtFactor: '2',
    sundayHolidayNocturnalOtFactor: '2.5',
    sundayHolidayNormalFactor: '1.75',
    nonBillableRestMinutes: '60',
  };
}

export function payrollConfigToFormValues(config: PayrollConfigResponse): PayrollConfigFormValues {
  return {
    minimumWage: String(config.minimumWage),
    transportSubsidy: String(config.transportSubsidy),
    monthlyWorkHours: String(config.monthlyWorkHours),
    normalDailyHours: String(config.normalDailyHours),
    maxDailyExtraHours: String(config.maxDailyExtraHours),
    daytimeStart: toTimeInputValue(config.daytimeStart),
    daytimeEnd: toTimeInputValue(config.daytimeEnd),
    daytimeOtStart: toTimeInputValue(config.daytimeOtStart),
    daytimeOtEnd: toTimeInputValue(config.daytimeOtEnd),
    nightSurchargeStart: toTimeInputValue(config.nightSurchargeStart),
    nightSurchargeEnd: toTimeInputValue(config.nightSurchargeEnd),
    nocturnalOtStart: toTimeInputValue(config.nocturnalOtStart),
    nocturnalOtEnd: toTimeInputValue(config.nocturnalOtEnd),
    sundayOtStart: toTimeInputValue(config.sundayOtStart),
    sundayOtEnd: toTimeInputValue(config.sundayOtEnd),
    daytimeOtFactor: String(config.daytimeOtFactor),
    nocturnalOtFactor: String(config.nocturnalOtFactor),
    nightSurchargeFactor: String(config.nightSurchargeFactor),
    sundayHolidayDaytimeOtFactor: String(config.sundayHolidayDaytimeOtFactor),
    sundayHolidayNocturnalOtFactor: String(config.sundayHolidayNocturnalOtFactor),
    sundayHolidayNormalFactor: String(config.sundayHolidayNormalFactor),
    nonBillableRestMinutes: String(config.nonBillableRestMinutes),
  };
}

export function formValuesToPayrollConfigRequest(values: PayrollConfigFormValues): PayrollConfigRequest {
  return {
    minimumWage: Number(values.minimumWage),
    transportSubsidy: Number(values.transportSubsidy),
    monthlyWorkHours: Number(values.monthlyWorkHours),
    normalDailyHours: Number(values.normalDailyHours),
    maxDailyExtraHours: Number(values.maxDailyExtraHours),
    daytimeStart: values.daytimeStart,
    daytimeEnd: values.daytimeEnd,
    daytimeOtStart: values.daytimeOtStart,
    daytimeOtEnd: values.daytimeOtEnd,
    nightSurchargeStart: values.nightSurchargeStart,
    nightSurchargeEnd: values.nightSurchargeEnd,
    nocturnalOtStart: values.nocturnalOtStart,
    nocturnalOtEnd: values.nocturnalOtEnd,
    sundayOtStart: values.sundayOtStart,
    sundayOtEnd: values.sundayOtEnd,
    daytimeOtFactor: Number(values.daytimeOtFactor),
    nocturnalOtFactor: Number(values.nocturnalOtFactor),
    nightSurchargeFactor: Number(values.nightSurchargeFactor),
    sundayHolidayDaytimeOtFactor: Number(values.sundayHolidayDaytimeOtFactor),
    sundayHolidayNocturnalOtFactor: Number(values.sundayHolidayNocturnalOtFactor),
    sundayHolidayNormalFactor: Number(values.sundayHolidayNormalFactor),
    nonBillableRestMinutes: Number(values.nonBillableRestMinutes),
  };
}
