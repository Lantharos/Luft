import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import St from 'gi://St';
import Shell from 'gi://Shell';
import { GustLayout } from './layout.js';
import { GridDrag } from './drag.js';
import { SearchResults } from '../../search/results/searchResults.js';
import type { SearchItem, SearchView } from '../../search/item.js';
import { appKey } from '../../../shared/apps/launchHistory.js';
import { animateActor, Curve, Duration, liftIcon } from '../../../shared/motion/motion.js';
import { appIcon } from '../../../appearance/icons/appIcons.js';
import type { ContextMenus, MenuEntry } from '../../../desktop/menus/contextMenus.js';
import { t } from '../../../shared/i18n/index.js';
import { appName } from '../../../shared/apps/names.js';
import { AppHint, appKind } from './appHint.js';
import { CellRowLayout, CenteredColumnLayout } from './cells.js';
import { FillLayout } from '../../../shared/layout/fill.js';
import { AllApps } from './allApps.js';

const ICON_SIZE = 36;

export class GustGrid {
  readonly header = new St.BoxLayout({ style_class: 'kestrel-grid-header' });
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-app-grid', reactive: true, x_expand: true, y_expand: true });
  readonly hint = new AppHint();
  private readonly layout = new GustLayout(() => {
    this.allApps.refresh();
    if (!this.drag.active) this.render();
  });
  private readonly drag: GridDrag;
  private readonly allApps: AllApps;
  private readonly empty = new St.Label({ name: 'kestrel-gust-no-pins', text: t('gust-no-pins'), style_class: 'kestrel-gust-empty', x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER, y_expand: true, visible: false });
  private readonly results: SearchResults;
  private readonly resultsBox = new St.BoxLayout({ name: 'kestrel-search-results', orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-search-results', x_expand: true, visible: false });
  private catalogDirty = false;
  private catalog: Gio.AppInfo[] | null = null;
  private readonly buttons = new Map<string, { signature: string; actor: St.Button; draggable: { enabled: boolean } }>();
  private apps = new Map<string, Gio.AppInfo>();
  private all = false;
  private searchView: SearchView | null = null;
  private folder: string | null = null;
  private headerKey: string | null = null;
  firstResult: SearchItem | undefined;

  constructor(private readonly scroller: St.ScrollView, private readonly menus: ContextMenus, private readonly launch: (app: Gio.AppInfo) => void) {
    scroller.child = this.actor;
    this.results = new SearchResults(menus, actor => this.reveal(actor));
    this.allApps = new AllApps(menus, actor => this.reveal(actor), app => this.appItem(app));
    for (const child of [this.resultsBox, this.allApps.actor, this.empty]) this.actor.add_child(child);
    this.actor.connect('destroy', () => {
      this.hint.destroy();
      this.layout.destroy();
      for (const { actor } of this.buttons.values()) if (!actor.get_parent()) actor.destroy();
      this.buttons.clear();
    });
    this.drag = new GridDrag(scroller, () => this.render(false, true));
    this.drag.target(this.actor, source => this.searchView || this.all ? null : () => this.layout.move(source.id, this.folder));
  }

  update(apps: Gio.AppInfo[]): void {
    if (apps === this.catalog) return;
    this.catalog = apps;
    const named = apps.map(app => ({ app, name: appName(app) })).sort((a, b) => a.name.localeCompare(b.name));
    this.apps = new Map(named.map(({ app }) => [app.get_id()!, app]));
    this.layout.adopt([...this.apps.keys()]);
    this.allApps.update(apps);
    this.catalogDirty = true;
    if (!this.drag.active) this.render();
  }

  get showingAll(): boolean { return this.all; }

  showAll(all: boolean): void {
    if (this.all === all) return;
    this.all = all;
    if (!this.drag.active) this.render(true);
  }

  pinEntry(app: Gio.AppInfo): MenuEntry {
    const id = app.get_id()!;
    const pinned = this.layout.pinned(id);
    return { label: t(pinned ? 'gust-unpin' : 'gust-pin'), run: () => {
      if (pinned) this.layout.unpin(id);
      else this.layout.pin(id);
      this.allApps.refresh();
      this.render();
    } };
  }

  private appMenu(app: Gio.AppInfo, extra: MenuEntry[] = []): MenuEntry[] {
    const entries = [this.pinEntry(app), ...extra];
    const shellApp = Shell.AppSystem.get_default().lookup_app(app.get_id()!);
    return shellApp ? this.menus.appEntries(shellApp, { extra: entries }) : [{ label: t('gust-open'), run: () => this.launch(app) }, ...entries];
  }

  private appItem(app: Gio.AppInfo): SearchItem {
    return {
      key: appKey(app.get_id()!), title: appName(app), description: '', icon: app,
      pinned: this.layout.pinned(app.get_id()!),
      activate: () => this.launch(app),
      menu: () => this.appMenu(app),
    };
  }

  showResults(view: SearchView | null): void {
    const searching = !!this.searchView;
    this.searchView = view;
    if (this.drag.active) return;
    if (view && searching) this.renderResults(view);
    else this.render();
  }

  highlightFirstResult(highlight: boolean): void {
    this.results.setHighlighting(highlight);
  }

  private renderResults(view: SearchView): void {
    this.firstResult = view.best ?? view.groups[0]?.items[0];
    this.results.show(this.resultsBox, view);
    if (view.fresh) this.scroller.vadjustment.value = 0;
  }

  focusFirst(): boolean { return this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false); }

  private reveal(actor: St.Widget): void {
    const [, y] = actor.get_transformed_position();
    const [, top] = this.scroller.get_transformed_position();
    if (y < top) this.scroller.vadjustment.value += y - top;
    else if (y + actor.height > top + this.scroller.height) this.scroller.vadjustment.value += y + actor.height - top - this.scroller.height;
  }

  home(): boolean {
    if (!this.folder) return false;
    this.folder = null;
    this.render(true);
    return true;
  }

  private visible(id: string): boolean {
    const folder = this.layout.folder(id);
    return folder ? folder.apps.some(app => this.apps.has(app)) : this.apps.has(id);
  }

  private render(animate = false, reorder = false): void {
    const kept = new Set<Clutter.Actor>([this.resultsBox, this.allApps.actor, this.empty]);
    const rows = this.actor.get_children().filter(child => !kept.has(child));
    const positions = reorder
      ? new Map(rows.flatMap(row => row.get_children()).map(button => [button.name, button.get_transformed_position()]))
      : new Map<string, [number, number]>();
    if (this.catalogDirty) {
      for (const { actor } of this.buttons.values()) actor.destroy();
      this.buttons.clear();
      this.results.clear();
      this.catalogDirty = false;
    }
    if (this.folder && !this.layout.folder(this.folder)) this.folder = null;
    for (const { actor } of this.buttons.values()) actor.get_parent()?.remove_child(actor);
    for (const row of rows) row.destroy();
    for (const [id, item] of this.buttons) {
      if (this.layout.folder(id) || (this.apps.has(id) && this.layout.pinned(id))) continue;
      item.actor.destroy();
      this.buttons.delete(id);
    }
    this.renderHeader();
    this.resultsBox.visible = !!this.searchView;
    if (this.searchView) {
      this.allApps.hide();
      this.empty.hide();
      this.renderResults(this.searchView);
      return;
    }
    this.firstResult = undefined;
    if (this.all) this.allApps.show();
    else this.allApps.hide();
    const ids = this.all ? [] : this.layout.items(this.folder).filter(id => this.visible(id));
    this.empty.visible = !this.all && !ids.length;
    for (let index = 0; index < ids.length; index += 6) {
      const row = new St.Widget({ style_class: 'kestrel-app-row', layout_manager: new CellRowLayout(ICON_SIZE) });
      for (let column = 0; column < 6; column++) {
        const id = ids[index + column];
        const button = id ? this.cachedButton(id) : new St.Widget({ width: 92 });
        row.add_child(button);
        if (id && reorder) {
          const allocated = button.connect('notify::allocation', () => {
            button.disconnect(allocated);
            const previous = positions.get(button.name);
            const [x, y] = button.get_transformed_position();
            if (previous) {
              button.translation_x = previous[0] - x;
              button.translation_y = previous[1] - y;
            } else button.opacity = 0;
            animateActor(button, { translation_x: 0, translation_y: 0, opacity: 255, duration: Duration.quick, curve: Curve.settle });
          });
        }
      }
      this.actor.add_child(row);
    }
    if (animate) {
      this.scroller.vadjustment.value = 0;
      this.actor.opacity = 0;
      this.actor.translation_y = 8;
      animateActor(this.actor, { opacity: 255, translation_y: 0, duration: Duration.quick, curve: Curve.settle });
    }
  }

  private renderHeader(): void {
    const key = this.searchView ? 'search' : this.all ? 'all' : this.folder ?? 'root';
    if (this.headerKey === key) return;
    this.headerKey = key;
    this.header.destroy_all_children();
    const folder = !this.searchView && !this.all && this.folder ? this.layout.folder(this.folder) : undefined;
    this.header.visible = !!folder;
    if (!folder) return;
    const back = new St.Button({ name: 'kestrel-folder-back', style_class: 'kestrel-folder-back', y_align: Clutter.ActorAlign.START, child: new St.Label({ text: t('gust-pinned'), style_class: 'kestrel-section-title' }), can_focus: true, track_hover: true });
    back.connect('clicked', () => this.home());
    this.drag.target(back, source => source.folder ? null : () => { this.layout.move(source.id, null); this.folder = null; });
    this.header.add_child(back);
    this.header.add_child(new St.Icon({ icon_name: 'go-next-symbolic', icon_size: 12, style_class: 'kestrel-folder-separator', y_align: Clutter.ActorAlign.START }));
    const name = new St.Entry({ name: 'kestrel-folder-name', hint_text: folder.name, style_class: 'kestrel-folder-name', y_align: Clutter.ActorAlign.START, can_focus: true, x_expand: true });
    name.clutter_text.connect_after('key-focus-in', () => {
      if (!name.get_text()) name.set_text(folder.name);
    });
    const id = this.folder!;
    const save = () => this.layout.rename(id, name.get_text());
    name.clutter_text.connect('activate', () => {
      save();
      if (!name.get_text().trim()) name.set_text(folder.name);
      this.focusFirst();
    });
    name.clutter_text.connect('key-focus-out', save);
    this.header.add_child(name);
  }

  private icon(id: string, size: number): St.Widget {
    const folder = this.layout.folder(id);
    if (!folder) return appIcon(this.apps.get(id)!, size);
    const preview = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-folder-preview', width: size, height: size });
    const ids = folder.apps.filter(app => this.visible(app)).slice(0, 4);
    for (let index = 0; index < 4; index += 2) {
      const row = new St.BoxLayout({ x_expand: true, y_expand: true });
      for (let column = 0; column < 2; column++) {
        const app = this.apps.get(ids[index + column]);
        row.add_child(app ? appIcon(app, Math.floor((size - 8) / 2), { x_expand: true, y_expand: true }) : new St.Widget({ x_expand: true, y_expand: true }));
      }
      preview.add_child(row);
    }
    return preview;
  }

  private cachedButton(id: string): St.Button {
    const folder = this.layout.folder(id);
    const signature = folder ? JSON.stringify([folder.name, folder.apps.filter(app => this.visible(app)).slice(0, 4)]) : id;
    const key = id;
    const cached = this.buttons.get(key);
    if (cached?.signature === signature) {
      cached.draggable.enabled = !this.searchView;
      return cached.actor;
    }
    cached?.actor.destroy();
    const item = this.button(id);
    item.draggable.enabled = !this.searchView;
    this.buttons.set(key, { signature, ...item });
    return item.actor;
  }

  private button(id: string): { actor: St.Button; draggable: { enabled: boolean } } {
    const folder = this.layout.folder(id);
    const app = this.apps.get(id);
    const label = folder?.name ?? appName(app!);
    const content = new St.Widget({ style_class: 'kestrel-app-content', layout_manager: new CenteredColumnLayout() });
    const icon = this.icon(id, ICON_SIZE);
    content.add_child(icon);
    const name = new St.Label({ text: label, style_class: 'kestrel-app-label' });
    name.clutter_text.line_wrap = true;
    name.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
    name.clutter_text.ellipsize = Pango.EllipsizeMode.END;
    name.clutter_text.line_alignment = Pango.Alignment.CENTER;
    content.add_child(name);
    const button = new St.Button({ name: `kestrel-gust-item-${id}`, style_class: 'kestrel-app-button', child: content, layout_manager: new FillLayout(), width: 92, can_focus: true, track_hover: true, accessible_name: label });
    button.connect('key-focus-in', () => this.reveal(button));
    const kind = app && appKind(app, label);
    if (kind) this.hint.bind(button, () => kind);
    liftIcon(button, icon);
    button.connect('clicked', () => {
      if (this.drag.active) return;
      if (folder) { this.folder = id; this.render(true); }
      else this.launch(app!);
    });
    this.menus.bind(button, () => {
      if (folder) return [
        { label: t('gust-folder-open'), run: () => { this.folder = id; this.render(true); } },
        { label: t('gust-folder-rename'), run: () => { this.folder = id; this.render(true); (this.header.get_last_child() as St.Entry).grab_key_focus(); } },
        { label: t('gust-folder-ungroup'), run: () => { this.layout.dissolve(id); this.render(); } },
      ];
      const inFolder = this.folder && !this.searchView;
      return this.appMenu(app!, inFolder ? [{ label: t('gust-move-out-of-folder'), run: () => { this.layout.move(id, null); this.render(); } }] : []);
    });
    const draggable = this.drag.source(button, { id, folder: !!folder }, () => this.icon(id, 40));
    const mode = (source: { folder: boolean }, x: number) => !this.folder && !source.folder && x > button.width * 0.25 && x < button.width * 0.75
      ? 'drop-into' : x < button.width / 2 ? 'drop-before' : 'drop-after';
    this.drag.target(button, (source, x) => source.id === id ? () => {} : () => {
      if (mode(source, x) === 'drop-into') this.layout.combine(source.id, id);
      else this.layout.move(source.id, this.folder, id, x >= button.width / 2);
    }, mode);
    return { actor: button, draggable };
  }
}
