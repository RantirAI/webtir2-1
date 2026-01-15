import { ComponentInstance } from '../store/types';

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
};

const isNavWrapper = (node: ComponentInstance): boolean => {
  if (node.type === 'Section' && node.props?.htmlTag === 'nav') return true;
  const ids = node.styleSourceIds || [];
  return ids.includes('nav-wrapper') || ids.includes('style-nav-wrapper');
};

export function migrateNavigationRemoveGetStartedCTA(
  root: ComponentInstance
): { root: ComponentInstance; changed: boolean } {
  let changed = false;

  const walk = (node: ComponentInstance, insideNav: boolean): ComponentInstance => {
    const nextInsideNav = insideNav || isNavWrapper(node);
    const originalChildren = node.children || [];

    let workingChildren = originalChildren;

    // Remove legacy CTA button only within navigation subtree
    if (nextInsideNav && originalChildren.length) {
      workingChildren = originalChildren.filter((child, idx, arr) => {
        if (child.type !== 'Button') return true;

        const text = normalizeText(child.props?.children ?? child.props?.text);
        if (text !== 'Get Started') return true;

        const styleIds = child.styleSourceIds || [];
        const looksLikeNavCta = styleIds.includes('nav-cta') || styleIds.includes('style-nav-cta');
        const isTrailingButton = idx === arr.length - 1;

        if (looksLikeNavCta || isTrailingButton) {
          changed = true;
          return false;
        }

        return true;
      });
    }

    const walkedChildren = workingChildren.map((c) => walk(c, nextInsideNav));

    const childrenChanged =
      workingChildren.length !== originalChildren.length ||
      walkedChildren.some((c, i) => c !== workingChildren[i]);

    if (!childrenChanged) return node;

    return {
      ...node,
      children: walkedChildren,
    };
  };

  const nextRoot = walk(root, false);
  return { root: nextRoot, changed };
}
