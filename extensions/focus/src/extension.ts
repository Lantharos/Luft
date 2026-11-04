import type { Disposable, Enable, Popup } from '@luft/extension-api';

import { compact, expanded } from './element.js';
import { describePage } from './page.js';
import { panel } from './panel.js';
import { FocusSession, type Granted } from './session.js';
import { sumUp } from './summary.js';

const SECOND_MS = 1000;
const MINUTE_MS = 60_000;

const enable: Enable<Granted> = extension => {
  let popup: Popup | null = null;
  let grown = false;
  let ticking: Disposable | null = null;

  const session: FocusSession = new FocusSession(extension, ended => sumUp(extension, ended, () => session.start()));
  const element = extension.taskbar.addElement({
    key: 'focus',
    label: extension.t('focus'),
    content: layout => compact(extension, session, layout),
    expanded: layout => expanded(extension, session, layout),
    onExpandedChanged: expanding => {
      grown = expanding;
      tick();
    },
    onClick: () => toggle(),
    menu: ['settings'],
  });

  function toggle(): void {
    if (popup?.open) {
      popup.dispose();
      return;
    }
    popup = extension.popups.open({
      anchor: element,
      title: extension.t('focus'),
      width: 280,
      content: panel(extension, session),
      onClosed: () => {
        popup = null;
        tick();
      },
    });
    tick();
  }

  /** Counts the seconds while they show, in the pop-up or the grown element, and otherwise only the minutes. */
  function tick(): void {
    ticking?.dispose();
    ticking = null;
    if (!session.active || session.paused) return;
    const seconds = grown || !!popup?.open;
    const step = seconds ? SECOND_MS : MINUTE_MS;
    ticking = extension.timers.timeout(session.left % step || step, () => refresh());
  }

  function refresh(): void {
    element.refresh();
    if (popup?.open) popup.update(panel(extension, session));
    tick();
  }

  session.onChanged(refresh);
  extension.settings.onChanged(refresh);
  extension.peers.onChanged(refresh);
  extension.shortcuts.onActivated('toggle', () => (session.active ? session.finish() : session.start()));
  describePage(extension);
  tick();
};

export default enable;
