import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Background from './background.js';
import * as KestrelUi from './kestrelUi.js';
import * as Layout from './layout.js';
import * as SwipeTracker from './swipeTracker.js';
import * as Util from '../misc/util.js';

import * as Main from './main.js';

export const WORKSPACE_SPACING = 0;

export const BaseWorkspaceGroup = GObject.registerClass(
class BaseWorkspaceGroup extends Clutter.Actor {
    constructor(workspace, monitor, movingWindow) {
        super({
            width: monitor.width,
            height: monitor.height,
            clip_to_allocation: true,
        });

        this._workspace = workspace;
        this._monitor = monitor;
        this._movingWindow = movingWindow;
        this._windowRecords = [];
        this._board = workspace ? KestrelUi.boardView(workspace) : null;
        this._windowLayer = this;

        this._createBackground();
        if (this._board) {
            const {x, y, scale, viewportX, viewportY} = this._board;
            this._windowLayer = new Clutter.Actor({
                scale_x: scale,
                scale_y: scale,
                translation_x: viewportX - monitor.x - x * scale,
                translation_y: viewportY - monitor.y - y * scale,
            });
            this.add_child(this._windowLayer);
        }
        this._createWindows();

        this.connect('destroy', this._onDestroy.bind(this));
    }

    get workspace() {
        return this._workspace;
    }

    _shouldShowWindow(_window) {
        throw new GObject.NotImplementedError();
    }

    _isDesktopWindow(metaWindow) {
        return metaWindow.get_window_type() === Meta.WindowType.DESKTOP;
    }

    _windowIsOnThisMonitor(metawindow) {
        const geometry = global.display.get_monitor_geometry(this._monitor.index);
        const [intersects] = metawindow.get_frame_rect().intersect(geometry);
        return intersects;
    }

    _createBackground() {
    }

    _createWindows() {
        const windowActors = global.get_window_actors().filter(w =>
            this._shouldShowWindow(w.meta_window));

        windowActors.map(a => this._createClone(a)).forEach(clone => this._windowLayer.add_child(clone));
    }

    _createClone(windowActor) {
        const clone = new Clutter.Clone({
            source: windowActor,
            x: this._board ? windowActor.x : windowActor.x - this._monitor.x,
            y: this._board ? windowActor.y : windowActor.y - this._monitor.y,
        });

        const record = {windowActor, clone};

        windowActor.connectObject('destroy', () => {
            clone.destroy();
            this._windowRecords.splice(this._windowRecords.indexOf(record), 1);
        }, this);

        windowActor.meta_window.connectObject('notify::minimized',
            () => this._syncCloneVisibility(clone),
            this);
        this._syncCloneVisibility(clone);

        this._windowRecords.push(record);
        return clone;
    }

    _syncCloneVisibility(clone) {
        const window = clone.source.meta_window;
        clone.visible = window.showing_on_its_workspace();
    }

    _removeWindows() {
        for (const record of this._windowRecords)
            record.clone.destroy();

        this._windowRecords = [];
    }

    _onDestroy() {
        this._removeWindows();
    }
});

export const WorkspaceGroup = GObject.registerClass(
class WorkspaceGroup extends BaseWorkspaceGroup {
    constructor(workspace, monitor, movingWindow) {
        super(workspace, monitor, movingWindow);

        global.display.connectObject('restacked',
            () => this._syncStacking(), this);
    }

    _shouldShowWindow(window) {
        if (this._isDesktopWindow(window))
            return false;

        if (window.is_override_redirect())
            return false;

        if (!this._board && !this._windowIsOnThisMonitor(window))
            return false;

        const isSticky =
            window.is_on_all_workspaces() || window === this._movingWindow;

        // No workspace means we should show windows that are on all workspaces
        if (!this._workspace)
            return isSticky;

        // Otherwise only show windows that are (only) on that workspace
        return !isSticky && window.located_on_workspace(this._workspace);
    }

    _syncStacking() {
        const stackIndeces = new Map(
            global.get_window_actors().map((w, i) => [w, i]));

        this._windowRecords.sort((a, b) => {
            const seqA = a.windowActor;
            const seqB = b.windowActor;

            return stackIndeces.get(seqA) - stackIndeces.get(seqB);
        });

        let lastRecord;
        const bottomActor = this._board ? null : this._background ?? null;

        for (const record of this._windowRecords) {
            this._windowLayer.set_child_above_sibling(record.clone,
                lastRecord ? lastRecord.clone : bottomActor);
            lastRecord = record;
        }
    }

    _createBackground() {
        if (!this._workspace)
            return;

        this._background = this._board
            ? KestrelUi.boardBackdrop(this._workspace, this._monitor)
            : new WorkspaceBackground(this._workspace, this._monitor);
        this.add_child(this._background);
    }
});

