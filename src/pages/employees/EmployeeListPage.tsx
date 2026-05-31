import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Badge, Spinner, Table } from 'react-bootstrap';
import { employeesService } from '../../api/employees.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import { useAuth } from '../../context/AuthContext';
import type { IdType } from '../../types';

const ID_TYPE_LABELS: Record<IdType, string> = {
  CC: 'Citizenship ID (CC)',
  CE: 'Foreign ID (CE)',
  TI: 'Identity Card (TI)',
  PASSPORT: 'Passport',
  NIT: 'Tax ID (NIT)',
};

function formatSalary(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function EmployeeListPage() {
  const { currentUser } = useAuth();
  const { data: employees = [], isLoading, isError, error } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesService.findAll,
  });

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <ApiErrorAlert
        error={error}
        resourceLabel="employees"
        roleName={currentUser?.roleName}
      />
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Employee Configuration</h4>
        <Link to="/admin/employees/new" className="btn btn-primary btn-sm">+ New Employee</Link>
      </div>

      <Table striped hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Document</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Monthly Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.firstName} {employee.lastName}</td>
              <td>
                <Badge bg="secondary" className="me-1">{employee.idType}</Badge>
                {employee.idNumber}
              </td>
              <td className="text-muted">{employee.email}</td>
              <td>{employee.phone ?? '—'}</td>
              <td>{formatSalary(employee.monthlySalary)}</td>
              <td>
                <Link
                  to={`/admin/employees/${employee.id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">No employees configured yet.</td>
            </tr>
          )}
        </tbody>
      </Table>

      <p className="text-muted small">
        Document types: {Object.entries(ID_TYPE_LABELS).map(([k, v]) => `${k} = ${v}`).join(' · ')}
      </p>
    </div>
  );
}
