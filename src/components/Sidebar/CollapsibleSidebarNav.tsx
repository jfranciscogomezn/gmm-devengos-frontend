import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import type { MenuTreeNode } from '../../types';
import { menuNodeIcon } from '../../utils/menuIcons';
import {
  collectAncestorCodesForRoute,
  loadExpandedModules,
  saveExpandedModules,
} from '../../utils/sidebarNavState';
import styles from './Sidebar.module.css';

const STORAGE_KEY = 'stepcore.sidebar.expanded';

interface CollapsibleSidebarNavProps {
  nodes: MenuTreeNode[];
}

export function CollapsibleSidebarNav({ nodes }: CollapsibleSidebarNavProps) {
  const location = useLocation();
  const activeAncestors = useMemo(
    () => collectAncestorCodesForRoute(nodes, location.pathname),
    [nodes, location.pathname],
  );

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const stored = loadExpandedModules(STORAGE_KEY);
    return stored ?? new Set(activeAncestors);
  });

  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const code of activeAncestors) {
        next.add(code);
      }
      saveExpandedModules(STORAGE_KEY, next);
      return next;
    });
  }, [activeAncestors]);

  const toggle = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      saveExpandedModules(STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <nav className={styles.nav}>
      {nodes.map((node) => (
        <SidebarNavNode
          key={node.code}
          node={node}
          depth={0}
          expanded={expanded}
          onToggle={toggle}
        />
      ))}
    </nav>
  );
}

interface SidebarNavNodeProps {
  node: MenuTreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (code: string) => void;
}

function SidebarNavNode({ node, depth, expanded, onToggle }: SidebarNavNodeProps) {
  if (node.type === 'ITEM' && node.route) {
    return (
      <NavLink
        to={node.route}
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.linkActive : ''}`
        }
        style={{ marginLeft: depth * 12 }}
      >
        <span className={styles.icon}>{menuNodeIcon(node.code, 'ITEM')}</span>
        <span>{node.label}</span>
      </NavLink>
    );
  }

  const isOpen = expanded.has(node.code);
  const hasChildren = node.children.length > 0;

  return (
    <div style={{ marginBottom: 4 }}>
      {hasChildren && (
        <button
          type="button"
          className={styles.parentButton}
          style={{ marginLeft: depth * 12 }}
          onClick={() => onToggle(node.code)}
          aria-expanded={isOpen}
        >
          <span className={styles.icon}>{menuNodeIcon(node.code, node.type)}</span>
          <span className={styles.parentLabel}>{node.label}</span>
          <span className={styles.chevron}>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>
      )}
      {isOpen && hasChildren && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <SidebarNavNode
              key={child.code}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