export const WorkspaceBackground = GObject.registerClass(
class WorkspaceBackground extends BaseWorkspaceGroup {
    constructor(workspace, monitor) {
        super(workspace, monitor, null);
    }

    _shouldShowWindow(window) {
        return this._isDesktopWindow(window) &&
            this._windowIsOnThisMonitor(window);
    }

    _createBackground() {
        const background = new Meta.BackgroundGroup();
        this.add_child(background);

        this._bgManager = new Background.BackgroundManager({
            container: background,
            monitorIndex: this._monitor.index,
            controlPosition: false,
        });
    }

    _onDestroy() {
        super._onDestroy();

        this._bgManager.destroy();
    }
});

export const MonitorGroup = GObject.registerClass({
    Properties: {
        'progress': GObject.ParamSpec.double(
            'progress', null, null,
            GObject.ParamFlags.READWRITE,
            -Infinity, Infinity, 0),
    },
}, class MonitorGroup extends St.Widget {
    _init(monitor, workspaceIndices, movingWindow) {
        super._init({
            clip_to_allocation: true,
            style_class: 'workspace-animation',
        });

        this._monitor = monitor;
        this._workspaceIndices = workspaceIndices;

        const constraint = new Layout.MonitorConstraint({index: monitor.index});
        this.add_constraint(constraint);

        this._container = new Clutter.Actor();
        this.add_child(this._container);

        const stickyGroup = new WorkspaceGroup(null, monitor, movingWindow);
        this.add_child(stickyGroup);

        this._workspaceGroups = [];

        const workspaceManager = global.workspace_manager;
        const vertical = workspaceManager.layout_rows === -1;
        const activeWorkspace = workspaceManager.get_active_workspace();

        let x = 0;
        let y = 0;

        for (const i of workspaceIndices) {
            const ws = workspaceManager.get_workspace_by_index(i);
            const group = new WorkspaceGroup(ws, monitor, movingWindow);

            this._workspaceGroups.push(group);
            this._container.add_child(group);
            group.set_position(x, y);

            if (vertical)
                y += this.baseDistance;
            else if (Clutter.get_default_text_direction() === Clutter.TextDirection.RTL)
                x -= this.baseDistance;
            else
                x += this.baseDistance;
        }

        this.progress = this.getWorkspaceProgress(activeWorkspace);

        if (monitor.index === Main.layoutManager.primaryIndex) {
            this._workspacesAdjustment = Main.createWorkspacesAdjustment(this);
            this.bind_property_full('progress',
                this._workspacesAdjustment, 'value',
                GObject.BindingFlags.SYNC_CREATE,
                (bind, source) => {
                    const indices = [
                        workspaceIndices[Math.floor(source)],
                        workspaceIndices[Math.ceil(source)],
                    ];
                    return [true, Util.lerp(...indices, source % 1.0)];
                },
                null);

            this.connect('destroy', () => {
                delete this._workspacesAdjustment;
            });
        }
    }

    get baseDistance() {
        const spacing = WORKSPACE_SPACING * St.ThemeContext.get_for_stage(global.stage).scale_factor;

        if (global.workspace_manager.layout_rows === -1)
            return this._monitor.height + spacing;
        else
            return this._monitor.width + spacing;
    }

    get progress() {
        if (global.workspace_manager.layout_rows === -1)
            return -this._container.y / this.baseDistance;
        else if (this.get_text_direction() === Clutter.TextDirection.RTL)
            return this._container.x / this.baseDistance;
        else
            return -this._container.x / this.baseDistance;
    }

    set progress(p) {
        if (global.workspace_manager.layout_rows === -1)
            this._container.y = -Math.round(p * this.baseDistance);
        else if (this.get_text_direction() === Clutter.TextDirection.RTL)
            this._container.x = Math.round(p * this.baseDistance);
        else
            this._container.x = -Math.round(p * this.baseDistance);

        this.notify('progress');
    }

    get index() {
        return this._monitor.index;
    }

    get epsilon() {
        return 0.5 / (this.baseDistance * global.display.get_monitor_scale(this._monitor.index));
    }

    get progressVelocity() {
        return this.get_transition('progress')?.get_velocity?.() ?? 0;
    }

    get _indexStep() {
        const [first, second] = this._workspaceIndices;
        return second === undefined ? 1 : Math.sign(second - first);
    }

    positionOf(index) {
        return (index - this._workspaceIndices[0]) * this._indexStep;
    }

    indexAt(position) {
        return this._workspaceIndices[0] + position * this._indexStep;
    }

    ghostOf(workspace) {
        const group = this._workspaceGroups.find(g => g.workspace === workspace);
        const ghost = new Clutter.Clone({source: group});
        this.insert_child_above(ghost, this._container);
        return ghost;
    }

    getWorkspaceProgress(workspace) {
        const group = this._workspaceGroups.find(g =>
            g.workspace.index() === workspace.index());
        return this._getWorkspaceGroupProgress(group);
    }

    _getWorkspaceGroupProgress(group) {
        if (global.workspace_manager.layout_rows === -1)
            return group.y / this.baseDistance;
        else if (this.get_text_direction() === Clutter.TextDirection.RTL)
            return -group.x / this.baseDistance;
        else
            return group.x / this.baseDistance;
    }

    getSnapPoints() {
        return this._workspaceGroups.map(g =>
            this._getWorkspaceGroupProgress(g));
    }

    findClosestWorkspace(progress) {
        const distances = this.getSnapPoints().map(p =>
            Math.abs(p - progress));
        const index = distances.indexOf(Math.min(...distances));
        return this._workspaceGroups[index].workspace;
    }

    _interpolateProgress(progress, monitorGroup) {
        if (this.index === monitorGroup.index)
            return progress;

        const points1 = monitorGroup.getSnapPoints();
        const points2 = this.getSnapPoints();

        const upper = points1.indexOf(points1.find(p => p >= progress));
        const lower = points1.indexOf(points1.slice().reverse().find(p => p <= progress));

        if (points1[upper] === points1[lower])
            return points2[upper];

        const t = (progress - points1[lower]) / (points1[upper] - points1[lower]);

        return points2[lower] + (points2[upper] - points2[lower]) * t;
    }

    updateSwipeForMonitor(progress, monitorGroup) {
        this.progress = this._interpolateProgress(progress, monitorGroup);
    }
});


