import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { isSignInMethod, type SignInMethod } from '../lockScreen/signInMethod.js';

const SIGN_IN = 'com.lantharos.SignIn1';
const SIGN_IN_PATH = '/com/lantharos/SignIn1';
const PATIENCE = 3000;
const WITHOUT_SERVICE: SignInMethod[] = ['fingerprint', 'password'];

/** How the account `uid` signs in, best first, as the sign-in service knows it. */
export async function fetchWays(uid: number): Promise<SignInMethod[]> {
  try {
    const reply = await Gio.DBus.system.call(SIGN_IN, SIGN_IN_PATH, SIGN_IN, 'Ways', new GLib.Variant('(u)', [uid]),
      new GLib.VariantType('(as)'), Gio.DBusCallFlags.NONE, PATIENCE, null);
    const [ways] = reply.deepUnpack<[string[]]>();
    const known = ways.filter(isSignInMethod);
    return known.length ? known : WITHOUT_SERVICE;
  } catch (error) {
    console.warn(`Couldn't ask how this account signs in: ${error}`);
    return WITHOUT_SERVICE;
  }
}

/**
 * The way to open on: the one used last unless that was the password and something better is
 * there, else the best one. A closed lid hides the fingerprint reader.
 */
export function pickMethod(ways: SignInMethod[], remembered: SignInMethod | null, lidClosed: boolean): SignInMethod {
  const usable = usableWays(ways, lidClosed);
  const choices = usable.length ? usable : ways;
  if (remembered && remembered !== 'password' && choices.includes(remembered)) return remembered;
  return choices[0];
}

/** The ways that work now: a closed lid hides the fingerprint reader. */
export const usableWays = <T extends string>(ways: T[], lidClosed: boolean) => ways.filter(way => way !== 'fingerprint' || !lidClosed);

export const allowsPassword = (ways: SignInMethod[]) => ways.includes('password');
