import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import {checks} from '../lib/check.js';
import {fixture, spawn, stop, waitForWindow} from '../lib/processes.js';
import {launch, openSecurityContext, through} from '../lib/sandbox.js';

const {require, eventually} = checks('window state');
const CLIENT = fixture('clients', 'wayland', 'windowStateClient.py');
const RELEASE_SIGNAL = 10;

function listed(window) {
  const switcher = global.display.get_tab_list(Meta.TabList.NORMAL, null).includes(window);
  const taskbar = Shell.AppSystem.get_default().get_running().some(app => app.get_windows().includes(window));
  return switcher || taskbar;
}

async function checkSandboxed() {
  const sandbox = await openSecurityContext('org.example.Palette');
  try {
    const {process, lines} = await launch(['python3', CLIENT, 'skip', 'above'], {env: through(sandbox.socket), label: 'the sandboxed client connects'});
    require(lines[0] === 'unavailable', 'sandboxed apps cannot keep windows out of the taskbar or above others');
    await stop(process);
  } finally {
    await stop(sandbox.process);
  }
}

export async function run() {
  await checkSandboxed();
  const client = spawn(['python3', CLIENT, 'skip', 'above']);
  const window = await waitForWindow('Kestrel window state: skip above');
  await eventually(() => window.skip_taskbar && !listed(window), 'a client can keep its window out of the taskbar and switcher');
  require(window.is_above(), 'a client can keep its window above others');

  client.send_signal(RELEASE_SIGNAL);
  await eventually(() => !window.skip_taskbar && listed(window), 'the window returns to the taskbar and switcher when the client lets go');
  require(!window.is_above(), 'the window stacks normally again when the client lets go');
}
