import { styleSurface, freezeSelection } from '../../appearance/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import type Graphene from 'gi://Graphene';
import type Mtk from 'gi://Mtk';
import St from 'gi://St';

import { clamp } from '../math.js';
import * as Main from '../../core/main.js';
import { drawArrowBorder } from './arrowBorder.js';

export const PopupAnimation = {
  NONE: 0,
  SLIDE: 1 << 0,
  FADE: 1 << 1,
  FULL: ~0,
} as const;

export const POPUP_ANIMATION_TIME = 150;

const SLIDE_SCALE = 0.96;

export namespace BoxPointer {
  export interface Signals extends St.Widget.SignalSignatures {
    'arrow-side-changed': () => void;
  }
}

interface SlideStart {
  horizontal: boolean;
  translation: number;
  pivotX: number;
  pivotY: number;
}

function slideStart(side: St.Side, rise: number): SlideStart {
  switch (side) {
    case St.Side.TOP: return { horizontal: false, translation: -rise, pivotX: 0.5, pivotY: 0 };
    case St.Side.BOTTOM: return { horizontal: false, translation: rise, pivotX: 0.5, pivotY: 1 };
    case St.Side.LEFT: return { horizontal: true, translation: -rise, pivotX: 0, pivotY: 0.5 };
    case St.Side.RIGHT: return { horizontal: true, translation: rise, pivotX: 1, pivotY: 0.5 };
  }
}

function useMotion(animate: number): boolean {
  return St.Settings.get().reducedMotion !== St.ReducedMotion.REDUCE && !!(animate & PopupAnimation.SLIDE);
}

