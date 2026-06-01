import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  Modal,
  Spinner,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { menuService } from '../../api/menu.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import { useAuth } from '../../context/AuthContext';
import type {
  CreateMenuNodeRequest,
  MenuNodeType,
  MenuTreeNode,
  UpdateMenuNodeRequest,
} from '../../types';
import { menuNodeIcon } from '../../utils/menuIcons';
import { getApiErrorMessage } from '../../utils/apiError';
import { walkMenuTree } from '../../utils/menuTree';

interface MenuNodeFormState {
  code: string;
  label: string;
  nodeType: MenuNodeType;
  route: string;
  icon: string;
  parentId: string;
  sortOrder: number;
  enabled: boolean;
}

const emptyForm = (): MenuNodeFormState => ({
  code: '',
  label: '',
  nodeType: 'ITEM',
  route: '',
  icon: '',
  parentId: '',
  sortOrder: 10,
  enabled: true,
});

function flattenNodes(nodes: MenuTreeNode[]): MenuTreeNode[] {
  const flat: MenuTreeNode[] = [];
  walkMenuTree(nodes, (node) => flat.push(node));
  return flat;
}

function CatalogueRow({
  node,
  depth,
  isPlatformAdmin,
  onEdit,
  onDelete,
}: {
  node: MenuTreeNode;
  depth: number;
  isPlatformAdmin: boolean;
  onEdit: (node: MenuTreeNode) => void;
  onDelete: (node: MenuTreeNode) => void;
}) {
  return (
    <div
      className="d-flex align-items-center gap-2 py-2 border-bottom"
      style={{ marginLeft: depth * 20 }}
    >
      <span className="text-muted">{menuNodeIcon(node.code, node.type)}</span>
      <div className="flex-grow-1 min-w-0">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className={node.enabled ? '' : 'text-muted text-decoration-line-through'}>
            {node.label}
          </span>
          <Badge bg="light" text="dark" className="border">{node.type}</Badge>
          {!node.enabled && <Badge bg="secondary">Disabled</Badge>}
        </div>
        <div className="small text-muted">
          <code>{node.code}</code>
          {node.route && <span className="ms-2">{node.route}</span>}
        </div>
      </div>
      {isPlatformAdmin && node.id != null && (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-primary" onClick={() => onEdit(node)}>Edit</Button>
          <Button size="sm" variant="outline-danger" onClick={() => onDelete(node)}>Delete</Button>
        </div>
      )}
    </div>
  );
}

