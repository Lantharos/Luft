import { ensureActorVisibleInScrollView } from '../../../core/runtime/animationUtils.js';
import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import St from 'gi://St';

import { blurSurface } from '../../../shared/layout/surface.js';
import { pixelScale } from '../../../shared/display/graphics.js';
import { isControlEnter } from '../../../shared/input/keyboardNavigation.js';
import { appKey } from '../../../shared/apps/launchHistory.js';
import { SearchEngine, type SearchHost } from '../../search/engine.js';
import { searchField } from '../../search/field.js';
import { watchInstalledApps } from '../../search/installedApps.js';
import type { SearchView } from '../../search/item.js';
import { launchApp } from '../../search/providers/apps.js';
import { openWindows } from '../../search/providers/windows.js';
import { SearchResults } from '../../search/results/searchResults.js';
import type { GustArea, GustSurface } from '../gust.js';
import type { Offset } from '../../../shared/layout/edge.js';
import { CategoryChips } from './chips.js';
import { PalettePreview } from './preview.js';
import { AppSheet } from './sheet.js';

const WIDTH = 820;
const EDGE_MARGIN = 12;
const SHEET_HEIGHT = 476;
const SHEET_CHROME = 124;
const CHIPS_HEIGHT = 44;
const DROP = -16;
const PAGE = 5;
const MINIMUM_LIST = 160;
const APP = appKey('');

type Mode = 'grid' | 'windows' | 'results';

const LIST_STEPS = new Map([[Clutter.KEY_Up, -1], [Clutter.KEY_Down, 1], [Clutter.KEY_Page_Up, -PAGE], [Clutter.KEY_Page_Down, PAGE]]);
const GRID_STEPS = new Map([[Clutter.KEY_Left, [-1, 0]], [Clutter.KEY_Right, [1, 0]], [Clutter.KEY_Up, [0, -1]], [Clutter.KEY_Down, [0, 1]]]);
const GRID_PAGES = new Map([[Clutter.KEY_Page_Up, -1], [Clutter.KEY_Page_Down, 1]]);

