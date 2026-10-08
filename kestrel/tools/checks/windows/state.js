import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import {checks} from '../lib/check.js';
import {fixture, spawn, waitForWindow} from '../lib/processes.js';

const {require, eventually} = checks('window state');
const RELEASE_SIGNAL = 10;

function listed(window) {
  const switcher = global.display.get_tab_list(Meta.TabList.NORMAL, null).includes(window);
  const taskbar = Shell.AppSystem.get_default().get_running().some(app => app.get_windows().includes(window));
  return switcher || taskbar;
}

export async function run() {
  const client = spawn(['python3', fixture('clients', 'wayland', 'windowStateClient.py'), 'skip', 'above']);
  const window = await waitForWindow('Kestrel window state: skip above');
  await eventually(() => window.skip_taskbar && !listed(window), 'a client can keep its window out of the taskbar and switcher');
  require(window.is_above(), 'a client can keep its window above others');

  client.send_signal(RELEASE_SIGNAL);
  await eventually(() => !window.skip_taskbar && listed(window), 'the window returns to the taskbar and switcher when the client lets go');
  require(!window.is_above(), 'the window stacks normally again when the client lets go');
}
