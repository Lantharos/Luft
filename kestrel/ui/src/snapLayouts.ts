import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { blurSurface } from './surface.js';

type Zone = [x: number, y: number, width: number, height: number];

const THIRD = 1 / 3;
const LAYOUTS: Zone[][] = [
  [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]],
  [[0, 0, 2 * THIRD, 1], [2 * THIRD, 0, THIRD, 1]],
  [[0, 0, THIRD, 1], [THIRD, 0, THIRD, 1], [2 * THIRD, 0, THIRD, 1]],
  [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
  [[0, 0, 0.5, 1], [0.5, 0, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
  [[0, 0, 0.25, 1], [0.25, 0, 0.5, 1], [0.75, 0, 0.25, 1]],
];
const CARD_WIDTH = 132;
const CARD_HEIGHT = 84;
const ZONE_GAP = 3;
const COLUMNS = 3;
const CARD_GAP = 10;

export class SnapLayouts {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-snap-layouts', orientation: Clutter.Orientation.VERTICAL,
    style_class: 'kestrel-popover kestrel-snap-layouts', visible: false, reactive: true,
  });
  private window: Meta.Window | null = null;

  constructor(
    private readonly workArea: (monitorIndex: number) => Mtk.Rectangle,
    private readonly snap: (window: Meta.Window, rect: Mtk.Rectangle) => void,
    private readonly close: () => void,
  ) {
    blurSurface(this.actor);
    this.actor.style = `spacing: ${CARD_GAP}px;`;
    let row: St.BoxLayout | null = null;
    LAYOUTS.forEach((layout, index) => {
      if (index % COLUMNS === 0) {
        row = new St.BoxLayout({ style: `spacing: ${CARD_GAP}px;` });
        this.actor.add_child(row);
      }
      row!.add_child(this.card(layout));
    });
  }

  size(): [width: number, height: number] {
    const theme = this.actor.get_theme_node();
    const rows = Math.ceil(LAYOUTS.length / COLUMNS);
    return [
      COLUMNS * CARD_WIDTH + (COLUMNS - 1) * CARD_GAP + theme.get_horizontal_padding(),
      rows * CARD_HEIGHT + (rows - 1) * CARD_GAP + theme.get_vertical_padding(),
    ];
  }

  get available(): boolean {
    const window = (global as unknown as Shell.Global).display.focus_window;
    return !!window && window.window_type === Meta.WindowType.NORMAL && window.allows_resize();
  }

  prepareOpen(): void {
    this.window = (global as unknown as Shell.Global).display.focus_window;
  }

  focus(): void {
    this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
  }

  private card(layout: Zone[]): St.Widget {
    const card = new St.Widget({ style_class: 'kestrel-snap-card', width: CARD_WIDTH, height: CARD_HEIGHT });
    for (const zone of layout) {
      const [x, y, width, height] = zone;
      const button = new St.Button({
        style_class: 'kestrel-snap-zone', can_focus: true, track_hover: true,
        accessible_name: `Snap to ${Math.round(width * 100)}% by ${Math.round(height * 100)}% area`,
        x: Math.round(x * CARD_WIDTH) + ZONE_GAP, y: Math.round(y * CARD_HEIGHT) + ZONE_GAP,
        width: Math.round(width * CARD_WIDTH) - 2 * ZONE_GAP, height: Math.round(height * CARD_HEIGHT) - 2 * ZONE_GAP,
      });
      button.connect('clicked', () => this.apply(zone));
      card.add_child(button);
    }
    return card;
  }

  private apply([x, y, width, height]: Zone): void {
    const window = this.window;
    this.close();
    if (!window) return;
    const area = this.workArea(window.get_monitor());
    const left = area.x + Math.round(x * area.width);
    const top = area.y + Math.round(y * area.height);
    this.snap(window, new Mtk.Rectangle({
      x: left, y: top,
      width: area.x + Math.round((x + width) * area.width) - left,
      height: area.y + Math.round((y + height) * area.height) - top,
    }));
    window.activate((global as unknown as Shell.Global).get_current_time());
  }
}
