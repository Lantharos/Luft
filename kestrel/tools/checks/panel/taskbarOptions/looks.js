import Gio from 'gi://Gio';

import {named} from '../../lib/actors.js';
import {settled} from '../../lib/wait.js';
import {bottomGap, captureBottom, eventually, FLOATING_MARGIN, HEIGHTS, panel, panelBox, primary, set} from './taskbar.js';

const STYLES = ['bar', 'floating'];
const LOOKS = ['glass', 'solid', 'transparent', 'accent'];
const SCHEMES = {'prefer-dark': 'dark', default: 'light'};
const SCHEME_TIMEOUT = 3000;

export async function checkAlignment() {
  const center = named('kestrel-panel-center');
  set('taskbar-alignment', 'left');
  await eventually(() => Math.round(center.get_transformed_position()[0] - panel().x) <= 8, 'Start and the apps move to the left edge');
  await captureBottom('taskbar-left');
  set('taskbar-alignment', 'center');
  const monitor = primary();
  await eventually(() => Math.abs(center.get_transformed_position()[0] + center.width / 2 - (monitor.x + monitor.width / 2)) <= 1,
    'Start and the apps return to the middle');
}

export async function checkLooks() {
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  for (const [scheme, name] of Object.entries(SCHEMES)) {
    styles.set_string('color-scheme', scheme);
    await settled(SCHEME_TIMEOUT);
    for (const style of STYLES) {
      set('taskbar-style', style);
      for (const look of LOOKS) {
        set('taskbar-look', look);
        await eventually(() => panel().has_style_class_name(`kestrel-taskbar-${look}`) && panel().get_effect('backdrop').enabled === ['glass', 'accent'].includes(look),
          `the ${style} taskbar takes the ${look} look and blurs only when it needs to`);
        await captureBottom(`taskbar-${style}-${look}-${name}`);
      }
    }
  }
  set('taskbar-look', 'glass');
}

export async function checkFloating() {
  const monitor = primary();
  set('taskbar-style', 'floating');
  await eventually(() => {
    const floating = panelBox();
    return floating.x === monitor.x + FLOATING_MARGIN && floating.width === monitor.width - 2 * FLOATING_MARGIN &&
      floating.y + floating.height === monitor.y + monitor.height - FLOATING_MARGIN;
  }, 'the floating taskbar keeps a margin from the screen edges');
  await eventually(() => bottomGap() === HEIGHTS.normal + FLOATING_MARGIN, 'maximized windows stop above the floating taskbar and its margin');
  set('taskbar-style', 'bar');
}

export async function checkSizes() {
  for (const size of ['compact', 'large', 'normal']) {
    set('taskbar-size', size);
    await eventually(() => panel().height === HEIGHTS[size] && bottomGap() === HEIGHTS[size],
      `the ${size} taskbar is ${HEIGHTS[size]} pixels tall and reserves that much`);
    if (size !== 'normal') await captureBottom(`taskbar-${size}`);
  }
}
