import { describe, expect, it } from 'vitest';
import type { MenuTreeNode } from '../../types';
import { collectAncestorCodesForRoute } from '../../utils/sidebarNavState';

const tree: MenuTreeNode[] = [
  {
    id: 1,
    code: 'SECURITY',
    label: 'Security',
    type: 'MODULE',
    route: null,
    icon: null,
    enabled: true,
    children: [
      {
        id: 2,
        code: 'SECURITY_ADMIN',
        label: 'Administration',
        type: 'GROUP',
        route: null,
        icon: null,
        enabled: true,
        children: [
          {
            id: 3,
            code: 'ROLE_MANAGEMENT',
            label: 'Roles',
            type: 'ITEM',
            route: '/admin/access/roles',
            icon: null,
            enabled: true,
            children: [],
          },
        ],
      },
    ],
  },
];

describe('collectAncestorCodesForRoute', () => {
  it('returns ancestor module and group codes for active item route', () => {
    const ancestors = collectAncestorCodesForRoute(tree, '/admin/access/roles');
    expect(ancestors.has('SECURITY')).toBe(true);
    expect(ancestors.has('SECURITY_ADMIN')).toBe(true);
  });

  it('returns empty set when route does not match', () => {
    const ancestors = collectAncestorCodesForRoute(tree, '/dashboard');
    expect(ancestors.size).toBe(0);
  });
});
