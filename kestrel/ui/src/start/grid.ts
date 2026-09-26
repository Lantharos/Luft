import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import St from 'gi://St';
import Shell from 'gi://Shell';
import { StartLayout } from './layout.js';
import { GridDrag } from './drag.js';
import { SearchResults } from './searchResults.js';
import type { SearchItem } from './search/item.js';
import { animateActor, liftIcon } from '../motion.js';
import type { ContextMenus } from '../contextMenus.js';

export class StartGrid {
  readonly header = new St.BoxLayout({ style_class: 'kestrel-grid-header' });
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-app-grid', reactive: true, x_expand: true, y_expand: true });
  private readonly layout = new StartLayout();
  private readonly drag: GridDrag;
  private readonly results: SearchResults;
  private highlightFirst = true;
  private catalogDirty = false;
  private catalog: Gio.AppInfo[] | null = null;
  private readonly buttons = new Map<string, { signature: string; actor: St.Button; draggable: { enabled: boolean } }>();
  private apps = new Map<string, Gio.AppInfo>();
  private pinned = new Set<string>();
  private searchItems: SearchItem[] | null = null;
  private folder: string | null = null;
  private headerKey: string | null = null;
  firstResult: SearchItem | undefined;

  constructor(private readonly scroller: St.ScrollView, private readonly menus: ContextMenus, private readonly launch: (app: Gio.AppInfo) => void) {
    scroller.child = this.actor;
    this.results = new SearchResults(menus, actor => this.reveal(actor));
    this.actor.connect('destroy', () => {
      for (const { actor } of this.buttons.values()) if (!actor.get_parent()) actor.destroy();
      this.buttons.clear();
      this.results.destroy();
    });
    this.drag = new GridDrag(scroller, () => this.render(false, true));
    this.drag.target(this.actor, source => this.searchItems ? null : () => this.layout.move(source.id, this.folder));
  }

  update(apps: Gio.AppInfo[], pinned: Set<string>): void {
    if (apps !== this.catalog) {
      this.catalog = apps;
      this.apps = new Map(apps.map(app => [app.get_id()!, app]));
      this.layout.sync([...this.apps.keys()]);
      this.catalogDirty = true;
    }
    this.pinned = pinned;
    if (!this.drag.active) this.render();
  }

  showResults(items: SearchItem[] | null): void {
    this.searchItems = items;
    if (!this.drag.active) this.render();
  }

