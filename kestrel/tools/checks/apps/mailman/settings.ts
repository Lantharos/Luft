import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {press, type} from '../../lib/input/input.js';
import {changes, withApp} from '../lib/apps.js';

const {eventually} = checks('Luft app');
const STORE = GLib.build_filenamev([GLib.get_user_data_dir(), 'com.lantharos.mailman', 'mail.sqlite']);

function query(sql: string) {
  const [, stdout] = GLib.spawn_sync(null, ['sqlite3', STORE, sql], null, GLib.SpawnFlags.SEARCH_PATH, null);
  return new TextDecoder().decode(stdout!).trim();
}

function seedAccount() {
  const config = JSON.stringify({protocol: {kind: 'imap', imap: {host: '127.0.0.1', port: 9, security: 'none'}, smtp: {host: '127.0.0.1', port: 9, security: 'none'}}, username: 'mara', oauth: null});
  query(`INSERT INTO accounts (id, email, name, config, added) VALUES (1, 'mara@example.test', 'Mara', '${config}', strftime('%s', 'now'));
    INSERT INTO identities (account, name, address, preferred) VALUES (1, 'Mara', 'mara@example.test', 1);`);
}

async function addAddress(app: LuftApp) {
  (await changes(app, 'Ctrl+, opens the settings', () => press(Clutter.KEY_Control_L, Clutter.KEY_comma))).save('mailman-settings');
  await changes(app, 'clicking an account opens its settings', async () => app.click(await app.find({role: 'button', name: 'Mara'})));
  await changes(app, 'Add an address opens the address editor', async () => app.click(await app.find({role: 'button', name: 'Add an address'})));
  const name = await app.find({role: 'textbox', name: 'Name'});
  await changes(app, 'typing a name with a space keeps the editor open', () => {
    app.click(name);
    press(Clutter.KEY_Control_L, Clutter.KEY_a);
    type('Mara Lindqvist');
  });
  (await app.settle(() => true)).save('mailman-address-editor');
  app.click(await app.find({role: 'textbox', name: 'Address'}));
  type('mara.work@example.test');
  await changes(app, 'Save keeps the new address', async () => app.click(await app.find({role: 'button', name: 'Save'})));
}

export async function checkSettings() {
  seedAccount();
  try {
    await withApp('mailman', [], async app => {
      await addAddress(app);
      await eventually(() => query("SELECT name FROM identities WHERE address = 'mara.work@example.test'") === 'Mara Lindqvist', 'a space typed into the address editor stays in the name');
    });
  } finally {
    query('PRAGMA foreign_keys = ON; DELETE FROM accounts WHERE id = 1;');
  }
}
