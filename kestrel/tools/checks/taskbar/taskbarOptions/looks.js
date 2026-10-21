import Gio from 'gi://Gio';

import {named} from '../../lib/actors.js';
import {settled} from '../../lib/wait.js';
import {bottomGap, captureBottom, eventually, FLOATING_MARGIN, HEIGHTS, panel, panelBox, primary, require, set, settings} from './taskbar.js';

const STYLES = ['bar', 'floating'];
const LOOKS = ['glass', 'solid', 'transparent', 'accent'];
const SCHEMES = {'prefer-dark': 'dark', default: 'light'};
const SCHEME_TIMEOUT = 3000;
const INK_MIDPOINT = 128;

function inksDark() {
  const {red, green, blue} = panel().get_theme_node().get_foreground_color();
  return (red + green + blue) / 3 < INK_MIDPOINT;
}

function checkShading(name) {
  const glass = panel().get_effect('backdrop');
  const light = name === 'light';
  require(inksDark() === light, `the ${name} taskbar draws its text and icons in ${light ? 'dark' : 'light'} ink`);
  require(light ? glass.dark_lift > 0 && glass.bright_dim === 0 : glass.bright_dim > 0 && glass.dark_lift === 0,
    `the ${name} taskbar glass ${light ? 'lifts dark' : 'dims bright'} wallpapers behind it`);
}

async function checkPureBlack(name) {
  set('taskbar-look', 'glass');
  set('pure-black', true);
  const opaque = name === 'dark';
  await eventually(() => panel().has_style_class_name('kestrel-taskbar-opaque') === opaque && panel().get_effect('backdrop').enabled === !opaque,
    `pure black ${opaque ? 'makes the dark taskbar opaque' : 'leaves the light taskbar glass'}`);
  await captureBottom(`taskbar-pure-black-${name}`);
  settings.reset('pure-black');
}

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
    checkShading(name);
    for (const style of STYLES) {
      set('taskbar-style', style);
      for (const look of LOOKS) {
        set('taskbar-look', look);
        await eventually(() => panel().has_style_class_name(`kestrel-taskbar-${look}`) && panel().get_effect('backdrop').enabled === ['glass', 'accent'].includes(look),
          `the ${style} taskbar takes the ${look} look and blurs only when it needs to`);
        await captureBottom(`taskbar-${style}-${look}-${name}`);
      }
    }
    await checkPureBlack(name);
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
