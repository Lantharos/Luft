import type {LuftApp} from '../../../lib/apps/luftApp.js';
import type {Query} from '../../../lib/apps/probe.js';
import {type} from '../../../lib/input/input.js';
import {show, scrollDown} from '../navigation.js';

const ADD_KEY = {role: 'button', name: 'Add a security key'};
const ADD_CARD = {role: 'button', name: 'Add a smart card'};
const ADD = {role: 'button', name: 'Add'};
const DONE = {role: 'button', name: 'Done'};
const PASSWORD = {role: 'switch', name: 'Sign in with your password'};
const TURN_OFF = {role: 'button', name: 'Turn off'};

async function click(app: LuftApp, control: Query, label: string) {
  const target = await app.find(control);
  const before = await app.frame();
  app.click(target);
  return app.changes(before, label);
}

async function typed(app: LuftApp, text: string, label: string) {
  const before = await app.frame();
  type(text);
  return app.changes(before, label);
}

export async function checkSignIn(app: LuftApp) {
  (await scrollDown(app, await show(app, 'accounts'))).save('settings-users-keys-dark');
  (await click(app, ADD_KEY, 'adding a security key opens a dialog that asks for its PIN')).save('settings-users-add-key-dark');
  await typed(app, '2468', 'the PIN is typed');
  (await click(app, ADD, 'adding asks for a touch, then says it’s done')).save('settings-users-key-added-dark');
  await click(app, DONE, 'the dialog closes and lists the key');
  (await click(app, ADD_CARD, 'adding a smart card asks for its PIN')).save('settings-users-add-card-dark');
  await typed(app, '1357', 'the card’s PIN is typed');
  await click(app, ADD, 'the card is added');
  await click(app, DONE, 'the dialog closes and lists the card');
  (await click(app, PASSWORD, 'turning the password off asks first')).save('settings-users-password-off-dark');
  (await click(app, TURN_OFF, 'the password is off')).save('settings-users-keys-added-dark');
}
