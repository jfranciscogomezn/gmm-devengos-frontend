import type { MenuTreeNode } from '../types';

export function collectAncestorCodesForRoute(nodes: MenuTreeNode[], pathname: string): Set<string> {
  const ancestors = new Set<string>();

  function walk(node: MenuTreeNode, trail: string[]): boolean {
    const nextTrail = [...trail, node.code];
    if (node.type === 'ITEM' && node.route && pathname.startsWith(node.route)) {
      for (const code of trail) {
        ancestors.add(code);
      }
      return true;
    }
    for (const child of node.children) {
      if (walk(child, nextTrail)) {
        return true;
      }
    }
    return false;
  }

  for (const node of nodes) {
    walk(node, []);
  }
  return ancestors;
}

export function loadExpandedModules(storageKey: string): Set<string> | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return null;
  }
}

export function saveExpandedModules(storageKey: string, expanded: Set<string>): void {
  localStorage.setItem(storageKey, JSON.stringify([...expanded]));
}
