import type { View } from '../../api/v1/types.js';
import { type Accept, either, flag, fn, list, literal, nullable, number, optional, ref, Refused, shape, text } from './accept.js';

const PIXELS = 4096;
const CHILDREN = 200;
const MENU = 64;

export const label = text(500);
export const longText = text(10000);
export const path = text(4096);
export const icon = path;
export const key = text(100);
export const pixels = number(0, PIXELS);
export const unit = number(0, 1);
export const fade = optional(number(0, 60000));

const stack = (type: 'column' | 'row') => shape({
  type: literal(type), children: list(view, CHILDREN), spacing: optional(number(0, 256)), align: optional(literal('start', 'center', 'end', 'fill')),
});

const VIEWS: Record<View['type'], Accept<unknown>> = {
  column: stack('column'),
  row: stack('row'),
  text: shape({ type: literal('text'), text: longText, style: optional(literal('title', 'body', 'caption', 'number')), maxWidth: optional(pixels), marquee: optional(flag) }),
  icon: shape({ type: literal('icon'), icon, size: optional(number(1, 512)) }),
  image: shape({ type: literal('image'), path, width: pixels, height: pixels, radius: optional(number(0, PIXELS)), progress: optional(unit) }),
  button: shape({
    type: literal('button'), label: optional(label), icon: optional(icon), iconOnly: optional(flag), style: optional(literal('default', 'primary', 'flat')),
    small: optional(flag), disabled: optional(flag), onActivate: fn(),
  }),
  switch: shape({ type: literal('switch'), label, checked: flag, onToggled: fn() }),
  slider: shape({ type: literal('slider'), label, value: unit, onChanged: fn() }),
  entry: shape({ type: literal('entry'), label, placeholder: optional(label), text: optional(longText), onChanged: optional(fn()), onSubmit: optional(fn()) }),
  item: shape({ type: literal('item'), title: label, subtitle: optional(label), icon: optional(icon), checked: optional(flag), onActivate: optional(fn()) }),
  progress: shape({ type: literal('progress'), value: unit }),
  spinner: shape({ type: literal('spinner'), size: optional(number(1, 512)) }),
  separator: shape({ type: literal('separator') }),
  spacer: shape({ type: literal('spacer') }),
};

export function view(value: unknown, where: string, decoding: Parameters<Accept<unknown>>[2]): View {
  const type = (value as { type?: unknown } | null)?.type;
  if (typeof type !== 'string' || !Object.hasOwn(VIEWS, type)) throw new Refused(`${where} must be a view Kestrel draws`);
  return VIEWS[type as View['type']](value, where, decoding) as View;
}

const action = shape({ label, checked: optional(flag), onActivate: fn() });

export const actionItem = either<unknown>(literal('separator', 'settings'), action);
export const actionItems = list(actionItem, MENU);
export const menuItems = list(either<unknown>(literal('separator', 'settings'), action, shape({ setting: key })), MENU);

export const toggleChanges = { title: label, icon, subtitle: nullable(label), checked: flag, menu: menuItems };
export const toggleOptions = shape({
  title: label, icon, subtitle: nullable(label), setting: optional(key), checked: optional(flag), onToggled: optional(fn()), menu: optional(menuItems),
});

export const itemChanges = { icon, label, onClick: fn(), menu: actionItems };
export const itemOptions = shape({ icon, label, onClick: optional(fn()), menu: optional(actionItems) });

export const elementChanges = {
  label, content: fn(view), expanded: fn(view), shown: flag, onClick: fn(), onExpandedChanged: fn(), menu: actionItems,
};
export const elementOptions = shape({
  key, label, content: fn(view), expanded: optional(fn(view)), shown: optional(flag), onClick: optional(fn()), onExpandedChanged: optional(fn()),
  menu: optional(actionItems),
});

const POSITIONS = ['pointer', 'top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'] as const;

export const popupOptions = shape({
  anchor: either<unknown>(literal(...POSITIONS), shape({ x: number(), y: number() }), ref('taskbarItem', 'taskbarElement')),
  title: label, content: view, kind: optional(literal('panel', 'window')), width: optional(number(0, PIXELS)), chime: optional(flag), onClosed: optional(fn()),
});

export const notificationOptions = shape({
  title: label, body: optional(longText), icon: optional(icon), urgent: optional(flag), onActivate: optional(fn()),
  actions: optional(list(shape({ label, onActivate: fn() }), 3)),
});

const searchResult = shape({ title: label, description: optional(longText), icon: optional(icon), activate: fn() });

export const searchProvider = shape({ title: label, search: fn(optional(list(searchResult, 50))) });
