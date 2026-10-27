import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as KestrelUi from '../../../kestrelUi.js';
import type { EaseOptions } from '../../../environment.js';
import * as Main from '../../main.js';
import { SwipeTracker } from '../../input/swipeTracker.js';
import { MonitorGroup } from './monitorGroup.js';

interface SwitchData {
  monitors: MonitorGroup[];
  workspaceIndices: number[];
  releaseMotion: () => void;
  gestureActivated: boolean;
  superseded: boolean;
  completeEffect: (() => void) | null;
  baseMonitorGroup: MonitorGroup | null;
}

const range = (first: number, last: number) => Array.from({ length: last - first + 1 }, (_, i) => first + i);

export class WorkspaceAnimationController {
  movingWindow: Meta.Window | null = null;
  private switchData: SwitchData | null = null;
  private grab: Clutter.Grab | null = null;
  private readonly swipeTracker = new SwipeTracker(global.stage,
    Clutter.Orientation.HORIZONTAL,
    Shell.ActionMode.NORMAL,
    {
      allowDrag: false,
      phase: Clutter.EventPhase.CAPTURE,
      name: 'WorkspaceAnimation swipe tracker',
      yieldsTouch: (gesture: Clutter.PanGesture) => KestrelUi.touchClaimed(gesture),
    });

  constructor() {
    this.swipeTracker.connect('begin', (tracker, monitor) => this.switchWorkspaceBegin(tracker, monitor));
    this.swipeTracker.connect('update', (_tracker, progress) => this.switchWorkspaceUpdate(progress));
    this.swipeTracker.connect('end', (_tracker, velocity, endProgress, immediate) => this.switchWorkspaceEnd(velocity, endProgress, immediate));

    global.display.bind_property('compositor-modifiers',
      this.swipeTracker, 'scroll-modifiers',
      GObject.BindingFlags.SYNC_CREATE);
  }

  private prepareWorkspaceSwitch(workspaceIndices: number[] = [...Array(global.workspace_manager.get_n_workspaces()).keys()]): SwitchData {
    const monitors = Meta.prefs_get_workspaces_only_on_primary()
      ? [Main.layoutManager.primaryMonitor!] : Main.layoutManager.monitors;

    const switchData: SwitchData = {
      monitors: [],
      workspaceIndices,
      releaseMotion: KestrelUi.holdMotion(),
      gestureActivated: false,
      superseded: false,
      completeEffect: null,
      baseMonitorGroup: null,
    };
    this.switchData = switchData;

    for (const monitor of monitors) {
      const group = new MonitorGroup(monitor, workspaceIndices, this.movingWindow);
      Main.uiGroup.insert_child_above(group, global.window_group);
      switchData.monitors.push(group);
    }

    Main.wm.blockWorkspaceUpdates();
    global.compositor.disable_unredirect();
    this.grab = Main.pushModal(global.stage, {
      actionMode: Shell.ActionMode.NORMAL,
    });
    return switchData;
  }

  private finishWorkspaceSwitch(switchData: SwitchData): void {
    Main.wm.unblockWorkspaceUpdates();
    global.compositor.enable_unredirect();

    if (this.grab) {
      Main.popModal(this.grab);
      this.grab = null;
    }

    this.switchData = null;

    switchData.monitors.forEach(m => m.destroy());
    switchData.releaseMotion();

    this.movingWindow = null;
  }

  private primaryGroup(switchData: SwitchData): MonitorGroup {
    return switchData.monitors.find(m => m.index === Main.layoutManager.primaryIndex) ?? switchData.monitors[0];
  }

  private visibleWorkspace(switchData: SwitchData): { index: number; velocity: number } {
    const primary = this.primaryGroup(switchData);
    return {
      index: primary.indexAt(primary.progress),
      velocity: primary.progressVelocity,
    };
  }

  private rebuildSwitch(switchData: SwitchData): SwitchData {
    const { index } = this.visibleWorkspace(switchData);
    this.abandonSwitch(switchData);
    const rebuilt = this.prepareWorkspaceSwitch();
    for (const monitorGroup of rebuilt.monitors) monitorGroup.progress = monitorGroup.positionOf(index);
    return rebuilt;
  }

  private abandonSwitch(switchData: SwitchData): void {
    for (const monitorGroup of switchData.monitors) monitorGroup.remove_all_transitions();
    this.finishWorkspaceSwitch(switchData);
    switchData.completeEffect?.();
  }

