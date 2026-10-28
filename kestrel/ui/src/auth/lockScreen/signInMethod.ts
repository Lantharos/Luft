import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { tellLoginScreen } from '../../session/loginScreen/send.js';

export type SignInMethod = 'fingerprint' | 'password';

const record = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'sign-in-method']));

export function rememberedMethod(): SignInMethod | null {
  try {
    const method = new TextDecoder().decode(record.load_contents(null)[1]);
    return method === 'fingerprint' || method === 'password' ? method : null;
  } catch {
    return null;
  }
}

export function rememberMethod(method: SignInMethod): void {
  if (method !== rememberedMethod()) {
    GLib.mkdir_with_parents(record.get_parent()!.get_path()!, 0o755);
    record.replace_contents(new TextEncoder().encode(method), null, false, Gio.FileCreateFlags.NONE, null);
  }
  tellLoginScreen('SetSignInMethod', new GLib.Variant('(s)', [method]), 'login-sign-in-method', 'sign-in method');
}
