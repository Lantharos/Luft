import Gio from 'gi://Gio';
import Polkit from 'gi://Polkit';
import PolkitAgent from 'gi://PolkitAgent';
import type Shell from 'gi://Shell';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {StandInSession} from '../../../fixtures/auth/polkitSession.js';

export interface Request {
  uids?: number[];
  message?: string;
  iconName?: string;
  subjectPid?: number;
}

export type Outcome = 'authorized' | 'dismissed';

const ACTION = 'com.lantharos.checks.change-settings';
const MESSAGE = 'Authentication is required to change the system settings';
let cookies = 0;

export const myUid = () => new Gio.Credentials().get_unix_user();

export async function withStandInHelper<T>(run: () => Promise<T>): Promise<T> {
  const helper = PolkitAgent.Session;
  Object.assign(PolkitAgent, {Session: StandInSession});
  try {
    return await run();
  } finally {
    Object.assign(PolkitAgent, {Session: helper});
  }
}

export function ask({uids = [myUid()], message = MESSAGE, iconName = '', subjectPid}: Request = {}): Promise<Outcome> {
  const agent = Main.componentManager.allComponents.polkitAgent as unknown as Shell.PolkitAuthenticationAgent;
  const details = new Polkit.Details();
  if (subjectPid) details.insert('polkit.subject-pid', String(subjectPid));
  const identities = uids.map(uid => Polkit.UnixUser.new(uid));
  return new Promise(resolve => agent.vfunc_initiate_authentication(ACTION, message, iconName, details, `kestrel-checks-${++cookies}`,
    identities, new Gio.Cancellable(), (_agent, result) => {
      try {
        agent.vfunc_initiate_authentication_finish(result!);
        resolve('authorized');
      } catch {
        resolve('dismissed');
      }
    }));
}
