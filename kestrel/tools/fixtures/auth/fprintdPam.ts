import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {Request} from './framing.js';

export const MAX_TRIES = 3;
const FPRINTD = 'net.reactivated.Fprint';
const DEVICE = 'net.reactivated.Fprint.Device';
const INSTRUCTION = 'Place your finger on the fingerprint reader';
const RETRIES: Record<string, string> = {
  'verify-retry-scan': 'Scan your finger again',
  'verify-swipe-too-short': 'Swipe was too short, try again',
  'verify-finger-not-centered': 'Your finger was not centered, try swiping your finger again',
  'verify-remove-and-retry': 'Remove your finger, and try swiping your finger again',
};

export type Reply = object;

export const success = {type: 'success'};
export const message = (type: string, text: string) => ({type: 'auth_message', auth_message_type: type, auth_message: text});
export const error = (description: string, type = 'error') => ({type: 'error', error_type: type, description});
export const unavailable = () => error('Authentication service cannot retrieve authentication info', 'auth_error');
export const delay = (milliseconds: number) => new Promise<void>(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
  resolve();
  return GLib.SOURCE_REMOVE;
}));

function fprintd(path: string, iface: string, method: string, parameters: GLib.Variant | null = null) {
  return new Promise<GLib.Variant>((resolve, reject) => Gio.DBus.system.call(FPRINTD, path, iface, method, parameters, null,
    Gio.DBusCallFlags.NONE, -1, null, (connection, result) => {
      try {
        resolve(connection!.call_finish(result));
      } catch (e) {
        reject(e);
      }
    }));
}

export interface Steps {
  start(): Promise<Reply>;
  answer(request: Request): Promise<Reply>;
  stop(): void;
}

export interface Reader {
  next(timeout: number | null): Promise<string | null>;
  verify(): Promise<void>;
  stop(): void;
}

export async function openReader(user: string, closed: Promise<void>): Promise<Reader | null> {
  const [device] = (await fprintd('/net/reactivated/Fprint/Manager', `${FPRINTD}.Manager`, 'GetDefaultDevice')).deepUnpack<[string]>();
  const [fingers] = (await fprintd(device, DEVICE, 'ListEnrolledFingers', new GLib.Variant('(s)', [user]))).deepUnpack<[string[]]>();
  if (!fingers.length)
    return null;
  await fprintd(device, DEVICE, 'Claim', new GLib.Variant('(s)', [user]));
  const results: string[] = [];
  let waiting: (() => void) | null = null;
  let subscription = Gio.DBus.system.signal_subscribe(FPRINTD, DEVICE, 'VerifyStatus', device, null, Gio.DBusSignalFlags.NONE,
    (_connection, _sender, _path, _iface, _signal, parameters) => {
      results.push(parameters.deepUnpack<[string, boolean]>()[0]);
      waiting?.();
      waiting = null;
    });
  const reader: Reader = {
    async next(timeout) {
      if (!results.length) {
        const arrived = new Promise<void>(resolve => (waiting = resolve));
        const left = closed.then(() => Promise.reject(new Error('the client left')));
        await Promise.race(timeout === null ? [arrived, left] : [arrived, left, delay(timeout)]);
      }
      return results.shift() ?? null;
    },
    verify: async () => {
      await fprintd(device, DEVICE, 'VerifyStart', new GLib.Variant('(s)', ['any']));
    },
    stop() {
      if (!subscription)
        return;
      Gio.DBus.system.signal_unsubscribe(subscription);
      subscription = 0;
      fprintd(device, DEVICE, 'VerifyStop').catch(() => {});
      fprintd(device, DEVICE, 'Release').catch(() => {});
    },
  };
  await reader.verify();
  return reader;
}

export function fingerprintSteps(user: string, closed: Promise<void>): Steps {
  let reader: Reader | null = null;
  let tries = MAX_TRIES;
  let instruct = false;
  const end = (reply: Reply) => {
    reader?.stop();
    return reply;
  };

  return {
    async start() {
      reader = await openReader(user, closed);
      return reader ? message('info', INSTRUCTION) : unavailable();
    },
    async answer() {
      if (instruct) {
        instruct = false;
        return message('info', INSTRUCTION);
      }
      const result = (await reader!.next(null))!;
      if (result in RETRIES)
        return message('error', RETRIES[result]);
      if (result === 'verify-match')
        return end(success);
      if (result !== 'verify-no-match' || --tries === 0)
        return end(unavailable());
      instruct = true;
      await reader!.verify();
      return message('error', 'Failed to match fingerprint');
    },
    stop: () => reader?.stop(),
  };
}
