import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';
import * as Signals from '../runtime/signals.js';

import * as Main from '../main.js';
import { DragDropResult, DragMotionResult, dragMonitors, type DragDelegate, type DragEvent, type DropEvent } from './dndTargets.js';

export * from './dndTargets.js';

export const SCALE_ANIMATION_TIME = 250;
export const SNAP_BACK_ANIMATION_TIME = 250;
export const REVERT_ANIMATION_TIME = 750;

const DRAG_CURSOR_MAP: Record<Exclude<DragMotionResult, typeof DragMotionResult.CONTINUE>, Clutter.CursorType> = {
  [DragMotionResult.NO_DROP]: Clutter.CursorType.NO_DROP,
  [DragMotionResult.COPY_DROP]: Clutter.CursorType.COPY,
  [DragMotionResult.MOVE_DROP]: Clutter.CursorType.MOVE,
};

type DelegateActor = Clutter.Actor & { _delegate?: DragDelegate };

export interface DraggableOptions {
  manualMode?: boolean;
  timeoutThreshold?: number;
  restoreOnSuccess?: boolean;
  dragActorMaxSize?: number;
  dragActorOpacity?: number;
}

interface DraggableSignals {
  'drag-begin': (time: number) => void;
  'drag-cancelled': (time: number) => void;
  'drag-end': (time: number, snapback: boolean) => void;
}

let eventHandlerActor: Clutter.Actor | null = null;
let currentDraggable: Draggable | null = null;

function getEventHandlerActor(): Clutter.Actor {
  if (!eventHandlerActor) {
    eventHandlerActor = new Clutter.Actor({ width: 0, height: 0, reactive: true });
    Main.uiGroup.add_child(eventHandlerActor);
    eventHandlerActor.connect('event', (actor, event) => currentDraggable!.handleEvent(actor, event));
  }
  return eventHandlerActor;
}

function getRealActorScale(actor: Clutter.Actor | null): number {
  let scale = 1.0;
  while (actor) {
    scale *= actor.scale_x;
    actor = actor.get_parent();
  }
  return scale;
}

class Draggable extends Signals.EventEmitter {
  declare connect: GObject.SignalMethods<this, DraggableSignals>['connect'];
  declare emit: GObject.SignalMethods<this, DraggableSignals>['emit'];

  private readonly dndGesture: St.DndStartGesture;
  private readonly restoreOnSuccess: boolean;
  private readonly dragActorMaxSize: number | undefined;
  private readonly dragActorOpacity: number | undefined;
  private animationInProgress = false;
  private dragCancellable = true;
  private grab: Clutter.Grab | null = null;
  private sprite: Clutter.Sprite | null = null;
  private updateHoverId = 0;
  private dragActor: Clutter.Actor | null = null;
  private dragActorSource: Clutter.Actor | null | undefined;
  private dragOrigParent: Clutter.Actor | null | undefined;
  private dragActorDestroyId = 0;
  private dragActorSourceDestroyId = 0;
  private dragOrigParentDestroyId = 0;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragX = 0;
  private dragY = 0;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private dragActorHadFixedPos = false;
  private dragActorHadNatWidth = false;
  private dragActorHadNatHeight = false;
  private dragOrigX = 0;
  private dragOrigY = 0;
  private dragOrigWidth = 0;
  private dragOrigHeight = 0;
  private dragOrigScale = 1;
  private dragOrigOpacity = 255;
  private snapBackX = 0;
  private snapBackY = 0;
  private snapBackScale = 1;

  constructor(readonly actor: DelegateActor, {
    manualMode = false,
    timeoutThreshold = 0,
    restoreOnSuccess = false,
    dragActorMaxSize,
    dragActorOpacity,
  }: DraggableOptions = {}) {
    super();

    this.dndGesture = new St.DndStartGesture({
      manual_mode: manualMode,
      timeout_threshold: timeoutThreshold,
    });
    this.dndGesture.connect('recognize', () => this.gestureRecognized());
    this.actor.add_action(this.dndGesture);

    this.restoreOnSuccess = restoreOnSuccess;
    this.dragActorMaxSize = dragActorMaxSize;
    this.dragActorOpacity = dragActorOpacity;
  }

