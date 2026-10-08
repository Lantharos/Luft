import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';
import type St from 'gi://St';

import type { Keybindings } from '../../context.js';
import type { Monitor } from '../panel/panel.js';
import { animateActor } from '../../shared/motion.js';
import type { Box } from '../../shared/placement.js';
import { Corner } from './corner/corner.js';
import { BoardInput, type BoardActions } from './input/input.js';
import { BoardKeys } from './input/keys.js';
import { Backdrop, type BackgroundFactory } from './view/backdrop.js';
import { Camera } from './view/camera.js';
import { boundsOf, copyView, fits, FULL_SIZE, freeSpot, intersection, PLACEMENT_GAP, planExit, type View } from './view/geometry.js';
import { glideFrom, settleActor } from './view/transitions.js';
import { arrange, putBack, restoreSizes } from './windows/arrange.js';
import { Focus, WINDOW_PADDING, type FocusState } from './windows/focus.js';
import { Follower } from './windows/follower.js';
import { appWindowAfter, boardWindows, byOpening, Collisions, frameBox, isBoardWindow, magnify, setMagnification, setUnconstrained } from './windows/windows.js';
import { X11Origin } from './windows/x11Origin.js';

const FADE_DURATION = 200;

export interface Canvas extends FocusState {
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
  openStart(): void;
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
  private readonly corner: Corner;
  private readonly collisions: Collisions;
  private readonly keys: BoardKeys;
  private readonly follower: Follower;
  private readonly focus: Focus;
  private readonly x11Origin: X11Origin;
  private readonly canvases = new Map<Meta.Workspace, Canvas>();
  private readonly magnified = new Set<Meta.Window>();
  private presented: Canvas | null = null;
  private readonly managerSignal: number;
  private cancelRestore: (() => void) | null = null;

  private readonly interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly schemeSignal: number;

  constructor(private readonly host: BoardHost) {
    this.backdrop = new Backdrop(host.createBackground, this.light);
    this.schemeSignal = this.interfaceSettings.connect('changed::color-scheme', () => this.backdrop.setLight(this.light));
    this.camera = new Camera(shell().window_group, {
      changed: view => {
        this.backdrop.update(view, this.camera.viewport);
        this.input.syncShield(true);
      },
      settled: () => this.settled(),
      focusAt: (x, y) => {
        const window = this.focus.entered ?? this.windowUnder(x, y);
        return window ? frameBox(window) : null;
      },
    });
    this.corner = new Corner({
      openQuickSettings: () => host.openQuickSettings(),
      openStart: () => host.openStart(),
      overview: () => this.overview(),
      enterApp: app => this.enterApp(app),
    });
    this.input = new BoardInput(this, this.backdrop.actor);
    this.collisions = new Collisions(() => this.presentedWorkspace(), () => this.camera.view.scale);
    this.keys = new BoardKeys(host.keybindings, this);
    this.follower = new Follower(this);
    this.x11Origin = new X11Origin({ view: this.camera.shown, viewport: this.camera.viewport, screen: () => this.screen() });
    this.focus = new Focus({
      camera: this.camera,
      viewport: this.camera.viewport,
      moving: () => this.collisions.window,
      changed: () => {
        this.windowsChanged();
        this.input.syncShield(!!this.presented);
      },
    });
    const uiGroup = shell().window_group.get_parent()!;
    uiGroup.insert_child_below(this.backdrop.actor, shell().window_group);
    uiGroup.insert_child_above(this.input.shield, shell().window_group);
    host.addChrome(this.corner.actor);
    this.backdrop.build(host.monitors());
    const manager = shell().workspace_manager;
    this.managerSignal = manager.connect('active-workspace-changed', () => this.syncWorkspace());
  }

  get shown(): boolean {
    return this.presented !== null;
  }

  get cornerClearance(): number {
    return this.corner.clearance;
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
    return canvas === this.presented ? this.camera.shown : canvas.view;
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
    this.corner.showStatus(iconNames);
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
    if (canvas.shown || this.cancelRestore) return;
    canvas.shown = true;
    const windows = boardWindows(workspace);
    for (const window of windows) setUnconstrained(window, true);
    this.cancelRestore = restoreSizes(windows, () => {
      this.cancelRestore = null;
      if (canvas.shown && workspace.active) this.layOut(workspace, canvas);
    });
  }

