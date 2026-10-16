import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import {battery, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import {getStyleVariant} from 'resource:///com/lantharos/kestrel/ui/kestrelTheme.js';

import {named, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {captureArea, output, renderedFrame} from '../lib/screenshots.js';
import {nextFrame, settled} from '../lib/wait.js';
import {leaveBoard, showBoard} from '../board/lib/board.js';

const {require, eventually} = checks('battery');
const LEVELS = [5, 20, 50, 100];
const SCHEMES = {'prefer-dark': 'dark', 'prefer-light': 'light'};
const PADDING = 6;
const ZOOM = 4;
const SHEET_BACKGROUND = 0x808080ff;
const TINT_TOLERANCE = 24;
const IDLE_FRAMES = 20;
const STATUS_TEXT = {charging: 'charging', full: 'fully charged', discharging: ''};

const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
const indicator = (root = named('Quick settings', named('kestrel-panel'))) => styled('kestrel-battery', root)[0];
const hex = ({red, green, blue}) => `#${[red, green, blue].map(value => value.toString(16).padStart(2, '0')).join('')}`;

function status({level, charging}) {
  if (!charging) return 'discharging';
  return level === 100 ? 'full' : 'charging';
}

const describe = state => [`Battery ${state.level}%`, STATUS_TEXT[status(state)]].filter(Boolean).join(', ');

async function apply(state) {
  battery.pin({percentage: state.level, status: status(state), secondsLeft: 0});
  await eventually(() => indicator()?.mapped && indicator().accessible_name === describe(state), `the taskbar shows ${describe(state).toLowerCase()}`);
  await nextFrame();
}

function areaAround(actor) {
  const [x, y] = actor.get_transformed_position();
  const [width, height] = actor.get_transformed_size();
  return {x: Math.floor(x - PADDING), y: Math.floor(y - PADDING), width: Math.ceil(width + 2 * PADDING), height: Math.ceil(height + 2 * PADDING)};
}

function tint(name) {
  const [found, color] = indicator().get_theme_node().lookup_color(name, true);
  require(found, `the battery has a ${name.replace('-kestrel-battery-', '')} tint in the shell style`);
  return hex(color);
}

class Sheet {
  constructor() {
    this.rows = [];
  }

  add(row, frame) {
    (this.rows[row] ??= []).push(frame.pixbuf);
  }

  save(name) {
    const cellWidth = Math.max(...this.rows.flat().map(pixbuf => pixbuf.get_width())) * ZOOM;
    const cellHeight = Math.max(...this.rows.flat().map(pixbuf => pixbuf.get_height())) * ZOOM;
    const columns = Math.max(...this.rows.map(row => row.length));
    const sheet = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, cellWidth * columns, cellHeight * this.rows.length);
    sheet.fill(SHEET_BACKGROUND);
    this.rows.forEach((row, rowIndex) => row.forEach((pixbuf, column) => {
      const zoomed = pixbuf.scale_simple(pixbuf.get_width() * ZOOM, pixbuf.get_height() * ZOOM, GdkPixbuf.InterpType.NEAREST);
      zoomed.copy_area(0, 0, zoomed.get_width(), zoomed.get_height(), sheet, column * cellWidth, rowIndex * cellHeight);
    }));
    sheet.savev(output(name), 'png', [], []);
  }
}

async function checkStates(scheme) {
  const sheet = new Sheet();
  const widths = {};
  for (const numbered of [false, true]) {
    interfaceSettings.set_boolean('show-battery-percentage', numbered);
    for (const [row, state] of LEVELS.flatMap(level => [false, true].map(charging => ({level, charging}))).entries()) {
      await apply(state);
      await settled();
      const frame = await renderedFrame(areaAround(indicator()));
      sheet.add(row, frame);
      if (state.level === 50 && !state.charging) widths[numbered] = indicator().width;
      if (state.level === 50 && state.charging)
        require(frame.count([tint('-kestrel-battery-charging')], TINT_TOLERANCE) > 0, `the ${scheme} battery fills with the charging tint while charging${numbered ? ' with the percentage' : ''}`);
      if (state.level === 20 && !state.charging)
        require(frame.count([tint('-kestrel-battery-low')], TINT_TOLERANCE) > 0, `the ${scheme} battery turns the warning tint at 20%${numbered ? ' with the percentage' : ''}`);
    }
  }
  sheet.save(`battery-${scheme}`);
  require(widths.true > widths.false && widths.true < widths.false * 1.4, `the ${scheme} battery widens slightly to hold the percentage`);
}

async function checkIdle() {
  let repaints = 0;
  const signal = indicator().connect('repaint', () => repaints++);
  try {
    for (let frame = 0; frame < IDLE_FRAMES; frame++) {
      global.stage.queue_redraw();
      await nextFrame();
    }
    battery.pin({percentage: 50, status: 'charging', secondsLeft: 1800});
    await settled();
  } finally {
    indicator().disconnect(signal);
  }
  require(repaints === 0, `the battery redraws only when its level or state changes, not on other frames or new time estimates (${repaints} redraws)`);
}

async function captureSurfaces(scheme) {
  await apply({level: 50, charging: true});
  toggleSurface('quick');
  const tile = () => styled('kestrel-control', named('kestrel-quick-settings')).find(control => control.accessible_name === 'Battery');
  await eventually(() => tile()?.mapped && indicator(tile())?.mapped, 'quick settings shows the battery tile with the drawn battery');
  await settled();
  await captureArea(`battery-quick-settings-${scheme}`, areaAround(tile()));
  toggleSurface('quick');
  await settled();
  await showBoard();
  const pill = named('kestrel-board-pill');
  await eventually(() => indicator(pill)?.mapped, 'the board pill shows the battery');
  await settled();
  await captureArea(`battery-board-pill-${scheme}`, areaAround(pill));
  await leaveBoard();
}

async function switchStyle(scheme) {
  interfaceSettings.set_string('color-scheme', scheme);
  await eventually(() => getStyleVariant() === SCHEMES[scheme], `the shell turns ${SCHEMES[scheme]}`);
  await settled();
}

export async function run() {
  const scheme = interfaceSettings.get_string('color-scheme');
  try {
    for (const style of Object.keys(SCHEMES)) {
      await switchStyle(style);
      await checkStates(SCHEMES[style]);
      interfaceSettings.set_boolean('show-battery-percentage', true);
      await captureSurfaces(SCHEMES[style]);
    }
    await checkIdle();
  } finally {
    interfaceSettings.reset('show-battery-percentage');
    interfaceSettings.set_string('color-scheme', scheme);
    battery.pin(undefined);
  }
}
