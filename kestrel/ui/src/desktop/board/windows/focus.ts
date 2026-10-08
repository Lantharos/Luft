import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import { animateActor } from '../../../shared/motion.js';
import type { Box } from '../../../shared/placement.js';
import { CAMERA_DURATION, type Camera } from '../view/camera.js';
import { boundsOf, copyView, fitView, nearestInDirection, type View } from '../view/geometry.js';
import { boardWindows, frameBox } from './windows.js';

export const FIT_PADDING = 56;
export const WINDOW_PADDING = 24;
const DIMMED = 184;
const DIM_DURATION = 220;
const MAX_ARC = 0.16;
const ARC_REACH = 4;
const SETTLED = 0.5;

export interface FocusState {
  entered: Meta.Window | null;
  overview: View | null;
}

interface FocusHost {
  readonly camera: Camera;
  readonly viewport: Box;
  moving(): Meta.Window | null;
  changed(entered: boolean): void;
}

function shell(): Shell.Global {
  return global as unknown as Shell.Global;
}

export class Focus {
  private state: FocusState | null = null;
  private workspace: Meta.Workspace | null = null;
  private watched: Meta.Window | null = null;
  private signals: number[] = [];
  private following = 0;
  private readonly target: View = { x: 0, y: 0, scale: 1 };
  private readonly next: View = { x: 0, y: 0, scale: 1 };
  private readonly grabSignal: number;

  constructor(private readonly host: FocusHost) {
    this.grabSignal = shell().display.connect('grab-op-end', (_display, window: Meta.Window) => {
      if (window === this.entered) this.queueFollow();
    });
  }

  get entered(): Meta.Window | null {
    return this.state?.entered ?? null;
  }

  attach(state: FocusState, workspace: Meta.Workspace): void {
    this.detach();
    this.state = state;
    this.workspace = workspace;
    copyView(this.target, this.host.camera.view);
    if (state.entered) this.watch(state.entered);
    this.shade(false);
    this.host.changed(!!state.entered);
  }

  detach(): void {
    if (!this.state) return;
    this.unwatch();
    this.state = null;
    this.shade(false);
    this.workspace = null;
    this.host.changed(false);
  }

  enter(window: Meta.Window, from: View = this.host.camera.view): void {
    const state = this.state;
    if (!state) return;
    const previous = state.entered;
    if (!previous) state.overview = copyView(state.overview ?? { x: 0, y: 0, scale: 1 }, from);
    if (previous !== window) {
      state.entered = window;
      this.watch(window);
      this.shade(true);
      this.host.changed(true);
    }
    this.fit(window, !!previous && previous !== window);
    if (shell().display.focus_window !== window) window.activate(shell().get_current_time());
  }

  overview(): void {
    const back = this.state?.overview;
    this.release();
    if (back) this.host.camera.animateTo(back, CAMERA_DURATION);
    else this.fitAll();
  }

  release(): void {
    const state = this.state;
    if (!state) return;
    state.overview = null;
    if (!state.entered) return;
    state.entered = null;
    this.unwatch();
    this.shade(true);
    this.host.changed(false);
  }

  fitAll(): void {
    if (!this.workspace) return;
    const bounds = boundsOf(boardWindows(this.workspace).filter(window => !window.minimized).map(frameBox));
    if (!bounds) return;
    fitView(this.target, bounds, this.host.viewport, FIT_PADDING);
    this.host.camera.animateTo(this.target, CAMERA_DURATION);
  }

  navigate(directionX: number, directionY: number): void {
    const entered = this.entered;
    if (!entered || !this.workspace) return;
    const others = boardWindows(this.workspace).filter(window => window !== entered && !window.minimized);
    const index = nearestInDirection(frameBox(entered), others.map(frameBox), directionX, directionY);
    if (index >= 0) this.enter(others[index]!);
  }

  shade(animated: boolean): void {
    if (!this.workspace) return;
    const entered = this.entered;
    for (const window of boardWindows(this.workspace)) {
      const actor = window.get_compositor_private() as Meta.WindowActor | null;
      if (!actor) continue;
      const opacity = entered && window !== entered ? DIMMED : 255;
      if (actor.opacity === opacity && !actor.get_transition('opacity')) continue;
      if (animated) {
        animateActor(actor, { opacity, duration: DIM_DURATION, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
      } else {
        actor.remove_transition('opacity');
        actor.opacity = opacity;
      }
    }
  }

  destroy(): void {
    shell().display.disconnect(this.grabSignal);
    this.detach();
  }

  private fit(window: Meta.Window, travelling: boolean): void {
    const { camera, viewport } = this.host;
    fitView(this.target, frameBox(window), viewport, WINDOW_PADDING);
    const view = camera.view;
    const travel = Math.hypot(
      this.target.x + viewport.width / 2 / this.target.scale - view.x - viewport.width / 2 / view.scale,
      this.target.y + viewport.height / 2 / this.target.scale - view.y - viewport.height / 2 / view.scale) * view.scale;
    camera.animateTo(this.target, CAMERA_DURATION, travelling ? Math.min(MAX_ARC, travel / viewport.width / ARC_REACH) : 0);
  }

  private watch(window: Meta.Window): void {
    this.unwatch();
    this.watched = window;
    this.signals = [
      window.connect('size-changed', () => this.queueFollow()),
      window.connect('position-changed', () => this.queueFollow()),
      window.connect('unmanaging', () => this.overview()),
    ];
  }

  private unwatch(): void {
    for (const id of this.signals) this.watched!.disconnect(id);
    this.signals = [];
    this.watched = null;
    if (this.following) shell().compositor.get_laters().remove(this.following);
    this.following = 0;
  }

  private queueFollow(): void {
    if (this.following) return;
    this.following = shell().compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.following = 0;
      this.follow();
      return false;
    });
  }

  private follow(): void {
    const entered = this.entered;
    if (!entered || this.host.moving() === entered) return;
    fitView(this.next, frameBox(entered), this.host.viewport, WINDOW_PADDING);
    const { next, target } = this;
    if (Math.abs(next.scale - target.scale) < 1e-4 &&
      Math.abs(next.x - target.x) * next.scale < SETTLED && Math.abs(next.y - target.y) * next.scale < SETTLED) return;
    this.fit(entered, false);
  }
}