  focusFirst(): boolean { return this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false); }

  setSearchFocused(focused: boolean): void {
    this.highlightFirst = focused;
    if (this.searchItems) this.results.select(focused && this.firstResult ? this.results.row(this.firstResult) : null);
  }

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
    return folder ? folder.apps.some(app => this.apps.has(app) && !this.pinned.has(app)) : this.apps.has(id) && !this.pinned.has(id);
  }

  private render(animate = false, reorder = false): void {
    const positions = reorder
      ? new Map(this.actor.get_children().flatMap(row => row.get_children()).map(button => [button.name, button.get_transformed_position()]))
      : new Map<string, [number, number]>();
    if (this.catalogDirty) {
      for (const { actor } of this.buttons.values()) actor.destroy();
      this.buttons.clear();
      this.results.destroy();
      this.catalogDirty = false;
    }
    if (this.folder && !this.layout.folder(this.folder)) this.folder = null;
    for (const { actor } of this.buttons.values()) actor.get_parent()?.remove_child(actor);
    this.results.detach();
    this.actor.destroy_all_children();
    for (const [key, item] of this.buttons) {
      const id = key;
      if (!this.apps.has(id) && !this.layout.folder(id)) {
        item.actor.destroy();
        this.buttons.delete(key);
      }
    }
    this.renderHeader();
    if (this.searchItems) {
      this.firstResult = this.searchItems[0];
      if (!this.firstResult) this.actor.add_child(new St.Label({ text: 'No results', style_class: 'kestrel-empty' }));
      for (const item of this.searchItems) this.actor.add_child(this.results.row(item));
      this.results.select(this.highlightFirst && this.firstResult ? this.results.row(this.firstResult) : null);
      this.scroller.vadjustment.value = 0;
      return;
    }
    this.firstResult = undefined;
    const ids = this.layout.items(this.folder).filter(id => this.visible(id));
    this.results.select(null);
    for (let index = 0; index < ids.length; index += 6) {
      const row = new St.BoxLayout({ style_class: 'kestrel-app-row' });
      for (let column = 0; column < 6; column++) {
        const id = ids[index + column];
        const button = id ? this.cachedButton(id) : new St.Widget({ width: 92, x_expand: true });
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
            animateActor(button, { translation_x: 0, translation_y: 0, opacity: 255, duration: 180, mode: Clutter.AnimationMode.EASE_OUT_QUART });
          });
        }
      }
      this.actor.add_child(row);
    }
    if (animate) {
      this.scroller.vadjustment.value = 0;
      this.actor.opacity = 0;
      this.actor.translation_y = 8;
      animateActor(this.actor, { opacity: 255, translation_y: 0, duration: 160, mode: Clutter.AnimationMode.EASE_OUT_QUART });
    }
  }

  private renderHeader(): void {
    const key = this.searchItems ? 'search' : this.folder ?? 'root';
    if (this.headerKey === key) return;
    this.headerKey = key;
    this.header.destroy_all_children();
    const folder = !this.searchItems && this.folder ? this.layout.folder(this.folder) : undefined;
    this.header.visible = !!folder;
    if (!folder) return;
    const back = new St.Button({ name: 'kestrel-folder-back', style_class: 'kestrel-folder-back', y_align: Clutter.ActorAlign.START, child: new St.Label({ text: 'Apps', style_class: 'kestrel-section-title' }), can_focus: true, track_hover: true });
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
    if (!folder) return new St.Icon({ gicon: this.apps.get(id)!.get_icon(), icon_size: size });
    const preview = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-folder-preview', width: size, height: size });
    const ids = folder.apps.filter(app => this.visible(app)).slice(0, 4);
    for (let index = 0; index < 4; index += 2) {
      const row = new St.BoxLayout({ x_expand: true, y_expand: true });
      for (let column = 0; column < 2; column++) {
        const app = this.apps.get(ids[index + column]);
        row.add_child(app ? new St.Icon({ gicon: app.get_icon(), icon_size: Math.floor((size - 8) / 2), x_expand: true, y_expand: true }) : new St.Widget({ x_expand: true, y_expand: true }));
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
      cached.draggable.enabled = !this.searchItems;
      return cached.actor;
    }
    cached?.actor.destroy();
    const item = this.button(id);
    item.draggable.enabled = !this.searchItems;
    this.buttons.set(key, { signature, ...item });
    return item.actor;
  }

  private button(id: string): { actor: St.Button; draggable: { enabled: boolean } } {
    const folder = this.layout.folder(id);
    const app = this.apps.get(id);
    const label = folder?.name ?? app!.get_display_name();
    const content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-app-content', x_align: Clutter.ActorAlign.CENTER });
    const icon = this.icon(id, 36);
    icon.x_align = Clutter.ActorAlign.CENTER;
    content.add_child(icon);
    const name = new St.Label({ text: label, style_class: 'kestrel-app-label', x_align: Clutter.ActorAlign.CENTER });
    name.clutter_text.line_wrap = true;
    name.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
    name.clutter_text.ellipsize = Pango.EllipsizeMode.END;
    name.clutter_text.line_alignment = Pango.Alignment.CENTER;
    content.add_child(name);
    const button = new St.Button({ name: `kestrel-start-item-${id}`, style_class: 'kestrel-app-button', child: content, width: 92, x_expand: true, can_focus: true, track_hover: true, accessible_name: label });
    button.connect('key-focus-in', () => this.reveal(button));
    liftIcon(button, icon);
    button.connect('clicked', () => {
      if (this.drag.active) return;
      if (folder) { this.folder = id; this.render(true); }
      else this.launch(app!);
    });
    this.menus.bind(button, () => {
      if (folder) return [
        { label: 'Open folder', run: () => { this.folder = id; this.render(true); } },
        { label: 'Rename', run: () => { this.folder = id; this.render(true); (this.header.get_last_child() as St.Entry).grab_key_focus(); } },
        { label: 'Ungroup apps', run: () => { this.layout.dissolve(id); this.render(); } },
      ];
      const shellApp = Shell.AppSystem.get_default().lookup_app(id);
      const entries = shellApp ? this.menus.appEntries(shellApp) : [{ label: 'Open', run: () => this.launch(app!) }];
      if (this.folder && !this.searchItems) entries.push({ label: 'Move to Apps', run: () => { this.layout.move(id, null); this.render(); } });
      return entries;
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
