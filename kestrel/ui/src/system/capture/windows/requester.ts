import type Gio from 'gi://Gio';

import { appName } from '../../../portal/core/apps.js';
import { identify } from '../../../shared/dbus/sandbox.js';
import { t } from '../../../shared/i18n/index.js';
import { CaptureError } from './errors.js';

export interface Requester {
  readonly app: string;
  readonly name: string;
  readonly sender: string;
}

export async function requester(invocation: Gio.DBusMethodInvocation): Promise<Requester | null> {
  const caller = await identify(invocation);
  if (caller.kind === 'you') return null;
  if (caller.kind === 'unknown') throw new CaptureError('Denied', t('window-capture-error-unknown-app'));
  return { app: caller.app, name: appName(caller.app), sender: invocation.get_sender()! };
}