const range = (first, last) => Array.from({length: last - first + 1}, (_, i) => first + i);

export class WorkspaceAnimationController {
    constructor() {
        this._movingWindow = null;
        this._switchData = null;

        const swipeTracker = new SwipeTracker.SwipeTracker(global.stage,
            Clutter.Orientation.HORIZONTAL,
            Shell.ActionMode.NORMAL,
            {
                allowDrag: false,
                phase: Clutter.EventPhase.CAPTURE,
                name: 'WorkspaceAnimation swipe tracker',
            });
        swipeTracker.connect('begin', this._switchWorkspaceBegin.bind(this));
        swipeTracker.connect('update', this._switchWorkspaceUpdate.bind(this));
        swipeTracker.connect('end', this._switchWorkspaceEnd.bind(this));
        this._swipeTracker = swipeTracker;

        global.display.bind_property('compositor-modifiers',
            this._swipeTracker, 'scroll-modifiers',
            GObject.BindingFlags.SYNC_CREATE);
    }

    _prepareWorkspaceSwitch(workspaceIndices) {
        if (this._switchData)
            return;

        const workspaceManager = global.workspace_manager;
        const nWorkspaces = workspaceManager.get_n_workspaces();

        const switchData = {};

        this._switchData = switchData;
        switchData.monitors = [];

        switchData.gestureActivated = false;
        switchData.superseded = false;
        switchData.completeEffect = null;

        if (!workspaceIndices)
            workspaceIndices = [...Array(nWorkspaces).keys()];
        switchData.workspaceIndices = workspaceIndices;

        const monitors = Meta.prefs_get_workspaces_only_on_primary()
            ? [Main.layoutManager.primaryMonitor] : Main.layoutManager.monitors;

        for (const monitor of monitors) {
            if (Meta.prefs_get_workspaces_only_on_primary() &&
                monitor.index !== Main.layoutManager.primaryIndex)
                continue;

            const group = new MonitorGroup(monitor, workspaceIndices, this.movingWindow);

            Main.uiGroup.insert_child_above(group, global.window_group);

            switchData.monitors.push(group);
        }

        Main.wm.blockWorkspaceUpdates();
        global.compositor.disable_unredirect();
        this._grab = Main.pushModal(global.stage, {
            actionMode: Shell.ActionMode.NORMAL,
        });
    }

