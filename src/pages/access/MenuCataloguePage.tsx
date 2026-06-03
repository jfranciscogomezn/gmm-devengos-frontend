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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['access', 'common']);
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
          {!node.enabled && <Badge bg="secondary">{t('access:menuCatalogue.disabled')}</Badge>}
        </div>
        <div className="small text-muted">
          <code>{node.code}</code>
          {node.route && <span className="ms-2">{node.route}</span>}
        </div>
      </div>
      {isPlatformAdmin && node.id != null && (
        <div className="d-flex gap-1">
          <Button size="sm" variant="outline-primary" onClick={() => onEdit(node)}>
            {t('common:actions.edit')}
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => onDelete(node)}>
            {t('common:actions.delete')}
          </Button>
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
  const { t } = useTranslation(['access', 'common']);
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
      <Link to="/admin/access" className="text-decoration-none small">{t('access:backToAccess')}</Link>
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <div>
          <h4 className="mb-1">{t('access:menuCatalogue.title')}</h4>
          <p className="text-muted small mb-0">
            {isPlatformAdmin ? t('access:menuCatalogue.intro') : t('access:menuCatalogue.readOnly')}
          </p>
        </div>
        {isPlatformAdmin && (
          <Button size="sm" variant="primary" onClick={openCreate}>
            + {t('access:menuCatalogue.newNode')}
          </Button>
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
            <p className="text-muted p-3 mb-0">{t('access:menuCatalogue.empty')}</p>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingNode ? t('access:menuCatalogue.editTitle') : t('access:menuCatalogue.newTitle')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitForm}>
          <Modal.Body>
            {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}
            {!editingNode && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>{t('common:labels.code')}</Form.Label>
                  <Form.Control
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder={t('access:menuCatalogue.codePlaceholder')}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('common:labels.type')}</Form.Label>
                  <Form.Select
                    value={form.nodeType}
                    onChange={(e) => setForm({ ...form, nodeType: e.target.value as MenuNodeType })}
                  >
                    <option value="MODULE">{t('access:menuCatalogue.types.MODULE')}</option>
                    <option value="GROUP">{t('access:menuCatalogue.types.GROUP')}</option>
                    <option value="ITEM">{t('access:menuCatalogue.types.ITEM')}</option>
                  </Form.Select>
                </Form.Group>
                {(form.nodeType === 'GROUP' || form.nodeType === 'ITEM') && (
                  <Form.Group className="mb-3">
                    <Form.Label>{t('common:labels.parent')}</Form.Label>
                    <Form.Select
                      value={form.parentId}
                      onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                      required
                    >
                      <option value="">{t('common:placeholders.selectParent')}</option>
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
                {t('common:labels.code')}: <code>{editingNode.code}</code> · {t('common:labels.type')}: {editingNode.type}
              </p>
            )}
            <Form.Group className="mb-3">
              <Form.Label>{t('common:labels.name')}</Form.Label>
              <Form.Control
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                required
              />
            </Form.Group>
            {(editingNode?.type === 'ITEM' || form.nodeType === 'ITEM') && (
              <Form.Group className="mb-3">
                <Form.Label>{t('common:labels.route')}</Form.Label>
                <Form.Control
                  value={form.route}
                  onChange={(e) => setForm({ ...form, route: e.target.value })}
                  placeholder={t('access:menuCatalogue.routePlaceholder')}
                  required={!editingNode || editingNode.type === 'ITEM'}
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>{t('common:labels.sortOrder')}</Form.Label>
              <Form.Control
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Check
              type="switch"
              id="menu-node-enabled"
              label={t('common:labels.enabled')}
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>{t('common:actions.cancel')}</Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Spinner as="span" size="sm" className="me-2" />
              ) : null}
              {t('common:actions.save')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={deleteTarget !== null} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('access:menuCatalogue.deleteTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('access:menuCatalogue.deleteConfirm', { label: deleteTarget?.label ?? '' })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>{t('common:actions.cancel')}</Button>
          <Button
            variant="danger"
            disabled={deleteMutation.isPending}
            onClick={() => deleteTarget?.id != null && deleteMutation.mutate(deleteTarget.id)}
          >
            {t('common:actions.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