  exit(): void {
    const canvas = this.presented;
    const workspace = this.presentedWorkspace();
    if (!canvas || !workspace) return;
    this.collisions.end();
    const windows = boardWindows(workspace).filter(window => !window.minimized);
    const view = copyView({ x: 0, y: 0, scale: 1 }, this.camera.shown);
    const viewport = { ...this.viewport };
    const workArea = this.host.workArea(this.host.primary()?.index ?? 0);
    canvas.layout.clear();
    for (const window of windows) canvas.layout.set(window, frameBox(window));
    const entered = canvas.entered && !canvas.entered.minimized ? canvas.entered : null;
    const fitted = entered ?? windows.find(window => fits(view, frameBox(window), viewport, WINDOW_PADDING)) ?? null;
    const plan = planExit([...canvas.layout], view, viewport, workArea, fitted);
    canvas.shown = false;
    this.present(null);
    putBack(plan, canvas, view, viewport, workArea);
  }

  fitAll(): void {
    this.focus.release();
    this.focus.fitAll();
  }

  enteredWindow(): Meta.Window | null {
    return this.focus.entered;
  }

  enterWindow(window: Meta.Window, from?: View): void {
    const workspace = this.presentedWorkspace();
    if (workspace && isBoardWindow(window) && window.located_on_workspace(workspace)) this.focus.enter(window, from);
  }

  enterFocused(): void {
    const window = shell().display.focus_window;
    if (window) this.enterWindow(window);
  }

  overview(): void {
    this.focus.overview();
  }

  freeView(): void {
    this.focus.release();
  }

  navigate(directionX: number, directionY: number): void {
    this.focus.navigate(directionX, directionY);
  }

  reveal(window: Meta.Window): void {
    this.camera.reveal(frameBox(window), WINDOW_PADDING);
  }

  step(directionX: number, directionY: number): void {
    if (this.focus.entered) this.focus.navigate(directionX, directionY);
    else this.camera.panStep(directionX, directionY);
  }

  zoomStep(factor: number): void {
    this.focus.release();
    this.camera.zoomStep(factor);
  }

  pointerMoved(x: number, y: number): void {
    this.x11Origin.hover(x, y);
  }

  place(window: Meta.Window, canvas: Canvas): void {
    const view = canvas === this.presented ? this.camera.view : canvas.view;
    const others = boardWindows(window.get_workspace()!)
      .filter(other => other !== window && !other.minimized)
      .map(frameBox);
    const box = frameBox(window);
    const beside = canvas.entered ? frameBox(canvas.entered) : null;
    const centerX = beside ? beside.x + beside.width + PLACEMENT_GAP + box.width / 2 : view.x + this.viewport.width / 2 / view.scale;
    const centerY = beside ? beside.y + beside.height / 2 : view.y + this.viewport.height / 2 / view.scale;
    const [x, y] = freeSpot(others, box.width, box.height, centerX, centerY);
    setUnconstrained(window, true);
    window.move_frame(false, x, y);
    if (canvas !== this.presented) return;
    this.windowsChanged();
    if (canvas.entered) this.focus.shade(true);
    else this.reveal(window);
  }

  release(window: Meta.Window, canvas: Canvas): void {
    if (canvas.entered === window) {
      if (canvas === this.presented) this.focus.overview();
      else canvas.entered = canvas.overview = null;
    }
    canvas.layout.delete(window);
    canvas.normal.delete(window);
    if (this.magnified.delete(window)) setMagnification(window, FULL_SIZE);
    if (canvas === this.presented) this.windowsChanged();
    if (!window.get_workspace() || this.canvasOf(window.get_workspace())?.shown) return;
    setUnconstrained(window, false);
    const area = this.host.workArea(this.host.primary()?.index ?? 0);
    const box = frameBox(window);
    if (intersection(box, area) < box.width * box.height / 2)
      window.move_frame(false, area.x + Math.round((area.width - box.width) / 2), area.y + Math.round((area.height - box.height) / 2));
  }

  onCanvas(x: number, y: number): boolean {
    const actor = shell().stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
    if (actor === this.input.shield) return !this.windowUnder(x, y);
    return !!actor && this.backdrop.actor.contains(actor);
  }

  windowAt(x: number, y: number): Meta.Window | null {
    let actor: Clutter.Actor | null = shell().stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
    if (actor === this.input.shield) return this.windowUnder(x, y);
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
    const entered = this.focus.entered;
    if (entered) this.focus.enter(entered);
  }

