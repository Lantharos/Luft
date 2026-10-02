import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { animateAdjustment } from '../../shared/motion.js';
import { withTone, type Item, type Tab } from '../catalog/catalog.js';
import { CellView } from './cellView.js';
import { GlyphImages, GlyphRenderer, type Glyph } from './images.js';
import { CELL_SIZE, COLUMNS, GridLayout, HEADER_HEIGHT, type Cell } from './layout.js';

const SCROLLBAR_GUTTER = 10;
export const GRID_WIDTH = COLUMNS * CELL_SIZE + SCROLLBAR_GUTTER;
const SCROLL_DURATION = 320;
const EMOJI_SIZE = 26;
const CHARACTER_SIZE = 20;

interface Events {
  hovered(item: Item | null): void;
  activated(cell: Cell): void;
  scrolled(tab: Tab | null): void;
}

export class EmojiGrid {
  private readonly content = new St.Viewport({ layout_manager: new Clutter.FixedLayout() });
  readonly actor = new St.ScrollView({
    style_class: 'kestrel-app-scroll kestrel-emoji-grid', hscrollbar_policy: St.PolicyType.NEVER,
    vscrollbar_policy: St.PolicyType.AUTOMATIC, overlay_scrollbars: true, child: this.content,
    width: GRID_WIDTH, height: 0, y_expand: true,
  });
  private readonly spacer = new Clutter.Actor({ width: COLUMNS * CELL_SIZE });
  private layout = new GridLayout([]);
  private readonly views = new Map<number, CellView>();
  private readonly spareViews: CellView[] = [];
  private readonly reusable = new Map<Item, CellView>();
  private readonly emojiImages = new GlyphImages(GlyphRenderer.new_for_emoji(), EMOJI_SIZE);
  private characterImages: GlyphImages | null = null;
  private readonly themeContext = St.ThemeContext.get_for_stage((global as unknown as Shell.Global).stage);
  private readonly headers = new Map<number, St.Label>();
  private readonly spareHeaders: St.Label[] = [];
  private tone = 0;
  private selected: Cell | null = null;
  private pressed: CellView | null = null;
  private tab: Tab | null = null;
  private scrollTarget = 0;

  constructor(private readonly events: Events, private readonly maximumHeight: number) {
    this.content.add_child(this.spacer);
    this.actor.vadjustment.connect('notify::value', () => this.refresh());
    this.actor.vadjustment.connect('notify::page-size', () => this.refresh());
    this.actor.connect('resource-scale-changed', () => this.redraw());
    this.themeContext.connect('notify::scale-factor', () => this.redraw());
  }

  get cells(): readonly Cell[] {
    return this.layout.cells;
  }

  get selection(): Cell | null {
    return this.selected;
  }

  show(layout: GridLayout, tone: number): void {
    this.layout = layout;
    this.tone = tone;
    this.selected = null;
    this.spacer.height = layout.height;
    for (const view of this.views.values()) {
      if (this.reusable.has(view.cell!.item)) this.retire(view);
      else this.reusable.set(view.cell!.item, view);
    }
    this.views.clear();
    for (const index of [...this.headers.keys()]) this.releaseHeader(index);
    this.actor.vadjustment.remove_transition('value');
    this.actor.vadjustment.value = 0;
    this.refresh();
  }

  setTone(tone: number): void {
    this.tone = tone;
    this.redraw();
  }

  select(cell: Cell | null): void {
    this.views.get(this.selected?.index ?? -1)?.setSelected(false);
    this.selected = cell;
    if (!cell) return;
    this.reveal(cell);
    this.views.get(cell.index)?.setSelected(true);
  }

  scrollTo(tab: Tab): void {
    const row = this.layout.tabRows.get(tab);
    if (row === undefined) return;
    const adjustment = this.actor.vadjustment;
    this.scrollTarget = Math.min(this.layout.rows[row].y, Math.max(0, this.layout.height - adjustment.page_size));
    animateAdjustment(adjustment, this.scrollTarget, { duration: SCROLL_DURATION, mode: Clutter.AnimationMode.EASE_OUT_CUBIC });
  }

  firstVisibleCell(): Cell | null {
    const adjustment = this.actor.vadjustment;
    const top = adjustment.get_transition('value') ? this.scrollTarget : adjustment.value;
    const rows = this.layout.rows;
    for (let index = rows.length ? this.layout.firstRowAt(top) : 0; index < rows.length; index++)
      if (rows[index].cells.length) return rows[index].cells[0];
    return null;
  }

  neighbour(cell: Cell, rows: number): Cell | undefined {
    return this.layout.neighbour(cell, rows);
  }

  get visibleRows(): number {
    return Math.max(1, Math.floor(this.actor.vadjustment.page_size / CELL_SIZE) - 1);
  }

