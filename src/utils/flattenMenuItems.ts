import type { MenuTreeNode } from '../types';

export function flattenMenuItems(nodes: MenuTreeNode[]): MenuTreeNode[] {
  return nodes.flatMap((node) => {
    if (node.type === 'ITEM' && node.route) {
      return [node];
    }
    return flattenMenuItems(node.children);
  });
}
