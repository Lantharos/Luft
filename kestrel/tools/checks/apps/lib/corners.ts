import Gio from 'gi://Gio';

import {settled} from '../../lib/wait.js';

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
