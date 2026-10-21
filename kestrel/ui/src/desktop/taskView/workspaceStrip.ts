import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import St from 'gi://St';
import * as DND from 'resource:///com/lantharos/kestrel/ui/dnd.js';

import type { BoardFrame } from '../board/board.js';
import type { Monitor } from '../panel/panel.js';
import type { WindowDragSource } from './windowCard.js';
import { localized, t } from '../../shared/i18n/index.js';

const THUMBNAIL_HEIGHT = 84;

type DelegateActor = St.Widget & { _delegate?: object };
export type BackgroundFactory = (container: Clutter.Actor, monitorIndex: number) => { destroy(): void };
export type BoardFrames = (workspace: Meta.Workspace) => BoardFrame | null;

function isWindowSource(source: unknown): source is WindowDragSource {
  return (source as WindowDragSource | null)?.window instanceof Meta.Window;
}

class WorkspaceThumbnail {
  readonly card: St.Button;
  private readonly windows = new Clutter.Actor();
  private readonly background: { destroy(): void };
  private shown: Meta.Window[] = [];

  constructor(readonly workspace: Meta.Workspace, index: number, private readonly monitor: Monitor, createBackground: BackgroundFactory) {
    const width = Math.round(THUMBNAIL_HEIGHT * monitor.width / monitor.height);
    const scale = width / monitor.width;
    const thumbnail = new St.Widget({ style_class: 'kestrel-task-thumbnail', width, height: THUMBNAIL_HEIGHT, clip_to_allocation: true });
    const contents = new Clutter.Actor({ width: monitor.width, height: monitor.height, scale_x: scale, scale_y: scale });
    thumbnail.add_child(contents);
    this.background = createBackground(contents, monitor.index);
    contents.add_child(this.windows);
    const body = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-task-workspace-body' });
    body.add_child(thumbnail);
    const label = new St.Label({ style_class: 'kestrel-task-workspace-label', x_align: Clutter.ActorAlign.CENTER });
    body.add_child(label);
    this.card = new St.Button({ style_class: 'kestrel-task-workspace', child: body, can_focus: true, track_hover: true });
    localized(this.card, () => {
      label.text = t('task-view-desktop', { number: index + 1 });
      this.card.accessible_name = label.text;
    });
    this.card.connect('clicked', () => workspace.activate(global.get_current_time()));
  }

  sync(active: boolean, board: BoardFrame | null): void {
    if (active) this.card.add_style_pseudo_class('checked');
    else this.card.remove_style_pseudo_class('checked');
    const { monitor } = this;
    this.windows.set({
      scale_x: board?.scale ?? 1,
      scale_y: board?.scale ?? 1,
      translation_x: board ? board.viewportX - monitor.x - board.x * board.scale : -monitor.x,
      translation_y: board ? board.viewportY - monitor.y - board.y * board.scale : -monitor.y,
    });
    const windows = global.display.sort_windows_by_stacking(this.workspace.list_windows()
      .filter(window => !window.minimized && !window.skip_taskbar && window.get_compositor_private() && (board || window.get_monitor() === monitor.index)));
    if (windows.length === this.shown.length && windows.every((window, index) => window === this.shown[index])) return;
    this.shown = windows;
    this.windows.destroy_all_children();
    for (const window of windows) {
      const buffer = window.get_buffer_rect();
      this.windows.add_child(new Clutter.Clone({ source: window.get_compositor_private() as Meta.WindowActor, x: buffer.x, y: buffer.y }));
    }
  }

  destroy(): void {
    this.background.destroy();
    this.card.destroy();
  }
}

export class WorkspaceStrip {
  readonly actor = new St.BoxLayout({ style_class: 'kestrel-task-workspaces', x_align: Clutter.ActorAlign.CENTER });

  private thumbnails: WorkspaceThumbnail[] = [];

  constructor(private readonly createBackground: BackgroundFactory, private readonly boardFrame: BoardFrames) {}

  clear(): void {
    for (const thumbnail of this.thumbnails) thumbnail.destroy();
    this.thumbnails = [];
  }

  sync(monitor: Monitor): void {
    const manager = global.workspace_manager;
    const workspaces = Array.from({ length: manager.n_workspaces }, (_, index) => manager.get_workspace_by_index(index)!);
    if (workspaces.length !== this.thumbnails.length || workspaces.some((workspace, index) => this.thumbnails[index].workspace !== workspace)) {
      this.clear();
      this.thumbnails = workspaces.map((workspace, index) => {
        const thumbnail = new WorkspaceThumbnail(workspace, index, monitor, this.createBackground);
        this.acceptWindows(thumbnail.card, workspace);
        this.actor.add_child(thumbnail.card);
        return thumbnail;
      });
    }
    const active = manager.get_active_workspace();
    for (const thumbnail of this.thumbnails) thumbnail.sync(thumbnail.workspace === active, this.boardFrame(thumbnail.workspace));
  }

  private acceptWindows(card: St.Button, workspace: Meta.Workspace): void {
    const movable = (source: unknown): source is WindowDragSource =>
      isWindowSource(source) && !source.window.is_on_all_workspaces() && source.window.get_workspace() !== workspace;
    (card as DelegateActor)._delegate = {
      handleDragOver: (source: unknown) => {
        if (!movable(source)) return DND.DragMotionResult.CONTINUE;
        card.add_style_pseudo_class('drop');
        return DND.DragMotionResult.MOVE_DROP;
      },
      acceptDrop: (source: unknown) => {
        card.remove_style_pseudo_class('drop');
        if (!movable(source)) return false;
        source.window.change_workspace(workspace);
        return true;
      },
    };
    const monitor = {
      dragMotion: (event: { targetActor: Clutter.Actor }) => {
        if (!card.contains(event.targetActor)) card.remove_style_pseudo_class('drop');
        return DND.DragMotionResult.CONTINUE;
      },
    };
    DND.addDragMonitor(monitor);
    card.connect('destroy', () => DND.removeDragMonitor(monitor));
  }
}
