import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { blurSurface } from '../shared/surface.js';
import { animateActor } from '../shared/motion.js';
import { boxCenter, findAnchor, heightNear, placeNear, type Anchor, type Box } from '../shared/placement.js';
import type { TextInput } from '../shared/textInput.js';
import { annotate } from './catalog/annotations.js';
import { Catalog, describe, withTone } from './catalog/catalog.js';
import { SearchIndex } from './catalog/search.js';
import { SearchField } from './controls/searchField.js';
import { TabStrip } from './controls/tabStrip.js';
import { TonePicker } from './controls/tonePicker.js';
import { EmojiGrid, GRID_WIDTH } from './grid/grid.js';
import { GridLayout, type Cell } from './grid/layout.js';
import { EmojiPreferences } from './preferences.js';

type Zone = 'grid' | 'tone' | 'tabs' | 'tones';

const ZONES: readonly Zone[] = ['grid', 'tone', 'tabs'];
const PREFERRED_HEIGHT = 452;
const SLIDE_DISTANCE = 8;
const FADE_DURATION = 160;
const INDEX_DELAY_SECONDS = 5;
const INDEX_CHUNK = 500;
const ENTER_KEYS = [Clutter.KEY_Return, Clutter.KEY_KP_Enter, Clutter.KEY_ISO_Enter];
const NAVIGATION_KEYS = [
  Clutter.KEY_Left, Clutter.KEY_Right, Clutter.KEY_Up, Clutter.KEY_Down,
  Clutter.KEY_Page_Up, Clutter.KEY_Page_Down, Clutter.KEY_Home, Clutter.KEY_End,
];

export class EmojiPanel {
  readonly actor = new St.BoxLayout({
    name: 'kestrel-emoji', orientation: Clutter.Orientation.VERTICAL,
    style_class: 'kestrel-popover kestrel-emoji', visible: false, reactive: true,
  });
  readonly available = true;
  private readonly preferences = new EmojiPreferences(() => { this.browsing = null; });
  private readonly search = new SearchField(text => this.query(text), () => this.setZone('grid'));
  private readonly empty = new St.Label({ text: 'No results', style_class: 'kestrel-empty', visible: false, x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.START });
  private readonly footer = new St.Label({ style_class: 'kestrel-emoji-name', x_expand: true });
  private readonly grid = new EmojiGrid({
    hovered: item => this.hover(item ? describe(item) : null),
    activated: cell => this.insert(cell),
    scrolled: tab => this.tabs?.setCurrent(tab),
  }, PREFERRED_HEIGHT);
  private catalog: Catalog | null = null;
  private index: SearchIndex | null = null;
  private tabs: TabStrip | null = null;
  private tones: TonePicker | null = null;
  private browsing: GridLayout | null = null;
  private zone: Zone = 'grid';
  private hovered: string | null = null;
  private pointing = false;
  private intercepting = false;
  private anchor: Anchor | null = null;
  private above = false;
  private focusWatch = 0;
  private indexing: number;

