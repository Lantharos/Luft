import Gio from 'gi://Gio';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {settled} from '../../lib/wait.js';
import {withScheme} from './palette.js';

const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

export async function squareCorners(look: () => Promise<void>) {
  kestrel.set_boolean('rounded-window-corners', false);
  try {
    await settled();
    await look();
  } finally {
    kestrel.reset('rounded-window-corners');
    await settled();
  }
}

export async function saveEveryLook(app: LuftApp, name: string) {
  (await app.settle(() => true)).save(`${name}-dark`);
  await withScheme('light', async () => (await app.settle(() => true)).save(`${name}-light`));
  await squareCorners(async () => (await app.settle(() => true)).save(`${name}-square`));
}
