import Gio from 'gi://Gio';

import { categoryOf, SOUNDS, type Category, type Sound } from './catalog.js';
import { soundPlayer } from './player.js';
import { busy, followSession, interactingWith, onlyErrors, type SessionMode } from './situation.js';

const desktop = new Gio.Settings({ schema_id: 'org.gnome.desktop.sound' });
const kestrel = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.sounds' });

export function startSounds(session: SessionMode): void {
  followSession(session);
  soundPlayer().prepare();
}

function allowed(category: Category): boolean {
  if (!desktop.get_boolean('event-sounds')) return false;
  if (category === 'errors') return true;
  if (onlyErrors()) return false;
  if (category !== 'feedback' && !kestrel.get_boolean(category)) return false;
  return category !== 'notifications' || !busy();
}

export function playSound(sound: Sound): void {
  const { name, category } = SOUNDS[sound];
  if (allowed(category)) soundPlayer().play(name);
}

export function playNamedSound(name: string): void {
  if (!onlyErrors() && allowed(categoryOf(name))) soundPlayer().play(name);
}

export type NotificationSound = { name: string } | { file: Gio.File } | { fds: Gio.UnixFDList; index: number };

export function playNotificationSound(sound: NotificationSound): void {
  if (!allowed('notifications')) return;
  if ('fds' in sound) soundPlayer().play_fd(sound.fds.get(sound.index));
  else if ('file' in sound) soundPlayer().play_file(sound.file);
  else soundPlayer().play(sound.name);
}

export function promptAppeared(appId: string): void {
  if (!interactingWith(appId)) playSound('notification-low');
}
