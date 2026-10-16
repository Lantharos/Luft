import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';

import { battery, type BatteryState } from './battery.js';
import { batteryGeometry, type BatteryGeometry } from './geometry.js';
import { paintBattery, type Glyph } from './painter.js';

const LOW_LEVEL = 20;
const HALO_MARGIN = 2;
const PERCENTAGE_KEY = 'show-battery-percentage';
const STATUS_TEXT = { charging: 'charging', full: 'fully charged', plugged: 'plugged in', discharging: '' };

export type PercentageMode = 'setting' | 'never';

function glyphFor(state: BatteryState, numbered: boolean): Glyph {
  if (state.status === 'discharging') return 'none';
  return numbered ? 'outside' : 'inside';
}

export class BatteryIndicator {
  readonly actor = new St.DrawingArea({ style_class: 'kestrel-battery', y_align: Clutter.ActorAlign.CENTER, visible: false });
  private readonly interface = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private state: BatteryState | null = null;
  private geometry: BatteryGeometry | null = null;
  private family = '';

  constructor(private readonly size: number, private readonly percentage: PercentageMode = 'setting') {
    if (percentage === 'setting') this.interface.connect(`changed::${PERCENTAGE_KEY}`, () => this.relayout());
    this.actor.connect('style-changed', () => this.styleChanged());
    this.actor.connect('repaint', () => this.repaint());
    const unwatch = battery.watch(state => this.show(state));
    this.actor.connect('destroy', () => {
      unwatch();
      this.interface.run_dispose();
    });
  }

  private show(state: BatteryState | null): void {
    const previous = this.state;
    this.state = state;
    this.actor.visible = !!state;
    if (!state) return;
    this.actor.accessible_name = [`Battery ${state.percentage}%`, STATUS_TEXT[state.status]].filter(Boolean).join(', ');
    if (previous?.percentage === state.percentage && previous.status === state.status) return;
    if (!previous || glyphFor(previous, this.numbered) !== glyphFor(state, this.numbered)) this.relayout();
    else this.actor.queue_repaint();
  }

  private get numbered(): boolean {
    return this.percentage === 'setting' && this.interface.get_boolean(PERCENTAGE_KEY);
  }

  private styleChanged(): void {
    const family = this.actor.get_theme_node().get_font().get_family() ?? '';
    if (family === this.family && this.geometry) return;
    this.family = family;
    this.relayout();
  }

  private relayout(): void {
    if (!this.family) return;
    const numbered = this.numbered;
    this.geometry = batteryGeometry({
      size: this.size,
      margin: HALO_MARGIN,
      numbered,
      boltOutside: !!this.state && glyphFor(this.state, numbered) === 'outside',
      family: this.family,
    });
    this.actor.set_size(this.geometry.width, this.geometry.height);
    this.actor.queue_repaint();
  }

  private fillColor(theme: St.ThemeNode, ink: ReturnType<St.ThemeNode['get_foreground_color']>, state: BatteryState) {
    const tint = state.status === 'charging' || state.status === 'full' ? '-kestrel-battery-charging'
      : state.status === 'discharging' && state.percentage <= LOW_LEVEL ? '-kestrel-battery-low' : null;
    if (!tint) return ink;
    const [found, color] = theme.lookup_color(tint, true);
    return found ? color : ink;
  }

  private repaint(): void {
    if (!this.state || !this.geometry) return;
    const theme = this.actor.get_theme_node();
    const ink = theme.get_foreground_color();
    const numbered = this.numbered;
    const cr = this.actor.get_context();
    paintBattery(cr, {
      geometry: this.geometry,
      level: this.state.percentage,
      text: numbered ? `${this.state.percentage}` : null,
      glyph: glyphFor(this.state, numbered),
      ink,
      fill: this.fillColor(theme, ink, this.state),
      halo: theme.get_shadow('icon-shadow'),
      family: this.family,
      scale: this.actor.get_resource_scale(),
    });
    cr.$dispose();
  }
}
