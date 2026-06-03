import { describe, expect, it } from 'vitest';
import type { PayrollConfigResponse } from '../../types';
import {
  defaultPayrollConfigFormValues,
  formValuesToPayrollConfigRequest,
  payrollConfigToFormValues,
  toTimeInputValue,
} from '../../utils/payrollConfigForm';

describe('payrollConfigForm', () => {
  it('trims backend time values to HH:MM for time inputs', () => {
    expect(toTimeInputValue('06:00:00')).toBe('06:00');
    expect(toTimeInputValue('21:30')).toBe('21:30');
  });

  it('maps API response to editable form values', () => {
    const response: PayrollConfigResponse = {
      year: 2026,
      minimumWage: 1423500,
      transportSubsidy: 200000,
      monthlyWorkHours: 240,
      normalDailyHours: 8,
      maxDailyExtraHours: 2,
      daytimeStart: '06:00:00',
      daytimeEnd: '21:00:00',
      daytimeOtStart: '06:00:00',
      daytimeOtEnd: '21:00:00',
      nightSurchargeStart: '21:00:00',
      nightSurchargeEnd: '06:00:00',
      nocturnalOtStart: '21:00:00',
      nocturnalOtEnd: '06:00:00',
      sundayOtStart: '06:00:00',
      sundayOtEnd: '21:00:00',
      daytimeOtFactor: 1.25,
      nocturnalOtFactor: 1.75,
      nightSurchargeFactor: 1.35,
      sundayHolidayDaytimeOtFactor: 2,
      sundayHolidayNocturnalOtFactor: 2.5,
      sundayHolidayNormalFactor: 1.75,
      nonBillableRestMinutes: 60,
    };

    expect(payrollConfigToFormValues(response)).toEqual(defaultPayrollConfigFormValues());
  });

  it('builds API request payload from form values', () => {
    const request = formValuesToPayrollConfigRequest(defaultPayrollConfigFormValues());

    expect(request.minimumWage).toBe(1423500);
    expect(request.daytimeStart).toBe('06:00');
    expect(request.nonBillableRestMinutes).toBe(60);
  });
});
