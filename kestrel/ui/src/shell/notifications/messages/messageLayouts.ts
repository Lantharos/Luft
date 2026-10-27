import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

const EXPAND_LINES = 6;

export const ScaleLayout = GObject.registerClass(
class ScaleLayout extends Clutter.BinLayout {
  private container: Clutter.Actor | null = null;

  vfunc_set_container(container: Clutter.Actor | null): void {
    if (this.container === container) return;

    this.container?.disconnectObject(this);
    this.container = container;
    this.container?.connectObject(
      'notify::scale-x', () => this.layout_changed(),
      'notify::scale-y', () => this.layout_changed(), this);
  }

  vfunc_get_preferred_width(container: Clutter.Actor, forHeight: number): [number, number] {
    const [min, nat] = super.vfunc_get_preferred_width(container, forHeight);
    return [Math.floor(min * container.scale_x), Math.floor(nat * container.scale_x)];
  }

  vfunc_get_preferred_height(container: Clutter.Actor, forWidth: number): [number, number] {
    const [min, nat] = super.vfunc_get_preferred_height(container, forWidth);
    return [Math.floor(min * container.scale_y), Math.floor(nat * container.scale_y)];
  }
});

export const LabelExpanderLayout = GObject.registerClass({
  Properties: {
    'expansion': GObject.ParamSpec.double(
      'expansion', null, null,
      GObject.ParamFlags.READABLE | GObject.ParamFlags.WRITABLE,
      0, 1, 0),
  },
}, class LabelExpanderLayout extends Clutter.BinLayout {
  private expansionValue = 0;

  get expansion(): number {
    return this.expansionValue;
  }

  set expansion(expansion: number) {
    if (expansion === this.expansionValue) return;
    this.expansionValue = expansion;
    this.notify('expansion');
    this.layout_changed();
  }

  vfunc_get_preferred_height(container: Clutter.Actor, forWidth: number): [number, number] {
    const child = container.get_first_child();
    if (!child) return [0, 0];

    const [min, nat] = child.get_preferred_height(-1);
    const [, wrappedNat] = child.get_preferred_height(forWidth);
    const expHeight = Math.min(wrappedNat, nat * EXPAND_LINES);
    return [
      Math.floor(min + this.expansionValue * (expHeight - min)),
      Math.floor(nat + this.expansionValue * (expHeight - nat)),
    ];
  }
});
