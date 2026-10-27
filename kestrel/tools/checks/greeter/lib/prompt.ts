import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {styled, textOf} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';

export const {require, eventually} = checks('login screen');

interface GreeterEvent {
  type: string;
  action?: string;
  username?: string;
}

export function events() {
  const [, contents] = Gio.File.new_for_path(GLib.getenv('KESTREL_GREETER_EVENTS')!).load_contents(null);
  return new TextDecoder().decode(contents).trim().split('\n').filter(Boolean).map((line): GreeterEvent => JSON.parse(line));
}

export function promptState() {
  const entry = styled('login-dialog-prompt-entry').find((actor): actor is St.Entry => actor instanceof St.Entry && actor.mapped) ?? null;
  const message = styled('login-dialog-message').find(label => label.mapped && label.opacity > 0) ?? null;
  return {
    entry,
    hint: entry?.hint_text ?? null,
    secret: entry instanceof St.PasswordEntry,
    message: message && textOf(message),
    warning: message?.has_style_class_name('login-dialog-message-warning') ?? false,
  };
}

export function lastSessionStart() {
  return events().filter(event => event.type === 'create_session').at(-1)?.username ?? null;
}
