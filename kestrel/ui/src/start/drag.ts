import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as DND from 'resource:///org/gnome/shell/ui/dnd.js';

export interface DragItem { id: string; folder: boolean; }
type DelegateActor = Clutter.Actor & { _delegate?: object };

export class GridDrag {
  active = false;
  private highlighted: St.Widget | null = null;
  private scrollTimer = 0;
  private pointerY = 0;
  private readonly monitor = { dragMotion: (event: { y: number }) => {
    this.clearHighlight();
    this.pointerY = event.y;
    return DND.DragMotionResult.CONTINUE;
  } };

  constructor(private readonly scroller: St.ScrollView, private readonly finished: () => void) {}

  source(button: St.Button, item: DragItem, icon: () => Clutter.Actor): { enabled: boolean } {
    const delegate = { ...item, getDragActor: icon, getDragActorSource: () => button.child.get_first_child() };
    (button as DelegateActor)._delegate = delegate;
    const draggable = DND.makeDraggable(button, { dragActorMaxSize: 48, dragActorOpacity: 220 });
    draggable.connect('drag-begin', () => {
      this.active = true;
      this.pointerY = button.get_transformed_position()[1] + button.height / 2;
      button.opacity = 100;
      DND.addDragMonitor(this.monitor);
      this.scrollTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 30, () => {
        const [, top] = this.scroller.get_transformed_position();
        const y = this.pointerY - top;
        const delta = y < 36 ? -10 : y > this.scroller.height - 36 ? 10 : 0;
        if (delta) this.scroller.vadjustment.value += delta;
        return GLib.SOURCE_CONTINUE;
      });
    });
    draggable.connect('drag-end', () => {
      this.active = false;
      button.opacity = 255;
      DND.removeDragMonitor(this.monitor);
      this.clearHighlight();
      if (this.scrollTimer) GLib.Source.remove(this.scrollTimer);
      this.scrollTimer = 0;
      GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => { this.finished(); return GLib.SOURCE_REMOVE; });
    });
    return draggable;
  }

  target(actor: St.Widget, action: (source: DragItem, x: number) => (() => void) | null, mode: (source: DragItem, x: number) => string = () => 'drop-into'): void {
    const delegate = (actor as DelegateActor)._delegate ?? {};
    Object.assign(delegate, {
      handleDragOver: (source: DragItem, _dragActor: Clutter.Actor, x: number) => {
        if (!this.active || !action(source, x)) return DND.DragMotionResult.CONTINUE;
        this.clearHighlight();
        this.highlighted = actor;
        actor.add_style_class_name(mode(source, x));
        return DND.DragMotionResult.MOVE_DROP;
      },
      acceptDrop: (source: DragItem, _dragActor: Clutter.Actor, x: number) => {
        if (!this.active) return false;
        const apply = action(source, x);
        if (!apply) return false;
        apply();
        return true;
      },
    });
    (actor as DelegateActor)._delegate = delegate;
  }

  private clearHighlight(): void {
    for (const name of ['drop-into', 'drop-before', 'drop-after']) this.highlighted?.remove_style_class_name(name);
    this.highlighted = null;
  }
}
