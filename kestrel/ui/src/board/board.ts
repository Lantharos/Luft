import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';
import type St from 'gi://St';

import type { Keybindings } from '../context.js';
import type { Monitor } from '../panel/panel.js';
import { animateActor } from '../shared/motion.js';
import type { Box } from '../shared/placement.js';
import { Backdrop, type BackgroundFactory } from './backdrop.js';
import { Camera } from './camera.js';
import { Follower } from './follower.js';
import { boundsOf, clampScale, copyView, fits, fitView, freeSpot, intersection, planExit, screenBox, settle, type View } from './geometry.js';
import { BoardInput, type BoardActions } from './input.js';
import { BoardKeys } from './keys.js';
import { CornerPill } from './pill.js';
import { fadeAway, glideFrom, settleActor } from './transitions.js';
import { boardWindows, Collisions, frameBox, isBoardWindow, setUnconstrained } from './windows.js';

const FIT_PADDING = 56;
const WINDOW_PADDING = 24;
const REVEAL_MARGIN = 32;
const CAMERA_DURATION = 360;
const SETTLE_TIMEOUT = 300;
const FADE_DURATION = 200;

export interface Canvas {
  readonly view: View;
  readonly layout: Map<Meta.Window, Box>;
  readonly normal: Map<Meta.Window, Box>;
  shown: boolean;
  known: boolean;
}

export interface BoardFrame {
  x: number;
  y: number;
  scale: number;
  viewportX: number;
  viewportY: number;
}

export interface BoardHost {
  monitors(): Monitor[];
  primary(): Monitor | null;
  workArea(monitorIndex: number): Box;
  createBackground: BackgroundFactory;
  wallpaper: Clutter.Actor;
  keybindings: Keybindings;
  addChrome(actor: Clutter.Actor): void;
  setPanelsHidden(hidden: boolean): void;
  openQuickSettings(): void;
  changed(): void;
  canInteract(): boolean;
}

function shell(): Shell.Global {
  return global as unknown as Shell.Global;
}

export class Board implements BoardActions {
  readonly camera: Camera;
  readonly input: BoardInput;
  private readonly backdrop: Backdrop;
  private readonly pill: CornerPill;
  private readonly collisions: Collisions;
  private readonly keys: BoardKeys;
  private readonly follower: Follower;
  private readonly canvases = new Map<Meta.Workspace, Canvas>();
  private presented: Canvas | null = null;
  private readonly target: View = { x: 0, y: 0, scale: 1 };
  private readonly managerSignal: number;
  private settling = 0;

  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly schemeSignal: number;

  constructor(private readonly host: BoardHost) {
    this.backdrop = new Backdrop(host.createBackground, this.light);
    this.schemeSignal = this.interfaceSettings.connect('changed::color-scheme', () => this.backdrop.setLight(this.light));
    this.camera = new Camera(shell().window_group, view => this.backdrop.update(view, this.camera.viewport));
    this.pill = new CornerPill(() => host.openQuickSettings());
    this.input = new BoardInput(this, this.backdrop.actor);
    this.collisions = new Collisions(() => this.presentedWorkspace(), () => this.camera.view.scale);
    this.keys = new BoardKeys(host.keybindings, this);
    this.follower = new Follower(this);
    const uiGroup = shell().window_group.get_parent()!;
    uiGroup.insert_child_below(this.backdrop.actor, shell().window_group);
    host.addChrome(this.pill.actor);
    this.backdrop.build(host.monitors());
    const manager = shell().workspace_manager;
    this.managerSignal = manager.connect('active-workspace-changed', () => this.syncWorkspace());
  }

  get shown(): boolean {
    return this.presented !== null;
  }

  active(): boolean {
    return this.presented !== null;
  }

  canInteract(): boolean {
    return this.host.canInteract();
  }

  canvasOf(workspace: Meta.Workspace | null): Canvas | null {
    return workspace ? this.canvases.get(workspace) ?? null : null;
  }

  liveView(workspace: Meta.Workspace): View | null {
    const canvas = this.canvases.get(workspace);
    if (!canvas?.shown) return null;
    return canvas === this.presented ? this.camera.view : canvas.view;
  }

  frameOf(workspace: Meta.Workspace): BoardFrame | null {
    const view = this.liveView(workspace);
    return view ? { x: view.x, y: view.y, scale: view.scale, viewportX: this.viewport.x, viewportY: this.viewport.y } : null;
  }

  get viewport(): Box {
    return this.camera.viewport;
  }

