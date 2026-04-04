import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { rolesService } from '../../api/roles.service';
import type { MenuOption } from '../../types';

export function MenuOptionAssignPage() {
  const { id } = useParams<{ id: string }>();
  const roleId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [serverError, setServerError] = useState('');

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ['roles', id],
    queryFn: () => rolesService.findById(roleId),
  });

  const { data: allOptions = [], isLoading: optLoading } = useQuery({
    queryKey: ['menu-options'],
    queryFn: async (): Promise<MenuOption[]> => {
      const allRoles = await rolesService.findAll();
      const seen = new Map<number, MenuOption>();
      for (const r of allRoles) {
        for (const opt of r.menuOptions ?? []) seen.set(opt.id, opt);
      }
      return [...seen.values()].sort((a, b) => a.sortOrder - b.sortOrder);
    },
  });

  useEffect(() => {
    if (role?.menuOptions) {
      setSelected(new Set(role.menuOptions.map((o) => o.id)));
    }
  }, [role]);

  const mutation = useMutation({
    mutationFn: () => rolesService.assignMenuOptions(roleId, [...selected]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/admin/roles');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setServerError(err.response?.data?.message ?? 'Failed to assign menu options.');
    },
  });

  const toggle = (optId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(optId)) next.delete(optId); else next.add(optId);
      return next;
    });
  };

  if (roleLoading || optLoading) return <div className="text-center py-5"><Spinner /></div>;

  return (
    <div style={{ maxWidth: 540 }}>
      <h4 className="mb-4">Menu Options — {role?.name}</h4>
      <Card>
        <Card.Body>
          {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}
          <p className="text-muted small mb-3">
            Select which menu items this role can access.
          </p>
          <Form onSubmit={(e) => { e.preventDefault(); setServerError(''); mutation.mutate(); }}>
            {allOptions.map((opt) => (
              <Form.Check
                key={opt.id}
                type="checkbox"
                id={`opt-${opt.id}`}
                label={`${opt.label} (${opt.route})`}
                checked={selected.has(opt.id)}
                onChange={() => toggle(opt.id)}
                className="mb-2"
              />
            ))}
            {allOptions.length === 0 && (
              <p className="text-muted">No menu options available.</p>
            )}
            <div className="d-flex gap-2 mt-3">
              <Button type="submit" variant="primary" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner as="span" size="sm" className="me-2" /> : null}
                Save Assignment
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/roles')}>Cancel</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
