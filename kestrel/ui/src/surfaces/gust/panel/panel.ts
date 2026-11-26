import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import St from 'gi://St';

import { blurSurface, glassControl } from '../../../shared/layout/surface.js';
import { GustGrid } from './grid.js';
import { GustFooter } from './footer.js';
import { SearchEngine, type SearchHost } from '../../search/engine.js';
import { searchField } from '../../search/field.js';
import { watchInstalledApps } from '../../search/installedApps.js';
import { launchApp } from '../../search/providers/apps.js';
import { t } from '../../../shared/i18n/index.js';
import { pressable } from '../../../shared/motion/motion.js';
import { isControlEnter } from '../../../shared/input/keyboardNavigation.js';
import type { GustArea, GustSurface } from '../gust.js';
import { dock, isVertical, toward, type Edge, type Offset } from '../../../shared/layout/edge.js';
import { EDGE_MARGIN, middleAt } from '../../../shared/layout/anchor.js';

const WIDTH = 660;
const HEIGHT = 600;
const SLIDE = 56;

export class GustPanel implements GustSurface {
  readonly actor: St.BoxLayout;
  readonly search: St.Entry;
  readonly footer: GustFooter;
  readonly focusOnTouch = false;
  private readonly viewIcon = new St.Icon({ icon_name: 'view-list-bullet-symbolic', icon_size: 16 });
  private readonly viewButton = new St.Button({
    name: 'kestrel-gust-view', style_class: 'kestrel-icon-button kestrel-gust-view-button', child: this.viewIcon,
    accessible_name: t('gust-all-apps'), can_focus: true, track_hover: true,
  });
  private readonly browser: GustGrid;
  private readonly searchProvider: SearchEngine;
  private readonly close: () => void;

  constructor(host: SearchHost) {
    const { menus } = host;
    this.close = host.close;
    this.actor = new St.BoxLayout({
      name: 'kestrel-gust-panel',
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-popover kestrel-gust-panel',
      reactive: true, visible: false,
    });
    blurSurface(this.actor);
    this.search = searchField(menus, 'kestrel-search', 16);
    glassControl(this.actor, this.search);
    this.search.clutter_text.connect('text-changed', () => this.searchProvider.setText(this.search.get_text()));
    this.search.clutter_text.connect('key-press-event', (_text, event) => {
      if (event.get_key_symbol() === Clutter.KEY_Down) return this.browser.focusFirst() ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
      const reveal = this.browser.firstResult?.reveal;
      if (!reveal || !isControlEnter(event)) return Clutter.EVENT_PROPAGATE;
      reveal();
      return Clutter.EVENT_STOP;
    });
    this.search.clutter_text.connect('activate', () => this.browser.firstResult?.activate());
    this.search.clutter_text.connect('key-focus-in', () => this.browser.highlightFirstResult(true));
    this.search.clutter_text.connect('key-focus-out', () => this.browser.highlightFirstResult(false));
    const header = new St.BoxLayout({ style_class: 'kestrel-gust-header' });
    header.add_child(this.search);
    header.add_child(this.viewButton);
    this.actor.add_child(header);
    const scroller = new St.ScrollView({
      style_class: 'kestrel-app-scroll',
      hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.AUTOMATIC,
      height: 0,
      x_expand: true, y_expand: true,
    });
    this.browser = new GustGrid(scroller, menus, app => this.launch(app));
    this.searchProvider = new SearchEngine(host, view => this.browser.showResults(view), app => [this.browser.pinEntry(app)]);
    this.browser.hint.bind(this.viewButton, () => this.viewButton.accessible_name);
    this.viewButton.connect('clicked', () => this.showAll(!this.browser.showingAll));
    pressable(this.viewButton, this.viewIcon);
    this.actor.add_child(this.browser.header);
    this.actor.connect('key-press-event', (_actor, event) => event.get_key_symbol() === Clutter.KEY_Escape && this.back() ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE);
    this.actor.add_child(scroller);

    this.footer = new GustFooter(host.close, menus);
    this.actor.add_child(this.footer.actor);

    const unwatchApps = watchInstalledApps(apps => {
      this.searchProvider.update(apps);
      this.browser.update(apps);
    });
    this.actor.connect('destroy', () => {
      this.searchProvider.destroy();
      unwatchApps();
    });
  }

  private showAll(all: boolean): void {
    this.search.set_text('');
    this.browser.showAll(all);
    this.viewIcon.icon_name = all ? 'view-app-grid-symbolic' : 'view-list-bullet-symbolic';
    this.viewButton.accessible_name = t(all ? 'gust-pinned' : 'gust-all-apps');
  }

  focus(): void {
    this.search.grab_key_focus();
  }

  slideFrom(edge: Edge): Offset {
    return toward(edge, SLIDE);
  }

  place({ area, available, anchor }: GustArea): void {
    const width = Math.min(WIDTH, area.width - 2 * EDGE_MARGIN);
    const height = Math.min(HEIGHT, available);
    const length = isVertical(anchor.edge) ? height : width;
    this.actor.set_size(width, height);
    this.actor.set_position(...dock(area, anchor.edge, width, height, middleAt(anchor, length), anchor.align ? 0 : EDGE_MARGIN));
  }
  private back(): boolean {
    if (this.footer.sessionOpen) { this.footer.setOpen(false); this.focus(); return true; }
    if (this.search.get_text()) { this.search.set_text(''); this.focus(); return true; }
    if (this.browser.home()) { this.focus(); return true; }
    if (this.browser.showingAll) { this.showAll(false); this.focus(); return true; }
    return false;
  }
  reset(): void {
    this.browser.home();
    this.showAll(false);
    this.footer.setOpen(false, false);
    this.searchProvider.prepare();
  }

  private launch(app: Gio.AppInfo): void {
    launchApp(app);
    this.close();
  }
}
