import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { blurSurface } from './surface.js';
import type { ContextMenus } from './contextMenus.js';
import { blinkCaret } from './caret.js';
import { StartGrid } from './start/grid.js';
import { StartFooter } from './start/footer.js';
import { StartSearch } from './start/search/search.js';

export class StartMenu {
  readonly actor: St.BoxLayout;
  readonly search: St.Entry;
  readonly footer: StartFooter;
  private readonly favorites = new Gio.Settings({ schema_id: 'org.gnome.shell' });
  private pinned = new Set(this.favorites.get_strv('favorite-apps'));
  private readonly appSystem = Shell.AppSystem.get_default();
  private readonly browser: StartGrid;
  private readonly searchProvider: StartSearch;
  private apps: Gio.AppInfo[] = [];

  constructor(private readonly close: () => void, private readonly menus: ContextMenus) {
    this.actor = new St.BoxLayout({
      name: 'kestrel-start',
      orientation: Clutter.Orientation.VERTICAL,
      style_class: 'kestrel-popover kestrel-start',
      reactive: true, visible: false,
    });
    blurSurface(this.actor);
    this.search = new St.Entry({
      style_class: 'kestrel-search', hint_text: 'Search apps',
      can_focus: true, x_expand: true,
      primary_icon: new St.Icon({ icon_name: 'edit-find-symbolic', icon_size: 16 }),
    });
    blinkCaret(this.search);
    menus.bind(this.search, () => {
      const text = this.search.clutter_text;
      const clipboard = St.Clipboard.get_default();
      const copy = () => clipboard.set_text(St.ClipboardType.CLIPBOARD, text.get_selection());
      return [
        { label: 'Cut', enabled: text.get_selection().length > 0, run: () => { copy(); text.delete_selection(); } },
        { label: 'Copy', enabled: text.get_selection().length > 0, run: copy },
        { label: 'Paste', run: () => clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, value) => {
          if (value) { text.delete_selection(); text.insert_text(value, text.cursor_position); }
        }) },
        { label: 'Select all', run: () => text.set_selection(0, -1) },
      ];
    });
    this.search.get_clutter_text().connect('text-changed', () => {
      this.refreshApps();
    });
    this.search.clutter_text.connect('key-focus-in', () => this.browser.setSearchFocused(true));
    this.search.clutter_text.connect('key-focus-out', () => this.browser.setSearchFocused(false));
    this.search.clutter_text.connect('key-press-event', (_text, event) => {
      if (event.get_key_symbol() !== Clutter.KEY_Down) return Clutter.EVENT_PROPAGATE;
      return this.browser.focusFirst() ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
    });
    this.search.get_clutter_text().connect('activate', () => {
      this.browser.firstResult?.activate();
    });
    this.actor.add_child(this.search);
    const scroller = new St.ScrollView({
      style_class: 'kestrel-app-scroll',
      hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.AUTOMATIC,
      height: 0,
      x_expand: true, y_expand: true,
    });
    this.browser = new StartGrid(scroller, menus, app => this.launch(app));
    this.searchProvider = new StartSearch(menus, app => this.launch(app), close);
    this.actor.add_child(this.browser.header);
    this.actor.connect('key-press-event', (_actor, event) => event.get_key_symbol() === Clutter.KEY_Escape && this.back() ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE);
    this.actor.add_child(scroller);

    this.footer = new StartFooter(close, menus);
    this.actor.add_child(this.footer.actor);

    const installedChanged = this.appSystem.connect('installed-changed', () => this.loadApps());
    const favoritesChanged = this.favorites.connect('changed::favorite-apps', () => {
      this.pinned = new Set(this.favorites.get_strv('favorite-apps'));
      this.browser.update(this.apps, this.pinned);
    });
    this.actor.connect('destroy', () => {
      this.appSystem.disconnect(installedChanged);
      this.favorites.disconnect(favoritesChanged);
    });
    this.loadApps();
    menus.bind(this.actor, () => [
      { label: 'Refresh apps', run: () => this.loadApps() },
      { label: 'Settings', run: () => menus.settings() },
    ]);
  }

  focus(): void {
    this.search.grab_key_focus();
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
  }

  private loadApps(): void {
    const installed = this.appSystem.get_installed();
    this.apps = installed.filter(app => app.should_show())
      .sort((a, b) => a.get_display_name().localeCompare(b.get_display_name()));
    this.searchProvider.update(this.apps, installed);
    this.browser.update(this.apps, this.pinned);
    this.refreshApps();
  }

  private refreshApps(): void {
    const text = this.search.get_text();
    this.browser.showResults(text.trim() ? this.searchProvider.results(text) : null);
  }

  private launch(app: Gio.AppInfo): void {
    const shellApp = this.appSystem.lookup_app(app.get_id() ?? '');
    if (shellApp) shellApp.activate();
    else app.launch([], null);
    this.close();
  }
}