  presentedWorkspace(): Meta.Workspace | null {
    return this.presented ? shell().workspace_manager.get_active_workspace() : null;
  }

  private get light(): boolean {
    return this.interfaceSettings.get_string('color-scheme') !== 'prefer-dark';
  }

  backdropFor(workspace: Meta.Workspace, monitor: Monitor): St.Widget | null {
    const view = this.liveView(workspace);
    return view ? this.backdrop.snapshot(monitor, view, this.viewport) : null;
  }

  showStatus(iconNames: string[]): void {
    this.pill.showStatus(iconNames);
  }

  monitorsChanged(): void {
    this.backdrop.build(this.host.monitors());
    if (this.presented) this.present(this.presented);
  }

  doubleTapped(): boolean {
    return this.keys.doubleTapped();
  }

  toggle(): void {
    if (this.presented) this.exit();
    else this.enter();
  }

  enter(): void {
    const workspace = shell().workspace_manager.get_active_workspace();
    const canvas = this.canvasFor(workspace);
    if (canvas.shown || this.settling) return;
    canvas.shown = true;
    const windows = boardWindows(workspace);
    const resizing = windows.filter(window => window.is_fullscreen() || window.get_maximize_flags() !== 0);
    for (const window of windows) {
      setUnconstrained(window, true);
      if (window.minimized) window.unminimize();
      if (window.is_fullscreen()) window.unmake_fullscreen();
      if (window.get_maximize_flags() !== 0) window.unmaximize();
    }
    if (!resizing.length) {
      this.layOut(workspace, canvas);
      return;
    }
    const pending = new Map(resizing.map(window => [window, window.connect('size-changed', () => {
      window.disconnect(pending.get(window)!);
      pending.delete(window);
      if (!pending.size) finish();
    })]));
    const finish = () => {
      for (const [window, id] of pending) window.disconnect(id);
      pending.clear();
      if (this.settling) GLib.Source.remove(this.settling);
      this.settling = 0;
      if (canvas.shown && workspace.active) this.layOut(workspace, canvas);
    };
    this.settling = GLib.timeout_add(GLib.PRIORITY_DEFAULT, SETTLE_TIMEOUT, () => {
      this.settling = 0;
      finish();
      return GLib.SOURCE_REMOVE;
    });
  }

  exit(): void {
    const canvas = this.presented;
    const workspace = this.presentedWorkspace();
    if (!canvas || !workspace) return;
    this.collisions.end();
    const windows = boardWindows(workspace).filter(window => !window.minimized);
    const view = copyView({ x: 0, y: 0, scale: 1 }, this.camera.view);
    const viewport = { ...this.viewport };
    const primary = this.host.primary();
    const workArea = this.host.workArea(primary?.index ?? 0);
    canvas.layout.clear();
    for (const window of windows) canvas.layout.set(window, frameBox(window));
    const screens = new Map(windows.map(window => [window, screenBox(view, viewport, frameBox(window))]));
    const fitted = windows.find(window => fits(view, frameBox(window), viewport, WINDOW_PADDING)) ?? null;
    const plan = planExit([...canvas.layout], view, viewport, workArea, fitted);
    canvas.shown = false;
    this.present(null);
    for (const [window, box] of plan.placed) {
      setUnconstrained(window, false);
      window.move_frame(false, box.x, box.y);
      glideFrom(window, screens.get(window)!, null, viewport);
    }
    if (plan.maximized) {
      setUnconstrained(plan.maximized, false);
      glideFrom(plan.maximized, screens.get(plan.maximized)!, null, viewport);
      plan.maximized.maximize();
    }
    for (const window of plan.minimized) {
      const screen = screens.get(window)!;
      const tuck = () => this.tuck(window, canvas, workArea);
      if (intersection(screen, viewport) > 0) fadeAway(window, screen, viewport, tuck);
      else tuck();
    }
  }

  fitAll(): void {
    const workspace = this.presentedWorkspace();
    if (!workspace) return;
    const bounds = boundsOf(boardWindows(workspace).filter(window => !window.minimized).map(frameBox));
    if (!bounds) return;
    fitView(this.target, bounds, this.viewport, FIT_PADDING);
    this.camera.animateTo(this.target, CAMERA_DURATION);
  }

  fitWindow(window: Meta.Window): void {
    fitView(this.target, frameBox(window), this.viewport, WINDOW_PADDING);
    this.camera.animateTo(this.target, CAMERA_DURATION);
    window.activate(shell().get_current_time());
  }

