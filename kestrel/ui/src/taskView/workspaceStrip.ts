import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import * as DND from 'resource:///org/gnome/shell/ui/dnd.js';

import type { Monitor } from '../panel.js';
import type { WindowDragSource } from './windowCard.js';

export const THUMBNAIL_HEIGHT = 84;

type DelegateActor = St.Widget & { _delegate?: object };
export type BackgroundFactory = (container: Clutter.Actor, monitorIndex: number) => { destroy(): void };

function isWindowSource(source: unknown): source is WindowDragSource {
  return (source as WindowDragSource | null)?.window instanceof Meta.Window;
}

export class WorkspaceStrip {
  readonly actor = new St.BoxLayout({ style_class: 'kestrel-task-workspaces', x_align: Clutter.ActorAlign.CENTER });

  private backgrounds: { destroy(): void }[] = [];

  constructor(private readonly createBackground: BackgroundFactory) {}

  clear(): void {
    for (const background of this.backgrounds) background.destroy();
    this.backgrounds = [];
    this.actor.destroy_all_children();
  }

  build(monitor: Monitor): void {
    this.clear();
    const shell = global as unknown as Shell.Global;
    const manager = shell.workspace_manager;
    const active = manager.get_active_workspace();
    const width = Math.round(THUMBNAIL_HEIGHT * monitor.width / monitor.height);
    for (let index = 0; index < manager.n_workspaces; index++) {
      const workspace = manager.get_workspace_by_index(index)!;
      const thumbnail = this.thumbnail(workspace, monitor, width);
      const body = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, style_class: 'kestrel-task-workspace-body' });
      body.add_child(thumbnail);
      body.add_child(new St.Label({ text: `Desktop ${index + 1}`, style_class: 'kestrel-task-workspace-label', x_align: Clutter.ActorAlign.CENTER }));
      const card = new St.Button({ style_class: 'kestrel-task-workspace', child: body, can_focus: true, track_hover: true,
        accessible_name: `Desktop ${index + 1}` });
      if (workspace === active) card.add_style_pseudo_class('checked');
      card.connect('clicked', () => workspace.activate(shell.get_current_time()));
      this.acceptWindows(card, workspace);
      this.actor.add_child(card);
    }
  }

  private thumbnail(workspace: Meta.Workspace, monitor: Monitor, width: number): St.Widget {
    const scale = width / monitor.width;
    const thumbnail = new St.Widget({ style_class: 'kestrel-task-thumbnail', width, height: THUMBNAIL_HEIGHT, clip_to_allocation: true });
    const contents = new Clutter.Actor({ width: monitor.width, height: monitor.height, scale_x: scale, scale_y: scale });
    thumbnail.add_child(contents);
    this.backgrounds.push(this.createBackground(contents, monitor.index));
    const windows = workspace.list_windows()
      .filter(window => !window.minimized && !window.skip_taskbar && window.get_monitor() === monitor.index);
    for (const window of (global as unknown as Shell.Global).display.sort_windows_by_stacking(windows)) {
      const source = window.get_compositor_private() as Meta.WindowActor | null;
      if (!source) continue;
      const buffer = window.get_buffer_rect();
      contents.add_child(new Clutter.Clone({ source, x: buffer.x - monitor.x, y: buffer.y - monitor.y }));
    }
    return thumbnail;
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