  get enabled(): boolean {
    return this.dndGesture.enabled;
  }

  set enabled(enabled: boolean) {
    this.dndGesture.enabled = enabled;
  }

  private grabEvents(sprite: Clutter.Sprite | null): void {
    this.grab = Main.pushModal(getEventHandlerActor(), { dismissShell: false });
    this.sprite = sprite;
  }

  private ungrabEvents(): void {
    Main.popModal(this.grab!);
    this.grab = null;
    this.sprite = null;
  }

  private updateCursor(cursorType: Clutter.CursorType): void {
    global.stage.get_grab_actor()?.set_cursor_type(cursorType);
  }

  private gestureRecognized(): void {
    [this.dragStartX, this.dragStartY] = this.dndGesture.get_point_begin_event().get_coords();

    const triggeringEvent = this.dndGesture.get_drag_triggering_event();
    const [stageX, stageY] = triggeringEvent.get_coords();
    const sprite = this.actor.get_context().get_backend().get_sprite(global.stage, triggeringEvent);
    const time = triggeringEvent.get_time();

    currentDraggable = this;

    this.grabEvents(sprite);
    if (!this.grab) return;

    this.emit('drag-begin', time);
    this.updateCursor(Clutter.CursorType.NO_DROP);

    this.dragX = stageX;
    this.dragY = stageY;

    const delegate = this.actor._delegate;
    const [scaledWidth, scaledHeight] = delegate?.getDragActor ? this.liftDelegateActor(delegate) : this.liftActor();
    const dragActor = this.dragActor!;

    this.dragActorDestroyId = dragActor.connect('destroy', () => {
      this.finishAnimation();
      this.dragActor = null;
      if (this.dragCancellable) this.cancelDrag(global.get_current_time());
    });
    this.dragOrigOpacity = dragActor.opacity;
    if (this.dragActorOpacity !== undefined) dragActor.opacity = this.dragActorOpacity;

    this.snapBackX = this.dragStartX + this.dragOffsetX;
    this.snapBackY = this.dragStartY + this.dragOffsetY;
    this.snapBackScale = dragActor.scale_x;

    const origDragOffsetX = this.dragOffsetX;
    const origDragOffsetY = this.dragOffsetY;
    const [transX, transY] = dragActor.get_translation();
    this.dragOffsetX -= transX;
    this.dragOffsetY -= transY;

    dragActor.set_position(this.dragX + this.dragOffsetX, this.dragY + this.dragOffsetY);

    if (this.dragActorMaxSize === undefined) return;
    const currentSize = Math.max(scaledWidth, scaledHeight);
    if (currentSize <= this.dragActorMaxSize) return;

    const scale = this.dragActorMaxSize / currentSize;
    const origScale = dragActor.scale_x;
    const update = () => this.updateActorPosition(origScale, origDragOffsetX, origDragOffsetY, transX, transY);
    dragActor.ease({
      scale_x: scale * origScale,
      scale_y: scale * origScale,
      duration: SCALE_ANIMATION_TIME,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: update,
    });
    dragActor.get_transition('scale-x')?.connect('new-frame', update);
  }

