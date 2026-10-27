import Cairo from 'cairo';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import {existing} from '../../lib/actors.js';
import {scratch} from '../../lib/processes.js';
import {settled} from '../../lib/wait.js';
import {bottomGap, captureBottom, eventually, FLOATING_MARGIN, HEIGHTS, panel, panelBox, primary, set, settings} from './taskbar.js';

const STYLES = ['bar', 'floating'];
const LOOKS = ['glass', 'solid', 'transparent', 'accent'];
const SCHEMES = {'prefer-dark': 'dark', default: 'light'};
const SCHEME_TIMEOUT = 3000;
const INK_MIDPOINT = 128;
const PICTURES = ['picture-uri', 'picture-uri-dark'];
const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});

function inksDark() {
  const {red, green, blue} = panel().get_theme_node().get_foreground_color();
  return (red + green + blue) / 3 < INK_MIDPOINT;
}

function backdrop() {
  const glass = panel().get_effect('backdrop');
  if (!(glass instanceof Shell.BlurEffect)) throw new Error('The taskbar has no glass');
  return glass;
}

function shaded(name: string) {
  const glass = backdrop();
  const light = name === 'light';
  return inksDark() === light && (light ? glass.dark_lift > 0 && glass.bright_dim === 0 : glass.bright_dim > 0 && glass.dark_lift === 0);
}

function checkShading(name: string, label?: string) {
  const light = name === 'light';
  return eventually(() => shaded(name), label ??
    `the ${name} taskbar draws its text and icons in ${light ? 'dark' : 'light'} ink, and its glass ${light ? 'lifts dark' : 'dims bright'} wallpapers behind it`);
}

function plainWallpaper(name: string, gray: number) {
  const path = scratch(`taskbar-${name}-wallpaper.png`);
  const surface = new Cairo.ImageSurface(Cairo.Format.RGB24, 64, 64);
  const context = new Cairo.Context(surface);
  context.setSourceRGB(gray, gray, gray);
  context.paint();
  surface.writeToPNG(path);
  return Gio.File.new_for_path(path).get_uri();
}

// The taskbar takes its glass from the bottom of the wallpaper when that's
// clearly light or dark, so each style gets the same wallpaper here
async function withWallpaper(uri: string, action: () => Promise<void>) {
  const saved = PICTURES.map(key => [key, background.get_string(key)]);
  try {
    for (const key of PICTURES) background.set_string(key, uri);
    return await action();
  } finally {
    for (const [key, value] of saved) background.set_string(key, value);
  }
}

async function checkPureBlack(name: string) {
  set('taskbar-look', 'glass');
  set('pure-black', true);
  const opaque = name === 'dark';
  await eventually(() => panel().has_style_class_name('kestrel-taskbar-opaque') === opaque && backdrop().enabled === !opaque,
    `pure black ${opaque ? 'makes the dark taskbar opaque' : 'leaves the light taskbar glass'}`);
  await captureBottom(`taskbar-pure-black-${name}`);
  settings.reset('pure-black');
}

export async function checkAlignment() {
  const center = existing('kestrel-panel-center');
  set('taskbar-alignment', 'left');
  await eventually(() => Math.round(center.get_transformed_position()[0] - panel().x) <= 8, 'Start and the apps move to the left edge');
  await captureBottom('taskbar-left');
  set('taskbar-alignment', 'center');
  const monitor = primary();
  await eventually(() => Math.abs(center.get_transformed_position()[0] + center.width / 2 - (monitor.x + monitor.width / 2)) <= 1,
    'Start and the apps return to the middle');
}

export async function checkLooks() {
  await withWallpaper(background.get_string('picture-uri'), checkStyles);
}

async function checkStyles() {
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  for (const [scheme, name] of Object.entries(SCHEMES)) {
    styles.set_string('color-scheme', scheme);
    await settled(SCHEME_TIMEOUT);
    await checkShading(name);
    for (const style of STYLES) {
      set('taskbar-style', style);
      for (const look of LOOKS) {
        set('taskbar-look', look);
        await eventually(() => panel().has_style_class_name(`kestrel-taskbar-${look}`) && backdrop().enabled === ['glass', 'accent'].includes(look),
          `the ${style} taskbar takes the ${look} look and blurs only when it needs to`);
        await captureBottom(`taskbar-${style}-${look}-${name}`);
      }
    }
    await checkPureBlack(name);
  }
  set('taskbar-look', 'glass');
}

export async function checkWallpaperGlass() {
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  for (const [scheme, name, glass, gray] of [['prefer-dark', 'dark', 'light', 1], ['default', 'light', 'dark', 0]] as const) {
    styles.set_string('color-scheme', scheme);
    await withWallpaper(plainWallpaper(glass, gray), async () => {
      await checkShading(glass, `over a ${gray ? 'white' : 'black'} wallpaper the ${name} style's taskbar takes ${glass} glass`);
      await captureBottom(`taskbar-${glass}-wallpaper-${name}`);
    });
  }
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
  for (const size of ['compact', 'large', 'normal'] as const) {
    set('taskbar-size', size);
    await eventually(() => panel().height === HEIGHTS[size] && bottomGap() === HEIGHTS[size],
      `the ${size} taskbar is ${HEIGHTS[size]} pixels tall and reserves that much`);
    if (size !== 'normal') await captureBottom(`taskbar-${size}`);
  }
}
