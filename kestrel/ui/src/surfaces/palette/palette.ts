import { ensureActorVisibleInScrollView } from '../../core/runtime/animationUtils.js';
import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { blurSurface } from '../../shared/layout/surface.js';
import { isControlEnter } from '../../shared/input/keyboardNavigation.js';
import { SearchEngine, type SearchHost } from '../search/engine.js';
import { searchField } from '../search/field.js';
import { watchInstalledApps } from '../search/installedApps.js';
import type { SearchView } from '../search/item.js';
import { SearchResults } from '../search/results/searchResults.js';
import type { StartArea, StartSurface } from '../start/startSurface.js';
import { PalettePreview } from './preview.js';

const WIDTH = 760;
const EDGE_MARGIN = 12;
const TOP = 0.18;
const PAGE = 5;
const MINIMUM_LIST = 160;

const STEPS = new Map([[Clutter.KEY_Up, -1], [Clutter.KEY_Down, 1], [Clutter.KEY_Page_Up, -PAGE], [Clutter.KEY_Page_Down, PAGE]]);

export class Palette implements StartSurface {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-palette', orientation: Clutter.Orientation.VERTICAL,
    style_class: 'kestrel-popover kestrel-palette', reactive: true, visible: false,
  });
  readonly search: St.Entry;
  readonly slideDistance = -16;
  readonly focusOnTouch = true;
  private readonly list = new St.BoxLayout({ name: 'kestrel-search-results', orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-search-results', x_expand: true });
  private readonly scroller = new St.ScrollView({
    style_class: 'kestrel-palette-scroll', hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC,
    x_expand: true, child: this.list,
  });
  private readonly body = new St.BoxLayout({ style_class: 'kestrel-palette-body', visible: false });
  private readonly preview = new PalettePreview();
  private readonly results: SearchResults;
  private readonly engine: SearchEngine;
  private listLimit = 0;

  constructor(host: SearchHost) {
    blurSurface(this.actor);
    this.search = searchField(host.menus, 'kestrel-search kestrel-palette-search', 20);
    this.results = new SearchResults(host.menus, actor => ensureActorVisibleInScrollView(this.scroller, actor), { highlighted: item => this.preview.show(item) });
    this.engine = new SearchEngine(host, view => this.show(view));
    this.body.add_child(this.scroller);
    this.body.add_child(this.preview.actor);
    this.actor.add_child(this.search);
    this.actor.add_child(this.body);

    const text = this.search.clutter_text;
    text.connect('text-changed', () => this.engine.setText(this.search.get_text()));
    text.connect('activate', () => this.results.current?.activate());
    text.connect('key-press-event', (_text, event) => this.key(event));
    this.actor.connect('key-press-event', (_actor, event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Escape || !this.search.get_text()) return Clutter.EVENT_PROPAGATE;
      this.search.set_text('');
      return Clutter.EVENT_STOP;
    });
    const unwatchApps = watchInstalledApps(apps => this.engine.update(apps));
    this.actor.connect('destroy', () => {
      unwatchApps();
      this.engine.destroy();
      this.preview.destroy();
    });
  }

  focus(): void {
    this.search.grab_key_focus();
  }

  reset(): void {
    this.search.set_text('');
    this.show(null);
    this.engine.prepare();
  }

  place({ monitor, bottom }: StartArea): void {
    const width = Math.min(WIDTH, monitor.width - 2 * EDGE_MARGIN);
    const y = monitor.y + Math.round(monitor.height * TOP);
    this.actor.set_width(width);
    this.actor.set_position(Math.round(monitor.x + (monitor.width - width) / 2), y);
    const scale = St.ThemeContext.get_for_stage(global.stage).scale_factor;
    const limit = Math.max(MINIMUM_LIST, Math.floor((bottom - y - this.search.height - EDGE_MARGIN * 4) / scale));
    if (limit === this.listLimit) return;
    this.listLimit = limit;
    this.scroller.style = `max-height: ${limit}px;`;
  }

  private show(view: SearchView | null): void {
    const shown = view ?? this.engine.suggestions();
    this.body.visible = !!shown.best || shown.groups.length > 0;
    this.results.show(this.list, shown);
    if (shown.fresh) this.scroller.vadjustment.value = 0;
  }

  private key(event: Clutter.Event): boolean {
    const key = event.get_key_symbol();
    const steps = STEPS.get(key);
    if (steps !== undefined) {
      this.results.move(steps);
      return Clutter.EVENT_STOP;
    }
    if (isControlEnter(event)) {
      this.results.current?.reveal?.();
      return Clutter.EVENT_STOP;
    }
    const shifted = !!(event.get_state() & Clutter.ModifierType.SHIFT_MASK);
    if (key === Clutter.KEY_Menu || (key === Clutter.KEY_F10 && shifted)) {
      this.results.openMenu();
      return Clutter.EVENT_STOP;
    }
    return Clutter.EVENT_PROPAGATE;
  }
}
