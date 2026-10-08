import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';

export const {require, eventually} = checks('login screen');

export function events() {
  const [, contents] = Gio.File.new_for_path(GLib.getenv('KESTREL_GREETER_EVENTS')).load_contents(null);
  return new TextDecoder().decode(contents).trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
}

export function promptState() {
  const entry = styled('login-dialog-prompt-entry').find(actor => actor.mapped) ?? null;
  const message = styled('login-dialog-message').find(label => label.mapped && label.opacity > 0) ?? null;
  return {
    entry,
    hint: entry?.hint_text ?? null,
    secret: entry?.constructor.name.includes('PasswordEntry') ?? false,
    message: message?.text ?? null,
    warning: message?.has_style_class_name('login-dialog-message-warning') ?? false,
  };
}

export function lastSessionStart() {
  return events().filter(event => event.type === 'create_session').at(-1)?.username ?? null;
}
