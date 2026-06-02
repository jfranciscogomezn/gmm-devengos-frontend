import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Col,
  Form,
  Modal,
  Nav,
  Row,
  Spinner,
  Tab,
  Table,
} from 'react-bootstrap';
import { employeesService } from '../../api/employees.service';
import {
  timeService,
  type CorrectTimeRecordRequest,
  type CreateTimeRecordRequest,
  type ResolveIncompleteRequest,
} from '../../api/time.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import { TimeRecordStatusBadge } from '../../components/time/TimeRecordStatusBadge';
import { useAuth } from '../../context/AuthContext';
import type { TimeRecord } from '../../types';
import { getApiErrorMessage } from '../../utils/apiError';
import {
  addDays,
  computeDurationMinutes,
  formatDuration,
  formatInstant,
  formatWorkDate,
  fromLocalDateTimeInput,
  startOfMonth,
  toIsoDateString,
  toLocalDateTimeInput,
} from '../../utils/timeFormat';

type AdminModalMode = 'resolve' | 'correct' | 'create' | null;

export function AdminTimeRecordsPage() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const today = toIsoDateString(new Date());
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [fromDate, setFromDate] = useState(toIsoDateString(startOfMonth(new Date())));
  const [toDate, setToDate] = useState(today);
  const [activeTab, setActiveTab] = useState<'records' | 'incomplete'>('records');
  const [modalMode, setModalMode] = useState<AdminModalMode>(null);
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [resolveClockOut, setResolveClockOut] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [correctClockIn, setCorrectClockIn] = useState('');
  const [correctClockOut, setCorrectClockOut] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [createWorkDate, setCreateWorkDate] = useState(today);
  const [createClockIn, setCreateClockIn] = useState('');
  const [createClockOut, setCreateClockOut] = useState('');

  const selectedEmployeeId = employeeId === '' ? null : employeeId;

  const { data: employees = [], isLoading: employeesLoading, isError: employeesError, error: employeesQueryError } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesService.findAll,
  });

  const { data: records = [], isLoading: recordsLoading, isError: recordsError, error: recordsQueryError } = useQuery({
    queryKey: ['time-records', 'admin', selectedEmployeeId, fromDate, toDate],
    queryFn: () =>
      timeService.getByEmployee({
        employeeId: selectedEmployeeId as number,
        from: fromDate,
        to: toDate,
      }),
    enabled: selectedEmployeeId !== null && activeTab === 'records',
  });

  const { data: incompleteRecords = [], isLoading: incompleteLoading, isError: incompleteError, error: incompleteQueryError } = useQuery({
    queryKey: ['time-records', 'incomplete', selectedEmployeeId],
    queryFn: () => timeService.getIncomplete(selectedEmployeeId ?? undefined),
    enabled: activeTab === 'incomplete',
  });

  const invalidateTimeQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['time-records'] });
  };

  const reopenMutation = useMutation({
    mutationFn: timeService.reopen,
    onSuccess: async () => {
      setActionError(null);
      await invalidateTimeQueries();
    },
    onError: (error) => setActionError(getApiErrorMessage(error, 'time record')),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: ResolveIncompleteRequest }) =>
      timeService.resolveIncomplete(id, request),
    onSuccess: async () => {
      setActionError(null);
      closeModal();
      await invalidateTimeQueries();
    },
    onError: (error) => setActionError(getApiErrorMessage(error, 'time record')),
  });

  const correctMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: CorrectTimeRecordRequest }) =>
      timeService.correct(id, request),
    onSuccess: async () => {
      setActionError(null);
      closeModal();
      await invalidateTimeQueries();
    },
    onError: (error) => setActionError(getApiErrorMessage(error, 'time record')),
  });

  const createMutation = useMutation({
    mutationFn: timeService.createRecord,
    onSuccess: async () => {
      setActionError(null);
      closeModal();
      await invalidateTimeQueries();
    },
    onError: (error) => setActionError(getApiErrorMessage(error, 'time record')),
  });

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId),
    [employees, selectedEmployeeId]
  );

  function closeModal() {
    setModalMode(null);
    setSelectedRecord(null);
    setResolveClockOut('');
    setResolveNote('');
    setCorrectClockIn('');
    setCorrectClockOut('');
    setCorrectionReason('');
    setCreateWorkDate(today);
    setCreateClockIn('');
    setCreateClockOut('');
  }

  function openResolveModal(record: TimeRecord) {
    setSelectedRecord(record);
    setResolveClockOut(toLocalDateTimeInput(record.clockIn));
    setResolveNote('');
    setModalMode('resolve');
  }

  function openCorrectModal(record: TimeRecord) {
    setSelectedRecord(record);
    setCorrectClockIn(toLocalDateTimeInput(record.clockIn));
    setCorrectClockOut(record.clockOut ? toLocalDateTimeInput(record.clockOut) : '');
    setCorrectionReason('');
    setModalMode('correct');
  }

  function openCreateModal() {
    if (selectedEmployeeId === null) {
      return;
    }
    setCreateWorkDate(today);
    setCreateClockIn('');
    setCreateClockOut('');
    setCorrectionReason('');
    setModalMode('create');
  }

  function renderActions(record: TimeRecord) {
    return (
      <div className="d-flex flex-wrap gap-1">
        {record.status === 'CLOSED' && (
          <Button
            size="sm"
            variant="outline-warning"
            disabled={reopenMutation.isPending}
            onClick={() => reopenMutation.mutate(record.id)}
          >
            Reopen
          </Button>
        )}
        {record.status === 'INCOMPLETE' && (
          <Button size="sm" variant="outline-danger" onClick={() => openResolveModal(record)}>
            Resolve
          </Button>
        )}
        <Button size="sm" variant="outline-primary" onClick={() => openCorrectModal(record)}>
          Correct
        </Button>
      </div>
    );
  }

  function renderRecordRows(items: TimeRecord[], showActions: boolean) {
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={showActions ? 6 : 5} className="text-center text-muted py-4">
            No records found.
          </td>
        </tr>
      );
    }

    return items.map((record) => {
      const durationMinutes = computeDurationMinutes(record.clockIn, record.clockOut);
      return (
        <tr key={record.id}>
          <td>{formatWorkDate(record.workDate)}</td>
          <td>{formatInstant(record.clockIn)}</td>
          <td>{record.clockOut ? formatInstant(record.clockOut) : '—'}</td>
          <td>{durationMinutes !== null ? formatDuration(durationMinutes) : '—'}</td>
          <td>
            <TimeRecordStatusBadge status={record.status} />
            {record.corrected && <span className="badge bg-secondary ms-2">Corrected</span>}
          </td>
          {showActions && <td>{renderActions(record)}</td>}
        </tr>
      );
    });
  }

  if (employeesLoading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  if (employeesError) {
    return (
      <ApiErrorAlert error={employeesQueryError} resourceLabel="employees" roleName={currentUser?.roleName} />
    );
  }

  const isMutating =
    reopenMutation.isPending ||
    resolveMutation.isPending ||
    correctMutation.isPending ||
    createMutation.isPending;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Time Records</h4>
        <Button
          size="sm"
          variant="primary"
          disabled={selectedEmployeeId === null}
          onClick={openCreateModal}
        >
          + Create record
        </Button>
      </div>

      {actionError && <Alert variant="danger">{actionError}</Alert>}

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Form.Group controlId="admin-time-employee">
            <Form.Label>Employee</Form.Label>
            <Form.Select
              value={employeeId}
              onChange={(event) => {
                const value = event.target.value;
                setEmployeeId(value === '' ? '' : Number(value));
              }}
            >
              <option value="">All employees (incomplete tab) / Select for records</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.email})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        {activeTab === 'records' && (
          <>
            <Col md={3}>
              <Form.Group controlId="admin-time-from">
                <Form.Label>From</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  max={toDate}
                  disabled={selectedEmployeeId === null}
                  onChange={(event) => setFromDate(event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="admin-time-to">
                <Form.Label>To</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  min={fromDate}
                  max={today}
                  disabled={selectedEmployeeId === null}
                  onChange={(event) => setToDate(event.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm w-100"
                disabled={selectedEmployeeId === null}
                onClick={() => {
                  setFromDate(toIsoDateString(addDays(new Date(), -30)));
                  setToDate(today);
                }}
              >
                Last 30 days
              </button>
            </Col>
          </>
        )}
      </Row>

      <Tab.Container activeKey={activeTab} onSelect={(key) => setActiveTab((key as 'records' | 'incomplete') ?? 'records')}>
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="records">Records</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="incomplete">Incomplete</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="records">
            {selectedEmployeeId === null && (
              <p className="text-muted">Select an employee to view their time records.</p>
            )}
            {selectedEmployeeId !== null && recordsLoading && (
              <div className="text-center py-4"><Spinner /></div>
            )}
            {selectedEmployeeId !== null && recordsError && (
              <ApiErrorAlert error={recordsQueryError} resourceLabel="time records" roleName={currentUser?.roleName} />
            )}
            {selectedEmployeeId !== null && !recordsLoading && !recordsError && (
              <>
                {selectedEmployee && (
                  <p className="text-muted mb-3">
                    Showing records for {selectedEmployee.firstName} {selectedEmployee.lastName}.
                  </p>
                )}
                <Table striped hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>Date</th>
                      <th>Clock in</th>
                      <th>Clock out</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>{renderRecordRows(records, true)}</tbody>
                </Table>
              </>
            )}
          </Tab.Pane>

          <Tab.Pane eventKey="incomplete">
            {incompleteLoading && <div className="text-center py-4"><Spinner /></div>}
            {incompleteError && (
              <ApiErrorAlert error={incompleteQueryError} resourceLabel="incomplete records" roleName={currentUser?.roleName} />
            )}
            {!incompleteLoading && !incompleteError && (
              <Table striped hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>Date</th>
                    <th>Clock in</th>
                    <th>Clock out</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>{renderRecordRows(incompleteRecords, true)}</tbody>
              </Table>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      <Modal show={modalMode === 'resolve'} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Resolve incomplete record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Manual clock-out</Form.Label>
            <Form.Control
              type="datetime-local"
              value={resolveClockOut}
              onChange={(event) => setResolveClockOut(event.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Correction note</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={resolveNote}
              onChange={(event) => setResolveNote(event.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button
            variant="primary"
            disabled={isMutating || !resolveClockOut || !resolveNote.trim() || !selectedRecord}
            onClick={() => {
              if (!selectedRecord) return;
              resolveMutation.mutate({
                id: selectedRecord.id,
                request: {
                  clockOut: fromLocalDateTimeInput(resolveClockOut),
                  note: resolveNote.trim(),
                },
              });
            }}
          >
            Resolve
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modalMode === 'correct'} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Correct time record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Clock-in</Form.Label>
            <Form.Control
              type="datetime-local"
              value={correctClockIn}
              onChange={(event) => setCorrectClockIn(event.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Clock-out</Form.Label>
            <Form.Control
              type="datetime-local"
              value={correctClockOut}
              onChange={(event) => setCorrectClockOut(event.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Correction reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={correctionReason}
              onChange={(event) => setCorrectionReason(event.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button
            variant="primary"
            disabled={isMutating || !correctionReason.trim() || !selectedRecord}
            onClick={() => {
              if (!selectedRecord) return;
              correctMutation.mutate({
                id: selectedRecord.id,
                request: {
                  clockIn: correctClockIn ? fromLocalDateTimeInput(correctClockIn) : undefined,
                  clockOut: correctClockOut ? fromLocalDateTimeInput(correctClockOut) : undefined,
                  correctionReason: correctionReason.trim(),
                },
              });
            }}
          >
            Save correction
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modalMode === 'create'} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create time record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Work date</Form.Label>
            <Form.Control
              type="date"
              value={createWorkDate}
              max={today}
              onChange={(event) => setCreateWorkDate(event.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Clock-in</Form.Label>
            <Form.Control
              type="datetime-local"
              value={createClockIn}
              onChange={(event) => setCreateClockIn(event.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Clock-out</Form.Label>
            <Form.Control
              type="datetime-local"
              value={createClockOut}
              onChange={(event) => setCreateClockOut(event.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={correctionReason}
              onChange={(event) => setCorrectionReason(event.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button
            variant="primary"
            disabled={
              isMutating ||
              selectedEmployeeId === null ||
              !createWorkDate ||
              !createClockIn ||
              !createClockOut ||
              !correctionReason.trim()
            }
            onClick={() => {
              if (selectedEmployeeId === null) return;
              const request: CreateTimeRecordRequest = {
                employeeId: selectedEmployeeId,
                workDate: createWorkDate,
                clockIn: fromLocalDateTimeInput(createClockIn),
                clockOut: fromLocalDateTimeInput(createClockOut),
                correctionReason: correctionReason.trim(),
              };
              createMutation.mutate(request);
            }}
          >
            Create record
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
