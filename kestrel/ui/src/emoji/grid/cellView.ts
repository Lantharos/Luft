import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import St from 'gi://St';

import type { Kind } from '../catalog/catalog.js';
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
  private style = '';

  constructor() {
    this.label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
  }

  bind(cell: Cell, text: string, image: Clutter.Content | null, y: number, selected: boolean): void {
    this.cell = cell;
    this.show(text, image);
    if (this.style !== STYLES[cell.item.kind]) this.actor.style_class = this.style = STYLES[cell.item.kind];
    if (this.actor.accessible_name !== cell.item.name) this.actor.accessible_name = cell.item.name;
    this.actor.set_position(cell.column * CELL_SIZE, y);
    this.actor.set_size(cell.span * CELL_SIZE, CELL_SIZE);
    this.setSelected(selected);
    this.actor.show();
  }

  show(text: string, image: Clutter.Content | null): void {
    if (image && this.image.content !== image) {
      const [, width, height] = image.get_preferred_size();
      this.image.content = image;
      this.image.set_size(width, height);
    } else if (!image && this.text !== text) {
      this.label.text = this.text = text;
    }
    const child = image ? this.image : this.label;
    if (this.actor.child !== child) this.actor.child = child;
  }

  setSelected(selected: boolean): void {
    if (selected) {
      this.actor.add_style_pseudo_class('selected');
      this.actor.add_accessible_state(Atk.StateType.SELECTED);
    } else {
      this.actor.remove_style_pseudo_class('selected');
      this.actor.remove_accessible_state(Atk.StateType.SELECTED);
    }
  }
}
