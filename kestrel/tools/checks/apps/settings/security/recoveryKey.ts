import Clutter from 'gi://Clutter';

import {RECOVERY_WORD} from '../../../../fixtures/system/security/recoveryKeys.js';
import type {LuftApp} from '../../../lib/apps/luftApp.js';
import {press, type, type Point} from '../../../lib/input/input.js';
import {changes} from '../../lib/apps.js';
import {show} from '../navigation.js';

const AT = {
  show: [876, 433],
  replace: [955, 433],
  writeDown: [558, 468],
  done: [755, 536],
} satisfies Record<string, Point>;

const click = (app: LuftApp, point: Point, label: string) => changes(app, label, () => app.click(point));
const enter = (app: LuftApp, label: string) => changes(app, label, () => press(Clutter.KEY_Return));

export async function checkRecoveryKey(app: LuftApp) {
  await show(app, 'security/encryption');
  (await click(app, AT.show, 'settings shows a recovery key made of letters in its groups')).save('settings-recovery-letters-dark');
  await enter(app, 'done closes a recovery key that was only shown');
  await click(app, AT.replace, 'replacing the recovery key asks first');
  (await enter(app, 'a new recovery key shows its 12 words')).save('settings-recovery-words-dark');
  (await click(app, AT.writeDown, 'writing the key down shows its words in a dialog')).save('settings-recovery-write-down-dark');
  await enter(app, 'once the words are written down, the dialog asks for three of them');
  const prefix = RECOVERY_WORD.slice(0, 4);
  type(`${prefix} ${prefix} ${prefix}`);
  (await app.settle(() => true)).save('settings-recovery-check-dark');
  (await enter(app, 'the right three words close the dialog')).save('settings-recovery-checked-dark');
  await click(app, AT.done, 'done closes the new key once three words were typed back');
}
