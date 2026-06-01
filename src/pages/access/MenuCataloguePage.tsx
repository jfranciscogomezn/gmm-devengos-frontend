import { useQuery } from '@tanstack/react-query';
import { Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { rolesService } from '../../api/roles.service';
import { ApiErrorAlert } from '../../components/ApiErrorAlert/ApiErrorAlert';
import type { MenuTreeNode } from '../../types';
import { menuNodeIcon } from '../../utils/menuIcons';

function CatalogueNode({ node, depth }: { node: MenuTreeNode; depth: number }) {
  if (node.type === 'ITEM') {
    return (
      <div className="d-flex align-items-center gap-2 py-1" style={{ marginLeft: depth * 20 }}>
        <span className="text-muted">{menuNodeIcon(node.code, 'ITEM')}</span>
        <span>{node.label}</span>
        {node.route && (
          <code className="small text-muted ms-1">{node.route}</code>
        )}
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div
        className="fw-semibold text-uppercase text-muted small d-flex align-items-center gap-2"
        style={{ marginLeft: depth * 20 }}
      >
        {menuNodeIcon(node.code, node.type)}
        {node.label}
      </div>
      {node.children.map((child) => (
        <CatalogueNode key={child.code} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function MenuCataloguePage() {
  const { data: catalogue = [], isLoading, isError, error } = useQuery({
    queryKey: ['menu-catalogue'],
    queryFn: rolesService.getMenuCatalogue,
  });

  if (isLoading) return <div className="text-center py-5"><Spinner /></div>;
  if (isError) return <ApiErrorAlert error={error} resourceLabel="menu catalogue" />;

  return (
    <div>
      <div className="mb-4">
        <Link to="/admin/access" className="text-decoration-none small">&larr; Access Control</Link>
        <h4 className="mb-1 mt-2">Menu Catalogue</h4>
        <p className="text-muted small mb-0">
          Global navigation structure. Screen assignments to roles are managed under Roles &amp; Permissions.
        </p>
      </div>
      <Card>
        <Card.Body>
          {catalogue.map((node) => (
            <CatalogueNode key={node.code} node={node} depth={0} />
          ))}
          {catalogue.length === 0 && (
            <p className="text-muted mb-0">No menu nodes defined.</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