  canvasFor(workspace: Meta.Workspace): Canvas {
    let canvas = this.canvases.get(workspace);
    if (!canvas) {
      canvas = { view: { x: 0, y: 0, scale: 1 }, layout: new Map(), normal: new Map(), shown: false, known: false, entered: null, overview: null };
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
    this.cancelRestore?.();
    this.present(null);
    this.camera.destroy();
    this.focus.destroy();
    this.follower.destroy();
    this.collisions.destroy();
    this.keys.destroy();
    this.corner.destroy();
    this.backdrop.destroy();
  }

  private enterApp(app: Shell.App): void {
    const workspace = this.presentedWorkspace();
    const next = workspace ? appWindowAfter(app, workspace, this.focus.entered) : null;
    if (next && next === this.focus.entered) this.overview();
    else if (next) this.enterWindow(next);
  }

  private screen(): Box {
    return boundsOf(this.host.monitors()) ?? this.viewport;
  }

  private settled(): void {
    const workspace = this.presentedWorkspace();
    if (!workspace) return;
    const windows = boardWindows(workspace).filter(window => !window.minimized);
    magnify(windows, this.camera.shown, this.viewport);
    for (const window of windows) this.magnified.add(window);
    const [x, y] = shell().get_pointer();
    this.x11Origin.settle(x, y);
  }

  private windowsChanged(): void {
    const workspace = this.presentedWorkspace();
    if (!workspace) return;
    const windows = boardWindows(workspace).filter(window => !window.minimized);
    this.x11Origin.track(windows);
    this.corner.showWindows(windows.sort(byOpening), this.focus.entered);
  }

  private windowUnder(x: number, y: number): Meta.Window | null {
    const workspace = this.presentedWorkspace();
    if (!workspace) return null;
    const { shown: view, viewport } = this.camera;
    const canvasX = view.x + (x - viewport.x) / view.scale;
    const canvasY = view.y + (y - viewport.y) / view.scale;
    return boardWindows(workspace).find(window => {
      const { x: left, y: top, width, height } = window.get_frame_rect();
      return !window.minimized && canvasX >= left && canvasX < left + width && canvasY >= top && canvasY < top + height;
    }) ?? null;
  }

  private layOut(workspace: Meta.Workspace, canvas: Canvas): void {
    const windows = boardWindows(workspace).filter(window => !window.minimized);
    const before = windows.map(frameBox);
    const viewport = this.viewportFor();
    const boxes = arrange(windows, canvas, viewport);
    canvas.layout.clear();
    canvas.normal.clear();
    windows.forEach((window, index) => canvas.normal.set(window, before[index]!));
    this.present(canvas);
    this.backdrop.actor.opacity = 0;
    animateActor(this.backdrop.actor, { opacity: 255, duration: FADE_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
    windows.forEach((window, index) => {
      settleActor(window);
      window.move_frame(false, Math.round(boxes[index]!.x), Math.round(boxes[index]!.y));
      glideFrom(window, before[index]!, this.camera.shown, viewport);
    });
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
    this.focus.detach();
    for (const window of this.magnified) setMagnification(window, FULL_SIZE);
    this.magnified.clear();
    this.x11Origin.reset();
    if (!canvas) {
      if (!previous) return;
      this.camera.release();
      this.backdrop.actor.remove_transition('opacity');
      this.backdrop.actor.hide();
      this.corner.setShown(false);
      this.host.wallpaper.show();
      this.setDesktopWindowsVisible(true);
      this.host.setPanelsHidden(false);
      this.keys.release();
      this.host.changed();
      return;
    }
    const viewport = this.viewportFor();
    const primary = this.host.primary();
    this.input.shield.set_position(viewport.x, viewport.y);
    this.input.shield.set_size(viewport.width, viewport.height);
    this.camera.engage(canvas.view, shell().display.get_monitor_scale(primary?.index ?? 0));
    this.backdrop.actor.show();
    this.backdrop.actor.opacity = 255;
    this.host.wallpaper.hide();
    this.setDesktopWindowsVisible(false);
    this.host.setPanelsHidden(true);
    if (primary) {
      this.corner.setShown(true);
      this.corner.place(primary);
    }
    this.keys.engage();
    this.focus.attach(canvas, shell().workspace_manager.get_active_workspace());
    this.windowsChanged();
    this.host.changed();
  }

  private setDesktopWindowsVisible(visible: boolean): void {
    for (const actor of shell().get_window_actors()) {
      if (actor.meta_window?.window_type === Meta.WindowType.DESKTOP) actor.opacity = visible ? 255 : 0;
    }
  }
}
