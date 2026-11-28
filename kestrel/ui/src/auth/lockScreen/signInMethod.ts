import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { tellLoginScreen } from '../../session/loginScreen/send.js';

export const SIGN_IN_METHODS = ['security-key', 'smart-card', 'fingerprint', 'password'] as const;
export type SignInMethod = typeof SIGN_IN_METHODS[number];

const record = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'sign-in-method']));

export const isSignInMethod = (name: string): name is SignInMethod => (SIGN_IN_METHODS as readonly string[]).includes(name);

export function methodIn(file: Gio.File): SignInMethod | null {
  try {
    const method = new TextDecoder().decode(file.load_contents(null)[1]);
    return isSignInMethod(method) ? method : null;
  } catch {
    return null;
  }
}

export const rememberedMethod = (): SignInMethod | null => methodIn(record);

export function rememberMethod(method: SignInMethod): void {
  if (method !== rememberedMethod()) {
    GLib.mkdir_with_parents(record.get_parent()!.get_path()!, 0o755);
    record.replace_contents(new TextEncoder().encode(method), null, false, Gio.FileCreateFlags.NONE, null);
  }
  tellLoginScreen('SetSignInMethod', new GLib.Variant('(s)', [method]), 'login-sign-in-method', 'sign-in method');
}
