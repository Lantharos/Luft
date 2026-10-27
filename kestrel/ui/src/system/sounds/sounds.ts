import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import { categoryOf, SOUNDS, type Category, type Sound } from './catalog.js';
import { followPlayback, unlessSenderPlays, type Sender } from './playback.js';
import { busy, followSession, interactingWith, onlyErrors, type SessionMode } from './situation.js';

const desktop = new Gio.Settings({ schema_id: 'org.gnome.desktop.sound' });
const kestrel = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.sounds' });

const OWN_SOUND_LEAD_US = 500_000;
const OWN_SOUND_WAIT_MS = 150;

export function startSounds(session: SessionMode): void {
  followSession(session);
  Shell.SoundPlayer.get_default().prepare();
  followPlayback();
  global.display.connect('bell', () => {
    playSound('error');
    return true;
  });
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
  if (allowed(category)) Shell.SoundPlayer.get_default().play(name);
}

export function playNamedSound(name: string): void {
  if (!onlyErrors() && allowed(categoryOf(name))) Shell.SoundPlayer.get_default().play(name);
}

export type NotificationSound = { name: string } | { file: Gio.File } | { fds: Gio.UnixFDList; index: number };

export type SoundChoice = 'automatic' | 'luft' | 'app' | 'none';

export interface NotificationSoundRequest {
  choice: SoundChoice;
  requested: NotificationSound | null | undefined;
  fallback: NotificationSound;
  sender: Sender;
}

function playFor(sound: NotificationSound): void {
  if ('fds' in sound) Shell.SoundPlayer.get_default().play_fd(sound.fds.get(sound.index));
  else if ('file' in sound) Shell.SoundPlayer.get_default().play_file(sound.file);
  else Shell.SoundPlayer.get_default().play(sound.name);
}

export function playNotificationSound({ choice, requested, fallback, sender }: NotificationSoundRequest): void {
  if (choice === 'none' || !allowed('notifications')) return;
  if (choice === 'luft') playFor(fallback);
  else if (requested) playFor(requested);
  else if (choice === 'automatic' && requested === undefined)
    unlessSenderPlays(sender, OWN_SOUND_LEAD_US, OWN_SOUND_WAIT_MS, () => playFor(fallback));
}

export function promptAppeared(appId: string): void {
  if (!interactingWith(appId)) playSound('notification-low');
}
