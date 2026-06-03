import { Col, Form, Row } from 'react-bootstrap';
import type { ReportPeriodState } from '../../utils/reportPeriod';
import { startOfWeek, toIsoDateString } from '../../utils/timeFormat';

interface ReportPeriodFiltersProps {
  idPrefix: string;
  today: string;
  period: ReportPeriodState;
  onChange: (period: ReportPeriodState) => void;
}

export function ReportPeriodFilters({ idPrefix, today, period, onChange }: ReportPeriodFiltersProps) {
  const setMode = (mode: ReportPeriodState['mode']) => {
    onChange({ ...period, mode });
  };

  const update = (patch: Partial<ReportPeriodState>) => {
    onChange({ ...period, ...patch });
  };

  return (
    <>
      <Col md={3}>
        <Form.Group controlId={`${idPrefix}-filter-mode`}>
          <Form.Label>Period</Form.Label>
          <Form.Select
            value={period.mode}
            onChange={(event) => setMode(event.target.value as ReportPeriodState['mode'])}
          >
            <option value="month">Month</option>
            <option value="day">Single day</option>
            <option value="week">Week</option>
            <option value="range">Custom range</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {period.mode === 'month' && (
        <Col md={3}>
          <Form.Group controlId={`${idPrefix}-month`}>
            <Form.Label>Month</Form.Label>
            <Form.Control
              type="month"
              value={period.month}
              onChange={(event) => update({ month: event.target.value })}
            />
          </Form.Group>
        </Col>
      )}

      {period.mode === 'day' && (
        <Col md={3}>
          <Form.Group controlId={`${idPrefix}-day`}>
            <Form.Label>Day</Form.Label>
            <Form.Control
              type="date"
              value={period.day}
              max={today}
              onChange={(event) => update({ day: event.target.value })}
            />
          </Form.Group>
        </Col>
      )}

      {period.mode === 'week' && (
        <Col md={3}>
          <Form.Group controlId={`${idPrefix}-week`}>
            <Form.Label>Week (pick any day)</Form.Label>
            <Form.Control
              type="date"
              value={period.week}
              max={today}
              onChange={(event) => {
                const picked = event.target.value;
                const weekStart = toIsoDateString(startOfWeek(new Date(`${picked}T12:00:00`)));
                update({ week: weekStart });
              }}
            />
            <Form.Text className="text-muted">Week starts {period.week}</Form.Text>
          </Form.Group>
        </Col>
      )}

      {period.mode === 'range' && (
        <>
          <Col md={3}>
            <Form.Group controlId={`${idPrefix}-start`}>
              <Form.Label>From</Form.Label>
              <Form.Control
                type="date"
                value={period.startDate}
                max={period.endDate}
                onChange={(event) => update({ startDate: event.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId={`${idPrefix}-end`}>
              <Form.Label>To</Form.Label>
              <Form.Control
                type="date"
                value={period.endDate}
                min={period.startDate}
                max={today}
                onChange={(event) => update({ endDate: event.target.value })}
              />
            </Form.Group>
          </Col>
        </>
      )}
    </>
  );
}

interface ReportPeriodPresetRowProps {
  today: string;
  onApply: (period: ReportPeriodState) => void;
}

export function ReportPeriodPresets({ today, onApply }: ReportPeriodPresetRowProps) {
  const monthStart = `${today.slice(0, 7)}-01`;

  return (
    <Row className="g-2 mb-3">
      <Col xs="auto">
        <Form.Label className="visually-hidden">Quick presets</Form.Label>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() =>
              onApply({
                mode: 'month',
                month: today.slice(0, 7),
                day: today,
                week: toIsoDateString(startOfWeek(new Date(`${today}T12:00:00`))),
                startDate: monthStart,
                endDate: today,
              })
            }
          >
            This month
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              const weekStart = toIsoDateString(startOfWeek(new Date(`${today}T12:00:00`)));
              onApply({
                mode: 'week',
                month: today.slice(0, 7),
                day: today,
                week: weekStart,
                startDate: monthStart,
                endDate: today,
              });
            }}
          >
            This week
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() =>
              onApply({
                mode: 'day',
                month: today.slice(0, 7),
                day: today,
                week: toIsoDateString(startOfWeek(new Date(`${today}T12:00:00`))),
                startDate: monthStart,
                endDate: today,
              })
            }
          >
            Today
          </button>
        </div>
      </Col>
    </Row>
  );
}
