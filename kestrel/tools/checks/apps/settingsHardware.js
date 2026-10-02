import {plugInBluetoothAdapter} from '../../fixtures/bluetoothAdapter.js';
import {LuftApp, sleep} from './luftApp.js';

const SIDEBAR_WIDTH = 280;
const HOT_PLUG = 1500;
const LOADING = 600;

function sidebar(app) {
  const {x, y, height} = app.window.get_frame_rect();
  return {x, y, width: SIDEBAR_WIDTH, height};
}

export async function checkSettingsHardware({styles, require, output}) {
  styles.interface.set_string('color-scheme', 'prefer-dark');
  const app = new LuftApp('settings');
  try {
    await app.open();
    const area = sidebar(app);
    await app.settle(() => true, area);
    await sleep(LOADING);
    const bare = await app.settle(() => true, area);
    bare.save(`${output}/settings-sidebar-dark.png`);

    const adapter = plugInBluetoothAdapter();
    let plugged;
    try {
      await sleep(HOT_PLUG);
      plugged = await app.settle(frame => !frame.looksLike(bare), area);
      plugged.save(`${output}/settings-sidebar-bluetooth-dark.png`);
    } finally {
      adapter.unplug();
    }
    require(!plugged.looksLike(bare), 'settings adds Bluetooth to the sidebar when an adapter is plugged in');

    await sleep(HOT_PLUG);
    const unplugged = await app.settle(frame => frame.looksLike(bare), area);
    require(unplugged.looksLike(bare), 'settings leaves Bluetooth out of the sidebar without an adapter');
  } finally {
    await app.close();
  }
}
