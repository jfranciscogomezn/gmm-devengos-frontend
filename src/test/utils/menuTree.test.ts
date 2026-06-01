import { describe, expect, it } from 'vitest';
import type { MenuTreeNode } from '../../types';
import { collectItemCodes, collectItemIdsFromTree, walkMenuTree } from '../../utils/menuTree';

const sampleTree: MenuTreeNode[] = [
  {
    id: 1,
    code: 'PAYROLL',
    label: 'Payroll',
    type: 'MODULE',
    route: null,
    icon: null,
    enabled: true,
    children: [
      {
        id: 2,
        code: 'PAYROLL_CONFIG_GRP',
        label: 'Configuration',
        type: 'GROUP',
        route: null,
        icon: null,
        enabled: true,
        children: [
          {
            id: 3,
            code: 'EMPLOYEE_CONFIG',
            label: 'Employee Configuration',
            type: 'ITEM',
            route: '/admin/employees',
            icon: null,
            enabled: true,
            children: [],
          },
        ],
      },
    ],
  },
];

describe('menuTree helpers', () => {
  it('collects leaf item codes from nested tree', () => {
    expect(collectItemCodes(sampleTree)).toEqual(['EMPLOYEE_CONFIG']);
  });

  it('maps item codes to ids from catalogue map', () => {
    const idByCode = new Map([['EMPLOYEE_CONFIG', 42]]);
    expect(collectItemIdsFromTree(sampleTree, idByCode)).toEqual([42]);
  });

  it('walks every node in pre-order', () => {
    const visited: string[] = [];
    walkMenuTree(sampleTree, (node) => visited.push(node.code));
    expect(visited).toEqual(['PAYROLL', 'PAYROLL_CONFIG_GRP', 'EMPLOYEE_CONFIG']);
  });
});
