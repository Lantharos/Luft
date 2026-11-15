import Gio from 'gi://Gio';
import Shell from 'gi://Shell';
import St from 'gi://St';
import * as DND from '../../../shared/popups/dnd.js';

import { taskbarPreferences } from '../preferences/taskbarPreferences.js';
import { rightToLeft } from '../../../shared/layout/edge.js';
import { glide } from '../../../shared/motion/motion.js';

interface TaskbarSlot { id: string; slot: St.Widget; button: St.Button; }
interface DraggedItem { id?: string; folder?: boolean; }
type DelegateActor = St.Widget & { _delegate?: object };

const NUDGE = 0.25;

export class TaskbarDrop {
  private spread = false;
  private readonly monitor = {
    dragMotion: (event: DND.DragEvent) => {
      if (!this.actor.contains(event.targetActor)) this.settle();
      return DND.DragMotionResult.CONTINUE;
    },
    dragDrop: () => {
      this.settle();
      return DND.DragDropResult.CONTINUE;
    },
  };

  constructor(
    private readonly actor: St.BoxLayout,
    private readonly slots: () => TaskbarSlot[],
    private readonly favorites: Gio.Settings,
    private readonly vertical: () => boolean,
  ) {
    (actor as DelegateActor)._delegate = {
      handleDragOver: (source: DraggedItem, _dragActor: St.Widget, x: number, y: number) => this.over(source, this.along(x, y)),
      acceptDrop: (source: DraggedItem, _dragActor: St.Widget, x: number, y: number) => this.drop(source, this.along(x, y)),
    };
    DND.addDragMonitor(this.monitor);
    actor.connect('destroy', () => DND.removeDragMonitor(this.monitor));
  }

  private pinnable(source: DraggedItem): source is { id: string } {
    if (!taskbarPreferences.showPinned || typeof source?.id !== 'string' || source.folder) return false;
    const app = Shell.AppSystem.get_default().lookup_app(source.id);
    return !!app && !app.is_window_backed();
  }

  private along(x: number, y: number): number {
    return this.vertical() ? y : x;
  }

  private get reversed(): boolean {
    return !this.vertical() && rightToLeft();
  }

  private insertionIndex(slots: TaskbarSlot[], position: number): number {
    const vertical = this.vertical();
    const reversed = this.reversed;
    const index = slots.findIndex(({ slot }) => {
      const middle = vertical ? slot.y + slot.height / 2 : slot.x + slot.width / 2;
      return reversed ? position > middle : position < middle;
    });
    return index < 0 ? slots.length : index;
  }

  private over(source: DraggedItem, position: number): DND.DragMotionResult {
    if (!this.pinnable(source)) return DND.DragMotionResult.CONTINUE;
    const slots = this.slots();
    const index = this.insertionIndex(slots, position);
    const from = slots.findIndex(slot => slot.id === source.id);
    this.makeRoom(slots, index, from);
    return from >= 0 ? DND.DragMotionResult.MOVE_DROP : DND.DragMotionResult.COPY_DROP;
  }

  private shiftFor(index: number, insertion: number, from: number): number {
    if (from < 0) return index === insertion - 1 ? -NUDGE : index === insertion ? NUDGE : 0;
    const landing = insertion > from ? insertion - 1 : insertion;
    if (index === from) return landing - from;
    if (index > from && index <= landing) return -1;
    if (index < from && index >= landing) return 1;
    return 0;
  }

  private makeRoom(slots: TaskbarSlot[], insertion: number, from: number): void {
    this.spread = true;
    const property = this.vertical() ? 'translation_y' : 'translation_x';
    const sign = this.reversed ? -1 : 1;
    slots.forEach(({ slot }, index) => {
      const length = this.vertical() ? slot.height : slot.width;
      const target = this.shiftFor(index, insertion, from) * length * sign;
      if (slot[property] !== target) glide(slot, { [property]: target });
    });
  }

  private drop(source: DraggedItem, position: number): boolean {
    this.settle();
    if (!this.pinnable(source)) return false;
    const slots = this.slots();
    const index = this.insertionIndex(slots, position);
    const before = slots.slice(0, index).map(slot => slot.id).filter(id => id !== source.id);
    const after = slots.slice(index).map(slot => slot.id).filter(id => id !== source.id);
    const favorites = this.favorites.get_strv('favorite-apps');
    const pinned = new Set([...favorites, source.id]);
    const shown = new Set(slots.map(slot => slot.id));
    const ordered = [...before, source.id, ...after].filter(id => pinned.has(id));
    this.favorites.set_strv('favorite-apps', [...ordered, ...favorites.filter(id => !shown.has(id) && id !== source.id)]);
    return true;
  }

  private settle(): void {
    if (!this.spread) return;
    this.spread = false;
    for (const { slot } of this.slots()) glide(slot, { translation_x: 0, translation_y: 0 });
  }
}
