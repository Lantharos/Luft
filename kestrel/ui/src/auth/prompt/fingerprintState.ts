import Gio from 'gi://Gio';
import type GLib from 'gi://GLib';

import * as KestrelUi from '../../kestrelUi.js';

export type RetryReason = 'retry-scan' | 'swipe-too-short' | 'finger-not-centered' | 'remove-and-retry';

export type FingerprintState =
  | { kind: 'idle' }
  | { kind: 'scanning' }
  | { kind: 'retry'; reason: RetryReason }
  | { kind: 'no-match' }
  | { kind: 'match' }
  | { kind: 'unavailable' };

const FPRINTD = 'net.reactivated.Fprint';
const DEVICE_INTERFACE = 'net.reactivated.Fprint.Device';

const RESULTS: Record<string, FingerprintState> = {
  'verify-match': { kind: 'match' },
  'verify-no-match': { kind: 'no-match' },
  'verify-retry-scan': { kind: 'retry', reason: 'retry-scan' },
  'verify-swipe-too-short': { kind: 'retry', reason: 'swipe-too-short' },
  'verify-finger-not-centered': { kind: 'retry', reason: 'finger-not-centered' },
  'verify-remove-and-retry': { kind: 'retry', reason: 'remove-and-retry' },
  'verify-disconnected': { kind: 'unavailable' },
  'verify-unknown-error': { kind: 'unavailable' },
};

export function watchVerifyResults(onResult: (state: FingerprintState) => void): () => void {
  const subscription = Gio.DBus.system.signal_subscribe(FPRINTD, DEVICE_INTERFACE, 'VerifyStatus', null, null,
    Gio.DBusSignalFlags.NONE, (_connection, _sender, _path, _interface, _signal, parameters: GLib.Variant) => {
      const [result] = parameters.deepUnpack<[string, boolean]>();
      const state = RESULTS[result];
      if (state) onResult(state);
    });
  return () => Gio.DBus.system.signal_unsubscribe(subscription);
}

const RETRY_MESSAGES: Record<RetryReason, string> = {
  'retry-scan': 'fingerprint-retry-scan',
  'swipe-too-short': 'fingerprint-swipe-too-short',
  'finger-not-centered': 'fingerprint-finger-not-centered',
  'remove-and-retry': 'fingerprint-remove-and-retry',
};

export function describeFingerprint(state: FingerprintState): string | null {
  switch (state.kind) {
  case 'scanning': return KestrelUi.t('fingerprint-scanning');
  case 'retry': return KestrelUi.t(RETRY_MESSAGES[state.reason]);
  case 'no-match': return KestrelUi.t('fingerprint-not-recognized');
  case 'unavailable': return KestrelUi.t('fingerprint-unavailable');
  default: return null;
  }
}
