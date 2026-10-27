import type Clutter from 'gi://Clutter';

import { PopupSeparatorMenuItem } from './items.js';
import { PopupMenuSection } from './menuBase.js';

export type MenuChild = Clutter.Actor & { _delegate?: unknown };

function isPopupMenuItemVisible(child: MenuChild): boolean {
  if (child._delegate instanceof PopupMenuSection && child._delegate.isEmpty()) return false;
  return child.visible;
}

const isSeparator = (child: MenuChild) => child._delegate instanceof PopupSeparatorMenuItem;

export function hasVisibleItems(children: MenuChild[]): boolean {
  return children.some(child => !isSeparator(child) && isPopupMenuItemVisible(child));
}

export function separatesItems(children: MenuChild[], index: number): boolean {
  let before = index - 1;
  while (before >= 0 && !isPopupMenuItemVisible(children[before])) before--;
  if (before < 0 || isSeparator(children[before])) return false;

  let after = index + 1;
  while (after < children.length && !isPopupMenuItemVisible(children[after])) after++;
  return after < children.length && !isSeparator(children[after]);
}
