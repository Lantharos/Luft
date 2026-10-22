import type Gio from 'gi://Gio';

import { t } from '../../../shared/i18n/index.js';
import { PeekError } from '../errors.js';
import { callerProcess, type PidFd } from '../../../shared/dbus/processes.js';
import { processUnit, statOf } from './processes.js';

export interface Caller {
  readonly unit: string;
}

const USER_MANAGER = /\/init\.scope$/;

export function identify(pid: number, launchedBy: (unit: string) => Caller | null): Caller | null {
  let own: string | null = null;
  for (let current = pid; current > 1;) {
    const unit = processUnit(current);
    if (!unit || USER_MANAGER.test(unit)) break;
    own ??= unit;
    const owner = launchedBy(unit);
    if (owner) return owner;
    current = statOf(current)?.parent ?? 0;
  }
  return own ? { unit: own } : null;
}

export async function identifiedProcess(invocation: Gio.DBusMethodInvocation): Promise<PidFd> {
  const process = await callerProcess(invocation);
  if (!process) throw new PeekError('Failed', t('peek-error-no-caller'));
  return process;
}