export class GustPalette implements GustSurface {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-gust-palette', orientation: Clutter.Orientation.VERTICAL,
    style_class: 'kestrel-popover kestrel-gust-palette', reactive: true, visible: false,
  });
  readonly search: St.Entry;
  readonly focusOnTouch = true;
  private readonly list = new St.BoxLayout({ name: 'kestrel-search-results', orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-search-results', x_expand: true });
  private readonly scroller = new St.ScrollView({
    style_class: 'kestrel-gust-palette-scroll', hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC,
    x_expand: true, child: this.list,
  });
  private readonly body = new St.BoxLayout({ style_class: 'kestrel-gust-palette-body', visible: false });
  private readonly preview = new PalettePreview();
  private readonly chips = new CategoryChips(() => this.chosen(), text => this.typeFromChips(text));
  private readonly sheet: AppSheet;
  private readonly results: SearchResults;
  private readonly engine: SearchEngine;
  private mode: Mode = 'grid';
  private listLimit = 0;
  private sheetHeight = SHEET_HEIGHT;

  constructor(host: SearchHost) {
    blurSurface(this.actor);
    this.search = searchField(host.menus, 'kestrel-search kestrel-gust-palette-search', 20);
    this.sheet = new AppSheet(host.menus, app => this.launch(app, host.close));
    this.results = new SearchResults(host.menus, actor => ensureActorVisibleInScrollView(this.scroller, actor), { highlighted: item => this.preview.show(item) });
    this.engine = new SearchEngine(host, view => this.show(view));
    this.body.add_child(this.scroller);
    this.body.add_child(this.preview.actor);
    for (const child of [this.search, this.chips.actor, this.sheet.actor, this.body]) this.actor.add_child(child);

    const text = this.search.clutter_text;
    text.connect('text-changed', () => {
      if (this.query) this.chips.clear();
      this.filter();
      this.engine.setText(this.query);
    });
    text.connect('activate', () => this.mode === 'grid' ? this.sheet.activate() : this.results.current?.activate());
    this.search.connect('captured-event', (_entry, event) => event.type() === Clutter.EventType.KEY_PRESS ? this.key(event) : Clutter.EVENT_PROPAGATE);
    this.actor.connect('key-press-event', (_actor, event) => event.get_key_symbol() === Clutter.KEY_Escape && this.back() ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE);
    const unwatchApps = watchInstalledApps(apps => {
      this.sheet.update(apps);
      this.chips.show(this.sheet.categories(), openWindows().length > 0);
      this.filter();
      this.engine.update(apps);
    });
    this.actor.connect('destroy', () => {
      unwatchApps();
      this.engine.destroy();
      this.preview.destroy();
    });
  }

  private get query(): string {
    return this.search.get_text().trim();
  }

  focus(): void {
    this.search.grab_key_focus();
  }

  reset(): void {
    this.search.set_text('');
    this.chips.clear();
    this.chips.show(this.sheet.categories(), openWindows().length > 0);
    this.filter();
    this.show(null);
    this.engine.prepare();
  }

  slideFrom(): Offset {
    return { translation_x: 0, translation_y: DROP };
  }

  place({ monitor, area }: GustArea): void {
    const scale = St.ThemeContext.get_for_stage(global.stage).scale_factor;
    const width = Math.min(WIDTH, area.width - 2 * EDGE_MARGIN);
    const y = Math.max(area.y, monitor.y + Math.round((monitor.height - (SHEET_HEIGHT + SHEET_CHROME) * scale) / 2));
    this.actor.set_width(width);
    const pixels = pixelScale(this.actor);
    const snapped = (value: number) => Math.round(Math.round(value) * pixels) / pixels;
    this.actor.set_position(snapped(area.x + (area.width - width) / 2), snapped(y));
    const limit = Math.max(MINIMUM_LIST, Math.floor((area.y + area.height - y - this.search.height - EDGE_MARGIN * 4) / scale));
    if (limit === this.listLimit) return;
    this.listLimit = limit;
    this.scroller.style = `max-height: ${limit}px;`;
    this.sheetHeight = Math.max(MINIMUM_LIST, Math.min(SHEET_HEIGHT, limit - CHIPS_HEIGHT));
    this.sheet.actor.style = `height: ${this.sheetHeight}px;`;
    this.fitBody();
  }

  private filter(): void {
    const chip = this.chips.selected;
    this.sheet.filter(this.query, chip === 'open' ? null : chip);
  }

  private chosen(): void {
    if (this.query) this.search.set_text('');
    this.filter();
    this.show(null);
  }

  private show(view: SearchView | null): void {
    const windows = !view && this.chips.selected === 'open';
    this.setMode(windows ? 'windows' : !view || view.best?.key.startsWith(APP) ? 'grid' : 'results');
    const shown = windows ? this.engine.openWindows() : view;
    if (!shown || this.mode === 'grid') return;
    this.body.visible = !!shown.best || shown.groups.some(group => group.items.length);
    this.results.show(this.list, shown);
    if (shown.fresh) this.scroller.vadjustment.value = 0;
  }

  private setMode(mode: Mode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.chips.actor.visible = mode !== 'results';
    this.sheet.actor.visible = mode === 'grid';
    if (mode === 'grid') this.body.hide();
    this.fitBody();
  }

  private fitBody(): void {
    this.body.style = this.mode === 'windows' ? `min-height: ${this.sheetHeight}px;` : null;
  }

  private back(): boolean {
    if (this.query) this.search.set_text('');
    else if (this.chips.selected) this.chips.select(null);
    else return false;
    return true;
  }

  private typeFromChips(text: string): void {
    this.search.grab_key_focus();
    if (text) this.search.clutter_text.insert_text(text, -1);
  }

  private launch(app: Gio.AppInfo, close: () => void): void {
    launchApp(app);
    close();
  }

  private key(event: Clutter.Event): boolean {
    const key = event.get_key_symbol();
    const shifted = !!(event.get_state() & Clutter.ModifierType.SHIFT_MASK);
    if (key === Clutter.KEY_Menu || (key === Clutter.KEY_F10 && shifted)) {
      if (this.mode === 'grid') this.sheet.openMenu();
      else this.results.openMenu();
      return Clutter.EVENT_STOP;
    }
    if (this.mode !== 'results' && (key === Clutter.KEY_Tab || key === Clutter.KEY_ISO_Left_Tab)) {
      this.chips.focus();
      return Clutter.EVENT_STOP;
    }
    return this.mode === 'grid' ? this.gridKey(key) : this.listKey(event, key);
  }

  private gridKey(key: number): boolean {
    const move = GRID_STEPS.get(key);
    const pages = GRID_PAGES.get(key);
    if (move) this.sheet.move(move[0], move[1]);
    else if (pages) this.sheet.move(0, pages * this.sheet.pageRows);
    else return Clutter.EVENT_PROPAGATE;
    return Clutter.EVENT_STOP;
  }

  private listKey(event: Clutter.Event, key: number): boolean {
    const steps = LIST_STEPS.get(key);
    if (steps !== undefined) {
      this.results.move(steps);
      return Clutter.EVENT_STOP;
    }
    if (isControlEnter(event)) {
      this.results.current?.reveal?.();
      return Clutter.EVENT_STOP;
    }
    return Clutter.EVENT_PROPAGATE;
  }
}