  constructor(private readonly input: TextInput, private readonly close: () => void, private readonly paste: (text: string) => void) {
    blurSurface(this.actor);
    this.actor.connect('key-press-event', (_actor, event) => {
      this.key(event);
      return Clutter.EVENT_STOP;
    });
    this.actor.connect('motion-event', () => {
      if (!this.pointing) {
        this.pointing = true;
        this.updateFooter();
      }
      return Clutter.EVENT_PROPAGATE;
    });
    this.indexing = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, INDEX_DELAY_SECONDS, () => {
      this.indexing = 0;
      this.prepare();
      return GLib.SOURCE_REMOVE;
    });
    this.actor.connect('destroy', () => {
      if (this.indexing) GLib.Source.remove(this.indexing);
    });
  }

  get slideDistance(): number {
    return this.above ? SLIDE_DISTANCE : -SLIDE_DISTANCE;
  }

  locate(): [number, number] {
    this.anchor = findAnchor(this.input.caret);
    return boxCenter(this.anchor.box);
  }

  place(limit: number, area: Box): void {
    if (!this.anchor) return;
    const theme = this.actor.get_theme_node();
    const width = GRID_WIDTH + theme.get_horizontal_padding();
    const height = heightNear(this.anchor, area, Math.min(limit, PREFERRED_HEIGHT));
    const { x, y, above } = placeNear(this.anchor, width, height, area);
    this.above = above;
    this.actor.set_size(width, height);
    this.actor.set_position(x, y);
  }

  open(): void {
    this.prepare();
    const shellGlobal = global as unknown as Shell.Global;
    const shellFocus = shellGlobal.stage.get_key_focus();
    this.intercepting = !!this.input.currentFocus && (!shellFocus || shellFocus === shellGlobal.stage);
    if (this.search.text) this.search.clear();
    else this.showBrowsing();
    this.closeTones(false);
    this.tones!.show(this.preferences.tone);
    this.pointing = false;
    this.hover(null);
    this.setZone('grid');
    if (!this.intercepting) {
      this.actor.grab_key_focus();
      return;
    }
    this.focusWatch = shellGlobal.display.connect('notify::focus-window', () => this.close());
    this.input.interceptKeys(event => {
      this.key(event);
      return true;
    });
  }

  closed(): void {
    this.input.interceptKeys(null);
    this.search.setActive(false);
    if (this.focusWatch) (global as unknown as Shell.Global).display.disconnect(this.focusWatch);
    this.focusWatch = 0;
  }

  private prepare(): void {
    if (this.catalog) return;
    if (this.indexing) GLib.Source.remove(this.indexing);
    this.indexing = 0;
    const catalog = this.catalog = new Catalog();
    annotate(catalog);
    const index = this.index = new SearchIndex(catalog.items);
    this.indexing = GLib.idle_add(GLib.PRIORITY_LOW, () => {
      index.extend(INDEX_CHUNK);
      if (!index.complete) return GLib.SOURCE_CONTINUE;
      this.indexing = 0;
      return GLib.SOURCE_REMOVE;
    });
    const hovered = (title: string | null) => this.hover(title);
    this.tabs = new TabStrip(catalog.tabs, { hovered, activated: index => this.openTab(index) });
    this.tones = new TonePicker({ hovered, activated: tone => this.chooseTone(tone), toggled: () => this.toggleTones(false) });
    const header = new St.BoxLayout({ style_class: 'kestrel-emoji-header-row', x_expand: true });
    header.add_child(this.search.actor);
    header.add_child(this.tones.button);
    const switcher = new St.Widget({ layout_manager: new Clutter.BinLayout(), x_expand: true });
    switcher.add_child(this.tabs.actor);
    switcher.add_child(this.tones.options);
    const body = new St.Widget({ layout_manager: new Clutter.BinLayout(), y_expand: true });
    body.add_child(this.grid.actor);
    body.add_child(this.empty);
    for (const child of [header, switcher, body, this.footer]) this.actor.add_child(child);
    this.showBrowsing();
  }

  private showBrowsing(): void {
    const catalog = this.catalog!;
    this.browsing ??= new GridLayout([
      { title: 'Recently used', tab: catalog.tabs[0], items: this.preferences.recent.flatMap(text => catalog.find(text) ?? []) },
      ...catalog.tabs.flatMap(tab => GridLayout.sections(tab.sections)),
    ]);
    this.empty.hide();
    this.grid.show(this.browsing, this.preferences.tone);
  }

  private query(text: string): void {
    if (text.trim()) {
      const layout = new GridLayout([{ title: null, tab: null, items: this.index!.search(text) }]);
      this.grid.show(layout, this.preferences.tone);
      this.empty.visible = !layout.cells.length;
    } else {
      this.showBrowsing();
    }
    if (this.zone === 'grid') this.grid.select(this.grid.firstVisibleCell());
    this.updateFooter();
  }

  private insert(cell: Cell): void {
    const text = withTone(cell.item, this.preferences.tone);
    this.preferences.remember(cell.item.text);
    if (this.intercepting && this.input.currentFocus) {
      this.input.commit(text);
      if (this.search.text) this.search.clear();
      return;
    }
    this.close();
    this.paste(text);
  }

  private key(event: Clutter.Event): void {
    const key = event.get_key_symbol();
    this.pointing = false;
    if (key === Clutter.KEY_Escape) {
      if (this.zone === 'tones') this.closeTones(true);
      else this.close();
    } else if (key === Clutter.KEY_Tab || key === Clutter.KEY_ISO_Left_Tab) {
      const backward = key === Clutter.KEY_ISO_Left_Tab || (event.get_state() & Clutter.ModifierType.SHIFT_MASK) !== 0;
      if (this.zone === 'tones') this.closeTones(false);
      const current = ZONES.indexOf(this.zone === 'tones' ? 'tone' : this.zone);
      this.setZone(ZONES[(current + (backward ? ZONES.length - 1 : 1)) % ZONES.length]);
    } else if (ENTER_KEYS.includes(key)) {
      this.activate();
    } else if (!this.navigate(key) && this.search.edit(event) && this.zone !== 'grid') {
      if (this.zone === 'tones') this.closeTones(false);
      this.setZone('grid');
    }
  }

  private navigate(key: number): boolean {
    switch (this.zone) {
    case 'tone':
      if (key === Clutter.KEY_space) this.toggleTones(true);
      else if (key === Clutter.KEY_Down) this.setZone('tabs');
      else return key === Clutter.KEY_Up || key === Clutter.KEY_Left || key === Clutter.KEY_Right;
      return true;
    case 'tones':
      return this.moveFocus(key, this.tones!.focusedIndex, this.tones!.options.get_n_children(), index => this.tones!.focus(index),
        () => this.chooseTone(this.tones!.focusedIndex));
    case 'tabs':
      if (key === Clutter.KEY_Up) this.setZone('tone');
      else if (key === Clutter.KEY_Down) this.setZone('grid');
      else return this.moveFocus(key, this.tabs!.focusedIndex, this.tabs!.tabs.length, index => this.tabs!.focus(index),
        () => this.openTab(this.tabs!.focusedIndex));
      return true;
    case 'grid':
      return this.moveSelection(key);
    }
  }

  private moveFocus(key: number, index: number, count: number, focus: (index: number) => void, activate: () => void): boolean {
    if (key === Clutter.KEY_Left) focus(Math.max(0, index - 1));
    else if (key === Clutter.KEY_Right) focus(Math.min(count - 1, index + 1));
    else if (key === Clutter.KEY_Home) focus(0);
    else if (key === Clutter.KEY_End) focus(count - 1);
    else if (key === Clutter.KEY_space) activate();
    else return key === Clutter.KEY_Up || key === Clutter.KEY_Down;
    return true;
  }

  private moveSelection(key: number): boolean {
    const cells = this.grid.cells;
    const cell = this.grid.selection;
    if (!cell) return NAVIGATION_KEYS.includes(key);
    let next: Cell | undefined;
    switch (key) {
    case Clutter.KEY_Left: next = cells[cell.index - 1]; break;
    case Clutter.KEY_Right: next = cells[cell.index + 1]; break;
    case Clutter.KEY_Up: next = this.grid.neighbour(cell, -1); break;
    case Clutter.KEY_Down: next = this.grid.neighbour(cell, 1); break;
    case Clutter.KEY_Page_Up: next = this.grid.neighbour(cell, -this.grid.visibleRows) ?? cells[0]; break;
    case Clutter.KEY_Page_Down: next = this.grid.neighbour(cell, this.grid.visibleRows) ?? cells[cells.length - 1]; break;
    case Clutter.KEY_Home: next = cells[0]; break;
    case Clutter.KEY_End: next = cells[cells.length - 1]; break;
    default: return false;
    }
    if (next) this.grid.select(next);
    else if (key === Clutter.KEY_Up && !this.search.text) this.setZone('tabs');
    this.updateFooter();
    return true;
  }

  private activate(): void {
    if (this.zone === 'tone') this.toggleTones(true);
    else if (this.zone === 'tones') this.chooseTone(this.tones!.focusedIndex);
    else if (this.zone === 'tabs') this.openTab(this.tabs!.focusedIndex);
    else if (this.grid.selection) this.insert(this.grid.selection);
  }

  private setZone(zone: Zone): void {
    this.zone = zone;
    this.search.setActive(zone === 'grid');
    this.tones!.focusButton(zone === 'tone');
    this.tabs!.focus(zone === 'tabs' ? Math.max(0, this.tabs!.currentIndex) : -1);
    if (zone === 'tones') this.tones!.focus(this.preferences.tone);
    if (zone === 'grid' && !this.grid.selection) this.grid.select(this.grid.firstVisibleCell());
    if (zone !== 'grid') this.grid.select(null);
    this.updateFooter();
  }

  private openTab(index: number): void {
    if (this.search.text) this.search.clear();
    this.grid.scrollTo(this.tabs!.tabs[index]);
    this.tabs!.setCurrent(this.tabs!.tabs[index]);
    if (this.zone === 'grid') this.grid.select(this.grid.firstVisibleCell());
  }

  private toggleTones(fromKeyboard: boolean): void {
    if (this.tones!.options.visible) this.closeTones(fromKeyboard);
    else {
      this.crossfade(this.tones!.options, this.tabs!.actor);
      if (fromKeyboard) this.setZone('tones');
    }
  }

  private closeTones(focusButton: boolean): void {
    if (this.tones!.options.visible) this.crossfade(this.tabs!.actor, this.tones!.options);
    this.tones!.focus(-1);
    if (focusButton) this.setZone('tone');
  }

  private chooseTone(tone: number): void {
    this.preferences.tone = tone;
    this.tones!.show(tone);
    this.grid.setTone(tone);
    this.closeTones(this.zone === 'tones');
  }

  private crossfade(incoming: Clutter.Actor, outgoing: Clutter.Actor): void {
    incoming.show();
    animateActor(incoming, { opacity: 255, duration: FADE_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    animateActor(outgoing, {
      opacity: 0, duration: FADE_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onStopped: (finished: boolean) => { if (finished) outgoing.hide(); },
    });
  }

  private hover(description: string | null): void {
    this.hovered = description;
    this.updateFooter();
  }

  private updateFooter(): void {
    const selected = this.grid.selection?.item;
    const pointed = this.pointing ? this.hovered : null;
    this.footer.text = pointed ?? (selected ? describe(selected) : '');
  }
}
