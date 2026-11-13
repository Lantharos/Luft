import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

export function contentBoxOf(container: Clutter.Actor): Clutter.ActorBox {
  const node = (container as St.Widget).get_theme_node();
  const inset = (side: St.Side) => node.get_padding(side) + node.get_border_width(side);
  const [width, height] = container.get_allocation_box().get_size();
  return new Clutter.ActorBox({
    x1: inset(St.Side.LEFT), y1: inset(St.Side.TOP),
    x2: width - inset(St.Side.RIGHT), y2: height - inset(St.Side.BOTTOM),
  });
}

export const FillLayout = GObject.registerClass(class FillLayout extends Clutter.BinLayout {
  vfunc_allocate(container: Clutter.Actor): void {
    const box = contentBoxOf(container);
    for (const child of container.get_children()) child.allocate(box);
  }
});
