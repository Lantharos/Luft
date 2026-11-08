import type { ElementLayout, Extension, View } from '@luft/extension-api';

import type { FocusSession, Granted } from './session.js';
import { countdown, minutesLeft, timeOfDay } from './time.js';

export const ICON = 'icons/focus-symbolic.svg';

const icon = (layout: ElementLayout): View => ({ type: 'icon', icon: ICON, size: layout.icon });

/** The taskbar shows the icon on its own, and while a session runs the minutes left beside it. */
export function compact({ t }: Extension<Granted>, session: FocusSession, layout: ElementLayout): View {
  if (!session.active) return icon(layout);
  const left = layout.vertical ? String(minutesLeft(session.left)) : t('minutes-left', { minutes: minutesLeft(session.left) });
  return {
    type: layout.vertical ? 'column' : 'row',
    spacing: layout.vertical ? 2 : 6,
    align: 'center',
    children: [icon(layout), { type: 'text', text: session.paused ? t('paused') : left, style: 'number' }],
  };
}

/** Under the pointer it shows the time to the second, when it ends and how many notifications wait. */
export function expanded(extension: Extension<Granted>, session: FocusSession, layout: ElementLayout): View {
  if (!session.active || layout.vertical) return compact(extension, session, layout);
  const { t } = extension;
  const detail = session.paused ? t('paused') : t('until', { time: timeOfDay(session.endsAt!) });
  return {
    type: 'row',
    spacing: 8,
    align: 'center',
    children: [
      icon(layout),
      {
        type: 'column',
        spacing: 0,
        align: 'start',
        children: [
          { type: 'text', text: countdown(session.left), style: 'number' },
          { type: 'text', text: session.waiting ? `${detail} · ${t('waiting', { count: session.waiting })}` : detail, style: 'caption' },
        ],
      },
      {
        type: 'button', small: true, style: 'flat', iconOnly: true,
        icon: session.paused ? 'media-playback-start-symbolic' : 'media-playback-pause-symbolic',
        label: t(session.paused ? 'resume' : 'pause'),
        onActivate: () => (session.paused ? session.resume() : session.pause()),
      },
      { type: 'button', small: true, style: 'flat', iconOnly: true, icon: 'media-playback-stop-symbolic', label: t('end'), onActivate: () => session.finish() },
    ],
  };
}
