import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';
import type { ContextMenus } from '../contextMenus.js';

export function rankMatches(names: Map<string, string>, query: string): string[] {
  const ranked: [string, number][] = [];
  for (const [id, name] of names) {
    const index = name.indexOf(query);
    if (index < 0) continue;
    const wordStart = index === 0 || /[\s\-_.]/.test(name[index - 1]);
    ranked.push([id, index === 0 ? 0 : wordStart ? 1 : 2]);
  }
  return ranked.sort((a, b) => a[1] - b[1]).map(([id]) => id);
}

export class SearchResults {
  private readonly rows = new Map<string, St.Button>();
  private selected: St.Button | null = null;

  constructor(
    private readonly menus: ContextMenus,
    private readonly launch: (app: Gio.AppInfo) => void,
    private readonly reveal: (actor: St.Widget) => void,
  ) {}

  row(app: Gio.AppInfo): St.Button {
    const id = app.get_id()!;
    let row = this.rows.get(id);
    if (!row) {
      row = this.build(app);
      this.rows.set(id, row);
    }
    return row;
  }

  select(row: St.Button | null): void {
    this.selected?.remove_style_pseudo_class('selected');
    this.selected = row;
    row?.add_style_pseudo_class('selected');
  }

  detach(): void {
    for (const row of this.rows.values()) row.get_parent()?.remove_child(row);
  }

  destroy(): void {
    for (const row of this.rows.values()) row.destroy();
    this.rows.clear();
  }

  private build(app: Gio.AppInfo): St.Button {
    const content = new St.BoxLayout({ style_class: 'kestrel-search-result-content', x_expand: true });
    content.add_child(new St.Icon({ gicon: app.get_icon(), icon_size: 32, y_align: Clutter.ActorAlign.CENTER }));
    const text = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true, y_align: Clutter.ActorAlign.CENTER });
    text.add_child(new St.Label({ text: app.get_display_name(), style_class: 'kestrel-search-result-name' }));
    const description = app.get_description();
    if (description) {
      const label = new St.Label({ text: description, style_class: 'kestrel-search-result-description' });
      label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
      text.add_child(label);
    }
    content.add_child(text);
    const row = new St.Button({
      name: `kestrel-search-${app.get_id()}`, style_class: 'kestrel-search-result', child: content,
      x_expand: true, can_focus: true, track_hover: true, accessible_name: app.get_display_name(),
    });
    row.connect('clicked', () => this.launch(app));
    row.connect('key-focus-in', () => {
      this.select(null);
      this.reveal(row);
    });
    this.menus.bind(row, () => {
      const shellApp = Shell.AppSystem.get_default().lookup_app(app.get_id()!);
      return shellApp ? this.menus.appEntries(shellApp) : [{ label: 'Open', run: () => this.launch(app) }];
    });
    return row;
  }
}
