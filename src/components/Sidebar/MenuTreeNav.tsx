import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import type { MenuTreeNode } from '../../types';

const ITEM_ICONS: Record<string, string> = {
  ROLE_MANAGEMENT: '🔑',
  USER_MANAGEMENT: '👥',
  PAYROLL_CONFIG: '⚙️',
  EMPLOYEE_CONFIG: '🧑‍💼',
  TIME_RECORDS_ADMIN: '🕐',
  REPORTS: '📊',
  MY_TIME: '🗓️',
  MY_PROFILE: '👤',
  PLATFORM_TENANTS: '🏢',
};

const MODULE_ICONS: Record<string, string> = {
  SECURITY: '🛡️',
  PAYROLL: '💰',
  TIME_TRACKING: '⏱️',
  ACCOUNT: '👤',
  PLATFORM: '🏢',
};

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  `nav-link text-white-50 px-2 py-2 rounded d-flex align-items-center gap-2 ${
    isActive ? 'bg-primary text-white' : 'hover-bg-secondary'
  }`;

interface MenuTreeNavProps {
  nodes: MenuTreeNode[];
}

export function MenuTreeNav({ nodes }: MenuTreeNavProps) {
  return (
    <>
      {nodes.map((node) => (
        <MenuTreeNavNode key={node.code} node={node} />
      ))}
    </>
  );
}

function MenuTreeNavNode({ node }: { node: MenuTreeNode }) {
  const [open, setOpen] = useState(true);

  if (node.type === 'ITEM' && node.route) {
    return (
      <Nav.Item>
        <NavLink to={node.route} className={NAV_LINK_CLASS}>
          <span>{ITEM_ICONS[node.code] ?? '•'}</span>
          <span className="small">{node.label}</span>
        </NavLink>
      </Nav.Item>
    );
  }

  return (
    <div className="mb-1">
      <button
        type="button"
        className="btn btn-link btn-sm text-white-50 text-decoration-none w-100 text-start px-2 py-1 d-flex align-items-center gap-2"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{node.type === 'MODULE' ? (MODULE_ICONS[node.code] ?? '📁') : '▸'}</span>
        <span className="small fw-semibold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
          {node.label}
        </span>
      </button>
      {open && node.children.length > 0 && (
        <Nav className="flex-column ms-2 border-start border-secondary ps-1">
          <MenuTreeNav nodes={node.children} />
        </Nav>
      )}
    </div>
  );
}
