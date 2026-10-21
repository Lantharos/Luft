import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';

import { blurSurface } from '../../shared/layout/surface.js';
import { StartGrid } from './grid.js';
import { StartFooter } from './footer.js';
import { SearchEngine, type SearchHost } from '../search/engine.js';
import { searchField } from '../search/field.js';
import { watchInstalledApps } from '../search/installedApps.js';
import { launchApp } from '../search/providers/apps.js';
import { taskbarPreferences } from '../../desktop/panel/preferences/taskbarPreferences.js';
import { isControlEnter } from '../../shared/input/keyboardNavigation.js';
import type { StartArea, StartSurface } from './startSurface.js';

const WIDTH = 660;
const HEIGHT = 600;
const EDGE_MARGIN = 12;

export class StartMenu implements StartSurface {
  readonly actor: St.BoxLayout;
  readonly search: St.Entry;
  readonly footer: StartFooter;
  readonly slideDistance = 56;
  readonly focusOnTouch = false;
  private readonly favorites = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private pinned = this.readPinned();
  private readonly browser: StartGrid;
  private readonly searchProvider: SearchEngine;
  private readonly close: () => void;
  private apps: Gio.AppInfo[] = [];

  constructor(host: SearchHost) {
    const { menus } = host;
    this.close = host.close;
    this.actor = new St.BoxLayout({
      name: 'kestrel-start',
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-popover kestrel-start',
      reactive: true, visible: false,
    });
    blurSurface(this.actor);
    this.search = searchField(menus, 'kestrel-search', 16);
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
    this.actor.add_child(this.search);
    const scroller = new St.ScrollView({
      style_class: 'kestrel-app-scroll',
      hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.AUTOMATIC,
      height: 0,
      x_expand: true, y_expand: true,
    });
    this.browser = new StartGrid(scroller, menus, app => this.launch(app));
    this.searchProvider = new SearchEngine(host, view => this.browser.showResults(view));
    this.actor.add_child(this.browser.header);
    this.actor.connect('key-press-event', (_actor, event) => event.get_key_symbol() === Clutter.KEY_Escape && this.back() ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE);
    this.actor.add_child(scroller);

    this.footer = new StartFooter(host.close, menus);
    this.actor.add_child(this.footer.actor);

    const pinnedChanged = () => {
      this.pinned = this.readPinned();
      this.browser.update(this.apps, this.pinned);
    };
    const favoritesChanged = this.favorites.connect('changed::favorite-apps', pinnedChanged);
    const unwatchTaskbar = taskbarPreferences.watch(key => { if (key === 'taskbar-show-pinned') pinnedChanged(); });
    const unwatchApps = watchInstalledApps(apps => {
      this.apps = apps;
      this.searchProvider.update(apps);
      this.browser.update(apps, this.pinned);
    });
    this.actor.connect('destroy', () => {
      this.searchProvider.destroy();
      unwatchApps();
      this.favorites.disconnect(favoritesChanged);
      unwatchTaskbar();
    });
  }

  private readPinned(): Set<string> {
    return new Set(taskbarPreferences.showPinned ? this.favorites.get_strv('favorite-apps') : []);
  }

  focus(): void {
    this.search.grab_key_focus();
  }

  place({ monitor, bottom, available, cornered }: StartArea): void {
    const width = Math.min(WIDTH, monitor.width - 2 * EDGE_MARGIN);
    const height = Math.min(HEIGHT, available);
    const x = cornered ? monitor.x + monitor.width - EDGE_MARGIN - width : monitor.x + (monitor.width - width) / 2;
    this.actor.set_size(width, height);
    this.actor.set_position(Math.round(x), bottom - height);
  }
  private back(): boolean {
    if (this.footer.sessionOpen) { this.footer.setOpen(false); this.focus(); return true; }
    if (this.search.get_text()) { this.search.set_text(''); this.focus(); return true; }
    if (this.browser.home()) { this.focus(); return true; }
    return false;
  }
  reset(): void {
    this.browser.home();
    this.search.set_text('');
    this.footer.setOpen(false, false);
    this.searchProvider.prepare();
  }

  private launch(app: Gio.AppInfo): void {
    launchApp(app);
    this.close();
  }
}