    _finishWorkspaceSwitch(switchData) {
        Main.wm.unblockWorkspaceUpdates();
        global.compositor.enable_unredirect();

        if (this._grab) {
            Main.popModal(this._grab);
            this._grab = null;
        }

        this._switchData = null;

        switchData.monitors.forEach(m => m.destroy());

        this.movingWindow = null;
    }

    _primaryGroup() {
        return this._switchData.monitors.find(m => m.index === Main.layoutManager.primaryIndex) ??
            this._switchData.monitors[0];
    }

    _visibleWorkspace() {
        const primary = this._primaryGroup();
        return {
            index: primary.indexAt(primary.progress),
            velocity: primary.progressVelocity,
        };
    }

    _rebuildSwitch(workspaceIndices) {
        const {index} = this._visibleWorkspace();
        this._abandonSwitch();
        this._prepareWorkspaceSwitch(workspaceIndices);
        for (const monitorGroup of this._switchData.monitors)
            monitorGroup.progress = monitorGroup.positionOf(index);
    }

    _abandonSwitch() {
        const switchData = this._switchData;
        for (const monitorGroup of switchData.monitors)
            monitorGroup.remove_all_transitions();
        this._finishWorkspaceSwitch(switchData);
        switchData.completeEffect?.();
    }

    animateSwitch(from, to, direction, onComplete) {
        if (KestrelUi.reducedMotion()) {
            this._crossfade(from, to, onComplete);
            return;
        }

        let start = from;
        let velocity = 0;
        if (this._switchData?.superseded) {
            this._switchData.superseded = false;
            ({index: start, velocity} = this._visibleWorkspace());
        }

        const first = Math.min(Math.floor(start), to);
        const last = Math.max(Math.ceil(start), to);
        const indices = this._switchData?.workspaceIndices;
        if (!indices || !indices.includes(first) || !indices.includes(last)) {
            if (this._switchData)
                this._abandonSwitch();
            const workspaceIndices = range(first, last);
            if (Clutter.get_default_text_direction() === Clutter.TextDirection.RTL &&
                direction !== Meta.MotionDirection.UP &&
                direction !== Meta.MotionDirection.DOWN)
                workspaceIndices.reverse();
            this._prepareWorkspaceSwitch(workspaceIndices);
            for (const monitorGroup of this._switchData.monitors)
                monitorGroup.progress = monitorGroup.positionOf(start);
        }

        const switchData = this._switchData;
        switchData.completeEffect = onComplete;
        for (const monitorGroup of switchData.monitors) {
            const params = {spring: KestrelUi.Spring.snappy, velocity, epsilon: monitorGroup.epsilon};
            if (monitorGroup === this._primaryGroup()) {
                params.onComplete = () => {
                    this._finishWorkspaceSwitch(switchData);
                    onComplete();
                };
            }
            monitorGroup.ease_property('progress', monitorGroup.positionOf(to), params);
        }
    }