  animateSwitch(from: number, to: number, onComplete: () => void): void {
    if (KestrelUi.reducedMotion()) {
      this.crossfade(from, to, onComplete);
      return;
    }

    let start = from;
    let velocity = 0;
    if (this.switchData?.superseded) {
      this.switchData.superseded = false;
      ({ index: start, velocity } = this.visibleWorkspace(this.switchData));
    }

    const first = Math.min(Math.floor(start), to);
    const last = Math.max(Math.ceil(start), to);
    const switchData = this.switchFrom(start, first, last);
    switchData.completeEffect = onComplete;
    const primary = this.primaryGroup(switchData);
    for (const monitorGroup of switchData.monitors) {
      const params: EaseOptions = { spring: KestrelUi.Spring.snappy, velocity, epsilon: monitorGroup.epsilon };
      if (monitorGroup === primary) {
        params.onComplete = () => {
          this.finishWorkspaceSwitch(switchData);
          onComplete();
        };
      }
      monitorGroup.ease_property('progress', monitorGroup.positionOf(to), params);
    }
  }

  private switchFrom(start: number, first: number, last: number): SwitchData {
    const current = this.switchData;
    if (current?.workspaceIndices.includes(first) && current.workspaceIndices.includes(last)) return current;

    if (current) this.abandonSwitch(current);
    const workspaceIndices = range(first, last);
    if (Clutter.get_default_text_direction() === Clutter.TextDirection.RTL) workspaceIndices.reverse();
    const switchData = this.prepareWorkspaceSwitch(workspaceIndices);
    for (const monitorGroup of switchData.monitors) monitorGroup.progress = monitorGroup.positionOf(start);
    return switchData;
  }

  private crossfade(from: number, to: number, onComplete: () => void): void {
    if (this.switchData) this.abandonSwitch(this.switchData);
    const switchData = this.prepareWorkspaceSwitch([from, to]);
    switchData.completeEffect = onComplete;
    const fromWs = global.workspace_manager.get_workspace_by_index(from)!;
    const toWs = global.workspace_manager.get_workspace_by_index(to)!;
    const primary = this.primaryGroup(switchData);
    for (const monitorGroup of switchData.monitors) {
      const ghost = monitorGroup.ghostOf(fromWs);
      monitorGroup.progress = monitorGroup.getWorkspaceProgress(toWs);
      ghost.ease({
        opacity: 0,
        duration: KestrelUi.Duration.quick,
        curve: KestrelUi.Curve.decelerate,
        onComplete: monitorGroup === primary ? () => {
          this.finishWorkspaceSwitch(switchData);
          onComplete();
        } : undefined,
      });
    }
  }

  handleScrollEvent(event: Clutter.Event): boolean {
    return this.swipeTracker.handleScrollEvent(event);
  }

  private switchWorkspaceBegin(tracker: SwipeTracker, monitor: number): void {
    if (Meta.prefs_get_workspaces_only_on_primary() && monitor !== Main.layoutManager.primaryIndex) return;

    let switchData = this.switchData;
    if (switchData?.gestureActivated) {
      for (const group of switchData.monitors) group.remove_all_transitions();
    } else if (switchData) {
      switchData = this.rebuildSwitch(switchData);
    } else {
      switchData = this.prepareWorkspaceSwitch();
    }

    const monitorGroup = switchData.monitors.find(m => m.index === monitor)!;
    const progress = monitorGroup.progress;
    const closestWs = monitorGroup.findClosestWorkspace(progress);
    const cancelProgress = monitorGroup.getWorkspaceProgress(closestWs);

    switchData.baseMonitorGroup = monitorGroup;

    tracker.confirmSwipe(monitorGroup.baseDistance, monitorGroup.getSnapPoints(), progress, cancelProgress);
  }

  private switchWorkspaceUpdate(progress: number): void {
    const switchData = this.switchData;
    if (!switchData) return;

    for (const monitorGroup of switchData.monitors)
      monitorGroup.updateSwipeForMonitor(progress, switchData.baseMonitorGroup!);
  }

  private switchWorkspaceEnd(velocity: number, endProgress: number, immediate: boolean): void {
    const switchData = this.switchData;
    if (!switchData) return;

    switchData.gestureActivated = true;

    const newWs = switchData.baseMonitorGroup!.findClosestWorkspace(endProgress);
    const endTime = Clutter.get_current_event_time();
    const finish = () => {
      if (!newWs.active) newWs.activate(endTime);
      this.finishWorkspaceSwitch(switchData);
    };

    if (immediate) {
      finish();
      return;
    }

    const primary = this.primaryGroup(switchData);
    for (const monitorGroup of switchData.monitors) {
      const progress = monitorGroup.getWorkspaceProgress(newWs);
      const params: EaseOptions = { spring: KestrelUi.Spring.snappy, velocity, epsilon: monitorGroup.epsilon };
      if (monitorGroup === primary) params.onComplete = finish;
      monitorGroup.ease_property('progress', progress, params);
    }
  }

  get gestureActive(): boolean {
    return this.switchData !== null && this.switchData.gestureActivated;
  }

  cancelSwitchAnimation(): void {
    const switchData = this.switchData;
    if (!switchData || switchData.gestureActivated) return;

    switchData.superseded = true;
    switchData.completeEffect = null;
    global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      if (this.switchData === switchData && switchData.superseded) this.finishWorkspaceSwitch(switchData);
      return GLib.SOURCE_REMOVE;
    });
  }
}
