import Clutter from 'gi://Clutter';
import Graphene from 'gi://Graphene';
import GObject from 'gi://GObject';
import St from 'gi://St';

const INDICATOR_INACTIVE_OPACITY = 128;
const INDICATOR_INACTIVE_OPACITY_HOVER = 255;
const INDICATOR_INACTIVE_SCALE = 2 / 3;
const INDICATOR_INACTIVE_SCALE_PRESSED = 0.5;

export namespace PageIndicators {
  export interface Signals extends St.BoxLayout.SignalSignatures {
    'page-activated': (page: number) => void;
  }
}

export const PageIndicators = GObject.registerClass({
  Signals: { 'page-activated': { param_types: [GObject.TYPE_INT] } },
}, class PageIndicators extends St.BoxLayout {
  declare connect: GObject.SignalMethods<this, PageIndicators.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, PageIndicators.Signals>['emit'];

  private nPages = 0;
  private currentPosition = 0;
  private indicatorsReactive = true;

  constructor(orientation = Clutter.Orientation.VERTICAL) {
    const vertical = orientation === Clutter.Orientation.VERTICAL;
    super({
      style_class: 'page-indicators',
      orientation,
      x_expand: true,
      y_expand: true,
      x_align: vertical ? Clutter.ActorAlign.END : Clutter.ActorAlign.CENTER,
      y_align: vertical ? Clutter.ActorAlign.CENTER : Clutter.ActorAlign.END,
      reactive: true,
      clip_to_allocation: true,
    });
  }

  vfunc_get_preferred_height(forWidth: number): [number, number] {
    const [, natHeight] = super.vfunc_get_preferred_height(forWidth);
    return [0, natHeight];
  }

  setReactive(reactive: boolean): void {
    for (const child of this.get_children()) child.reactive = reactive;
    this.indicatorsReactive = reactive;
  }

  setNPages(nPages: number): void {
    if (this.nPages === nPages) return;

    const diff = nPages - this.nPages;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) this.add_child(this.createIndicator(this.nPages + i));
    } else {
      for (const child of this.get_children().splice(diff)) child.destroy();
    }

    this.nPages = nPages;
    this.visible = this.nPages > 1;
  }

  setCurrentPosition(currentPosition: number): void {
    this.currentPosition = currentPosition;
    this.get_children().forEach((child, i) => this.updateIndicator(child as St.Button, i));
  }

  private createIndicator(pageIndex: number): St.Button {
    const indicator = new St.Button({
      style_class: 'page-indicator',
      button_mask: St.ButtonMask.PRIMARY | St.ButtonMask.MIDDLE | St.ButtonMask.SECONDARY,
      reactive: this.indicatorsReactive,
      child: new St.Widget({
        style_class: 'page-indicator-icon',
        pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 }),
      }),
    });
    indicator.connect('clicked', () => this.emit('page-activated', pageIndex));
    indicator.connect('notify::hover', () => this.updateIndicator(indicator, pageIndex));
    indicator.connect('notify::pressed', () => this.updateIndicator(indicator, pageIndex));
    this.updateIndicator(indicator, pageIndex);
    return indicator;
  }

  private updateIndicator(indicator: St.Button, pageIndex: number): void {
    const progress = Math.max(1 - Math.abs(this.currentPosition - pageIndex), 0);

    const inactiveScale = indicator.pressed ? INDICATOR_INACTIVE_SCALE_PRESSED : INDICATOR_INACTIVE_SCALE;
    const inactiveOpacity = indicator.hover ? INDICATOR_INACTIVE_OPACITY_HOVER : INDICATOR_INACTIVE_OPACITY;

    const scale = inactiveScale + (1 - inactiveScale) * progress;
    const opacity = inactiveOpacity + (255 - inactiveOpacity) * progress;

    const icon = indicator.child!;
    icon.set_scale(scale, scale);
    icon.opacity = opacity;
  }
});

export type PageIndicators = InstanceType<typeof PageIndicators>;