  private liftDelegateActor(delegate: DragDelegate): [number, number] {
    const dragActor = delegate.getDragActor!();
    this.dragActor = dragActor;
    Main.uiGroup.add_child(dragActor);
    Main.uiGroup.set_child_above_sibling(dragActor, null);
    Shell.util_set_hidden_from_pick(dragActor, true);

    if (delegate.getDragActorSource) {
      const source = delegate.getDragActorSource();
      this.dragActorSource = source;
      const [sourceX, sourceY] = source.get_transformed_position();
      const overSource = this.dragStartX > sourceX && this.dragStartX <= sourceX + dragActor.width &&
        this.dragStartY > sourceY && this.dragStartY <= sourceY + dragActor.height;
      dragActor.set_position(
        overSource ? sourceX : this.dragStartX - dragActor.width / 2,
        overSource ? sourceY : this.dragStartY - dragActor.height / 2);

      this.dragActorSourceDestroyId = source.connect('destroy', () => {
        this.dragActorSource = null;
      });
    } else {
      this.dragActorSource = this.actor;
    }
    this.dragOrigParent = undefined;

    this.dragOffsetX = dragActor.x - this.dragStartX;
    this.dragOffsetY = dragActor.y - this.dragStartY;

    return dragActor.get_transformed_size();
  }

  private liftActor(): [number, number] {
    const dragActor = this.actor;
    const parent = dragActor.get_parent()!;
    this.dragActor = dragActor;
    this.dragActorSource = undefined;
    this.dragOrigParent = parent;

    this.dragActorHadFixedPos = dragActor.fixed_position_set;
    this.dragOrigX = dragActor.allocation.x1;
    this.dragOrigY = dragActor.allocation.y1;
    this.dragActorHadNatWidth = dragActor.natural_width_set;
    this.dragActorHadNatHeight = dragActor.natural_height_set;
    this.dragOrigWidth = dragActor.allocation.get_width();
    this.dragOrigHeight = dragActor.allocation.get_height();
    this.dragOrigScale = dragActor.scale_x;

    dragActor.set_size(...dragActor.allocation.get_size());

    const transformedExtents = dragActor.get_transformed_extents();

    this.dragOffsetX = transformedExtents.origin.x - this.dragStartX;
    this.dragOffsetY = transformedExtents.origin.y - this.dragStartY;

    const scaledWidth = transformedExtents.get_width();
    const scaledHeight = transformedExtents.get_height();

    dragActor.scale_x = scaledWidth / this.dragOrigWidth;
    dragActor.scale_y = scaledHeight / this.dragOrigHeight;

    parent.remove_child(dragActor);
    Main.uiGroup.add_child(dragActor);
    Main.uiGroup.set_child_above_sibling(dragActor, null);
    Shell.util_set_hidden_from_pick(dragActor, true);

    this.dragOrigParentDestroyId = parent.connect('destroy', () => {
      this.dragOrigParent = null;
    });

    return [scaledWidth, scaledHeight];
  }

  private updateActorPosition(origScale: number, origDragOffsetX: number, origDragOffsetY: number, transX: number, transY: number): void {
    const dragActor = this.dragActor!;
    const currentScale = dragActor.scale_x / origScale;
    this.dragOffsetX = currentScale * origDragOffsetX - transX;
    this.dragOffsetY = currentScale * origDragOffsetY - transY;
    dragActor.set_position(this.dragX + this.dragOffsetX, this.dragY + this.dragOffsetY);
  }

  private pickTargetActor(): DelegateActor {
    return this.dragActor!.get_stage()!.get_actor_at_pos(Clutter.PickMode.ALL, this.dragX, this.dragY)!;
  }

