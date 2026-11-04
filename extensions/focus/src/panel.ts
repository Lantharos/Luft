import type { Extension, View } from '@luft/extension-api';

import type { FocusSession, Granted } from './session.js';
import { countdown, timeOfDay } from './time.js';

const SOUNDSCAPES = 'com.lantharos.Soundscapes';
const SHORT_LABELS = {
  '15': 'length-short-15',
  '25': 'length-short-25',
  '45': 'length-short-45',
  '60': 'length-short-60',
  '90': 'length-short-90',
} as const;
export const LENGTHS = ['15', '25', '45', '60', '90'] as const;

function before(extension: Extension<Granted>, session: FocusSession): View[] {
  const { t, settings, peers } = extension;
  const chosen = settings.get<string>('length');
  const notes = [
    ...settings.get<boolean>('hold-notifications') ? [t('before-held')] : [],
    ...settings.get<boolean>('soundscapes') && peers.handles(SOUNDSCAPES, 'play') ? [t('before-soundscapes')] : [],
  ];
  return [
    { type: 'text', text: countdown(session.left), style: 'number' },
    {
      type: 'row',
      spacing: 4,
      children: LENGTHS.map((length): View => ({
        type: 'button', label: t(SHORT_LABELS[length]), small: true, style: length === chosen ? 'default' : 'flat',
        onActivate: () => settings.set('length', length),
      })),
    },
    ...notes.length ? [{ type: 'column' as const, spacing: 2, children: notes.map((note): View => ({ type: 'text', text: note, style: 'caption' })) }] : [],
    { type: 'button', label: t('start'), style: 'primary', onActivate: () => session.start() },
  ];
}

function during({ t }: Extension<Granted>, session: FocusSession): View[] {
  const detail = session.paused ? t('paused') : t('until', { time: timeOfDay(session.endsAt!) });
  return [
    { type: 'text', text: countdown(session.left), style: 'number' },
    { type: 'progress', value: session.progress },
    { type: 'text', text: session.waiting ? `${detail} · ${t('waiting', { count: session.waiting })}` : detail, style: 'caption' },
    {
      type: 'row',
      spacing: 8,
      children: [
        session.paused
          ? { type: 'button', label: t('resume'), style: 'primary', onActivate: () => session.resume() }
          : { type: 'button', label: t('pause'), onActivate: () => session.pause() },
        { type: 'button', label: t('end'), onActivate: () => session.finish() },
      ],
    },
  ];
}

/** The pop-up: the length and Start before a session, the time left and its controls during one. */
export function panel(extension: Extension<Granted>, session: FocusSession): View {
  return { type: 'column', spacing: 12, children: session.active ? during(extension, session) : before(extension, session) };
}