    _crossfade(from, to, onComplete) {
        if (this._switchData)
            this._abandonSwitch();
        this._prepareWorkspaceSwitch([from, to]);
        const switchData = this._switchData;
        switchData.completeEffect = onComplete;
        const fromWs = global.workspace_manager.get_workspace_by_index(from);
        const toWs = global.workspace_manager.get_workspace_by_index(to);
        for (const monitorGroup of switchData.monitors) {
            const ghost = monitorGroup.ghostOf(fromWs);
            monitorGroup.progress = monitorGroup.getWorkspaceProgress(toWs);
            ghost.ease({
                opacity: 0,
                duration: KestrelUi.Duration.quick,
                curve: KestrelUi.Curve.decelerate,
                onComplete: monitorGroup === this._primaryGroup() ? () => {
                    this._finishWorkspaceSwitch(switchData);
                    onComplete();
                } : null,
            });
        }
    }

    canHandleScrollEvent(event) {
        return this._swipeTracker.canHandleScrollEvent(event);
    }

    handleScrollEvent(event) {
        return this._swipeTracker.handleScrollEvent(event);
    }

    _findMonitorGroup(monitorIndex) {
        return this._switchData.monitors.find(m => m.index === monitorIndex);
    }

    _switchWorkspaceBegin(tracker, monitor) {
        if (Meta.prefs_get_workspaces_only_on_primary() &&
            monitor !== Main.layoutManager.primaryIndex)
            return;

        const workspaceManager = global.workspace_manager;
        const horiz = workspaceManager.layout_rows !== -1;
        tracker.orientation = horiz
            ? Clutter.Orientation.HORIZONTAL
            : Clutter.Orientation.VERTICAL;

        if (this._switchData?.gestureActivated) {
            for (const group of this._switchData.monitors)
                group.remove_all_transitions();
        } else if (this._switchData) {
            this._rebuildSwitch(null);
        } else {
            this._prepareWorkspaceSwitch();
        }

        const monitorGroup = this._findMonitorGroup(monitor);
        const baseDistance = monitorGroup.baseDistance;
        const progress = monitorGroup.progress;

        const closestWs = monitorGroup.findClosestWorkspace(progress);
        const cancelProgress = monitorGroup.getWorkspaceProgress(closestWs);
        const points = monitorGroup.getSnapPoints();

        this._switchData.baseMonitorGroup = monitorGroup;

        tracker.confirmSwipe(baseDistance, points, progress, cancelProgress);
    }

    _switchWorkspaceUpdate(tracker, progress) {
        if (!this._switchData)
            return;

        for (const monitorGroup of this._switchData.monitors)
            monitorGroup.updateSwipeForMonitor(progress, this._switchData.baseMonitorGroup);
    }

    _switchWorkspaceEnd(tracker, velocity, endProgress, immediate) {
        if (!this._switchData)
            return;

        const switchData = this._switchData;
        switchData.gestureActivated = true;

        const newWs = switchData.baseMonitorGroup.findClosestWorkspace(endProgress);
        const endTime = Clutter.get_current_event_time();
        const finish = () => {
            if (!newWs.active)
                newWs.activate(endTime);
            this._finishWorkspaceSwitch(switchData);
        };

        if (immediate) {
            finish();
            return;
        }

        for (const monitorGroup of this._switchData.monitors) {
            const progress = monitorGroup.getWorkspaceProgress(newWs);
            const params = {spring: KestrelUi.Spring.snappy, velocity, epsilon: monitorGroup.epsilon};
            if (monitorGroup === this._primaryGroup())
                params.onComplete = finish;
            monitorGroup.ease_property('progress', progress, params);
        }
    }

    get gestureActive() {
        return this._switchData !== null && this._switchData.gestureActivated;
    }

    cancelSwitchAnimation() {
        const switchData = this._switchData;
        if (!switchData || switchData.gestureActivated)
            return;

        switchData.superseded = true;
        switchData.completeEffect = null;
        global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
            if (this._switchData === switchData && switchData.superseded)
                this._finishWorkspaceSwitch(switchData);
            return GLib.SOURCE_REMOVE;
        });
    }

    set movingWindow(movingWindow) {
        this._movingWindow = movingWindow;
    }

    get movingWindow() {
        return this._movingWindow;
    }
}
