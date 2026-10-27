import { styleSurface } from '../../appearance/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import { setSourceColor } from '../../shared/display/cairo.js';

const POPUP_SCROLL_TIME = 100;

export namespace ItemList {
  export interface Signals extends St.Widget.SignalSignatures {
    'item-activated': (index: number) => void;
    'item-entered': (index: number) => void;
    'item-removed': (index: number) => void;
  }
}

export abstract class ItemList extends St.Widget {
  static {
    GObject.registerClass({
      GTypeFlags: GObject.TypeFlags.ABSTRACT,
      Signals: {
        'item-activated': { param_types: [GObject.TYPE_INT] },
        'item-entered': { param_types: [GObject.TYPE_INT] },
        'item-removed': { param_types: [GObject.TYPE_INT] },
      },
    }, this as unknown as typeof St.Widget);
  }

  declare connect: GObject.SignalMethods<this, ItemList.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, ItemList.Signals>['emit'];

  abstract highlight(index: number, justOutline?: boolean): void;
}

class SwitcherButton extends St.Button {
  static {
    GObject.registerClass(this);
  }

  constructor(private readonly square: boolean) {
    super({ style_class: 'item-box', reactive: true });
  }

  vfunc_get_preferred_width(forHeight: number): [number, number] {
    if (this.square) return this.get_preferred_height(-1);
    return super.vfunc_get_preferred_width(forHeight);
  }
}

function drawArrow(area: St.DrawingArea, side: St.Side.LEFT | St.Side.RIGHT): void {
  const themeNode = area.get_theme_node();
  const [width, height] = area.get_surface_size();
  const cr = area.get_context();

  cr.setLineWidth(1.0);
  setSourceColor(cr, themeNode.get_border_color(side));

  if (side === St.Side.LEFT) {
    cr.moveTo(width, height);
    cr.lineTo(0, Math.floor(height * 0.5));
    cr.lineTo(width, 0);
  } else {
    cr.moveTo(0, 0);
    cr.lineTo(width, Math.floor(height * 0.5));
    cr.lineTo(0, height);
  }

  cr.strokePreserve();

  setSourceColor(cr, themeNode.get_foreground_color());
  cr.fill();
  cr.$dispose();
}

function arrow(side: St.Side.LEFT | St.Side.RIGHT): St.DrawingArea {
  const area = new St.DrawingArea({ style_class: 'switcher-arrow', pseudo_class: 'highlighted' });
  area.connect('repaint', () => drawArrow(area, side));
  return area;
}

export class SwitcherList extends ItemList {
  static {
    GObject.registerClass(this);
  }

  private readonly list = new St.BoxLayout({
    style_class: 'switcher-list-item-container',
    orientation: Clutter.Orientation.HORIZONTAL,
    x_expand: true,
    y_expand: true,
  });

  private readonly scrollView: St.ScrollView;
  private readonly leftArrow = arrow(St.Side.LEFT);
  private readonly rightArrow = arrow(St.Side.RIGHT);
  private readonly items: SwitcherButton[] = [];
  private highlighted = -1;
  private scrollableRight = true;
  private scrollableLeft = false;

  constructor(private readonly squareItems: boolean) {
    super({ style_class: 'switcher-list' });
    styleSurface(this, 22);

    this.scrollView = new St.ScrollView({
      style_class: 'hfade',
      enable_mouse_scrolling: false,
      enable_touch_scrolling: false,
      hscrollbar_policy: St.PolicyType.NEVER,
      vscrollbar_policy: St.PolicyType.NEVER,
      child: this.list,
    });

    this.add_child(this.scrollView);
    this.add_child(this.leftArrow);
    this.add_child(this.rightArrow);

    (this.list.get_layout_manager() as Clutter.BoxLayout).homogeneous = squareItems;
  }

  addItem(item: Clutter.Actor, label: Clutter.Actor): St.Button {
    const button = new SwitcherButton(this.squareItems);

    button.set_child(item);
    this.list.add_child(button);

    button.connect('clicked', () => this.emit('item-activated', this.items.indexOf(button)));

    const motionController = new Clutter.MotionController();
    motionController.connect('motion', () => this.onItemMotion(button));
    button.add_action(motionController);

    button.label_actor = label;

    this.items.push(button);

    return button;
  }

  removeItem(index: number): void {
    const [item] = this.items.splice(index, 1);
    item.destroy();
    this.emit('item-removed', index);
  }

  private onItemMotion(item: SwitcherButton): boolean {
    if (item !== this.items[this.highlighted]) this.emit('item-entered', this.items.indexOf(item));

    return Clutter.EVENT_PROPAGATE;
  }

