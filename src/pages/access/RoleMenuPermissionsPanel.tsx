import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { menuService } from '../../api/menu.service';
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

interface RoleMenuPermissionsPanelProps {
  roleId: number;
  roleName?: string;
  onSaved?: () => void;
}

export function RoleMenuPermissionsPanel({ roleId, roleName, onSaved }: RoleMenuPermissionsPanelProps) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [serverError, setServerError] = useState('');

  const { data: catalogue = [], isLoading: catalogueLoading } = useQuery({
    queryKey: ['menu-catalogue'],
    queryFn: menuService.getCatalogue,
  });

  const { data: assignedNodes = [], isLoading: assignedLoading } = useQuery({
    queryKey: ['roles', roleId, 'menu-nodes'],
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
      onSaved?.();
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

  if (catalogueLoading || assignedLoading) {
    return <div className="text-center py-4"><Spinner /></div>;
  }

  return (
    <div>
      {serverError && <Alert variant="danger" className="py-2">{serverError}</Alert>}
      <p className="text-muted small mb-3">
        Select which screens {roleName ? `the ${roleName} role` : 'this role'} can access.
        Only leaf items grant permissions.
      </p>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          setServerError('');
          mutation.mutate();
        }}
      >
        <MenuTreeAssign
          nodes={catalogue}
          selected={selected}
          idByCode={idByCode}
          onToggle={toggle}
          onToggleModule={toggleModule}
        />
        <div className="d-flex gap-2 mt-3">
          <Button type="submit" variant="primary" disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner as="span" size="sm" className="me-2" /> : null}
            Save Permissions
          </Button>
        </div>
      </Form>
    </div>
  );
}
