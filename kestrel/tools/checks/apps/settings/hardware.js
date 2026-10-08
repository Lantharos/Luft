import {plugInBluetoothAdapter} from '../../../fixtures/system/bluetoothAdapter.js';
import {checks} from '../../lib/check.js';

const {require} = checks('Luft app');
const SIDEBAR = {x: 0, y: 0, width: 280};

export async function checkHardware(app) {
  const area = app.area(SIDEBAR);
  const bare = await app.settle(() => true, area);
  bare.save('settings-sidebar-dark');
  const adapter = plugInBluetoothAdapter();
  let plugged;
  try {
    plugged = await app.settle(frame => !frame.looksLike(bare), area);
    plugged.save('settings-sidebar-bluetooth-dark');
  } finally {
    adapter.unplug();
  }
  require(!plugged.looksLike(bare), 'settings adds Bluetooth to the sidebar when an adapter is plugged in');
  require((await app.settle(frame => frame.looksLike(bare), area)).looksLike(bare), 'settings leaves Bluetooth out of the sidebar without an adapter');
}