  highlight(index: number, justOutline = false): void {
    const previous = this.items[this.highlighted];
    if (previous) {
      previous.remove_style_pseudo_class('selected');
      previous.remove_style_pseudo_class('highlighted');
    }

    const item = this.items[index];
    item?.add_style_pseudo_class(justOutline ? 'highlighted' : 'selected');

    this.highlighted = index;

    const [value] = this.scrollView.hadjustment.get_values();
    const [absItemX] = item.get_transformed_position();
    const [, posX] = this.transform_stage_point(absItemX, 0);
    const [containerWidth] = this.get_transformed_size();
    if (posX + item.get_width() > containerWidth) this.scrollTo(index, true);
    else if (item.allocation.x1 - value < 0) this.scrollTo(index, false);
  }

  private scrollTo(index: number, right: boolean): void {
    const adjustment = this.scrollView.hadjustment;
    let [value, , upper, , , pageSize] = adjustment.get_values();

    const item = this.items[index];

    if (item.allocation.x1 < value) value = Math.max(0, item.allocation.x1);
    else if (item.allocation.x2 > value + pageSize) value = Math.min(upper, item.allocation.x2 - pageSize);

    if (right) this.scrollableLeft = true;
    else this.scrollableRight = true;

    adjustment.ease(value, {
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      duration: POPUP_SCROLL_TIME,
      onComplete: () => {
        if (right && index === this.items.length - 1) this.scrollableRight = false;
        if (!right && index === 0) this.scrollableLeft = false;
        this.queue_relayout();
      },
    });
  }

  private maxChildWidth(forHeight: number): [number, number] {
    let maxChildMin = 0;
    let maxChildNat = 0;

    for (const item of this.items) {
      let [childMin, childNat] = item.get_preferred_width(forHeight);
      maxChildMin = Math.max(childMin, maxChildMin);
      maxChildNat = Math.max(childNat, maxChildNat);

      if (this.squareItems) {
        [childMin, childNat] = item.get_preferred_height(-1);
        maxChildMin = Math.max(childMin, maxChildMin);
        maxChildNat = Math.max(childNat, maxChildNat);
      }
    }

    return [maxChildMin, maxChildNat];
  }

  vfunc_get_preferred_width(forHeight: number): [number, number] {
    const [maxChildMin] = this.maxChildWidth(forHeight);
    const [minListWidth] = this.list.get_preferred_width(forHeight);

    return this.get_theme_node().adjust_preferred_width(maxChildMin, minListWidth);
  }

  vfunc_get_preferred_height(_forWidth: number): [number, number] {
    let maxChildMin = 0;
    let maxChildNat = 0;

    for (const item of this.items) {
      const [childMin, childNat] = item.get_preferred_height(-1);
      maxChildMin = Math.max(childMin, maxChildMin);
      maxChildNat = Math.max(childNat, maxChildNat);
    }

    if (this.squareItems) {
      const [childMin] = this.maxChildWidth(-1);
      maxChildMin = Math.max(childMin, maxChildMin);
      maxChildNat = maxChildMin;
    }

    return this.get_theme_node().adjust_preferred_height(maxChildMin, maxChildNat);
  }

  vfunc_allocate(box: Clutter.ActorBox): void {
    this.set_allocation(box);

    const themeNode = this.get_theme_node();
    const contentBox = themeNode.get_content_box(box);
    const width = contentBox.x2 - contentBox.x1;
    const height = contentBox.y2 - contentBox.y1;

    const leftPadding = themeNode.get_padding(St.Side.LEFT);
    const rightPadding = themeNode.get_padding(St.Side.RIGHT);

    const [minListWidth] = this.list.get_preferred_width(height);

    const childBox = new Clutter.ActorBox();
    const scrollable = minListWidth > width;

    this.scrollView.allocate(contentBox);

    let arrowWidth = Math.floor(leftPadding / 3);
    let arrowHeight = arrowWidth * 2;
    childBox.x1 = leftPadding / 2;
    childBox.y1 = this.height / 2 - arrowWidth;
    childBox.x2 = childBox.x1 + arrowWidth;
    childBox.y2 = childBox.y1 + arrowHeight;
    this.leftArrow.allocate(childBox);
    this.leftArrow.opacity = this.scrollableLeft && scrollable ? 255 : 0;

    arrowWidth = Math.floor(rightPadding / 3);
    arrowHeight = arrowWidth * 2;
    childBox.x1 = this.width - arrowWidth - rightPadding / 2;
    childBox.y1 = this.height / 2 - arrowWidth;
    childBox.x2 = childBox.x1 + arrowWidth;
    childBox.y2 = childBox.y1 + arrowHeight;
    this.rightArrow.allocate(childBox);
    this.rightArrow.opacity = this.scrollableRight && scrollable ? 255 : 0;
  }
}
