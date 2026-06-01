import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { rolesService } from '../../api/roles.service';
import { MenuTreeAssign } from '../../components/MenuTreeAssign/MenuTreeAssign';
import { getApiErrorMessage } from '../../utils/apiError';
import { walkMenuTree } from '../../utils/menuTree';
import type { MenuTreeNode } from '../../types';

function buildIdByCode(nodes: MenuTreeNode[]): Map<string, number> {
  const map = new Map<string, number>();
  walkMenuTree(nodes, (node) => {
    if (node.type === 'ITEM' && node.id != null) {
      map.set(node.code, node.id);
    }
  });
  return map;
}

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

  const { data: catalogue = [], isLoading: catalogueLoading } = useQuery({
    queryKey: ['menu-catalogue'],
    queryFn: rolesService.getMenuCatalogue,
  });

  const { data: assignedNodes = [], isLoading: assignedLoading } = useQuery({
    queryKey: ['roles', id, 'menu-nodes'],
    queryFn: () => rolesService.getAssignedMenuNodes(roleId),
  });

  const idByCode = useMemo(() => buildIdByCode(catalogue), [catalogue]);

  useEffect(() => {
    if (assignedNodes.length > 0) {
      setSelected(new Set(assignedNodes.map((node) => node.id)));
    }
  }, [assignedNodes]);

  const mutation = useMutation({
    mutationFn: () => rolesService.assignMenuNodes(roleId, [...selected]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/admin/roles');
    },
    onError: (err: unknown) => {
      setServerError(getApiErrorMessage(err, 'menu assignment'));
    },
  });

  const toggle = (nodeId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const toggleModule = (itemIds: number[], select: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const itemId of itemIds) {
        if (select) next.add(itemId);
        else next.delete(itemId);
      }
      return next;
    });
  };

  if (roleLoading || catalogueLoading || assignedLoading) {
    return <div className="text-center py-5"><Spinner /></div>;
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h4 className="mb-4">Menu Permissions — {role?.name}</h4>
      <Card>
        <Card.Body>
          {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}
          <p className="text-muted small mb-3">
            Select which screens this role can access. Only leaf items grant permissions.
          </p>
          <Form onSubmit={(e) => { e.preventDefault(); setServerError(''); mutation.mutate(); }}>
            <MenuTreeAssign
              nodes={catalogue}
              selected={selected}
              idByCode={idByCode}
              onToggle={toggle}
              onToggleModule={toggleModule}
            />
            {catalogue.length === 0 && (
              <p className="text-muted">No menu catalogue available.</p>
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