function CatalogueTree({
  nodes,
  depth,
  isPlatformAdmin,
  onEdit,
  onDelete,
}: {
  nodes: MenuTreeNode[];
  depth: number;
  isPlatformAdmin: boolean;
  onEdit: (node: MenuTreeNode) => void;
  onDelete: (node: MenuTreeNode) => void;
}) {
  return (
    <>
      {nodes.map((node) => (
        <div key={node.code}>
          <CatalogueRow
            node={node}
            depth={depth}
            isPlatformAdmin={isPlatformAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          {node.children.length > 0 && (
            <CatalogueTree
              nodes={node.children}
              depth={depth + 1}
              isPlatformAdmin={isPlatformAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </div>
      ))}
    </>
  );
}

export function MenuCataloguePage() {
  const { isPlatformAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingNode, setEditingNode] = useState<MenuTreeNode | null>(null);
  const [form, setForm] = useState<MenuNodeFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<MenuTreeNode | null>(null);
  const [formError, setFormError] = useState('');

  const { data: catalogue = [], isLoading, isError, error } = useQuery({
    queryKey: ['menu-catalogue'],
    queryFn: menuService.getCatalogue,
  });

  const parentOptions = flattenNodes(catalogue).filter((n) => n.type !== 'ITEM' && n.id != null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['menu-catalogue'] });

  const createMutation = useMutation({
    mutationFn: (request: CreateMenuNodeRequest) => menuService.create(request),
    onSuccess: () => { invalidate(); setShowModal(false); setFormError(''); },
    onError: (err: unknown) => setFormError(getApiErrorMessage(err, 'menu node')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateMenuNodeRequest }) =>
      menuService.update(id, request),
    onSuccess: () => { invalidate(); setShowModal(false); setEditingNode(null); setFormError(''); },
    onError: (err: unknown) => setFormError(getApiErrorMessage(err, 'menu node')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => menuService.delete(id),
    onSuccess: () => { invalidate(); setDeleteTarget(null); },
    onError: (err: unknown) => setFormError(getApiErrorMessage(err, 'menu node')),
  });

  const openCreate = () => {
    setEditingNode(null);
    setForm(emptyForm());
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (node: MenuTreeNode) => {
    setEditingNode(node);
    setForm({
      code: node.code,
      label: node.label,
      nodeType: node.type,
      route: node.route ?? '',
      icon: node.icon ?? '',
      parentId: '',
      sortOrder: 10,
      enabled: node.enabled,
    });
    setFormError('');
    setShowModal(true);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (editingNode?.id != null) {
      updateMutation.mutate({
        id: editingNode.id,
        request: {
          label: form.label,
          route: form.route || undefined,
          icon: form.icon || undefined,
          sortOrder: form.sortOrder,
          enabled: form.enabled,
        },
      });
      return;
    }
    createMutation.mutate({
      code: form.code.toUpperCase(),
      label: form.label,
      nodeType: form.nodeType,
      route: form.route || undefined,
      icon: form.icon || undefined,
      parentId: form.parentId ? Number(form.parentId) : null,
      sortOrder: form.sortOrder,
      enabled: form.enabled,
    });
  };

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="menu catalogue" />;

  return (
    <div>
      <Link to="/admin/access" className="text-decoration-none small">&larr; Access Control</Link>
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h4 className="mb-1">Menu Catalogue</h4>
          <p className="text-muted small mb-0">
            {isPlatformAdmin
              ? 'Manage the global navigation structure. Changes affect all tenants.'
              : 'Read-only view of the global navigation structure.'}
          </p>
        </div>
        {isPlatformAdmin && (
          <Button size="sm" variant="primary" onClick={openCreate}>+ New Node</Button>
        )}
      </div>

      {formError && !showModal && (
        <Alert variant="danger" className="py-2" dismissible onClose={() => setFormError('')}>
          {formError}
        </Alert>
      )}

      <Card>
        <Card.Body className="p-0 px-3">
          <CatalogueTree
            nodes={catalogue}
            depth={0}
            isPlatformAdmin={isPlatformAdmin}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
          {catalogue.length === 0 && (
            <p className="text-muted p-3 mb-0">No menu nodes defined.</p>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingNode ? 'Edit Menu Node' : 'New Menu Node'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitForm}>
          <Modal.Body>
            {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}
            {!editingNode && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Code</Form.Label>
                  <Form.Control
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. REPORTS_V2"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={form.nodeType}
                    onChange={(e) => setForm({ ...form, nodeType: e.target.value as MenuNodeType })}
                  >
                    <option value="MODULE">MODULE</option>
                    <option value="GROUP">GROUP</option>
                    <option value="ITEM">ITEM</option>
                  </Form.Select>
                </Form.Group>
                {(form.nodeType === 'GROUP' || form.nodeType === 'ITEM') && (
                  <Form.Group className="mb-3">
                    <Form.Label>Parent</Form.Label>
                    <Form.Select
                      value={form.parentId}
                      onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                      required
                    >
                      <option value="">Select parent…</option>
                      {parentOptions.map((n) => (
                        <option key={n.id!} value={n.id!}>{n.label} ({n.type})</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
              </>
            )}
            {editingNode && (
              <p className="small text-muted">
                Code: <code>{editingNode.code}</code> · Type: {editingNode.type}
              </p>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Label</Form.Label>
              <Form.Control
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required
              />
            </Form.Group>
            {(editingNode?.type === 'ITEM' || form.nodeType === 'ITEM') && (
              <Form.Group className="mb-3">
                <Form.Label>Route</Form.Label>
                <Form.Control
                  value={form.route}
                  onChange={(e) => setForm({ ...form, route: e.target.value })}
                  placeholder="/admin/example"
                  required={!editingNode || editingNode.type === 'ITEM'}
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Sort order</Form.Label>
              <Form.Control
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Check
              type="switch"
              id="menu-node-enabled"
              label="Enabled"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Spinner as="span" size="sm" className="me-2" />
              ) : null}
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={deleteTarget !== null} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton><Modal.Title>Delete Menu Node</Modal.Title></Modal.Header>
        <Modal.Body>
          Delete <strong>{deleteTarget?.label}</strong>? This cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => deleteTarget?.id != null && deleteMutation.mutate(deleteTarget.id)}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