  private reveal(cell: Cell): void {
    const adjustment = this.actor.vadjustment;
    const row = this.layout.rows[cell.row];
    const previous = this.layout.rows[cell.row - 1];
    const top = previous?.title ? previous.y : row.y;
    const value = adjustment.get_transition('value') ? this.scrollTarget : adjustment.value;
    if (top >= value && row.y + row.height <= value + adjustment.page_size) return;
    adjustment.remove_transition('value');
    adjustment.value = top < value ? top : row.y + row.height - adjustment.page_size;
  }

  private refresh(): void {
    const { value, page_size: pageSize } = this.actor.vadjustment;
    const rows = this.layout.rows;
    const first = rows.length ? this.layout.firstRowAt(value) : 0;
    const bottom = value + (pageSize || this.maximumHeight);
    const cells: Cell[] = [];
    const titled: number[] = [];
    for (let index = first; index < rows.length && rows[index].y < bottom; index++) {
      if (rows[index].title) titled.push(index);
      cells.push(...rows[index].cells);
    }
    const wantedCells = new Set(cells.map(cell => cell.index));
    const wantedHeaders = new Set(titled);
    for (const index of [...this.views.keys()]) if (!wantedCells.has(index)) this.releaseView(index);
    for (const index of [...this.headers.keys()]) if (!wantedHeaders.has(index)) this.releaseHeader(index);
    this.bindViews(cells.filter(cell => !this.views.has(cell.index)));
    for (const index of titled) if (!this.headers.has(index)) this.bindHeader(index);
    const tab = rows.length ? rows[this.layout.firstRowAt(value + 1)].tab : null;
    if (tab !== this.tab) this.events.scrolled(this.tab = tab);
  }

  private redraw(): void {
    const scale = this.scale();
    for (const view of this.views.values()) view.show(...this.face(view.cell!.item, scale));
  }

  private scale(): number {
    return this.themeContext.scale_factor * this.actor.get_resource_scale();
  }

  private face(item: Item, scale: number): [string, Glyph | null] {
    if (item.kind === 'emoji') {
      const text = withTone(item, this.tone);
      return [text, this.emojiImages.get(text, scale)];
    }
    if (item.kind === 'character') return [item.face, this.characters.get(item.text, scale)];
    return [item.face, null];
  }

  private get characters(): GlyphImages {
    if (!this.characterImages) {
      const theme = this.actor.get_theme_node();
      this.characterImages = new GlyphImages(GlyphRenderer.new_for_text(theme.get_font().get_family()!, theme.get_foreground_color()), CHARACTER_SIZE);
    }
    return this.characterImages;
  }

  private bindViews(cells: readonly Cell[]): void {
    const scale = this.scale();
    const unmatched = cells.filter(cell => {
      const view = this.reusable.get(cell.item);
      if (!view) return true;
      this.reusable.delete(cell.item);
      this.bindView(cell, view, scale);
      return false;
    });
    const leftovers = this.reusable.values();
    for (const cell of unmatched) this.bindView(cell, leftovers.next().value ?? this.spareViews.pop() ?? this.createView(), scale);
    for (const view of leftovers) this.retire(view);
    this.reusable.clear();
  }

  private bindView(cell: Cell, view: CellView, scale: number): void {
    view.bind(cell, ...this.face(cell.item, scale), this.layout.rows[cell.row].y, cell === this.selected);
    this.views.set(cell.index, view);
    if (view.actor.hover) this.events.hovered(cell.item);
  }

  private releaseView(index: number): void {
    this.retire(this.views.get(index)!);
    this.views.delete(index);
  }

  private retire(view: CellView): void {
    view.release();
    this.spareViews.push(view);
  }

  private createView(): CellView {
    const view = new CellView();
    view.actor.connect('notify::hover', () => {
      if (view.cell) this.events.hovered(view.actor.hover ? view.cell.item : null);
    });
    view.actor.connect('button-press-event', (_actor, event) => {
      if (event.get_button() !== Clutter.BUTTON_PRIMARY) return Clutter.EVENT_PROPAGATE;
      this.pressed = view;
      return Clutter.EVENT_STOP;
    });
    view.actor.connect('button-release-event', (_actor, event) => {
      if (event.get_button() !== Clutter.BUTTON_PRIMARY) return Clutter.EVENT_PROPAGATE;
      const pressed = this.pressed === view && view.cell;
      this.pressed = null;
      if (pressed) this.events.activated(pressed);
      return Clutter.EVENT_STOP;
    });
    this.content.add_child(view.actor);
    return view;
  }

  private bindHeader(index: number): void {
    const header = this.spareHeaders.pop() ?? this.createHeader();
    const row = this.layout.rows[index];
    header.text = row.title!;
    header.set_position(0, row.y);
    header.show();
    this.headers.set(index, header);
  }

  private releaseHeader(index: number): void {
    const header = this.headers.get(index)!;
    this.headers.delete(index);
    header.hide();
    this.spareHeaders.push(header);
  }

  private createHeader(): St.Label {
    const header = new St.Label({ style_class: 'kestrel-emoji-header', width: COLUMNS * CELL_SIZE, height: HEADER_HEIGHT });
    this.content.add_child(header);
    return header;
  }
}