  private updateDragHover(): void {
    this.updateHoverId = 0;
    let target: DelegateActor | null = this.pickTargetActor();

    const dragEvent: DragEvent = {
      x: this.dragX,
      y: this.dragY,
      dragActor: this.dragActor!,
      source: this.actor._delegate,
      targetActor: target,
    };

    let targetActorDestroyHandlerId = 0;
    const handleTargetActorDestroy = () => {
      target = this.pickTargetActor();
      dragEvent.targetActor = target;
      targetActorDestroyHandlerId = target.connect('destroy', handleTargetActorDestroy);
    };
    targetActorDestroyHandlerId = target.connect('destroy', handleTargetActorDestroy);

    for (const monitor of dragMonitors) {
      const result = monitor.dragMotion?.(dragEvent);
      if (result === undefined || result === DragMotionResult.CONTINUE) continue;
      this.updateCursor(DRAG_CURSOR_MAP[result]);
      dragEvent.targetActor.disconnect(targetActorDestroyHandlerId);
      return;
    }
    dragEvent.targetActor.disconnect(targetActorDestroyHandlerId);

    while (target) {
      if (target._delegate?.handleDragOver) {
        const [, targX, targY] = target.transform_stage_point(this.dragX, this.dragY);
        const result = target._delegate.handleDragOver(this.actor._delegate, this.dragActor!, targX, targY, 0);
        if (result !== DragMotionResult.CONTINUE) {
          this.updateCursor(DRAG_CURSOR_MAP[result]);
          return;
        }
      }
      target = target.get_parent();
    }
    this.updateCursor(Clutter.CursorType.NO_DROP);
  }

  private queueUpdateDragHover(): void {
    if (this.updateHoverId) return;

    this.updateHoverId = GLib.idle_add_once(GLib.PRIORITY_DEFAULT, () => this.updateDragHover());
    GLib.Source.set_name_by_id(this.updateHoverId, '[kestrel] this._updateDragHover');
  }

  private updateDragPosition(event: Clutter.Event): void {
    const [stageX, stageY] = event.get_coords();
    this.dragX = stageX;
    this.dragY = stageY;
    this.dragActor!.set_position(stageX + this.dragOffsetX, stageY + this.dragOffsetY);

    this.queueUpdateDragHover();
  }

  private dragActorDropped(event: Clutter.Event): void {
    const [dropX, dropY] = event.get_coords();
    const dropActor = this.dragActor!;
    let target: DelegateActor | null = dropActor.get_stage()!.get_actor_at_pos(Clutter.PickMode.ALL, dropX, dropY)!;

    const dropEvent: DropEvent = { dropActor, targetActor: target, clutterEvent: event };
    for (const monitor of dragMonitors) {
      const result = monitor.dragDrop?.(dropEvent);
      if (result === DragDropResult.FAILURE || result === DragDropResult.SUCCESS) return;
    }

    this.dragCancellable = false;

    while (target) {
      if (target._delegate?.acceptDrop) {
        const [, targX, targY] = target.transform_stage_point(dropX, dropY);
        let accepted = false;
        try {
          accepted = target._delegate.acceptDrop(this.actor._delegate, dropActor, targX, targY, event.get_time());
        } catch (e) {
          logError(e as Error, 'Skipping drag target');
        }
        if (accepted) {
          if (this.dragActor && this.dragActor.get_parent() === Main.uiGroup) {
            if (this.restoreOnSuccess) {
              this.restoreDragActor(event.get_time());
              return;
            }
            this.dragActor.destroy();
          }

          this.updateCursor(Clutter.CursorType.DEFAULT);
          this.emit('drag-end', event.get_time(), true);
          this.dragComplete();
          return;
        }
      }
      target = target.get_parent();
    }

    this.cancelDrag(event.get_time());
  }

  private getRestoreLocation(): [number, number, number] {
    if (this.dragActorSource?.visible) {
      const [x, y] = this.dragActorSource.get_transformed_position();
      const [sourceScaledWidth] = this.dragActorSource.get_transformed_size();
      return [x, y, sourceScaledWidth ? sourceScaledWidth / this.dragActor!.width : 0];
    }
    if (this.dragOrigParent) {
      const [parentX, parentY] = this.dragOrigParent.get_transformed_position();
      const parentScale = getRealActorScale(this.dragOrigParent);
      return [parentX + parentScale * this.dragOrigX, parentY + parentScale * this.dragOrigY, this.dragOrigScale * parentScale];
    }
    return [this.snapBackX, this.snapBackY, this.snapBackScale];
  }

