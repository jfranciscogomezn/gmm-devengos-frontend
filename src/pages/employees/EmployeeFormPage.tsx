import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { employeesService } from '../../api/employees.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import type { CreateEmployeeRequest, IdType, UpdateEmployeeRequest } from '../../types';

const ID_TYPES: IdType[] = ['CC', 'CE', 'TI', 'PASSPORT', 'NIT'];

export function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idType, setIdType] = useState<IdType>('CC');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [userId, setUserId] = useState('');
  const [serverError, setServerError] = useState('');

  const { data: employee, isLoading: employeeLoading, isError: loadError, error: loadQueryError } = useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeesService.findById(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (employee) {
      setFirstName(employee.firstName);
      setLastName(employee.lastName);
      setIdType(employee.idType);
      setIdNumber(employee.idNumber);
      setEmail(employee.email);
      setPhone(employee.phone ?? '');
      setMonthlySalary(String(employee.monthlySalary));
      setUserId(employee.userId != null ? String(employee.userId) : '');
    }
  }, [employee]);

  const mutation = useMutation({
    mutationFn: () => {
      const salary = Number(monthlySalary);
      const linkedUserId = userId.trim() === '' ? null : Number(userId);

      if (isEdit) {
        const req: UpdateEmployeeRequest = {
          firstName,
          lastName,
          idType,
          idNumber,
          email,
          phone: phone || undefined,
          monthlySalary: salary,
          userId: linkedUserId,
        };
        return employeesService.update(Number(id), req);
      }

      const req: CreateEmployeeRequest = {
        firstName,
        lastName,
        idType,
        idNumber,
        email,
        phone: phone || undefined,
        monthlySalary: salary,
        userId: linkedUserId,
      };
      return employeesService.create(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/admin/employees');
    },
    onError: (err: unknown) => {
      setServerError(getApiErrorMessage(err, 'employee'));
    },
  });

  if (isEdit && loadError) {
    return <ApiErrorAlert error={loadQueryError} resourceLabel="employee" />;
  }

  if (isEdit && employeeLoading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const salary = Number(monthlySalary);
    if (!Number.isFinite(salary) || salary <= 0) {
      setServerError('Monthly salary must be greater than zero.');
      return;
    }

    mutation.mutate();
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h4 className="mb-4">{isEdit ? 'Edit Employee' : 'New Employee'}</h4>
      <Card>
        <Card.Body>
          {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    maxLength={100}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col sm={4}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value as IdType)}
                    required
                  >
                    {ID_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={8}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    required
                    maxLength={50}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Monthly Salary (COP) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                min="0.01"
                step="0.01"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Linked User ID</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Optional — security service user id"
              />
              <Form.Text className="text-muted">
                Optional link to a user account in the security service (same tenant).
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner as="span" size="sm" className="me-2" /> : null}
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/employees')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
