import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import type Meta from 'gi://Meta';
import St from 'gi://St';

import * as Layout from '../../../core/stage/layout.js';
import * as Main from '../../../core/main.js';
import * as Util from '../../../core/runtime/util.js';
import { transitionVelocity } from '../effects/velocity.js';
import { WorkspaceGroup } from './workspaceGroup.js';

export const MonitorGroup = GObject.registerClass({
  Properties: {
    'progress': GObject.ParamSpec.double(
      'progress', null, null,
      GObject.ParamFlags.READWRITE,
      -Infinity, Infinity, 0),
  },
}, class MonitorGroup extends St.Widget {
  private readonly container = new Clutter.Actor();
  private readonly workspaceGroups: WorkspaceGroup[] = [];
  private workspacesAdjustment: St.Adjustment | null = null;

  constructor(private readonly monitor: Layout.Monitor, private readonly workspaceIndices: number[], movingWindow: Meta.Window | null) {
    super({
      clip_to_allocation: true,
      style_class: 'workspace-animation',
    });

    this.add_constraint(new Layout.MonitorConstraint({ index: monitor.index }));
    this.add_child(this.container);
    this.add_child(new WorkspaceGroup(null, monitor, movingWindow));

    const workspaceManager = global.workspace_manager;
    const activeWorkspace = workspaceManager.get_active_workspace();
    const step = Clutter.get_default_text_direction() === Clutter.TextDirection.RTL ? -this.baseDistance : this.baseDistance;

    let x = 0;
    for (const i of workspaceIndices) {
      const group = new WorkspaceGroup(workspaceManager.get_workspace_by_index(i), monitor, movingWindow);
      this.workspaceGroups.push(group);
      this.container.add_child(group);
      group.set_position(x, 0);
      x += step;
    }

    const activeGroup = this.workspaceGroups.find(g => g.workspace === activeWorkspace) ?? this.workspaceGroups[0];
    this.insert_child_below(new Clutter.Clone({ source: activeGroup.background! }), this.container);

    this.progress = this.getWorkspaceProgress(activeWorkspace);

    if (monitor.index !== Main.layoutManager.primaryIndex) return;

    this.workspacesAdjustment = Main.createWorkspacesAdjustment(this);
    this.bind_property_full('progress',
      this.workspacesAdjustment, 'value',
      GObject.BindingFlags.SYNC_CREATE,
      (_bind, source: number) => [true, Util.lerp(workspaceIndices[Math.floor(source)], workspaceIndices[Math.ceil(source)], source % 1.0)],
      null);
    this.connect('destroy', () => (this.workspacesAdjustment = null));
  }

  get baseDistance(): number {
    return this.monitor.width;
  }

  private get rtl(): boolean {
    return this.get_text_direction() === Clutter.TextDirection.RTL;
  }

  get progress(): number {
    return this.rtl ? this.container.x / this.baseDistance : -this.container.x / this.baseDistance;
  }

  set progress(p: number) {
    this.container.x = this.rtl ? Math.round(p * this.baseDistance) : -Math.round(p * this.baseDistance);
    this.notify('progress');
  }

  get index(): number {
    return this.monitor.index;
  }

  get epsilon(): number {
    return 0.5 / (this.baseDistance * global.display.get_monitor_scale(this.monitor.index));
  }

  get progressVelocity(): number {
    return transitionVelocity(this, 'progress');
  }

  private get indexStep(): number {
    const [first, second] = this.workspaceIndices;
    return second === undefined ? 1 : Math.sign(second - first);
  }

  positionOf(index: number): number {
    return (index - this.workspaceIndices[0]) * this.indexStep;
  }

  indexAt(position: number): number {
    return this.workspaceIndices[0] + position * this.indexStep;
  }

  ghostOf(workspace: Meta.Workspace): Clutter.Clone {
    const group = this.workspaceGroups.find(g => g.workspace === workspace);
    const ghost = new Clutter.Clone({ source: group });
    this.insert_child_above(ghost, this.container);
    return ghost;
  }

  getWorkspaceProgress(workspace: Meta.Workspace): number {
    const group = this.workspaceGroups.find(g => g.workspace!.index() === workspace.index())!;
    return this.getWorkspaceGroupProgress(group);
  }

  private getWorkspaceGroupProgress(group: WorkspaceGroup): number {
    return this.rtl ? -group.x / this.baseDistance : group.x / this.baseDistance;
  }

  getSnapPoints(): number[] {
    return this.workspaceGroups.map(g => this.getWorkspaceGroupProgress(g));
  }

  findClosestWorkspace(progress: number): Meta.Workspace {
    const distances = this.getSnapPoints().map(p => Math.abs(p - progress));
    const index = distances.indexOf(Math.min(...distances));
    return this.workspaceGroups[index].workspace!;
  }

  private interpolateProgress(progress: number, monitorGroup: MonitorGroup): number {
    if (this.index === monitorGroup.index) return progress;

    const points1 = monitorGroup.getSnapPoints();
    const points2 = this.getSnapPoints();

    const upper = points1.indexOf(points1.find(p => p >= progress)!);
    const lower = points1.indexOf(points1.slice().reverse().find(p => p <= progress)!);

    if (points1[upper] === points1[lower]) return points2[upper];

    const t = (progress - points1[lower]) / (points1[upper] - points1[lower]);

    return points2[lower] + (points2[upper] - points2[lower]) * t;
  }

  updateSwipeForMonitor(progress: number, monitorGroup: MonitorGroup): void {
    this.progress = this.interpolateProgress(progress, monitorGroup);
  }
});
export type MonitorGroup = InstanceType<typeof MonitorGroup>;