  private restoreDragActor(eventTime: number): void {
    const [restoreX, restoreY, restoreScale] = this.getRestoreLocation();
    const dragActor = this.dragActor!;

    dragActor.set_position(restoreX, restoreY);
    dragActor.set_scale(restoreScale, restoreScale);
    dragActor.opacity = 0;

    this.animateDragEnd(eventTime, { duration: REVERT_ANIMATION_TIME });
  }

  private animateDragEnd(eventTime: number, params: Record<string, number>): void {
    this.animationInProgress = true;

    this.dragActor!.ease({
      ...params,
      opacity: this.dragOrigOpacity,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onStopped: () => this.onAnimationComplete(eventTime),
    });
  }

  private finishAnimation(): void {
    if (!this.animationInProgress) return;

    this.animationInProgress = false;
    this.dragComplete();

    this.updateCursor(Clutter.CursorType.DEFAULT);
  }

  private onAnimationComplete(eventTime: number): void {
    if (this.dragOrigParent) {
      const dragActor = this.dragActor!;
      Main.uiGroup.remove_child(dragActor);
      this.dragOrigParent.add_child(dragActor);
      dragActor.set_scale(this.dragOrigScale, this.dragOrigScale);
      if (this.dragActorHadFixedPos) dragActor.set_position(this.dragOrigX, this.dragOrigY);
      else dragActor.fixed_position_set = false;
      if (this.dragActorHadNatWidth) dragActor.set_width(-1);
      if (this.dragActorHadNatHeight) dragActor.set_height(-1);
    } else {
      this.dragActor?.destroy();
    }

    this.emit('drag-end', eventTime, false);
    this.finishAnimation();
  }

  private dragComplete(): void {
    if (this.dragActor) Shell.util_set_hidden_from_pick(this.dragActor, false);

    if (this.grab) this.ungrabEvents();

    if (this.updateHoverId) {
      GLib.source_remove(this.updateHoverId);
      this.updateHoverId = 0;
    }

    if (this.dragActor) {
      this.dragActor.disconnect(this.dragActorDestroyId);
      this.dragActor = null;
    }

    if (this.dragOrigParent) {
      this.dragOrigParent.disconnect(this.dragOrigParentDestroyId);
      this.dragOrigParent = null;
    }

    if (this.dragActorSource) {
      this.dragActorSource.disconnect(this.dragActorSourceDestroyId);
      this.dragActorSource = null;
    }
  }

  handleEvent(actor: Clutter.Actor, event: Clutter.Event): boolean {
    const type = event.type();
    if (type === Clutter.EventType.KEY_PRESS) {
      if (event.get_key_symbol() === Clutter.KEY_Escape) this.cancelDrag(event.get_time());
      return Clutter.EVENT_PROPAGATE;
    }

    const sprite = actor.get_context().get_backend().get_sprite(global.stage, event);
    if (sprite !== this.sprite) return Clutter.EVENT_PROPAGATE;

    if (type === Clutter.EventType.BUTTON_RELEASE || type === Clutter.EventType.TOUCH_END) this.dragActorDropped(event);

    if (type === Clutter.EventType.MOTION || type === Clutter.EventType.TOUCH_UPDATE) this.updateDragPosition(event);

    return Clutter.EVENT_PROPAGATE;
  }

  private cancelDrag(eventTime: number): void {
    this.emit('drag-cancelled', eventTime);

    if (!this.dragActor) {
      this.updateCursor(Clutter.CursorType.DEFAULT);
      this.dragComplete();
      this.emit('drag-end', eventTime, false);
      return;
    }

    const [snapBackX, snapBackY, snapBackScale] = this.getRestoreLocation();

    this.animateDragEnd(eventTime, {
      x: snapBackX,
      y: snapBackY,
      scale_x: snapBackScale,
      scale_y: snapBackScale,
      duration: SNAP_BACK_ANIMATION_TIME,
    });
  }
}
export type { Draggable };

export function makeDraggable(actor: Clutter.Actor, options?: DraggableOptions): Draggable {
  return new Draggable(actor, options);
}
