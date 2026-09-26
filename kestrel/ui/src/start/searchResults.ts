import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import St from 'gi://St';
import type { ContextMenus } from '../contextMenus.js';
import type { SearchItem } from './search/item.js';

interface Row {
  actor: St.Button;
  icon: St.Icon;
  title: St.Label;
  description: St.Label;
  item: SearchItem;
}

export class SearchResults {
  private readonly rows = new Map<string, Row>();
  private selected: St.Button | null = null;

  constructor(
    private readonly menus: ContextMenus,
    private readonly reveal: (actor: St.Widget) => void,
  ) {}

  row(item: SearchItem): St.Button {
    let row = this.rows.get(item.key);
    if (!row) {
      row = this.build(item);
      this.rows.set(item.key, row);
    }
    row.item = item;
    row.icon.gicon = item.icon;
    row.title.text = item.title;
    row.description.text = item.description;
    row.description.visible = !!item.description;
    row.actor.accessible_name = item.title;
    return row.actor;
  }

  select(row: St.Button | null): void {
    this.selected?.remove_style_pseudo_class('selected');
    this.selected = row;
    row?.add_style_pseudo_class('selected');
  }

  detach(): void {
    for (const { actor } of this.rows.values()) actor.get_parent()?.remove_child(actor);
  }

  destroy(): void {
    for (const { actor } of this.rows.values()) actor.destroy();
    this.rows.clear();
  }

  private build(item: SearchItem): Row {
    const content = new St.BoxLayout({ style_class: 'kestrel-search-result-content', x_expand: true });
    const icon = new St.Icon({ icon_size: 32, y_align: Clutter.ActorAlign.CENTER });
    content.add_child(icon);
    const text = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true, y_align: Clutter.ActorAlign.CENTER });
    const title = new St.Label({ style_class: 'kestrel-search-result-name' });
    const description = new St.Label({ style_class: 'kestrel-search-result-description' });
    for (const label of [title, description]) {
      label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
      text.add_child(label);
    }
    content.add_child(text);
    const actor = new St.Button({
      name: `kestrel-search-${item.key}`, style_class: 'kestrel-search-result', child: content,
      x_expand: true, can_focus: true, track_hover: true,
    });
    const row: Row = { actor, icon, title, description, item };
    actor.connect('clicked', () => row.item.activate());
    actor.connect('key-focus-in', () => {
      this.select(null);
      this.reveal(actor);
    });
    this.menus.bind(actor, () => row.item.menu?.() ?? [{ label: 'Open', run: () => row.item.activate() }]);
    return row;
  }
}
