import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { payrollConfigService } from '../../api/payrollConfig.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  defaultPayrollConfigFormValues,
  formValuesToPayrollConfigRequest,
  payrollConfigToFormValues,
  type PayrollConfigFormValues,
} from '../../utils/payrollConfigForm';
import { formatWorkDate } from '../../utils/timeFormat';

function currentYear(): number {
  return new Date().getFullYear();
}

function yearOptions(): number[] {
  const year = currentYear();
  return [year - 1, year, year + 1];
}

interface TimeRangeFieldsProps {
  prefix: string;
  label: string;
  values: PayrollConfigFormValues;
  onChange: (field: keyof PayrollConfigFormValues, value: string) => void;
}

function TimeRangeFields({ prefix, label, values, onChange }: TimeRangeFieldsProps) {
  const { t } = useTranslation('payroll');
  const startKey = `${prefix}Start` as keyof PayrollConfigFormValues;
  const endKey = `${prefix}End` as keyof PayrollConfigFormValues;

  return (
    <Row className="g-3 mb-2">
      <Col xs={12}>
        <span className="text-muted small fw-semibold">{label}</span>
      </Col>
      <Col md={6}>
        <Form.Group controlId={`${prefix}-start`}>
          <Form.Label className="small mb-1">{t('timeRange.start')}</Form.Label>
          <Form.Control
            type="time"
            value={values[startKey]}
            onChange={(event) => onChange(startKey, event.target.value)}
            required
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId={`${prefix}-end`}>
          <Form.Label className="small mb-1">{t('timeRange.end')}</Form.Label>
          <Form.Control
            type="time"
            value={values[endKey]}
            onChange={(event) => onChange(endKey, event.target.value)}
            required
          />
        </Form.Group>
      </Col>
    </Row>
  );
}

const SURCHARGE_FIELDS = [
  ['daytimeOtFactor', 'fields.daytimeOvertime'],
  ['nocturnalOtFactor', 'fields.nocturnalOvertime'],
  ['nightSurchargeFactor', 'fields.nightSurcharge'],
  ['sundayHolidayDaytimeOtFactor', 'fields.sundayHolidayDaytimeOt'],
  ['sundayHolidayNocturnalOtFactor', 'fields.sundayHolidayNocturnalOt'],
  ['sundayHolidayNormalFactor', 'fields.sundayHolidayNormal'],
] as const;

const BOUNDARY_RANGES = [
  ['daytime', 'boundaries.normalShift'],
  ['daytimeOt', 'boundaries.daytimeOvertime'],
  ['nightSurcharge', 'boundaries.nightSurcharge'],
  ['nocturnalOt', 'boundaries.nocturnalOvertime'],
  ['sundayOt', 'boundaries.sundayHolidayOvertime'],
] as const;