export const BoxPointer = GObject.registerClass({
  Signals: { 'arrow-side-changed': {} },
}, class BoxPointer extends St.Widget {
  declare connect: GObject.SignalMethods<this, BoxPointer.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, BoxPointer.Signals>['emit'];

  declare bin: St.Bin;
  declare clearClosingSelection: (() => void) | null | undefined;
  declare private currentArrowSide: St.Side;
  declare private userArrowSide: St.Side;
  declare private arrowOrigin: number;
  declare private border: St.DrawingArea;
  declare private sourceAlignment: number;
  declare private arrowAlignment: number;
  declare private muteKeys: Clutter.KeyController;
  declare private muteInput: Clutter.ClickGesture;
  declare private sourceActor: Clutter.Actor | null | undefined;
  declare private sourceExtents: Graphene.Rect;
  declare private workArea: Mtk.Rectangle;

  _init(arrowSide: St.Side, binProperties?: Partial<St.Bin.ConstructorProps>): void {
    super._init();

    this.currentArrowSide = arrowSide;
    this.userArrowSide = arrowSide;
    this.arrowOrigin = 0;
    this.bin = new St.Bin(binProperties);
    styleSurface(this.bin, 18);
    this.add_child(this.bin);
    this.border = new St.DrawingArea();
    this.border.connect('repaint', area => drawArrowBorder(area, this.get_theme_node(), this.currentArrowSide, this.arrowOrigin));
    this.add_child(this.border);
    this.set_child_above_sibling(this.bin, this.border);
    this.sourceAlignment = 0.5;

    this.connect('notify::visible', () => {
      if (this.visible) global.compositor.disable_unredirect();
      else global.compositor.enable_unredirect();
    });

    this.muteKeys = new Clutter.KeyController();
    this.muteKeys.connect('key-press', () => Clutter.EVENT_STOP);
    this.add_action_full('key-muting', Clutter.EventPhase.CAPTURE, this.muteKeys);

    this.muteInput = new Clutter.ClickGesture({ recognize_on_press: true });
    this.add_action_full('click-muting', Clutter.EventPhase.CAPTURE, this.muteInput);
  }

  get arrowSide(): St.Side {
    return this.currentArrowSide;
  }

  open(animate: number, onComplete?: () => void): void {
    this.clearClosingSelection?.();
    this.clearClosingSelection = null;
    const rise = this.get_theme_node().get_length('-arrow-rise');
    const animationTime = animate & PopupAnimation.FULL ? POPUP_ANIMATION_TIME : 0;

    this.opacity = animate & PopupAnimation.FADE ? 0 : 255;

    this.muteKeys.enabled = false;
    this.show();

    if (useMotion(animate)) {
      const start = slideStart(this.currentArrowSide, rise);
      this.scale_x = SLIDE_SCALE;
      this.scale_y = SLIDE_SCALE;
      if (start.horizontal) this.translation_x = start.translation;
      else this.translation_y = start.translation;
      this.set_pivot_point(start.pivotX, start.pivotY);
    }

    this.ease({
      opacity: 255,
      translation_x: 0,
      translation_y: 0,
      scale_x: 1,
      scale_y: 1,
      duration: animationTime,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => {
        this.muteInput.enabled = false;
        onComplete?.();
      },
    });
  }

  close(animate: number, onComplete?: () => void): void {
    this.clearClosingSelection ??= freezeSelection(this.bin);
    if (!this.visible) return;

    let translationX = 0;
    let translationY = 0;
    let scale = 1;
    const rise = this.get_theme_node().get_length('-arrow-rise');
    const fade = animate & PopupAnimation.FADE;
    const animationTime = animate & PopupAnimation.FULL ? POPUP_ANIMATION_TIME : 0;

    if (useMotion(animate)) {
      const start = slideStart(this.currentArrowSide, rise);
      scale = SLIDE_SCALE;
      if (start.horizontal) translationX = start.translation;
      else translationY = start.translation;
      this.set_pivot_point(start.pivotX, start.pivotY);
    }

    this.muteInput.enabled = true;
    this.muteKeys.enabled = true;

    this.remove_all_transitions();
    this.ease({
      opacity: fade ? 0 : 255,
      translation_x: translationX,
      translation_y: translationY,
      scale_x: scale,
      scale_y: scale,
      duration: animationTime,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => {
        this.hide();
        this.opacity = 0;
        this.translation_x = 0;
        this.translation_y = 0;
        onComplete?.();
      },
    });
  }

  private adjustAllocationForArrow(isWidth: boolean, minSize: number, natSize: number): [number, number] {
    const themeNode = this.get_theme_node();
    const borderWidth = themeNode.get_length('-arrow-border-width');
    minSize += borderWidth * 2;
    natSize += borderWidth * 2;
    const vertical = this.currentArrowSide === St.Side.TOP || this.currentArrowSide === St.Side.BOTTOM;
    if (isWidth !== vertical) {
      const rise = themeNode.get_length('-arrow-rise');
      minSize += rise;
      natSize += rise;
    }

    return [minSize, natSize];
  }

  vfunc_get_preferred_width(forHeight: number): [number, number] {
    const themeNode = this.get_theme_node();
    forHeight = themeNode.adjust_for_height(forHeight);

    const width = this.adjustAllocationForArrow(true, ...this.bin.get_preferred_width(forHeight));
    return themeNode.adjust_preferred_width(...width);
  }

  vfunc_get_preferred_height(forWidth: number): [number, number] {
    const themeNode = this.get_theme_node();
    const borderWidth = themeNode.get_length('-arrow-border-width');
    forWidth = themeNode.adjust_for_width(forWidth);

    const height = this.adjustAllocationForArrow(false, ...this.bin.get_preferred_height(forWidth - 2 * borderWidth));
    return themeNode.adjust_preferred_height(...height);
  }

  vfunc_allocate(box: Clutter.ActorBox): void {
    if (this.sourceActor?.mapped) {
      this.reposition(this.sourceActor, box);
      this.updateFlip(this.sourceActor, box);
    }

    this.set_allocation(box);

    const themeNode = this.get_theme_node();
    const borderWidth = themeNode.get_length('-arrow-border-width');
    const rise = themeNode.get_length('-arrow-rise');
    const childBox = new Clutter.ActorBox();
    const [availWidth, availHeight] = themeNode.get_content_box(box).get_size();

    childBox.x1 = 0;
    childBox.y1 = 0;
    childBox.x2 = availWidth;
    childBox.y2 = availHeight;
    this.border.allocate(childBox);

    childBox.x1 = borderWidth;
    childBox.y1 = borderWidth;
    childBox.x2 = availWidth - borderWidth;
    childBox.y2 = availHeight - borderWidth;
    switch (this.currentArrowSide) {
      case St.Side.TOP:
        childBox.y1 += rise;
        break;
      case St.Side.BOTTOM:
        childBox.y2 -= rise;
        break;
      case St.Side.LEFT:
        childBox.x1 += rise;
        break;
      case St.Side.RIGHT:
        childBox.x2 -= rise;
        break;
    }
    this.bin.allocate(childBox);
  }

  setPosition(sourceActor: Clutter.Actor | null, alignment: number): void {
    if (!this.sourceActor || sourceActor !== this.sourceActor) {
      this.sourceActor?.disconnectObject(this);
      this.sourceActor = sourceActor;
      this.sourceActor?.connectObject('destroy', () => (this.sourceActor = null), this);
    }

    this.arrowAlignment = clamp(alignment, 0.0, 1.0);
    this.queue_relayout();
  }

  setSourceAlignment(alignment: number): void {
    this.sourceAlignment = clamp(alignment, 0.0, 1.0);
    if (!this.sourceActor) return;

    this.setPosition(this.sourceActor, this.arrowAlignment);
  }

  private reposition(sourceActor: Clutter.Actor, allocationBox: Clutter.ActorBox): void {
    let alignment = this.arrowAlignment;
    const monitorIndex = Main.layoutManager.findIndexForActor(sourceActor);

    this.sourceExtents = sourceActor.get_transformed_extents();
    this.workArea = Main.layoutManager.getWorkAreaForMonitor(monitorIndex);

    const sourceAllocation = sourceActor.get_allocation_box();
    const sourceContentBox = sourceActor instanceof St.Widget
      ? sourceActor.get_theme_node().get_content_box(sourceAllocation)
      : new Clutter.ActorBox({ x2: sourceAllocation.get_width(), y2: sourceAllocation.get_height() });
    const sourceTopLeft = this.sourceExtents.get_top_left();
    const sourceBottomRight = this.sourceExtents.get_bottom_right();
    const sourceCenterX = sourceTopLeft.x + sourceContentBox.x1 + (sourceContentBox.x2 - sourceContentBox.x1) * this.sourceAlignment;
    const sourceCenterY = sourceTopLeft.y + sourceContentBox.y1 + (sourceContentBox.y2 - sourceContentBox.y1) * this.sourceAlignment;
    const [, , natWidth, natHeight] = this.get_preferred_size();

    const workarea = this.workArea;
    const themeNode = this.get_theme_node();
    const borderWidth = themeNode.get_length('-arrow-border-width');
    const arrowBase = themeNode.get_length('-arrow-base');
    const borderRadius = themeNode.get_length('-arrow-border-radius');
    const margin = 4 * borderRadius + borderWidth + arrowBase;

    const gap = themeNode.get_length('-boxpointer-gap');
    const padding = themeNode.get_length('-arrow-rise');

    let resX = 0;
    let resY = 0;

    switch (this.currentArrowSide) {
      case St.Side.TOP:
        resY = sourceBottomRight.y + gap;
        break;
      case St.Side.BOTTOM:
        resY = sourceTopLeft.y - natHeight - gap;
        break;
      case St.Side.LEFT:
        resX = sourceBottomRight.x + gap;
        break;
      case St.Side.RIGHT:
        resX = sourceTopLeft.x - natWidth - gap;
        break;
    }

    let arrowOrigin = 0;
    const halfBase = Math.floor(arrowBase / 2);
    const halfBorder = borderWidth / 2;
    const halfMargin = margin / 2;
    const [x1, y1] = [halfBorder, halfBorder];
    const [x2, y2] = [natWidth - halfBorder, natHeight - halfBorder];

    switch (this.currentArrowSide) {
      case St.Side.TOP:
      case St.Side.BOTTOM:
        if (this.text_direction === Clutter.TextDirection.RTL) alignment = 1.0 - alignment;

        resX = sourceCenterX - (halfMargin + (natWidth - margin) * alignment);
        resX = Math.max(resX, workarea.x + padding);
        resX = Math.min(resX, workarea.x + workarea.width - (padding + natWidth));

        arrowOrigin = sourceCenterX - resX;
        if (arrowOrigin <= x1 + borderRadius + halfBase) {
          if (arrowOrigin > x1) resX += arrowOrigin - x1;
          arrowOrigin = x1;
        } else if (arrowOrigin >= x2 - (borderRadius + halfBase)) {
          if (arrowOrigin < x2) resX -= x2 - arrowOrigin;
          arrowOrigin = x2;
        }
        break;

      case St.Side.LEFT:
      case St.Side.RIGHT:
        resY = sourceCenterY - (halfMargin + (natHeight - margin) * alignment);
        resY = Math.max(resY, workarea.y + padding);
        resY = Math.min(resY, workarea.y + workarea.height - (padding + natHeight));

        arrowOrigin = sourceCenterY - resY;
        if (arrowOrigin <= y1 + borderRadius + halfBase) {
          if (arrowOrigin > y1) resY += arrowOrigin - y1;
          arrowOrigin = y1;
        } else if (arrowOrigin >= y2 - (borderRadius + halfBase)) {
          if (arrowOrigin < y2) resY -= y2 - arrowOrigin;
          arrowOrigin = y2;
        }
        break;
    }

    this.setArrowOrigin(arrowOrigin);

    let parent = this.get_parent()!;
    let success = false;
    let x = 0;
    let y = 0;
    while (!success) {
      [success, x, y] = parent.transform_stage_point(resX, resY);
      parent = parent.get_parent()!;
    }

    allocationBox.set_origin(Math.floor(x), Math.floor(y));
  }

  setArrowOrigin(origin: number): void {
    if (this.arrowOrigin === origin) return;

    this.arrowOrigin = origin;
    this.border.queue_repaint();
  }

  private calculateArrowSide(arrowSide: St.Side): St.Side {
    const sourceTopLeft = this.sourceExtents.get_top_left();
    const sourceBottomRight = this.sourceExtents.get_bottom_right();
    const [, , boxWidth, boxHeight] = this.get_preferred_size();
    const workarea = this.workArea;

    switch (arrowSide) {
      case St.Side.TOP:
        if (sourceBottomRight.y + boxHeight > workarea.y + workarea.height && boxHeight < sourceTopLeft.y - workarea.y)
          return St.Side.BOTTOM;
        break;
      case St.Side.BOTTOM:
        if (sourceTopLeft.y - boxHeight < workarea.y && boxHeight < workarea.y + workarea.height - sourceBottomRight.y)
          return St.Side.TOP;
        break;
      case St.Side.LEFT:
        if (sourceBottomRight.x + boxWidth > workarea.x + workarea.width && boxWidth < sourceTopLeft.x - workarea.x)
          return St.Side.RIGHT;
        break;
      case St.Side.RIGHT:
        if (sourceTopLeft.x - boxWidth < workarea.x && boxWidth < workarea.x + workarea.width - sourceBottomRight.x)
          return St.Side.LEFT;
        break;
    }

    return arrowSide;
  }

  private updateFlip(sourceActor: Clutter.Actor, allocationBox: Clutter.ActorBox): void {
    const arrowSide = this.calculateArrowSide(this.userArrowSide);
    if (this.currentArrowSide === arrowSide) return;

    this.currentArrowSide = arrowSide;
    this.reposition(sourceActor, allocationBox);
    this.emit('arrow-side-changed');
  }
});
export type BoxPointer = InstanceType<typeof BoxPointer>;
