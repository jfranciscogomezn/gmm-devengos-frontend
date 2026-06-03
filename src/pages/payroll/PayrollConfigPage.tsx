import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
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
  const startKey = `${prefix}Start` as keyof PayrollConfigFormValues;
  const endKey = `${prefix}End` as keyof PayrollConfigFormValues;

  return (
    <Row className="g-3 mb-2">
      <Col xs={12}>
        <span className="text-muted small fw-semibold">{label}</span>
      </Col>
      <Col md={6}>
        <Form.Group controlId={`${prefix}-start`}>
          <Form.Label className="small mb-1">Start</Form.Label>
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
          <Form.Label className="small mb-1">End</Form.Label>
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

export function PayrollConfigPage() {
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
      setSaveMessage(`Payroll configuration saved for ${year}.`);
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
        <h4 className="mb-0">Payroll Configuration</h4>
        <Form.Group controlId="payroll-year" className="mb-0">
          <Form.Label className="me-2 mb-0">Year</Form.Label>
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
        <Alert variant="info">
          No payroll configuration exists for {year} yet. Review the defaults below and save to create it.
        </Alert>
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
              <Card.Header>Salary &amp; subsidies</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="minimum-wage">
                      <Form.Label>Minimum wage (monthly)</Form.Label>
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
                      <Form.Label>Transport subsidy (monthly)</Form.Label>
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
              <Card.Header>Work-hour limits</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group controlId="monthly-work-hours">
                      <Form.Label>Monthly work hours</Form.Label>
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
                      <Form.Label>Normal daily hours</Form.Label>
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
                      <Form.Label>Max daily extra hours</Form.Label>
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
              <Card.Header>Surcharge factors</Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {([
                    ['daytimeOtFactor', 'Daytime overtime'],
                    ['nocturnalOtFactor', 'Nocturnal overtime'],
                    ['nightSurchargeFactor', 'Night surcharge'],
                    ['sundayHolidayDaytimeOtFactor', 'Sunday/holiday daytime OT'],
                    ['sundayHolidayNocturnalOtFactor', 'Sunday/holiday nocturnal OT'],
                    ['sundayHolidayNormalFactor', 'Sunday/holiday normal'],
                  ] as const).map(([field, label]) => (
                    <Col md={6} key={field}>
                      <Form.Group controlId={field}>
                        <Form.Label>{label}</Form.Label>
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
              <Card.Header>Time boundaries</Card.Header>
              <Card.Body>
                <TimeRangeFields prefix="daytime" label="Normal shift" values={formValues} onChange={updateField} />
                <TimeRangeFields prefix="daytimeOt" label="Daytime overtime" values={formValues} onChange={updateField} />
                <TimeRangeFields prefix="nightSurcharge" label="Night surcharge" values={formValues} onChange={updateField} />
                <TimeRangeFields prefix="nocturnalOt" label="Nocturnal overtime" values={formValues} onChange={updateField} />
                <TimeRangeFields prefix="sundayOt" label="Sunday / holiday overtime" values={formValues} onChange={updateField} />
              </Card.Body>
            </Card>

            <Card className="mt-4">
              <Card.Header>Rest deduction</Card.Header>
              <Card.Body>
                <Form.Group controlId="non-billable-rest-minutes">
                  <Form.Label>Non-billable rest minutes (per day)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="1"
                    value={formValues.nonBillableRestMinutes}
                    onChange={(event) => updateField('nonBillableRestMinutes', event.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    Deducted from worked time before earnings classification.
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="mt-4">
          <Button type="submit" variant="primary" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : isNewConfig ? 'Create configuration' : 'Save configuration'}
          </Button>
        </div>
      </Form>

      <Card className="mt-5">
        <Card.Header>Holiday calendar ({year})</Card.Header>
        <Card.Body>
          {holidayError && <Alert variant="danger">{holidayError}</Alert>}

          <Form
            className="mb-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!holidayDate) {
                setHolidayError('Select a holiday date.');
                return;
              }
              createHolidayMutation.mutate();
            }}
          >
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group controlId="holiday-date">
                  <Form.Label>Date</Form.Label>
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
                  <Form.Label>Description (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={150}
                    value={holidayDescription}
                    onChange={(event) => setHolidayDescription(event.target.value)}
                    placeholder="e.g. Independence Day"
                  />
                </Form.Group>
              </Col>
              <Col md="auto">
                <Button
                  type="submit"
                  variant="outline-primary"
                  disabled={createHolidayMutation.isPending}
                >
                  {createHolidayMutation.isPending ? 'Adding…' : 'Add holiday'}
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
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th style={{ width: '7rem' }} />
                </tr>
              </thead>
              <tbody>
                {holidays.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      No holidays configured for {year}.
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
                          Remove
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