  reveal(window: Meta.Window): void {
    const box = frameBox(window);
    const view = this.camera.view;
    const viewport = this.viewport;
    const visibleWidth = viewport.width / view.scale - 2 * REVEAL_MARGIN / view.scale;
    const visibleHeight = viewport.height / view.scale - 2 * REVEAL_MARGIN / view.scale;
    if (box.width > visibleWidth || box.height > visibleHeight) {
      fitView(this.target, box, viewport, WINDOW_PADDING);
    } else {
      copyView(this.target, view);
      const margin = REVEAL_MARGIN / view.scale;
      this.target.x = Math.min(Math.max(view.x, box.x + box.width + margin - viewport.width / view.scale), box.x - margin);
      this.target.y = Math.min(Math.max(view.y, box.y + box.height + margin - viewport.height / view.scale), box.y - margin);
    }
    this.camera.animateTo(this.target, CAMERA_DURATION);
  }

  panStep(directionX: number, directionY: number): void {
    copyView(this.target, this.camera.view);
    this.target.x += directionX * this.viewport.width / 3 / this.target.scale;
    this.target.y += directionY * this.viewport.height / 3 / this.target.scale;
    this.camera.animateTo(this.target, CAMERA_DURATION);
  }

  zoomStep(factor: number): void {
    const { viewport } = this;
    copyView(this.target, this.camera.view);
    const centerX = this.target.x + viewport.width / 2 / this.target.scale;
    const centerY = this.target.y + viewport.height / 2 / this.target.scale;
    this.target.scale = clampScale(this.target.scale * factor);
    this.target.x = centerX - viewport.width / 2 / this.target.scale;
    this.target.y = centerY - viewport.height / 2 / this.target.scale;
    this.camera.animateTo(this.target, CAMERA_DURATION);
  }

  place(window: Meta.Window, canvas: Canvas): void {
    const view = canvas === this.presented ? this.camera.view : canvas.view;
    const others = boardWindows(window.get_workspace()!)
      .filter(other => other !== window && !other.minimized)
      .map(frameBox);
    const box = frameBox(window);
    const centerX = view.x + this.viewport.width / 2 / view.scale;
    const centerY = view.y + this.viewport.height / 2 / view.scale;
    const [x, y] = freeSpot(others, box.width, box.height, centerX, centerY);
    setUnconstrained(window, true);
    window.move_frame(false, x, y);
    if (canvas === this.presented) this.reveal(window);
  }

  release(window: Meta.Window, canvas: Canvas): void {
    canvas.layout.delete(window);
    canvas.normal.delete(window);
    if (!window.get_workspace() || this.canvasOf(window.get_workspace())?.shown) return;
    setUnconstrained(window, false);
    const area = this.host.workArea(this.host.primary()?.index ?? 0);
    const box = frameBox(window);
    if (intersection(box, area) < box.width * box.height / 2)
      window.move_frame(false, area.x + Math.round((area.width - box.width) / 2), area.y + Math.round((area.height - box.height) / 2));
  }

  onCanvas(x: number, y: number): boolean {
    const actor = shell().stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
    return !!actor && this.backdrop.actor.contains(actor);
  }

  windowAt(x: number, y: number): Meta.Window | null {
    let actor: Clutter.Actor | null = shell().stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
    while (actor && !(actor instanceof Meta.WindowActor)) actor = actor.get_parent();
    const window = actor ? (actor as Meta.WindowActor).meta_window : null;
    return window && isBoardWindow(window) ? window : null;
  }

  beginMove(window: Meta.Window): void {
    this.collisions.begin(window, true);
  }

  moveBy(screenDx: number, screenDy: number): void {
    this.collisions.moveBy(screenDx / this.camera.view.scale, screenDy / this.camera.view.scale);
  }

  endMove(): void {
    this.collisions.end();
  }

  canvasFor(workspace: Meta.Workspace): Canvas {
    let canvas = this.canvases.get(workspace);
    if (!canvas) {
      canvas = { view: { x: 0, y: 0, scale: 1 }, layout: new Map(), normal: new Map(), shown: false, known: false };
      this.canvases.set(workspace, canvas);
      this.follower.watch(workspace, canvas);
    }
    return canvas;
  }

  forget(workspace: Meta.Workspace): void {
    const canvas = this.canvases.get(workspace);
    if (!canvas) return;
    if (canvas === this.presented) this.present(null);
    this.follower.unwatch(workspace);
    this.canvases.delete(workspace);
  }

