import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { ensureActorVisibleInScrollView } from '../../../core/runtime/animationUtils.js';
import { appIcons } from '../../../appearance/icons/appIcons.js';
import type { ContextMenus, MenuEntry } from '../../../desktop/menus/contextMenus.js';
import { appKey, launchHistory } from '../../../shared/apps/launchHistory.js';
import { appName } from '../../../shared/apps/names.js';
import { t } from '../../../shared/i18n/index.js';
import { FillLayout } from '../../../shared/layout/fill.js';
import { liftIcon } from '../../../shared/motion/motion.js';
import { searchTerms } from '../../search/providers/apps.js';
import { query, rank, searchable, type Searchable } from '../../search/ranking.js';
import { CenteredColumnLayout } from '../panel/cells.js';
import { categoriesOf, type Category } from './categories.js';
import { SheetLayout } from './sheetLayout.js';

const CELL_WIDTH = 96;
const CELL_HEIGHT = 116;
const ICON_SIZE = 48;
const INSET = 24;
const PRELOADED_ROWS = 1;

interface Cell extends Searchable {
  app: Gio.AppInfo;
  title: string;
  actor: St.Button;
  icon: St.Icon;
  categories: Set<Category>;
  loaded: boolean;
}

export class AppSheet {
  private readonly layout = new SheetLayout(CELL_WIDTH, CELL_HEIGHT, ICON_SIZE, INSET);
  private readonly grid = new St.Viewport({ name: 'kestrel-gust-sheet', style_class: 'kestrel-gust-sheet', layout_manager: this.layout, x_expand: true });
  readonly actor = new St.ScrollView({
    style_class: 'kestrel-gust-sheet-scroll', hscrollbar_policy: St.PolicyType.NEVER, vscrollbar_policy: St.PolicyType.AUTOMATIC,
    x_expand: true, child: this.grid,
  });
  private cells: Cell[] = [];
  private order: Cell[] = [];
  private highlighted: Cell | null = null;
  private loading = 0;

  constructor(private readonly menus: ContextMenus, private readonly launch: (app: Gio.AppInfo) => void) {
    const adjustment = this.actor.vadjustment;
    adjustment.connect('notify::value', () => this.loadSoon());
    adjustment.connect('changed', () => this.loadSoon());
    this.actor.connect('destroy', () => {
      if (this.loading) global.compositor.get_laters().remove(this.loading);
    });
  }

  categories(): Set<Category> {
    return new Set(this.cells.flatMap(cell => [...cell.categories]));
  }

  update(apps: Gio.AppInfo[]): void {
    const previous = new Map(this.cells.map(cell => [cell.key, cell]));
    this.cells = apps.map(app => {
      const key = appKey(app.get_id()!);
      const known = previous.get(key);
      if (!known || known.title !== appName(app)) return this.cell(app, key);
      previous.delete(key);
      known.app = app;
      return known;
    });
    for (const cell of previous.values()) cell.actor.destroy();
    for (const cell of this.cells) if (!cell.actor.get_parent()) this.grid.add_child(cell.actor);
    if (this.highlighted && !this.cells.includes(this.highlighted)) this.highlighted = null;
  }

  filter(text: string, category: Category | null): void {
    const matching = text
      ? rank(this.cells, query(text), 0, launchHistory.weigher()).map(({ entry }) => entry)
      : this.cells.filter(cell => !category || cell.categories.has(category));
    const shown = new Set(matching);
    matching.forEach((cell, index) => {
      if (this.grid.get_child_at_index(index) !== cell.actor) this.grid.set_child_at_index(cell.actor, index);
      cell.actor.visible = true;
    });
    for (const cell of this.cells) if (!shown.has(cell)) cell.actor.visible = false;
    this.order = matching;
    this.highlight(text ? matching[0] ?? null : null);
    this.actor.vadjustment.value = 0;
    this.loadSoon();
  }

  move(columns: number, rows: number): void {
    if (!this.order.length) return;
    const width = this.columns();
    const current = this.highlighted ? this.order.indexOf(this.highlighted) : -1;
    const target = current < 0 ? 0 : Math.max(0, Math.min(this.order.length - 1, current + columns + rows * width));
    if (current >= 0 && rows && Math.floor(target / width) === Math.floor(current / width)) return;
    const next = this.order[target];
    this.highlight(next);
    ensureActorVisibleInScrollView(this.actor, next.actor);
  }

  get pageRows(): number {
    return Math.max(1, Math.floor(this.actor.vadjustment.page_size / CELL_HEIGHT));
  }

  activate(): void {
    if (this.highlighted) this.launch(this.highlighted.app);
  }

  openMenu(): void {
    const cell = this.highlighted;
    if (!cell) return;
    const [x, y] = cell.actor.get_transformed_position();
    this.menus.open(cell.actor, this.entries(cell.app), x, y + cell.actor.height);
  }

  private columns(): number {
    return this.layout.columns || this.layout.fit(this.actor.width || CELL_WIDTH);
  }

  private highlight(cell: Cell | null): void {
    this.highlighted?.actor.remove_style_pseudo_class('highlighted');
    this.highlighted = cell;
    cell?.actor.add_style_pseudo_class('highlighted');
  }

  private loadSoon(): void {
    this.loading ||= global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.loading = 0;
      this.loadVisible();
      return false;
    });
  }

  private loadVisible(): void {
    const { value, page_size: pageSize } = this.actor.vadjustment;
    const columns = this.columns();
    const first = Math.max(0, Math.floor(value / CELL_HEIGHT) - PRELOADED_ROWS) * columns;
    const end = (Math.ceil((value + (pageSize || this.actor.height)) / CELL_HEIGHT) + PRELOADED_ROWS) * columns;
    for (const cell of this.order.slice(first, end)) {
      if (cell.loaded) continue;
      cell.loaded = true;
      appIcons.bind(cell.icon, cell.app);
    }
  }

  private entries(app: Gio.AppInfo): MenuEntry[] {
    const shellApp = Shell.AppSystem.get_default().lookup_app(app.get_id()!);
    return shellApp ? this.menus.appEntries(shellApp) : [{ label: t('gust-open'), run: () => this.launch(app) }];
  }

  private cell(app: Gio.AppInfo, key: string): Cell {
    const name = appName(app);
    const content = new St.Widget({ style_class: 'kestrel-app-content', layout_manager: new CenteredColumnLayout() });
    const icon = new St.Icon({ icon_size: ICON_SIZE, fallback_icon_name: 'application-x-executable' });
    content.add_child(icon);
    const label = new St.Label({ text: name, style_class: 'kestrel-app-label kestrel-gust-sheet-label' });
    label.clutter_text.line_wrap = true;
    label.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;
    label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
    label.clutter_text.line_alignment = Pango.Alignment.CENTER;
    content.add_child(label);
    const actor = new St.Button({
      name: `kestrel-gust-app-${app.get_id()}`, style_class: 'kestrel-app-button kestrel-gust-sheet-app', child: content,
      layout_manager: new FillLayout(), accessible_name: name, track_hover: true,
    });
    const cell: Cell = searchable({ app, title: name, actor, icon, categories: categoriesOf(app), loaded: false }, key, name, searchTerms(app));
    liftIcon(actor, icon);
    actor.connect('clicked', () => this.launch(cell.app));
    actor.connect('motion-event', () => {
      if (this.highlighted !== cell) this.highlight(cell);
      return Clutter.EVENT_PROPAGATE;
    });
    this.menus.bind(actor, () => this.entries(cell.app));
    return cell;
  }
}
