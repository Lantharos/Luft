import type { ElementLayout, TaskbarElement, View } from '@luft/extension-api';

import { ICON } from './format.js';
import type { Panel } from './panel.js';
import type { Pigeon } from './pigeon.js';
import { moving, percent, status } from './status.js';

/** Pigeon in the taskbar: how a transfer is going, a click away from the devices, and a place to drop files on. */
export function addElement(pigeon: Pigeon, panel: Panel): void {
  const { t, taskbar, settings } = pigeon.extension;
  const icon = (layout: ElementLayout): View => ({ type: 'icon', icon: ICON, size: Math.round(layout.button * 0.5) });
  const stack = (layout: ElementLayout, children: View[]): View => ({ type: layout.vertical ? 'column' : 'row', spacing: 6, children });
  const menu = () => [
    { label: t('receive'), checked: settings.get<boolean>('receive'), onActivate: () => settings.set('receive', !settings.get<boolean>('receive')) },
    'settings' as const,
  ];
  let shown = '';
  const element: TaskbarElement = taskbar.addElement({
    key: 'pigeon',
    label: t('pigeon'),
    shown: settings.get<boolean>('taskbar'),
    content: layout => {
      const fraction = moving(pigeon);
      return stack(layout, [icon(layout), ...fraction === null ? [] : [{ type: 'text', text: percent(fraction), style: 'number' } as const]]);
    },
    expanded: layout => stack(layout, [icon(layout), { type: 'text', text: status(pigeon), maxWidth: 220 }]),
    onClick: () => panel.show(element),
    onDrop: paths => panel.show(element, { dropped: paths }),
    menu: menu(),
  });
  const sync = () => {
    const now = status(pigeon);
    if (now === shown) return;
    shown = now;
    element.refresh();
  };
  pigeon.onChanged(sync);
  settings.onChanged(key => {
    if (key === 'taskbar') element.update({ shown: settings.get<boolean>('taskbar') });
    if (key === 'receive') element.update({ menu: menu() });
    sync();
  });
}
