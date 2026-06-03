import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { MenuTreeNode } from '../../types';
import { walkMenuTree } from '../../utils/menuTree';

interface MenuTreeAssignProps {
  nodes: MenuTreeNode[];
  selected: Set<number>;
  idByCode: Map<string, number>;
  onToggle: (id: number) => void;
  onToggleModule: (itemIds: number[], select: boolean) => void;
}

interface MenuTreeAssignNodeProps {
  node: MenuTreeNode;
  selected: Set<number>;
  idByCode: Map<string, number>;
  onToggle: (id: number) => void;
  onToggleModule: (itemIds: number[], select: boolean) => void;
  depth: number;
}

export function MenuTreeAssign({
  nodes,
  selected,
  idByCode,
  onToggle,
  onToggleModule,
}: MenuTreeAssignProps) {
  return (
    <div>
      {nodes.map((node) => (
        <MenuTreeAssignNode
          key={node.code}
          node={node}
          selected={selected}
          idByCode={idByCode}
          onToggle={onToggle}
          onToggleModule={onToggleModule}
          depth={0}
        />
      ))}
    </div>
  );
}

function collectItemIds(node: MenuTreeNode, idByCode: Map<string, number>): number[] {
  const ids: number[] = [];
  walkMenuTree([node], (current) => {
    if (current.type === 'ITEM') {
      const id = current.id ?? idByCode.get(current.code);
      if (id !== undefined) ids.push(id);
    }
  });
  return ids;
}

function MenuTreeAssignNode({
  node,
  selected,
  idByCode,
  onToggle,
  onToggleModule,
  depth,
}: MenuTreeAssignNodeProps) {
  const { t } = useTranslation('common');

  if (node.type === 'ITEM') {
    const id = node.id ?? idByCode.get(node.code);
    if (id === undefined) return null;
    return (
      <Form.Check
        type="checkbox"
        id={`menu-node-${id}`}
        label={`${node.label} (${node.route})`}
        checked={selected.has(id)}
        onChange={() => onToggle(id)}
        className="mb-2"
        style={{ marginLeft: depth * 16 }}
      />
    );
  }

  const itemIds = collectItemIds(node, idByCode);
  const allSelected = itemIds.length > 0 && itemIds.every((id) => selected.has(id));

  return (
    <div className="mb-3" style={{ marginLeft: depth * 12 }}>
      <div className="fw-semibold small text-uppercase text-muted mb-2">{node.label}</div>
      {node.type === 'MODULE' && itemIds.length > 0 && (
        <Form.Check
          type="checkbox"
          id={`module-${node.code}`}
          label={t('actions.selectAllIn', { module: node.label })}
          checked={allSelected}
          onChange={() => onToggleModule(itemIds, !allSelected)}
          className="mb-2 ms-1"
        />
      )}
      {node.children.map((child) => (
        <MenuTreeAssignNode
          key={child.code}
          node={child}
          selected={selected}
          idByCode={idByCode}
          onToggle={onToggle}
          onToggleModule={onToggleModule}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
