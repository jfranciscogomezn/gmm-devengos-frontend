import { Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { ReportPeriodState } from '../../utils/reportPeriod';
import { startOfWeek, toIsoDateString } from '../../utils/timeFormat';

interface ReportPeriodFiltersProps {
  idPrefix: string;
  today: string;
  period: ReportPeriodState;
  onChange: (period: ReportPeriodState) => void;
}

export function ReportPeriodFilters({ idPrefix, today, period, onChange }: ReportPeriodFiltersProps) {
  const { t } = useTranslation(['reports', 'common']);

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
          <Form.Label>{t('reports:period.label')}</Form.Label>
          <Form.Select
            value={period.mode}
            onChange={(event) => setMode(event.target.value as ReportPeriodState['mode'])}
          >
            <option value="month">{t('reports:period.month')}</option>
            <option value="day">{t('reports:period.singleDay')}</option>
            <option value="week">{t('reports:period.week')}</option>
            <option value="range">{t('reports:period.range')}</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {period.mode === 'month' && (
        <Col md={3}>
          <Form.Group controlId={`${idPrefix}-month`}>
            <Form.Label>{t('reports:period.month')}</Form.Label>
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
            <Form.Label>{t('reports:period.day')}</Form.Label>
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
            <Form.Label>{t('reports:period.weekPicker')}</Form.Label>
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
            <Form.Text className="text-muted">
              {t('reports:period.weekHint', { date: period.week })}
            </Form.Text>
          </Form.Group>
        </Col>
      )}

      {period.mode === 'range' && (
        <>
          <Col md={3}>
            <Form.Group controlId={`${idPrefix}-start`}>
              <Form.Label>{t('common:labels.from')}</Form.Label>
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
              <Form.Label>{t('common:labels.to')}</Form.Label>
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
  const { t } = useTranslation('reports');
  const monthStart = `${today.slice(0, 7)}-01`;

  return (
    <Row className="g-2 mb-3">
      <Col xs="auto">
        <Form.Label className="visually-hidden">{t('period.label')}</Form.Label>
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
            {t('period.presets.thisMonth')}
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
            {t('period.presets.thisWeek')}
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
            {t('period.presets.today')}
          </button>
        </div>
      </Col>
    </Row>
  );
}
