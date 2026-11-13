import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import {press, type, type Point} from '../../lib/input/input.js';
import {changes, withApp} from '../lib/apps.js';

const {eventually} = checks('Luft app');
const STORE = GLib.build_filenamev([GLib.get_user_data_dir(), 'com.lantharos.mailman', 'mail.sqlite']);
const ACCOUNT_ROW: Point = [714, 155];
const ADD_ADDRESS: Point = [548, 351];
const NAME_FIELD: Point = [600, 394];
const ADDRESS_FIELD: Point = [830, 394];
const SAVE: Point = [520, 630];

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
  await changes(app, 'clicking an account opens its settings', () => app.click(ACCOUNT_ROW));
  await changes(app, 'Add an address opens the address editor', () => app.click(ADD_ADDRESS));
  await changes(app, 'typing a name with a space keeps the editor open', () => {
    app.click(NAME_FIELD);
    press(Clutter.KEY_Control_L, Clutter.KEY_a);
    type('Mara Lindqvist');
  });
  (await app.settle(() => true)).save('mailman-address-editor');
  app.click(ADDRESS_FIELD);
  type('mara.work@example.test');
  await changes(app, 'Save keeps the new address', () => app.click(SAVE));
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
