export type Category = 'notifications' | 'devices' | 'volume-feedback' | 'screenshots' | 'recording' | 'sign-in' | 'keyboard' | 'feedback' | 'errors';

interface Entry {
  name: string;
  category: Category;
}

export const SOUNDS = {
  notification: { name: 'message-new-instant', category: 'notifications' },
  'notification-low': { name: 'dialog-information', category: 'notifications' },
  'new-mail': { name: 'message-new-email', category: 'notifications' },
  'mail-sent': { name: 'message-sent-email', category: 'feedback' },
  'device-plugged': { name: 'device-added', category: 'devices' },
  'device-unplugged': { name: 'device-removed', category: 'devices' },
  'charger-connected': { name: 'power-plug', category: 'devices' },
  'low-battery': { name: 'battery-low', category: 'devices' },
  screenshot: { name: 'screen-capture', category: 'screenshots' },
  'volume-tick': { name: 'audio-volume-change', category: 'volume-feedback' },
  error: { name: 'dialog-error', category: 'errors' },
  warning: { name: 'dialog-warning', category: 'feedback' },
  question: { name: 'dialog-question', category: 'feedback' },
  'recording-started': { name: 'recording-started', category: 'recording' },
  'recording-stopped': { name: 'recording-stopped', category: 'recording' },
  'sign-in': { name: 'desktop-login', category: 'sign-in' },
  'keyboard-tap': { name: 'keyboard-tap', category: 'keyboard' },
  'keyboard-tap-delete': { name: 'keyboard-tap-delete', category: 'keyboard' },
  'keyboard-tap-space': { name: 'keyboard-tap-space', category: 'keyboard' },
} satisfies Record<string, Entry>;

export type Sound = keyof typeof SOUNDS;

const BY_NAME = new Map<string, Entry>(Object.values(SOUNDS).map(entry => [entry.name, entry]));

export function categoryOf(name: string): Category {
  return BY_NAME.get(name)?.category ?? 'feedback';
}
