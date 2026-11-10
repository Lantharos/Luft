import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

const { SnapEdge } = Clutter;

const shade = () => new St.Widget({ style_class: 'screenshot-ui-area-indicator-shade' });

const snap = (source: Clutter.Actor, fromEdge: Clutter.SnapEdge, toEdge: Clutter.SnapEdge) =>
  new Clutter.SnapConstraint({ source, from_edge: fromEdge, to_edge: toEdge });

const bindWidth = (source: Clutter.Actor) =>
  new Clutter.BindConstraint({ source, coordinate: Clutter.BindCoordinate.WIDTH });

export class UIAreaIndicator extends St.Widget {
  static {
    GObject.registerClass(this);
  }

  private readonly selectionRect = new St.Widget({ style_class: 'screenshot-ui-area-indicator-selection' });

  constructor(params?: Partial<St.Widget.ConstructorProps>) {
    super(params);

    const topRect = shade();
    topRect.add_constraint(bindWidth(this));
    topRect.add_constraint(snap(this, SnapEdge.TOP, SnapEdge.TOP));
    topRect.add_constraint(snap(this, SnapEdge.LEFT, SnapEdge.LEFT));
    this.add_child(topRect);

    const bottomRect = shade();
    bottomRect.add_constraint(bindWidth(this));
    bottomRect.add_constraint(snap(this, SnapEdge.BOTTOM, SnapEdge.BOTTOM));
    bottomRect.add_constraint(snap(this, SnapEdge.LEFT, SnapEdge.LEFT));
    this.add_child(bottomRect);

    const leftRect = shade();
    leftRect.add_constraint(snap(this, SnapEdge.LEFT, SnapEdge.LEFT));
    leftRect.add_constraint(snap(topRect, SnapEdge.TOP, SnapEdge.BOTTOM));
    leftRect.add_constraint(snap(bottomRect, SnapEdge.BOTTOM, SnapEdge.TOP));
    this.add_child(leftRect);

    const rightRect = shade();
    rightRect.add_constraint(snap(this, SnapEdge.RIGHT, SnapEdge.RIGHT));
    rightRect.add_constraint(snap(topRect, SnapEdge.TOP, SnapEdge.BOTTOM));
    rightRect.add_constraint(snap(bottomRect, SnapEdge.BOTTOM, SnapEdge.TOP));
    this.add_child(rightRect);

    this.add_child(this.selectionRect);

    topRect.add_constraint(snap(this.selectionRect, SnapEdge.BOTTOM, SnapEdge.TOP));
    bottomRect.add_constraint(snap(this.selectionRect, SnapEdge.TOP, SnapEdge.BOTTOM));
    leftRect.add_constraint(snap(this.selectionRect, SnapEdge.RIGHT, SnapEdge.LEFT));
    rightRect.add_constraint(snap(this.selectionRect, SnapEdge.LEFT, SnapEdge.RIGHT));
  }

  setSelectionRect(x: number, y: number, width: number, height: number): void {
    this.selectionRect.set_position(x, y);
    this.selectionRect.set_size(width, height);
  }
}
