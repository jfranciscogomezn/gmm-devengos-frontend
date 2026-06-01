import type { MenuTreeNode } from '../types';

export function collectItemCodes(nodes: MenuTreeNode[]): string[] {
  const codes: string[] = [];
  for (const node of nodes) {
    if (node.type === 'ITEM') {
      codes.push(node.code);
    }
    if (node.children.length > 0) {
      codes.push(...collectItemCodes(node.children));
    }
  }
  return codes;
}

export function collectItemIdsFromTree(
  nodes: MenuTreeNode[],
  idByCode: Map<string, number>,
): number[] {
  return collectItemCodes(nodes)
    .map((code) => idByCode.get(code))
    .filter((id): id is number => id !== undefined);
}

export function walkMenuTree(nodes: MenuTreeNode[], visit: (node: MenuTreeNode) => void): void {
  for (const node of nodes) {
    visit(node);
    if (node.children.length > 0) {
      walkMenuTree(node.children, visit);
    }
  }
}
