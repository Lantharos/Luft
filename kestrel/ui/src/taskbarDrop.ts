import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import St from 'gi://St';
import * as DND from 'resource:///org/gnome/shell/ui/dnd.js';

export interface TaskbarSlot { id: string; slot: St.Widget; button: St.Button; }
interface DraggedItem { id?: string; folder?: boolean; }
type DelegateActor = St.Widget & { _delegate?: object };
interface DragEvent { targetActor: St.Widget; }

export class TaskbarDrop {
  private marked: St.Widget | null = null;
  private readonly monitor = {
    dragMotion: (event: DragEvent) => {
      if (!this.actor.contains(event.targetActor)) this.unmark();
      return DND.DragMotionResult.CONTINUE;
    },
    dragDrop: () => {
      this.unmark();
      return DND.DragMotionResult.CONTINUE;
    },
  };

  constructor(
    private readonly actor: St.BoxLayout,
    private readonly slots: () => TaskbarSlot[],
    private readonly favorites: Gio.Settings,
  ) {
    (actor as DelegateActor)._delegate = {
      handleDragOver: (source: DraggedItem, _dragActor: St.Widget, x: number) => this.over(source, x),
      acceptDrop: (source: DraggedItem, _dragActor: St.Widget, x: number) => this.drop(source, x),
    };
    DND.addDragMonitor(this.monitor);
    actor.connect('destroy', () => DND.removeDragMonitor(this.monitor));
  }

  private pinnable(source: DraggedItem): source is { id: string } {
    if (typeof source?.id !== 'string' || source.folder) return false;
    const app = Shell.AppSystem.get_default().lookup_app(source.id);
    return !!app && !app.is_window_backed();
  }

  private insertionIndex(slots: TaskbarSlot[], x: number): number {
    const index = slots.findIndex(({ slot }) => x < slot.x + slot.width / 2);
    return index < 0 ? slots.length : index;
  }

  private over(source: DraggedItem, x: number): DND.DragMotionResult {
    if (!this.pinnable(source)) return DND.DragMotionResult.CONTINUE;
    const slots = this.slots();
    const index = this.insertionIndex(slots, x);
    const before = index < slots.length;
    const target = before ? slots[index]?.button : slots[slots.length - 1]?.button;
    this.unmark();
    if (target) {
      target.add_style_class_name(before ? 'drop-before' : 'drop-after');
      this.marked = target;
    }
    return slots.some(slot => slot.id === source.id) ? DND.DragMotionResult.MOVE_DROP : DND.DragMotionResult.COPY_DROP;
  }

  private drop(source: DraggedItem, x: number): boolean {
    this.unmark();
    if (!this.pinnable(source)) return false;
    const slots = this.slots();
    const index = this.insertionIndex(slots, x);
    const before = slots.slice(0, index).map(slot => slot.id).filter(id => id !== source.id);
    const after = slots.slice(index).map(slot => slot.id).filter(id => id !== source.id);
    const favorites = this.favorites.get_strv('favorite-apps');
    const pinned = new Set([...favorites, source.id]);
    const shown = new Set(slots.map(slot => slot.id));
    const ordered = [...before, source.id, ...after].filter(id => pinned.has(id));
    this.favorites.set_strv('favorite-apps', [...ordered, ...favorites.filter(id => !shown.has(id) && id !== source.id)]);
    return true;
  }

  private unmark(): void {
    this.marked?.remove_style_class_name('drop-before');
    this.marked?.remove_style_class_name('drop-after');
    this.marked = null;
  }
}