export function PayrollConfigPage() {
  const { t } = useTranslation(['payroll', 'common']);
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [year, setYear] = useState(currentYear());
  const [formValues, setFormValues] = useState<PayrollConfigFormValues>(defaultPayrollConfigFormValues());
  const [isNewConfig, setIsNewConfig] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayDescription, setHolidayDescription] = useState('');
  const [holidayError, setHolidayError] = useState<string | null>(null);

  const configQuery = useQuery({
    queryKey: ['payroll-config', year],
    queryFn: () => payrollConfigService.getByYearOrNull(year),
  });

  const holidaysQuery = useQuery({
    queryKey: ['holidays', year],
    queryFn: () => payrollConfigService.listHolidays(year),
  });

  useEffect(() => {
    if (configQuery.data) {
      setFormValues(payrollConfigToFormValues(configQuery.data));
      setIsNewConfig(false);
    } else if (configQuery.data === null && !configQuery.isLoading) {
      setFormValues(defaultPayrollConfigFormValues());
      setIsNewConfig(true);
    }
  }, [configQuery.data, configQuery.isLoading]);

  const saveMutation = useMutation({
    mutationFn: () => payrollConfigService.upsert(year, formValuesToPayrollConfigRequest(formValues)),
    onMutate: () => {
      setSaveMessage(null);
      setSaveError(null);
    },
    onSuccess: () => {
      setIsNewConfig(false);
      setSaveMessage(t('payroll:saved', { year }));
      queryClient.invalidateQueries({ queryKey: ['payroll-config', year] });
    },
    onError: (error) => setSaveError(getApiErrorMessage(error, 'payroll configuration')),
  });

  const createHolidayMutation = useMutation({
    mutationFn: () =>
      payrollConfigService.createHoliday({
        date: holidayDate,
        description: holidayDescription.trim() || undefined,
      }),
    onMutate: () => setHolidayError(null),
    onSuccess: () => {
      setHolidayDate('');
      setHolidayDescription('');
      queryClient.invalidateQueries({ queryKey: ['holidays', year] });
    },
    onError: (error) => setHolidayError(getApiErrorMessage(error, 'holiday')),
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: (id: number) => payrollConfigService.deleteHoliday(id),
    onMutate: () => setHolidayError(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays', year] }),
    onError: (error) => setHolidayError(getApiErrorMessage(error, 'holiday')),
  });

  const updateField = (field: keyof PayrollConfigFormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const holidays = holidaysQuery.data ?? [];

  if (configQuery.isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  if (configQuery.isError) {
    return (
      <ApiErrorAlert
        error={configQuery.error}
        resourceLabel="payroll configuration"
        roleName={currentUser?.roleName}
      />
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h4 className="mb-0">{t('payroll:title')}</h4>
        <Form.Group controlId="payroll-year" className="mb-0">
          <Form.Label className="me-2 mb-0">{t('common:labels.year')}</Form.Label>
          <Form.Select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            style={{ width: '8rem', display: 'inline-block' }}
          >
            {yearOptions().map((optionYear) => (
              <option key={optionYear} value={optionYear}>
                {optionYear}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      {isNewConfig && (
        <Alert variant="info">{t('payroll:noConfigSetup', { year })}</Alert>
      )}

      {saveMessage && <Alert variant="success">{saveMessage}</Alert>}
      {saveError && <Alert variant="danger">{saveError}</Alert>}

      <Form
        onSubmit={(event) => {
          event.preventDefault();
          saveMutation.mutate();
        }}
      >
        <Row className="g-4">
          <Col lg={6}>
            <Card>
              <Card.Header>{t('payroll:sections.salary')}</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="minimum-wage">
                      <Form.Label>{t('payroll:fields.minimumWage')}</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="1"
                        value={formValues.minimumWage}
                        onChange={(event) => updateField('minimumWage', event.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="transport-subsidy">
                      <Form.Label>{t('payroll:fields.transportSubsidy')}</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="1"
                        value={formValues.transportSubsidy}
                        onChange={(event) => updateField('transportSubsidy', event.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mt-4">
              <Card.Header>{t('payroll:sections.limits')}</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group controlId="monthly-work-hours">
                      <Form.Label>{t('payroll:fields.monthlyHours')}</Form.Label>
                      <Form.Control
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formValues.monthlyWorkHours}
                        onChange={(event) => updateField('monthlyWorkHours', event.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="normal-daily-hours">
                      <Form.Label>{t('payroll:fields.normalDailyHours')}</Form.Label>
                      <Form.Control
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formValues.normalDailyHours}
                        onChange={(event) => updateField('normalDailyHours', event.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="max-daily-extra-hours">
                      <Form.Label>{t('payroll:fields.maxDailyExtra')}</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={formValues.maxDailyExtraHours}
                        onChange={(event) => updateField('maxDailyExtraHours', event.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mt-4">
              <Card.Header>{t('payroll:sections.surcharges')}</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {SURCHARGE_FIELDS.map(([field, labelKey]) => (
                    <Col md={6} key={field}>
                      <Form.Group controlId={field}>
                        <Form.Label>{t(`payroll:${labelKey}`)}</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          value={formValues[field]}
                          onChange={(event) => updateField(field, event.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <Card.Header>{t('payroll:sections.boundaries')}</Card.Header>
              <Card.Body>
                {BOUNDARY_RANGES.map(([prefix, labelKey]) => (
                  <TimeRangeFields
                    key={prefix}
                    prefix={prefix}
                    label={t(`payroll:${labelKey}`)}
                    values={formValues}
                    onChange={updateField}
                  />
                ))}
              </Card.Body>
            </Card>

            <Card className="mt-4">
              <Card.Header>{t('payroll:sections.rest')}</Card.Header>
              <Card.Body>
                <Form.Group controlId="non-billable-rest-minutes">
                  <Form.Label>{t('payroll:fields.restMinutes')}</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1"
                    value={formValues.nonBillableRestMinutes}
                    onChange={(event) => updateField('nonBillableRestMinutes', event.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">{t('payroll:restHint')}</Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="mt-4">
          <Button type="submit" variant="primary" disabled={saveMutation.isPending}>
            {saveMutation.isPending
              ? t('payroll:saving')
              : isNewConfig
                ? t('payroll:createConfig')
                : t('payroll:saveConfig')}
          </Button>
        </div>
      </Form>

      <Card className="mt-5">
        <Card.Header>{t('payroll:sections.holidays', { year })}</Card.Header>
        <Card.Body>
          {holidayError && <Alert variant="danger">{holidayError}</Alert>}

          <Form
            className="mb-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!holidayDate) {
                setHolidayError(t('payroll:selectHolidayDate'));
                return;
              }
              createHolidayMutation.mutate();
            }}
          >
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group controlId="holiday-date">
                  <Form.Label>{t('payroll:fields.holidayDate')}</Form.Label>
                  <Form.Control
                    type="date"
                    value={holidayDate}
                    min={`${year}-01-01`}
                    max={`${year}-12-31`}
                    onChange={(event) => setHolidayDate(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group controlId="holiday-description">
                  <Form.Label>{t('payroll:fields.holidayDescription')}</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={150}
                    value={holidayDescription}
                    onChange={(event) => setHolidayDescription(event.target.value)}
                    placeholder={t('payroll:fields.holidayPlaceholder')}
                  />
                </Form.Group>
              </Col>
              <Col md="auto">
                <Button
                  type="submit"
                  variant="outline-primary"
                  disabled={createHolidayMutation.isPending}
                >
                  {createHolidayMutation.isPending ? t('payroll:adding') : t('payroll:addHoliday')}
                </Button>
              </Col>
            </Row>
          </Form>

          {holidaysQuery.isLoading ? (
            <div className="text-center py-3"><Spinner size="sm" /></div>
          ) : holidaysQuery.isError ? (
            <ApiErrorAlert
              error={holidaysQuery.error}
              resourceLabel="holidays"
              roleName={currentUser?.roleName}
            />
          ) : (
            <Table striped hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>{t('payroll:fields.holidayDate')}</th>
                  <th>{t('common:labels.description')}</th>
                  <th style={{ width: '7rem' }} />
                </tr>
              </thead>
              <tbody>
                {holidays.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      {t('payroll:noHolidays', { year })}
                    </td>
                  </tr>
                ) : (
                  holidays.map((holiday) => (
                    <tr key={holiday.id}>
                      <td>{formatWorkDate(holiday.date)}</td>
                      <td>{holiday.description ?? '—'}</td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={deleteHolidayMutation.isPending}
                          onClick={() => deleteHolidayMutation.mutate(holiday.id)}
                        >
                          {t('common:actions.remove')}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
