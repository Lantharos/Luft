import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import St from 'gi://St';
import type { ContextMenus } from '../../../desktop/menus/contextMenus.js';
import type { SearchItem, SearchView } from '../item.js';
import { appIcons, type IconApp } from '../../../appearance/icons/appIcons.js';
import { t } from '../../../shared/i18n/index.js';
import { isControlEnter } from '../../../shared/input/keyboardNavigation.js';

const KEPT_ROWS = 64;

const isApp = (icon: SearchItem['icon']): icon is IconApp => 'get_id' in icon;

interface Row {
  actor: St.Button;
  highlight: St.Widget;
  icon: St.Icon | St.Label;
  title: St.Label;
  description: St.Label;
  item: SearchItem;
}

export class SearchResults {
  private readonly rows = new Map<string, Row>();
  private readonly titles = new Map<string, St.Label>();
  private order: Row[] = [];
  private highlighted: Row | null = null;
  private highlightedItem: SearchItem | null = null;
  private highlighting = true;
  private chosen = false;

  constructor(
    private readonly menus: ContextMenus,
    private readonly reveal: (actor: St.Widget) => void,
    private readonly steering: { highlighted(item: SearchItem | null): void } | null = null,
  ) {}

  get current(): SearchItem | null {
    return this.highlighted?.item ?? null;
  }

  show(container: St.BoxLayout, view: SearchView): void {
    const used = new Set<string>();
    const actors: Clutter.Actor[] = [];
    const titled = view.groups.length + Number(!!view.best) > 1;
    const previous = this.highlighted?.item.key;
    this.order = [];
    const add = (item: SearchItem) => {
      used.add(item.key);
      const row = this.row(item);
      this.order.push(row);
      actors.push(row.actor);
    };
    if (view.best) {
      if (titled) actors.push(this.title(t('start-search-best-match')));
      add(view.best);
    }
    for (const group of view.groups) {
      if (titled) actors.push(this.title(group.title));
      group.items.forEach(add);
    }
    this.arrange(container, actors);
    if (view.fresh) this.chosen = false;
    const kept = this.chosen ? this.order.find(row => row.item.key === previous) : undefined;
    this.highlight(kept ?? this.order[0] ?? null);
    if (this.rows.size > KEPT_ROWS) this.prune(used);
  }

  move(steps: number): void {
    if (!this.order.length) return;
    const index = this.highlighted ? this.order.indexOf(this.highlighted) : -1;
    const next = this.order[Math.max(0, Math.min(this.order.length - 1, index + steps))];
    this.chosen = true;
    this.highlight(next);
    this.reveal(next.actor);
  }

  openMenu(): void {
    const row = this.highlighted;
    if (!row) return;
    const [x, y] = row.actor.get_transformed_position();
    this.menus.open(row.actor, this.entries(row), x, y + row.actor.height);
  }

  setHighlighting(highlighting: boolean): void {
    this.highlighting = highlighting;
    this.highlight(this.highlighted);
  }

  clear(): void {
    for (const { actor } of this.rows.values()) actor.destroy();
    this.rows.clear();
    this.highlighted = null;
    this.highlightedItem = null;
  }

  private arrange(container: St.BoxLayout, actors: Clutter.Actor[]): void {
    const wanted = new Set(actors);
    actors.forEach((actor, index) => {
      if (actor.get_parent() !== container) container.insert_child_at_index(actor, index);
      else if (container.get_child_at_index(index) !== actor) container.set_child_at_index(actor, index);
      actor.visible = true;
    });
    for (const child of container.get_children()) if (!wanted.has(child)) child.visible = false;
  }

  private highlight(row: Row | null): void {
    if (this.highlighted && this.highlighted !== row) this.highlighted.highlight.visible = false;
    this.highlighted = row;
    if (row) row.highlight.visible = this.highlighting;
    const item = row?.item ?? null;
    if (item === this.highlightedItem) return;
    this.highlightedItem = item;
    this.steering?.highlighted(item);
  }

  private entries(row: Row) {
    return row.item.menu?.() ?? [{ label: t('start-open'), run: () => row.item.activate() }];
  }

  private prune(used: Set<string>): void {
    for (const [key, row] of this.rows) {
      if (used.has(key)) continue;
      row.actor.destroy();
      this.rows.delete(key);
    }
  }

  private title(text: string): St.Label {
    let title = this.titles.get(text);
    if (!title) {
      title = new St.Label({ text, style_class: 'kestrel-section-title kestrel-search-group' });
      this.titles.set(text, title);
    }
    return title;
  }

  private row(item: SearchItem): Row {
    let row = this.rows.get(item.key);
    if (!row) {
      row = this.build(item);
      this.rows.set(item.key, row);
    }
    row.item = item;
    if (row.icon instanceof St.Label) row.icon.text = item.glyph ?? '';
    else if (!isApp(item.icon)) row.icon.gicon = item.icon;
    if (row.title.text !== item.title) {
      row.title.text = item.title;
      row.actor.accessible_name = item.title;
    }
    if (row.description.text !== item.description) {
      row.description.text = item.description;
      row.description.visible = !!item.description;
    }
    return row;
  }

  private build(item: SearchItem): Row {
    const content = new St.BoxLayout({ style_class: 'kestrel-search-result-content', x_expand: true });
    const icon = item.glyph !== undefined
      ? new St.Label({ style_class: 'kestrel-search-result-glyph', y_align: Clutter.ActorAlign.CENTER })
      : new St.Icon({ icon_size: 32, y_align: Clutter.ActorAlign.CENTER });
    if (icon instanceof St.Icon && isApp(item.icon)) appIcons.bind(icon, item.icon);
    content.add_child(icon);
    const text = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true, y_align: Clutter.ActorAlign.CENTER });
    const title = new St.Label({ style_class: 'kestrel-search-result-name' });
    const description = new St.Label({ style_class: 'kestrel-search-result-description', visible: false });
    for (const label of [title, description]) {
      label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
      text.add_child(label);
    }
    content.add_child(text);
    const highlight = new St.Widget({ style_class: 'kestrel-search-result-highlight', x_expand: true, y_expand: true, visible: false });
    const layers = new Clutter.Actor({ layout_manager: new Clutter.BinLayout(), x_expand: true, y_expand: false });
    layers.add_child(highlight);
    layers.add_child(content);
    const actor = new St.Button({
      name: `kestrel-search-${item.key}`, style_class: 'kestrel-search-result', child: layers,
      x_expand: true, can_focus: true, track_hover: true,
    });
    const row: Row = { actor, highlight, icon, title, description, item };
    actor.connect('clicked', () => row.item.activate());
    actor.connect('key-press-event', (_actor, event) => {
      if (!row.item.reveal || !isControlEnter(event)) return Clutter.EVENT_PROPAGATE;
      row.item.reveal();
      return Clutter.EVENT_STOP;
    });
    actor.connect('key-focus-in', () => this.reveal(actor));
    if (this.steering) actor.connect('motion-event', () => {
      this.chosen = true;
      this.highlight(row);
      return Clutter.EVENT_PROPAGATE;
    });
    this.menus.bind(actor, () => this.entries(row));
    return row;
  }
}
