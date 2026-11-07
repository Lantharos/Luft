import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type GObject from 'gi://GObject';
import Meta from 'gi://Meta';

import * as DND from '../../shared/popups/dnd.js';
import * as Main from '../main.js';
import { EventEmitter } from '../runtime/signals.js';

interface XdndHandlerSignals {
  'drag-begin': (time: number) => void;
  'drag-end': () => void;
}

type DelegateActor = Clutter.Actor & { _delegate?: DND.DragDelegate };

const URI_LIST = 'text/uri-list';

function fileTarget(actor: DelegateActor | null): DND.FileDropTarget | null {
  for (; actor; actor = actor.get_parent()) {
    const target = actor._delegate?.fileDrop;
    if (target) return target.takes() ? target : null;
  }
  return null;
}

function paths(uris: string): string[] {
  return uris.split(/\r?\n/).filter(uri => uri && !uri.startsWith('#')).map(uri => Gio.File.new_for_uri(uri).get_path()).filter((path): path is string => path !== null);
}

export class XdndHandler extends EventEmitter {
  declare connect: GObject.SignalMethods<this, XdndHandlerSignals>['connect'];
  declare emit: GObject.SignalMethods<this, XdndHandlerSignals>['emit'];

  private cursorWindowClone: Clutter.Clone | null = null;
  private readonly dummy = new Clutter.Actor({ width: 1, height: 1, opacity: 0 });
  private readonly dnd = global.backend.get_dnd();
  private carriesFiles = false;
  private fileHover: DND.FileDropTarget | null = null;
  private dropped: DND.FileDropTarget | null = null;

  constructor() {
    super();

    Main.uiGroup.add_child(this.dummy);
    this.dummy.hide();

    this.dnd.connect('dnd-enter', () => this.onEnter());
    this.dnd.connect('dnd-position-change', (_dnd, x, y) => this.onPositionChanged(x, y));
    this.dnd.connect('dnd-leave', () => this.onLeave());
    this.dnd.connect('dnd-drop', (_dnd, uris: string) => {
      this.dropped?.drop(paths(uris));
      this.dropped = null;
    });
  }

  /** Lights up the file target under the pointer, and tells Mutter whether a drop there is taken. */
  private hoverFiles(target: DND.FileDropTarget | null): void {
    if (target === this.fileHover) return;
    this.fileHover?.hover(false);
    this.fileHover = target;
    target?.hover(true);
    this.dnd.set_shell_target(!!target);
  }

  private onLeave(): void {
    this.dropped = this.fileHover;
    this.hoverFiles(null);
    global.window_group.disconnectObject(this);
    Main.sessionMode.disconnectObject(this);

    this.destroyCursorWindowClone();

    global.compositor.get_feedback_group().show();

    this.emit('drag-end');
  }

  private onEnter(): void {
    this.dropped = null;
    this.carriesFiles = global.display.get_selection().get_mimetypes(Meta.SelectionType.SELECTION_DND).includes(URI_LIST);
    global.window_group.connectObject('notify::visible', () => this.syncCursorWindowClone(), this);
    Main.sessionMode.connectObject('updated', () => {
      this.syncCursorWindowClone();
      global.compositor.get_feedback_group().visible = !Main.sessionMode.isLocked;
    }, this);

    this.emit('drag-begin', global.get_current_time());
  }

  private destroyCursorWindowClone(): void {
    this.cursorWindowClone?.destroy();
    this.cursorWindowClone = null;
  }

  private syncCursorWindowClone(): void {
    if (global.window_group.visible || Main.sessionMode.isLocked) {
      this.destroyCursorWindowClone();
      return;
    }
    if (this.cursorWindowClone) return;

    const windows = global.get_window_actors();
    const cursorWindow = windows[windows.length - 1];
    if (!cursorWindow.get_meta_window()!.is_override_redirect()) return;

    this.cursorWindowClone = new Clutter.Clone({ source: cursorWindow });
    Main.uiGroup.add_child(this.cursorWindowClone);
    this.cursorWindowClone.add_constraint(new Clutter.BindConstraint({ coordinate: Clutter.BindCoordinate.POSITION, source: cursorWindow }));
  }

  private onPositionChanged(x: number, y: number): void {
    let pickedActor: DelegateActor | null = global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);

    if (this.cursorWindowClone) Main.uiGroup.set_child_above_sibling(this.cursorWindowClone, null);
    if (this.carriesFiles) this.hoverFiles(fileTarget(pickedActor));

    const dragEvent: DND.DragEvent = {
      x,
      y,
      dragActor: this.cursorWindowClone ?? this.dummy,
      source: this,
      targetActor: pickedActor!,
    };

    for (const monitor of DND.dragMonitors) {
      if (monitor.dragMotion && monitor.dragMotion(dragEvent) !== DND.DragMotionResult.CONTINUE) return;
    }

    while (pickedActor) {
      if (pickedActor._delegate?.handleDragOver) {
        const [, targetX, targetY] = pickedActor.transform_stage_point(x, y);
        const result = pickedActor._delegate.handleDragOver(this, dragEvent.dragActor, targetX, targetY, global.get_current_time());
        if (result !== DND.DragMotionResult.CONTINUE) return;
      }
      pickedActor = pickedActor.get_parent();
    }
  }
}
