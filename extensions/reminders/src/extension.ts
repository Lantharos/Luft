import type { ElementLayout, Enable, TaskbarElement } from '@luft/extension-api';

import { Alerts } from './alerts/alerts.js';
import { type Granted, Reminders } from './reminders.js';
import { addSearch } from './search.js';
import { compact, expanded } from './view/element.js';
import { SettingsPage } from './view/page.js';
import { RemindersPanel } from './view/panel.js';

const enable: Enable<Granted> = extension => {
  const reminders = new Reminders(extension);
  let element: TaskbarElement | null = null;
  const panel = new RemindersPanel(extension, reminders, () => element!);
  const hoverView = () => extension.settings.get<boolean>('expand-on-hover') ? (layout: ElementLayout) => expanded(extension, reminders, layout) : undefined;
  element = extension.taskbar.addElement({
    key: 'reminders',
    label: extension.t('reminders'),
    content: layout => compact(extension, reminders, layout),
    expanded: hoverView(),
    onClick: () => panel.toggle(),
    menu: ['settings'],
  });
  reminders.onChanged(() => {
    element!.refresh();
    panel.refresh();
  });
  extension.settings.onChanged(key => key === 'expand-on-hover' && element!.update({ expanded: hoverView() }));
  new SettingsPage(extension, reminders);
  addSearch(extension, reminders, id => panel.show(id));
  extension.shortcuts.onActivated('open', () => panel.toggle());
  reminders.start(new Alerts(extension, reminders, id => panel.show(id)));
};

export default enable;
