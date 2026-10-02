import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import St from 'gi://St';

import type { Kind } from '../catalog/catalog.js';
import type { Glyph } from './images.js';
import { CELL_SIZE, type Cell } from './layout.js';

const STYLES: Record<Kind, string> = {
  emoji: 'kestrel-emoji-cell',
  character: 'kestrel-emoji-cell',
  space: 'kestrel-emoji-cell kestrel-emoji-wide kestrel-emoji-space',
  kaomoji: 'kestrel-emoji-cell kestrel-emoji-wide',
};

export class CellView {
  private readonly label = new St.Label({ x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
  private readonly image = new Clutter.Actor({ x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER });
  readonly actor = new St.Bin({ reactive: true, track_hover: true, child: this.label, accessible_role: Atk.Role.PUSH_BUTTON });
  cell: Cell | null = null;
  private text = '';
  private glyph: Glyph | null = null;
  private style = '';
  private name = '';
  private span = 0;
  private selected = false;

  constructor() {
    this.label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
  }

  bind(cell: Cell, text: string, glyph: Glyph | null, y: number, selected: boolean): void {
    if (!this.cell) this.actor.show();
    this.cell = cell;
    this.show(text, glyph);
    const { kind, name } = cell.item;
    if (this.style !== STYLES[kind]) this.actor.style_class = this.style = STYLES[kind];
    if (this.name !== name) this.actor.accessible_name = this.name = name;
    this.actor.set_position(cell.column * CELL_SIZE, y);
    if (this.span !== cell.span) this.actor.set_size((this.span = cell.span) * CELL_SIZE, CELL_SIZE);
    this.setSelected(selected);
  }

  release(): void {
    this.actor.hide();
    this.setSelected(false);
    this.cell = null;
  }

  show(text: string, glyph: Glyph | null): void {
    if (glyph && glyph !== this.glyph) {
      this.image.content = glyph.content;
      this.image.set_size(glyph.width, glyph.height);
    } else if (!glyph && this.text !== text) {
      this.label.text = this.text = text;
    }
    if (!glyph !== !this.glyph) this.actor.child = glyph ? this.image : this.label;
    this.glyph = glyph;
  }

  setSelected(selected: boolean): void {
    if (this.selected === selected) return;
    this.selected = selected;
    if (selected) {
      this.actor.add_style_pseudo_class('selected');
      this.actor.add_accessible_state(Atk.StateType.SELECTED);
    } else {
      this.actor.remove_style_pseudo_class('selected');
      this.actor.remove_accessible_state(Atk.StateType.SELECTED);
    }
  }
}