  destroy(): void {
    shell().workspace_manager.disconnect(this.managerSignal);
    this.interfaceSettings.disconnect(this.schemeSignal);
    if (this.settling) GLib.Source.remove(this.settling);
    this.present(null);
    this.follower.destroy();
    this.collisions.destroy();
    this.keys.destroy();
    this.pill.destroy();
    this.backdrop.destroy();
  }

  private layOut(workspace: Meta.Workspace, canvas: Canvas): void {
    const windows = boardWindows(workspace).filter(window => !window.minimized);
    const before = windows.map(frameBox);
    const viewport = this.viewportFor();
    let boxes: Box[];
    if (canvas.known) {
      const known = windows.flatMap(window => {
        const box = canvas.layout.get(window);
        return box ? [box] : [];
      });
      const centerX = canvas.view.x + viewport.width / 2 / canvas.view.scale;
      const centerY = canvas.view.y + viewport.height / 2 / canvas.view.scale;
      boxes = windows.map((window, index) => {
        const stored = canvas.layout.get(window);
        if (stored) return { ...stored };
        const [x, y] = freeSpot(known, before[index]!.width, before[index]!.height, centerX, centerY);
        const placed = { ...before[index]!, x, y };
        known.push(placed);
        return placed;
      });
    } else {
      boxes = before.map(box => ({ ...box }));
      settle(boxes);
      const bounds = boundsOf(boxes);
      if (bounds) fitView(canvas.view, bounds, viewport, FIT_PADDING);
      canvas.known = true;
    }
    canvas.layout.clear();
    canvas.normal.clear();
    windows.forEach((window, index) => canvas.normal.set(window, before[index]!));
    this.present(canvas);
    this.backdrop.actor.opacity = 0;
    animateActor(this.backdrop.actor, { opacity: 255, duration: FADE_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    windows.forEach((window, index) => {
      settleActor(window);
      window.move_frame(false, Math.round(boxes[index]!.x), Math.round(boxes[index]!.y));
      glideFrom(window, before[index]!, this.camera.view, viewport);
    });
  }

  private tuck(window: Meta.Window, canvas: Canvas, workArea: Box): void {
    window.minimize();
    setUnconstrained(window, false);
    const normal = canvas.normal.get(window) ?? frameBox(window);
    const width = Math.min(normal.width, workArea.width);
    const height = Math.min(normal.height, workArea.height);
    const inside = intersection(normal, workArea) >= width * height / 2;
    window.move_frame(false,
      inside ? normal.x : workArea.x + Math.round((workArea.width - width) / 2),
      inside ? normal.y : workArea.y + Math.round((workArea.height - height) / 2));
  }

  private viewportFor(): Box {
    const primary = this.host.primary();
    const viewport = this.camera.viewport;
    if (primary) {
      viewport.x = primary.x;
      viewport.y = primary.y;
      viewport.width = primary.width;
      viewport.height = primary.height;
    }
    return viewport;
  }

  private syncWorkspace(): void {
    const canvas = this.canvasOf(shell().workspace_manager.get_active_workspace());
    this.present(canvas?.shown ? canvas : null);
  }

  private present(canvas: Canvas | null): void {
    const previous = this.presented;
    if (previous && previous !== canvas) copyView(previous.view, this.camera.view);
    this.collisions.end();
    this.presented = canvas;
    if (!canvas) {
      if (!previous) return;
      this.camera.release();
      this.backdrop.actor.remove_transition('opacity');
      this.backdrop.actor.hide();
      this.pill.actor.hide();
      this.host.wallpaper.show();
      this.setDesktopWindowsVisible(true);
      this.host.setPanelsHidden(false);
      this.keys.release();
      this.host.changed();
      return;
    }
    this.viewportFor();
    this.camera.engage(canvas.view);
    this.backdrop.actor.show();
    this.backdrop.actor.opacity = 255;
    this.host.wallpaper.hide();
    this.setDesktopWindowsVisible(false);
    this.host.setPanelsHidden(true);
    const primary = this.host.primary();
    if (primary) {
      this.pill.actor.show();
      this.pill.place(primary);
    }
    this.keys.engage();
    this.host.changed();
  }

  private setDesktopWindowsVisible(visible: boolean): void {
    for (const actor of shell().get_window_actors()) {
      if (actor.meta_window?.window_type === Meta.WindowType.DESKTOP) actor.opacity = visible ? 255 : 0;
    }
  }
}
