import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import Shell from 'gi://Shell';
import { StartLayout } from './layout.js';
import { GridDrag } from './drag.js';
import { animateActor, liftIcon } from '../motion.js';
import type { ContextMenus } from '../contextMenus.js';

export class StartGrid {
  readonly header = new St.BoxLayout({ style_class: 'kestrel-grid-header' });
  readonly actor = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-app-grid', reactive: true, x_expand: true, y_expand: true });
  private readonly layout = new StartLayout();
  private readonly drag: GridDrag;
  private apps = new Map<string, Gio.AppInfo>();
  private pinned = new Set<string>();
  private query = '';
  private folder: string | null = null;
  private headerKey: string | null = null;
  firstMatch: Gio.AppInfo | undefined;

  constructor(private readonly scroller: St.ScrollView, private readonly menus: ContextMenus, private readonly launch: (app: Gio.AppInfo) => void) {
    scroller.child = this.actor;
    this.drag = new GridDrag(scroller, () => this.render(false, true));
    this.drag.target(this.actor, source => this.query ? null : () => this.layout.move(source.id, this.folder));
  }

  update(apps: Gio.AppInfo[], pinned: Set<string>, query: string): void {
    this.apps = new Map(apps.map(app => [app.get_id()!, app]));
    this.pinned = pinned;
    this.query = query;
    this.layout.sync([...this.apps.keys()]);
    if (!this.drag.active) this.render();
  }

  focusFirst(): boolean { return this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false); }

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
    const positions = new Map(this.actor.get_children().flatMap(row => row.get_children()).map(button => [button.name, button.get_transformed_position()]));
    if (this.folder && !this.layout.folder(this.folder)) this.folder = null;
    this.actor.destroy_all_children();
    const ids = this.query
      ? [...this.apps].filter(([, app]) => app.get_display_name().toLocaleLowerCase().includes(this.query)).map(([id]) => id)
      : this.layout.items(this.folder).filter(id => this.visible(id));
    this.firstMatch = ids.length ? this.apps.get(ids[0]) : undefined;
    this.renderHeader();
    if (!ids.length) this.actor.add_child(new St.Label({ text: this.query ? 'No apps found' : 'No apps here', style_class: 'kestrel-empty' }));
    for (let index = 0; index < ids.length; index += 6) {
      const row = new St.BoxLayout({ style_class: 'kestrel-app-row' });
      for (let column = 0; column < 6; column++) {
        const id = ids[index + column];
        const button = id ? this.button(id) : new St.Widget({ width: 92, x_expand: true });
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
    const key = this.query ? 'search' : this.folder ?? 'root';
    if (this.headerKey === key) return;
    this.headerKey = key;
    this.header.destroy_all_children();
    const folder = !this.query && this.folder ? this.layout.folder(this.folder) : undefined;
    if (!folder) {
      this.header.add_child(new St.Label({ text: this.query ? 'Search results' : 'Apps', style_class: 'kestrel-section-title' }));
      return;
    }
    const back = new St.Button({ name: 'kestrel-folder-back', style_class: 'kestrel-folder-back', label: 'Apps', can_focus: true, track_hover: true });
    back.connect('clicked', () => this.home());
    this.drag.target(back, source => source.folder ? null : () => { this.layout.move(source.id, null); this.folder = null; });
    this.header.add_child(back);
    this.header.add_child(new St.Icon({ icon_name: 'go-next-symbolic', icon_size: 12 }));
    const name = new St.Entry({ name: 'kestrel-folder-name', hint_text: folder.name, style_class: 'kestrel-folder-name', can_focus: true, x_expand: true });
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

  private button(id: string): St.Button {
    const folder = this.layout.folder(id);
    const app = this.apps.get(id);
    const label = folder?.name ?? app!.get_display_name();
    const content = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-app-content', x_align: Clutter.ActorAlign.CENTER });
    const icon = this.icon(id, 36);
    icon.x_align = Clutter.ActorAlign.CENTER;
    content.add_child(icon);
    content.add_child(new St.Label({ text: label, style_class: 'kestrel-app-label', x_align: Clutter.ActorAlign.CENTER }));
    const button = new St.Button({ name: `kestrel-start-item-${id}`, style_class: 'kestrel-app-button', child: content, width: 92, x_expand: true, can_focus: true, track_hover: true, accessible_name: label });
    button.connect('key-focus-in', () => {
      const [, y] = button.get_transformed_position();
      const [, top] = this.scroller.get_transformed_position();
      if (y < top) this.scroller.vadjustment.value += y - top;
      else if (y + button.height > top + this.scroller.height) this.scroller.vadjustment.value += y + button.height - top - this.scroller.height;
    });
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
      if (this.folder && !this.query) entries.push({ label: 'Move to Apps', run: () => { this.layout.move(id, null); this.render(); } });
      return entries;
    });
    if (!this.query) {
      this.drag.source(button, { id, folder: !!folder }, () => this.icon(id, 40));
      const mode = (source: { folder: boolean }, x: number) => !this.folder && !source.folder && x > button.width * 0.25 && x < button.width * 0.75
        ? 'drop-into' : x < button.width / 2 ? 'drop-before' : 'drop-after';
      this.drag.target(button, (source, x) => source.id === id ? () => {} : () => {
        if (mode(source, x) === 'drop-into') this.layout.combine(source.id, id);
        else this.layout.move(source.id, this.folder, id, x >= button.width / 2);
      }, mode);
    }
    return button;
  }
}
